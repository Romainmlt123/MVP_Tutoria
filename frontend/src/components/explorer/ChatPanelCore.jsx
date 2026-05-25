import { useEffect, useRef } from 'react'
import ChatMessage from '../ChatMessage'
import ChatInput from '../ChatInput'

/**
 * Zone messages + saisie (réutilisable Chat principal et Explorer).
 */
export default function ChatPanelCore({
  messages,
  isLoading,
  error,
  onSend,
  initialMessage,
  onInitialMessageConsumed,
  inputDisabled,
  className = '',
}) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${className}`}>
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 scroll-smooth overscroll-y-contain"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-36 sm:pb-40 lg:pb-36">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}
          {messages.length > 0 && (
            <div className="flex justify-center">
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted shadow-sm">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading &&
            (messages.length === 0 || messages[messages.length - 1].role === 'user') && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
                Tutor&apos;IA réfléchit...
              </div>
            )}
        </div>
      </div>

      <ChatInput
        onSend={onSend}
        disabled={inputDisabled ?? isLoading}
        initialMessage={initialMessage}
        onInitialMessageConsumed={onInitialMessageConsumed}
      />
    </div>
  )
}
