import { useState, useRef, useCallback, useEffect } from 'react'
export default function ChatInput({ onSend, disabled, initialMessage, onInitialMessageConsumed }) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage)
      onInitialMessageConsumed?.()
    }
  }, [initialMessage, onInitialMessageConsumed])

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = ''
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [])

  const handleInput = (e) => {
    setMessage(e.target.value)
    resetHeight()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const text = message.trim()
    if (!text || disabled) return
    onSend?.(text)
    setMessage('')
    if (textareaRef.current) textareaRef.current.style.height = ''
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex justify-center bg-gradient-to-t from-background from-50% to-transparent px-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-3 sm:px-4 sm:pb-2 sm:pt-5 lg:pb-3">
      <div className="pointer-events-auto w-full max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="relative group overflow-hidden rounded-xl border border-border bg-surface shadow-lg transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/30"
        >
          <label htmlFor="chat-input" className="sr-only">
            Votre message
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full resize-none overflow-y-auto border-0 bg-transparent px-4 py-3 pr-12 text-[16px] text-text-primary placeholder-text-muted focus:ring-0 max-h-32 rounded-t-xl"
            placeholder="Écrivez un message, collez du code ou envoyez un problème..."
            rows="1"
          />
          <div className="flex items-center justify-between border-t border-border/60 px-2 py-1.5">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="p-2 text-text-muted transition-colors hover:bg-primary/5 hover:text-primary rounded-lg"
                aria-label="Joindre un fichier"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  attach_file
                </span>
              </button>
              <button
                type="button"
                className="p-2 text-text-muted transition-colors hover:bg-primary/5 hover:text-primary rounded-lg"
                aria-label="Message vocal"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  mic
                </span>
              </button>
              <button
                type="button"
                className="hidden p-2 text-text-muted transition-colors hover:bg-primary/5 hover:text-primary rounded-lg sm:block"
                aria-label="Envoyer une image"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  image
                </span>
              </button>
            </div>
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent-purple p-2 px-3 text-white shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Envoyer le message"
            >
              <span className="hidden text-sm font-bold sm:inline">Envoyer</span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                send
              </span>
            </button>
          </div>
          <p className="border-t border-border/40 bg-surface/95 px-3 py-1 text-center text-[9px] leading-tight text-text-muted sm:text-[10px]">
            L&apos;IA peut se tromper : vérifie les infos importantes.
          </p>
        </form>
      </div>
    </div>
  )
}