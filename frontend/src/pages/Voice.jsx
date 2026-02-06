import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import GraphPanel from '../components/GraphPanel'
import VoiceBars from '../components/VoiceBars'
import useRealtimeVoice from '../hooks/useRealtimeVoice'
import useChatStore from '../store/chatStore'

export default function Voice() {
  const { showGraphPanel, graphVersion } = useChatStore()
  const {
    isConnected,
    isConnecting,
    isSpeaking,
    isAssistantSpeaking,
    error,
    connect,
    disconnect,
  } = useRealtimeVoice()

  const connectTimeoutRef = useRef(null)
  useEffect(() => {
    connectTimeoutRef.current = setTimeout(() => connect(), 150)
    return () => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
      disconnect()
    }
  }, [connect, disconnect])

  const status = isConnecting
    ? 'connecting'
    : error
      ? 'error'
      : isConnected
        ? isSpeaking
          ? 'speaking'
          : 'ready'
        : 'disconnected'

  const statusConfig = {
    connecting: {
      icon: 'progress_activity',
      iconClass: 'text-amber-600 animate-spin text-[24px]',
      label: 'Connexion en cours...',
    },
    error: {
      icon: 'mic_off',
      iconClass: 'text-red-500 text-[24px]',
      label: error,
    },
    ready: {
      icon: 'mic',
      iconClass: 'text-green-600 text-[24px]',
      label: "Parle, je t'écoute !",
    },
    speaking: {
      icon: 'mic',
      iconClass: 'text-primary text-[24px]',
      label: "Je t'écoute...",
    },
    disconnected: {
      icon: 'mic_off',
      iconClass: 'text-slate-400 text-[24px]',
      label: 'Déconnecté',
    },
  }

  const config = statusConfig[status]

  // Layout comme sur l'image : quand un graphique est généré, le graph occupe la grande zone
  // et la zone vocale (texte + 5 traits + EN DIRECT) est en bas à droite.
  return (
    <div className="relative flex h-full min-h-[80vh] w-full flex-col overflow-hidden bg-gradient-to-br from-[#f0f2f8] via-white to-[#ede7f6] font-display text-text-primary antialiased">
      {/* En-tête */}
      <header className="relative z-10 flex w-full shrink-0 items-center justify-between px-6 py-4 md:px-10">
        <Link to="/chat" className="inline-flex transition-opacity hover:opacity-80">
          <Logo subtitle={null} />
        </Link>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm border shadow-sm ${
            isConnected ? 'bg-green-50 border-green-200' : 'bg-white/80 border-border'
          }`}
        >
          <div
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-widest">
            {isConnected ? 'En direct' : 'Hors ligne'}
          </span>
        </div>
      </header>

      {/* Zone principale : graph en grande zone OU écran centré ; zone vocale en bas à droite quand graph */}
      <main className="relative z-10 flex flex-1 min-h-0 overflow-hidden">
        {/* Grande zone : graphique (si généré) ou vide pour centrer le bloc vocal */}
        {showGraphPanel && (
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden pr-4 pb-4">
            <GraphPanel key={graphVersion} fill />
          </div>
        )}

        {/* Zone vocale : centrée quand pas de graph (barres au centre comme l'orbe) */}
        {!showGraphPanel && (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="mb-8 text-center">
              <h2 className="text-xl font-light text-text-primary md:text-2xl lg:text-3xl animate-pulse-slow tracking-wide">
                Tutor&apos;IA vous écoute...
              </h2>
            </div>
            <p className="text-center font-medium text-text-primary max-w-sm mb-6">
              {config.label}
            </p>
            {/* Barres au centre (comme l'orbe) — animation uniquement quand l'IA parle */}
            <div className="mb-8">
              <VoiceBars status={status} assistantSpeaking={isAssistantSpeaking} size="center" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {!isConnected && !isConnecting && (
                <button
                  onClick={connect}
                  className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">link</span>
                  Connecter
                </button>
              )}
              {isConnected && (
                <button
                  onClick={disconnect}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">call_end</span>
                  Raccrocher
                </button>
              )}
              {error && (
                <button
                  onClick={connect}
                  className="px-6 py-2.5 bg-slate-600 text-white rounded-full font-medium hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                  Réessayer
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer selon maquette_version2 : 3 colonnes (micro, barres, quitter) */}
      <footer className="relative z-20 flex-none h-24 bg-white border-t border-border grid grid-cols-3 items-center px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Colonne gauche : Micro + texte */}
        <div className="justify-self-start flex items-center gap-4">
          <button
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              isConnected
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-slate-100 text-text-muted hover:bg-slate-200'
            }`}
            aria-label="Microphone"
          >
            <span className="material-symbols-outlined text-2xl">
              {isConnected ? 'mic' : 'mic_off'}
            </span>
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-text-primary leading-tight">
              {isConnected ? (isAssistantSpeaking ? "IA en train de parler..." : "En écoute...") : "Hors ligne"}
            </span>
            <span className="text-xs text-text-muted">
              {isConnected ? "Microphone actif" : "Microphone désactivé"}
            </span>
          </div>
        </div>

        {/* Colonne centre : 5 barres (uniquement quand un graphique est affiché, sinon barres au centre de la page) */}
        <div className="justify-self-center">
          {showGraphPanel && (
            <VoiceBars status={status} assistantSpeaking={isAssistantSpeaking} size="footer" />
          )}
        </div>

        {/* Colonne droite : Bouton quitter */}
        <div className="justify-self-end">
          {!isConnected && !isConnecting && (
            <button
              onClick={connect}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all duration-200 font-medium shadow-md shadow-primary/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">link</span>
              Connecter
            </button>
          )}
          {isConnected && (
            <button
              onClick={disconnect}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-md shadow-red-600/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">call_end</span>
              Raccrocher
            </button>
          )}
          {error && (
            <button
              onClick={connect}
              className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-all duration-200 font-medium shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Réessayer
            </button>
          )}
          {!isConnected && !isConnecting && !error && (
            <Link
              to="/chat"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-md shadow-red-600/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Quitter le mode vocal
            </Link>
          )}
        </div>
      </footer>
    </div>
  )
}
