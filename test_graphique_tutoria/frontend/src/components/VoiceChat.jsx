/**
 * VoiceChat - Interface vocale Realtime
 */
import { useEffect } from 'react'
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaSpinner } from 'react-icons/fa'
import useRealtimeVoice from '../hooks/useRealtimeVoice'

export default function VoiceChat() {
  const { isConnected, isConnecting, isSpeaking, error, connect, disconnect } = useRealtimeVoice()

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const status = isConnecting ? 'connecting' 
    : error ? 'error' 
    : isConnected ? (isSpeaking ? 'speaking' : 'ready') 
    : 'disconnected'

  const styles = {
    connecting: { bg: 'bg-yellow-100 animate-pulse', icon: <FaSpinner className="w-12 h-12 text-yellow-500 animate-spin" />, text: <span className="text-yellow-600">Connexion...</span> },
    error: { bg: 'bg-red-100', icon: <FaMicrophoneSlash className="w-12 h-12 text-red-500" />, text: <span className="text-red-600">{error}</span> },
    ready: { bg: 'bg-green-100', icon: <FaMicrophone className="w-12 h-12 text-green-500" />, text: <span className="text-green-600">🎤 Parle, je t'écoute !</span> },
    speaking: { bg: 'bg-blue-100 scale-110 animate-pulse', icon: <FaMicrophone className="w-12 h-12 text-blue-500" />, text: <span className="text-blue-600">🎙️ Je t'écoute...</span> },
    disconnected: { bg: 'bg-slate-100', icon: <FaMicrophoneSlash className="w-12 h-12 text-slate-400" />, text: <span className="text-slate-500">Déconnecté</span> },
  }

  const { bg, icon, text } = styles[status]

  return (
    <div className="flex flex-col items-center py-8">
      <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all ${bg}`}>
        {icon}
      </div>

      <p className="text-center mb-6 font-medium">{text}</p>

      <div className="flex gap-3">
        {!isConnected && !isConnecting && (
          <button onClick={connect} className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600">
            Connecter
          </button>
        )}
        {isConnected && (
          <button onClick={disconnect} className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center gap-2">
            <FaPhoneSlash /> Raccrocher
          </button>
        )}
        {error && (
          <button onClick={connect} className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
            Réessayer
          </button>
        )}
      </div>

      <p className="mt-6 text-sm text-slate-400 text-center max-w-sm">
        Mode vocal temps réel - TutorIA répond instantanément
      </p>
    </div>
  )
}
