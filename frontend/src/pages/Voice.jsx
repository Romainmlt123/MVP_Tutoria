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
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#f5f1ff_0%,#f0f2f8_45%,#e9edf7_100%)] font-display text-text-primary antialiased touch-manipulation">
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

      {/* Contenu généré + zone vocale */}
      <main className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">
        {hasContent && (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden px-4 pb-2 pt-1 md:flex-row md:pb-4">
            {showGraphPanel && (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <GraphPanel key={graphVersion} fill />
              </div>
            )}
            {showWhiteboard && (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <WhiteboardPanel />
              </div>
            )}
          </div>
        )}

        <div
          className={
            hasContent
              ? 'pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-end px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] pt-20 lg:pb-28'
              : 'flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6'
          }
        >
          <div className={`text-center ${hasContent ? 'mb-2' : 'mb-5'}`}>
            <p className="text-sm text-text-secondary md:text-base">{label}</p>
          </div>
          <VoiceOrb status={status} assistantSpeaking={isAssistantSpeaking} size={hasContent ? 'footer' : 'center'} />
        </div>
      </main>

      {/* Contrôles : dans le flux pour rester au-dessus de la barre mobile fixe */}
      <footer className="relative z-30 shrink-0 flex flex-col items-center gap-2 px-3 pb-[calc(var(--app-bottom-nav-height,4.25rem)+env(safe-area-inset-bottom,0px))] pt-1 md:pb-3">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white/90 backdrop-blur-xl border border-border rounded-full px-2 py-2 shadow-lg max-w-[min(100%,24rem)]">
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
