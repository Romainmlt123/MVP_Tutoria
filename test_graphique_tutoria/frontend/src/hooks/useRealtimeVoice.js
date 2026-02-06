/**
 * Hook Realtime Voice - WebRTC + OpenAI Realtime API
 */
import { useState, useCallback } from 'react'
import useChatStore from '../store/chatStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// Singleton - une seule connexion
let pc = null, dc = null, audio = null, stream = null, connectingPromise = null

function cleanup() {
  dc?.close?.()
  stream?.getTracks().forEach(t => t.stop())
  pc?.close?.()
  if (audio) audio.srcObject = null
  pc = dc = audio = stream = connectingPromise = null
}

export default function useRealtimeVoice() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState(null)
  
  const { addMessage, setCurrentGraph } = useChatStore()

  const onMessage = useCallback((e) => {
    const data = JSON.parse(e.data)
    
    // Debug: afficher tous les événements liés aux fonctions
    if (data.type?.includes('function')) {
      console.log('🔧 Function event:', data.type, data)
    }
    
    if (data.type === 'input_audio_buffer.speech_started') setIsSpeaking(true)
    if (data.type === 'input_audio_buffer.speech_stopped') setIsSpeaking(false)
    
    if (data.type === 'response.output_item.done' && data.item?.content) {
      const text = data.item.content.find(c => c.transcript || c.text)
      if (text) addMessage({ role: 'assistant', content: text.transcript || text.text })
    }
    
    if (data.type === 'response.function_call_arguments.done' && data.name === 'generate_graph') {
      console.log('📊 Graph function called with:', data.arguments)
      try {
        const graph = JSON.parse(data.arguments)
        console.log('📊 Parsed graph:', graph)
        setCurrentGraph({ data: graph })
        addMessage({ role: 'assistant', content: `📊 ${graph.title}` })
        
        if (dc?.readyState === 'open') {
          dc.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: data.call_id, output: '{"success":true}' } }))
          dc.send(JSON.stringify({ type: 'response.create' }))
        }
      } catch(e) { console.error('❌ Graph parse error:', e) }
    }
    
    if (data.type === 'error') setError(data.error?.message)
  }, [addMessage, setCurrentGraph])

  const connect = useCallback(async () => {
    if (pc?.connectionState === 'connected') return setIsConnected(true)
    if (connectingPromise) return connectingPromise
    
    connectingPromise = (async () => {
      cleanup()
      setIsConnecting(true)
      setError(null)
      
      try {
        const res = await fetch(`${API_URL}/api/realtime/session`, { method: 'POST' })
        if (!res.ok) throw new Error('Erreur token')
        const { client_secret } = await res.json()
        
        pc = new RTCPeerConnection()
        audio = document.createElement('audio')
        audio.autoplay = true
        pc.ontrack = (e) => { audio.srcObject = e.streams[0] }
        
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
        pc.addTrack(stream.getTracks()[0])
        
        dc = pc.createDataChannel('oai-events')
        dc.onopen = () => setIsConnected(true)
        dc.onmessage = onMessage
        dc.onclose = () => { setIsConnected(false); cleanup() }
        
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        
        const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${client_secret.value}`, 'Content-Type': 'application/sdp' },
          body: offer.sdp
        })
        if (!sdpRes.ok) throw new Error('Erreur SDP')
        
        await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() })
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
    setIsConnected(false)
    setIsSpeaking(false)
  }, [])

  return { isConnected, isConnecting, isSpeaking, error, connect, disconnect }
}
