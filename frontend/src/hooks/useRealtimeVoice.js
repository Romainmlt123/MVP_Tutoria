/**
 * Hook Realtime Voice - WebRTC + OpenAI Realtime API
 */
import { useState, useCallback } from 'react'
import useChatStore from '../store/chatStore'
import { normalizeGraphData } from '../utils/graphNormalizer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Logs détaillés (désactiver en prod si besoin)
const VOICE_DEBUG = true
const log = (...args) => VOICE_DEBUG && console.log('[Realtime]', ...args)
const logEvent = (type, data) => {
  if (!VOICE_DEBUG) return
  const skipPayload = type?.includes('delta') || type?.includes('audio')
  const payload = skipPayload ? '(données delta/audio)' : (data && typeof data === 'object' ? { ...data } : data)
  console.log('[Realtime] 📥', type || '?', payload)
}

// Singleton - une seule connexion
let pc = null
let dc = null
let audio = null
let stream = null
let connectingPromise = null
let sessionCreatedCount = 0

function cleanup() {
  dc?.close?.()
  stream?.getTracks().forEach((t) => t.stop())
  pc?.close?.()
  if (audio) {
    audio.srcObject = null
    audio.pause()
    if (audio.parentNode) audio.remove()
  }
  pc = dc = audio = stream = connectingPromise = null
}

export default function useRealtimeVoice() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false)
  const [error, setError] = useState(null)

  const { addMessage, setCurrentGraph } = useChatStore()

  const onMessage = useCallback(
    (e) => {
      let data
      try {
        data = JSON.parse(e.data)
      } catch (err) {
        log('Parse error on message:', err)
        return
      }

      const type = data.type
      logEvent(type, data)

      if (type === 'session.created') {
        sessionCreatedCount += 1
        log(`SESSION #${sessionCreatedCount} créée (une seule attendue par conversation)`)
        if (sessionCreatedCount > 1) {
          console.warn('[Realtime] ⚠️ Plusieurs session.created détectés — possible reconnexion WebRTC, la voix peut changer.')
        }
      }
      if (type === 'session.updated') {
        const voice = data.session?.audio?.output?.voice
        log('session.updated → voice =', voice ?? '(non défini)')
      }

      // Avec server_vad + create_response: true, le serveur crée la réponse automatiquement — ne pas envoyer response.create
      if (type === 'input_audio_buffer.speech_started') {
        log('🎤 PAROLE DÉTECTÉE (speech_started)')
        setIsSpeaking(true)
      }
      if (type === 'input_audio_buffer.speech_stopped') {
        log('🎤 PAROLE TERMINÉE (speech_stopped) — le serveur va créer la réponse automatiquement')
        setIsSpeaking(false)
      }
      if (type === 'input_audio_buffer.committed') {
        log('📎 Buffer audio commit côté serveur')
      }
      if (type === 'response.created') {
        log('🔄 response.created — le modèle commence à répondre')
        setIsAssistantSpeaking(true)
      }
      if (type === 'response.output_item.added') {
        log('📦 response.output_item.added', data.item?.type)
      }

      if (type === 'response.output_item.done') {
        log('📦 response.output_item.done', JSON.stringify(data.item).slice(0, 300))
        const content = data.item?.content
        if (content) {
          const textPart = Array.isArray(content)
            ? content.find((c) => c.transcript || c.text)
            : content.transcript || content.text
          const text = textPart?.transcript ?? textPart?.text ?? (typeof textPart === 'string' ? textPart : null)
          if (text) {
            log('✅ Texte assistant:', text.slice(0, 100))
            addMessage({ role: 'assistant', content: text })
          } else {
            log('⚠️ Pas de texte trouvé dans item.content. item=', data.item)
          }
        } else {
          log('⚠️ response.output_item.done sans item.content. item=', data.item)
        }
      }

      if (type === 'response.done') {
        log('✅ response.done', data.response?.output ? 'output présent' : 'pas d\'output', data.response)
        setIsAssistantSpeaking(false)
      }

      if (type === 'response.output_audio_transcript.done') {
        log('📝 Transcript audio:', data.transcript?.slice(0, 200))
      }

      // Un seul flux audio : on n'envoie response.create qu'après function_call (même session, même voix).
      // Pas de response.create sur speech_stopped (le serveur le fait avec create_response: true).
      if (type === 'response.function_call_arguments.done') {
        const fnName = data.name
        const argsStr = data.arguments
        const isGenerateGraph =
          fnName === 'generate_graph' ||
          (argsStr && (() => {
            try {
              const o = JSON.parse(argsStr)
              if (!o || typeof o !== 'object') return false
              if (o.is3D === true) return !!(o.surfaces?.length || o.curves3D?.length || o.curves3d?.length || o.elements3D?.length || o.elements3d?.length)
              return (o.title != null || o.boundingBox != null) && Array.isArray(o.boundingBox)
            } catch {
              return false
            }
          })())
        if (isGenerateGraph && argsStr) {
          log('📊 generate_graph appelé, arguments:', argsStr.slice(0, 200))
          try {
            const raw = JSON.parse(argsStr)
            const graph = normalizeGraphData(raw)
            if (graph) {
              setCurrentGraph({ data: graph })
              addMessage({ role: 'assistant', content: `📊 ${graph.title || 'Graphique'}` })
            } else {
              log('⚠️ Graphique invalide après normalisation, ignoré')
            }
          } catch (err) {
            console.error('[Realtime] Graph parse error:', err)
          }
          if (dc?.readyState === 'open') {
            dc.send(
              JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: data.call_id,
                  output: '{"success":true}',
                },
              })
            )
            dc.send(JSON.stringify({ type: 'response.create' }))
            log('📤 Envoyé: function_call_output + response.create')
          }
        }
      }

      if (type === 'error') {
        log('❌ Erreur serveur:', data)
        setError(data.error?.message ?? data.message ?? JSON.stringify(data))
      }
    },
    [addMessage, setCurrentGraph]
  )

  const connect = useCallback(async () => {
    if (pc?.connectionState === 'connected') {
      log('Déjà connecté, skip')
      return setIsConnected(true)
    }
    if (connectingPromise) {
      log('Connexion déjà en cours, réutilisation de la promesse')
      return connectingPromise
    }

    const thisAttemptId = Date.now()
    connectingPromise = (async () => {
      sessionCreatedCount = 0
      cleanup()
      setIsConnecting(true)
      setError(null)
      log('Connexion en cours... (attempt', thisAttemptId, ')')

      // Référence locale : si cleanup() est appelé pendant le fetch, on n'utilise pas une pc fermée
      let peerConnection = null
      let dataChannel = null

      try {
        log('1/4 Création peer connection + micro')
        peerConnection = new RTCPeerConnection()
        pc = peerConnection
        audio = document.createElement('audio')
        audio.autoplay = true
        audio.setAttribute('playsinline', '')
        audio.style.cssText = 'position:fixed;width:0;height:0;opacity:0;pointer-events:none;'
        document.body.appendChild(audio)
        let remoteAudioAttached = false
        peerConnection.ontrack = (e) => {
          if (remoteAudioAttached) {
            log('Track distant ignoré (déjà une piste audio attachée, évite doublon)')
            return
          }
          const remoteStream = e.streams[0]
          if (!remoteStream) return
          const audioTracks = remoteStream.getAudioTracks()
          if (audioTracks.length === 0) return
          remoteAudioAttached = true
          const singleTrackStream = new MediaStream([audioTracks[0]])
          audio.srcObject = singleTrackStream
          audio.play().then(() => log('Lecture audio démarrée')).catch((err) => log('Lecture audio bloquée (autoplay?):', err?.message))
        }

        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        })
        peerConnection.addTrack(stream.getTracks()[0])
        log('2/4 Micro ajouté, création data channel')

        dataChannel = peerConnection.createDataChannel('oai-events')
        dc = dataChannel
        dataChannel.onopen = () => {
          log('4/4 Data channel oai-events OPEN')
          setIsConnected(true)
        }
        dataChannel.onmessage = onMessage
        dataChannel.onclose = () => {
          log('Data channel fermé')
          setIsConnected(false)
          cleanup()
        }
        dataChannel.onerror = (err) => log('Data channel error:', err)

        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        log('3/4 Offer SDP créé, récupération token éphémère puis appel direct OpenAI')

        const sessionRes = await fetch(`${API_URL}/api/realtime/session`, { method: 'POST' })
        if (!sessionRes.ok) {
          const errText = await sessionRes.text()
          log('Erreur session:', sessionRes.status, errText)
          throw new Error(errText?.slice(0, 200) || `Erreur token (${sessionRes.status})`)
        }
        const sessionData = await sessionRes.json()
        const clientSecret = sessionData?.client_secret?.value
        if (!clientSecret) {
          throw new Error('Token éphémère manquant')
        }

        const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        })
        const rawBody = await sdpRes.text()
        if (!sdpRes.ok) {
          log('Erreur connect OpenAI:', sdpRes.status, rawBody)
          let errMsg = rawBody.slice(0, 200)
          try {
            const j = JSON.parse(rawBody)
            const detail = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail || j)
            errMsg = detail.slice(0, 400)
          } catch (_) {}
          if (errMsg.includes('Gateway time-out') || errMsg.includes('504') || errMsg.includes('<!DOCTYPE')) {
            errMsg = 'Le service vocal met trop de temps à répondre. Réessaie dans une minute.'
          }
          throw new Error(errMsg || `Connexion vocale refusée (${sdpRes.status})`)
        }
        let answerSdp = rawBody
        if (rawBody.trim().startsWith('{')) {
          try {
            const data = JSON.parse(rawBody)
            const extracted = data.detail ?? data.sdp ?? data.answer
            if (typeof extracted === 'string' && extracted.includes('v=')) {
              answerSdp = extracted
              log('SDP extrait du JSON (detail/sdp/answer)')
            }
          } catch (_) {}
        }

        // Ne pas appeler setRemoteDescription si la connexion a été fermée (ex: double mount / cleanup)
        if (peerConnection.connectionState === 'closed') {
          log('Connexion déjà fermée, abandon setRemoteDescription (attempt', thisAttemptId, ')')
          return
        }
        if (peerConnection.signalingState === 'stable') {
          log('Déjà en état stable, skip setRemoteDescription (évite doublon)')
          return
        }
        await peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp })
        log('Answer SDP reçu, connexion WebRTC établie')
      } catch (err) {
        log('Erreur connexion:', err)
        setError(err.message)
        cleanup()
      } finally {
        setIsConnecting(false)
        connectingPromise = null
      }
    })()

    return connectingPromise
  }, [onMessage])

  const disconnect = useCallback(() => {
    cleanup()
    setIsConnected(false)
    setIsSpeaking(false)
    setIsAssistantSpeaking(false)
  }, [])

  return { isConnected, isConnecting, isSpeaking, isAssistantSpeaking, error, connect, disconnect }
}
