import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import GraphPanel from '../components/GraphPanel'
import WhiteboardPanel from '../components/WhiteboardPanel'
import VoiceOrb from '../components/VoiceOrb'
import useRealtimeVoice from '../hooks/useRealtimeVoice'
import useChatStore from '../store/chatStore'

const STATUS_CONFIG = {
  connecting: { label: 'Connexion...' },
  error: { label: 'Erreur de connexion' },
  ready: { label: "Prêt à écouter" },
  speaking: { label: 'Tu peux parler' },
  disconnected: { label: 'Déconnecté' },
}

export default function Voice() {
  const { showGraphPanel, showWhiteboard, graphVersion } = useChatStore()
  const { isConnected, isConnecting, isSpeaking, isAssistantSpeaking, error, connect, disconnect } = useRealtimeVoice()

  const connectTimeoutRef = useRef(null)
  useEffect(() => {
    connectTimeoutRef.current = setTimeout(connect, 150)
    return () => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
      disconnect()
    }
  }, [connect, disconnect])

  const status = isConnecting ? 'connecting' : error ? 'error' : isConnected ? (isSpeaking ? 'speaking' : 'ready') : 'disconnected'
  const label = status === 'error' ? error : STATUS_CONFIG[status].label
  const hasContent = showGraphPanel || showWhiteboard

  const primaryAction = isConnected
    ? { label: 'Terminer', icon: 'call_end', onClick: disconnect, className: 'bg-red-500 hover:bg-red-600 text-white' }
    : { label: isConnecting ? 'Connexion...' : 'Démarrer', icon: isConnecting ? 'progress_activity' : 'mic', onClick: connect, className: 'bg-primary hover:bg-primary-dark text-white' }

  return (
    <div className="relative flex h-full min-h-dvh min-h-screen w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#f5f1ff_0%,#f0f2f8_45%,#e9edf7_100%)] font-display text-text-primary antialiased touch-manipulation">
      {/* En-tête minimal */}
      <header className="relative z-10 flex w-full shrink-0 items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-8 sm:py-4">
        <Link to="/chat" className="inline-flex transition-opacity hover:opacity-80">
          <Logo subtitle={null} />
        </Link>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
            isConnected
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-white/80 border-border text-text-secondary'
          }`}>
            {isConnected ? 'En direct' : 'Hors ligne'}
          </span>
          <Link
            to="/chat"
            className="w-9 h-9 rounded-full border border-border bg-white/80 backdrop-blur flex items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="Quitter le mode vocal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </Link>
        </div>
      </header>

      {/* Contenu généré éventuel */}
      <main className="relative z-0 flex flex-1 min-h-0 overflow-hidden">
        {hasContent && (
          <div className="flex-1 min-w-0 flex flex-col md:flex-row gap-3 overflow-hidden px-4 pb-28">
            {showGraphPanel && (
              <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                <GraphPanel key={graphVersion} fill />
              </div>
            )}
            {showWhiteboard && (
              <div className="flex flex-col flex-1 min-w-0 min-h-0">
                <WhiteboardPanel />
              </div>
            )}
          </div>
        )}

        {/* Overlay vocal principal */}
        <div className={`absolute inset-0 z-20 flex flex-col items-center ${hasContent ? 'justify-end pb-28 pointer-events-none' : 'justify-center'} px-4`}>
          <div className={`${hasContent ? 'mb-4' : 'mb-6'} text-center pointer-events-none`}>
            <p className="text-sm md:text-base text-text-secondary">{label}</p>
          </div>
          <div className="pointer-events-none">
            <VoiceOrb status={status} assistantSpeaking={isAssistantSpeaking} size={hasContent ? 'footer' : 'center'} />
          </div>
        </div>
      </main>

      {/* Contrôles minimalistes */}
      <footer className="relative z-30 flex-none min-h-[5.5rem] flex items-center justify-center pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white/85 backdrop-blur-xl border border-border rounded-full px-2.5 sm:px-3 py-2 shadow-lg max-w-[calc(100vw-1rem)]">
          <button
            onClick={primaryAction.onClick}
            disabled={isConnecting}
            className={`flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full font-medium transition-all disabled:opacity-70 ${primaryAction.className}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isConnecting ? 'animate-spin' : ''}`}>{primaryAction.icon}</span>
            {primaryAction.label}
          </button>
          {error && (
            <button
              onClick={connect}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-slate-100 text-text-primary hover:bg-slate-200 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Réessayer
            </button>
          )}
          <Link
            to="/chat"
            className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Quitter le mode vocal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}
