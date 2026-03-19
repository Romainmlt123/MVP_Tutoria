/**
 * Hook Realtime Voice - WebRTC + OpenAI Realtime API
 */
import { useState, useCallback } from 'react'
import useChatStore from '../store/chatStore'
import useProfileStore from '../store/profileStore'
import { normalizeGraphData } from '../utils/graphNormalizer'
import { buildUserContextForPrompt } from '../utils/onboardingContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const DEBUG = import.meta.env.DEV
const log = (...args) => DEBUG && console.log('[Realtime]', ...args)

let pc = null
let dc = null
let audio = null
let stream = null
let connectingPromise = null

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

function sendFunctionOutput(callId) {
  if (dc?.readyState !== 'open') return
  dc.send(JSON.stringify({
    type: 'conversation.item.create',
    item: { type: 'function_call_output', call_id: callId, output: '{"success":true}' },
  }))
  dc.send(JSON.stringify({ type: 'response.create' }))
}

function extractTranscript(content) {
  if (!content) return null
  const part = Array.isArray(content) ? content.find((c) => c.transcript || c.text) : content
  return part?.transcript ?? part?.text ?? (typeof part === 'string' ? part : null)
}

export default function useRealtimeVoice() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false)
  const [error, setError] = useState(null)

  const { addMessage, setCurrentGraph, setWhiteboardContent, clearWhiteboard } = useChatStore()

  const onMessage = useCallback(
    (e) => {
      let data
      try {
        data = JSON.parse(e.data)
      } catch {
        log('Parse error:', e.data?.slice?.(0, 50))
        return
      }

      const { type } = data

      switch (type) {
        case 'input_audio_buffer.speech_started':
          setIsSpeaking(true)
          break
        case 'input_audio_buffer.speech_stopped':
          setIsSpeaking(false)
          break
        case 'response.created':
          setIsAssistantSpeaking(true)
          break
        case 'response.done': {
          const resp = data.response
          if (resp?.status === 'failed') {
            const err = resp?.error || resp?.status_details
            const msg = err?.message ?? err?.code ?? JSON.stringify(err)
            setError(`Réponse IA échouée: ${msg}`)
            log('Response failed:', msg)
          }
          setIsAssistantSpeaking(false)
          break
        }
        case 'response.output_item.done': {
          const text = extractTranscript(data.item?.content)
          if (text) addMessage({ role: 'assistant', content: text })
          break
        }
        case 'response.function_call_arguments.done': {
          const { name, call_id, arguments: argsStr } = data
          if (name === 'generate_graph' && argsStr) {
            try {
              const graph = normalizeGraphData(JSON.parse(argsStr))
              if (graph) {
                setCurrentGraph({ data: graph })
                addMessage({ role: 'assistant', content: `📊 ${graph.title || 'Graphique'}` })
              }
            } catch (err) {
              console.error('[Realtime] Graph error:', err)
            }
            sendFunctionOutput(call_id)
          } else if (name === 'write_to_whiteboard' && argsStr) {
            try {
              const { content, action = 'append' } = JSON.parse(argsStr)
              action === 'clear' ? setWhiteboardContent('', 'clear') : (typeof content === 'string' && setWhiteboardContent(content, action))
            } catch (err) {
              console.error('[Realtime] Whiteboard error:', err)
            }
            sendFunctionOutput(call_id)
          }
          break
        }
        case 'error':
          setError(data.error?.message ?? data.message ?? JSON.stringify(data))
          log('Server error:', data)
          break
        default:
          break
      }
    },
    [addMessage, setCurrentGraph, setWhiteboardContent]
  )

  const connect = useCallback(async () => {
    if (pc?.connectionState === 'connected') return setIsConnected(true)
    if (connectingPromise) return connectingPromise

    connectingPromise = (async () => {
      cleanup()
      setIsConnecting(true)
      setError(null)
      log('Connecting...')

      try {
        const peerConnection = new RTCPeerConnection()
        pc = peerConnection
        audio = document.createElement('audio')
        audio.autoplay = true
        audio.setAttribute('playsinline', '')
        audio.style.cssText = 'position:fixed;width:0;height:0;opacity:0;pointer-events:none;'
        document.body.appendChild(audio)

        let remoteAttached = false
        peerConnection.ontrack = (e) => {
          if (remoteAttached) return
          const s = e.streams[0]
          if (!s?.getAudioTracks().length) return
          remoteAttached = true
          audio.srcObject = new MediaStream([s.getAudioTracks()[0]])
          audio.play().catch((err) => log('Audio play:', err?.message))
        }

        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
        peerConnection.addTrack(stream.getTracks()[0])

        dc = peerConnection.createDataChannel('oai-events')
        dc.onopen = () => setIsConnected(true)
        dc.onmessage = onMessage
        dc.onclose = () => { setIsConnected(false); cleanup() }
        dc.onerror = (e) => log('DataChannel error:', e)

        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)

        const userContext = buildUserContextForPrompt(useProfileStore.getState().profile)
        const sessionRes = await fetch(`${API_URL}/api/realtime/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_context: userContext }),
        })
        if (!sessionRes.ok) {
          const text = await sessionRes.text()
          let msg
          try {
            const j = JSON.parse(text)
            msg = typeof j.detail === 'string' ? j.detail : j.detail?.[0]?.msg ?? j.error ?? text
          } catch {
            msg = text?.slice(0, 200) || `Erreur (${sessionRes.status})`
          }
          throw new Error(msg)
        }
        const sessionData = await sessionRes.json()
        const clientSecret = sessionData?.client_secret?.value
        if (!clientSecret) throw new Error('Token manquant')

        const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
          method: 'POST',
          headers: { Authorization: `Bearer ${clientSecret}`, 'Content-Type': 'application/sdp' },
          body: offer.sdp,
        })
        let answerSdp = await sdpRes.text()
        if (!sdpRes.ok) {
          let msg = answerSdp.slice(0, 200)
          try {
            const j = JSON.parse(answerSdp)
            msg = (typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail || j)).slice(0, 400)
          } catch (_) {}
          if (msg.includes('504') || msg.includes('Gateway')) msg = 'Service vocal temporairement indisponible. Réessaie.'
          throw new Error(msg || `Connexion refusée (${sdpRes.status})`)
        }
        if (answerSdp.trim().startsWith('{')) {
          try {
            const j = JSON.parse(answerSdp)
            const ext = j.detail ?? j.sdp ?? j.answer
            if (typeof ext === 'string' && ext.includes('v=')) answerSdp = ext
          } catch (_) {}
        }

        if (peerConnection.connectionState === 'closed') return
        if (peerConnection.signalingState !== 'stable') {
          await peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp })
        }
        log('Connected')
      } catch (err) {
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
    clearWhiteboard()
    setIsConnected(false)
    setIsSpeaking(false)
    setIsAssistantSpeaking(false)
  }, [clearWhiteboard])

  return { isConnected, isConnecting, isSpeaking, isAssistantSpeaking, error, connect, disconnect }
}
