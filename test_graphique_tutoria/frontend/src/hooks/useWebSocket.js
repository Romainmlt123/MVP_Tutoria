import { useEffect, useRef, useCallback } from 'react'
import useChatStore from '../store/chatStore'

const useWebSocket = () => {
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const audioContextRef = useRef(null)

  const { 
    sessionId, 
    setConnected, 
    addMessage, 
    setCurrentGraph,
    setLoading,
    setSocket,
    isRealtimeMode
  } = useChatStore()

  // Fonction pour jouer l'audio MP3
  const playAudioResponse = async (base64Audio) => {
    try {
      // Décoder le base64 en ArrayBuffer
      const binaryString = atob(base64Audio)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      // Créer un Blob et une URL
      const blob = new Blob([bytes], { type: 'audio/mp3' })
      const audioUrl = URL.createObjectURL(blob)
      
      // Jouer l'audio
      const audio = new Audio(audioUrl)
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
      }
      await audio.play()
    } catch (error) {
      console.error('Erreur lecture audio:', error)
    }
  }

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = window.location.hostname
    const wsPort = '8001'
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws/chat/${sessionId}`

    console.log('🔌 Connexion WebSocket:', wsUrl)

    try {
      socketRef.current = new WebSocket(wsUrl)

      socketRef.current.onopen = () => {
        console.log('✅ WebSocket connecté')
        setConnected(true)
        setSocket(socketRef.current) // Passer le socket au store
        reconnectAttempts.current = 0
      }

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 Message reçu:', data.type)

          if (data.type === 'assistant_message' || data.type === 'response') {
            setLoading(false)
            addMessage({
              role: 'assistant',
              content: data.content || data.text || data.message,
            })
          } else if (data.type === 'transcription') {
            // Transcription de l'audio utilisateur
            console.log('🎤 Transcription:', data.text)
            addMessage({
              role: 'user',
              content: '🎤 ' + data.text,
            })
            setLoading(true)
          } else if (data.type === 'audio_response') {
            // Réponse audio de l'IA - IGNORER si mode Realtime actif
            if (!useChatStore.getState().isRealtimeMode) {
              console.log('🔊 Audio reçu (TTS classique)')
              playAudioResponse(data.data)
            } else {
              console.log('🔇 Audio TTS ignoré (mode Realtime actif)')
            }
          } else if (data.type === 'graph') {
            setCurrentGraph(data.data || data)
          } else if (data.type === 'typing') {
            setLoading(true)
          } else if (data.type === 'error') {
            console.error('❌ Erreur serveur:', data.message)
            setLoading(false)
            addMessage({
              role: 'assistant',
              content: '❌ Erreur: ' + data.message,
            })
          } else if (data.type === 'connected') {
            console.log('✅ Session confirmée:', data.session_id)
          }
        } catch (err) {
          console.error('Erreur parsing message:', err)
        }
      }

      socketRef.current.onclose = (event) => {
        console.log('🔌 WebSocket fermé:', event.code, event.reason)
        setConnected(false)
        setSocket(null)
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)
          console.log('🔄 Reconnexion dans ' + delay + 'ms...')
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      socketRef.current.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error)
      }
    } catch (err) {
      console.error('Erreur création WebSocket:', err)
    }
  }, [sessionId, setConnected, addMessage, setCurrentGraph, setLoading, setSocket])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    setSocket(null)
  }, [setSocket])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { connect, disconnect }
}

export default useWebSocket
