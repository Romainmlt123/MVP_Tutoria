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
    <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-4 sm:pt-6 z-30 flex justify-center pointer-events-none bg-gradient-to-t from-background via-background to-transparent">
      <div className="w-full max-w-3xl pointer-events-auto">
        <form
          onSubmit={handleSubmit}
          className="relative group bg-surface border border-border rounded-xl shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 focus-within:shadow-xl"
        >
          <label htmlFor="chat-input" className="sr-only">Votre message</label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-0 text-text-primary placeholder-text-muted px-4 py-4 pr-12 rounded-xl focus:ring-0 resize-none max-h-32 overflow-y-auto text-[16px]"
            placeholder="Écrivez un message, collez du code ou envoyez un problème..."
            rows="1"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              <button type="button" className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" aria-label="Joindre un fichier">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">attach_file</span>
              </button>
              <button type="button" className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" aria-label="Message vocal">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">mic</span>
              </button>
              <button type="button" className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors hidden sm:block" aria-label="Envoyer une image">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">image</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="bg-gradient-to-r from-primary to-accent-purple hover:opacity-90 text-white rounded-lg p-2 px-3 flex items-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Envoyer le message"
            >
              <span className="text-sm font-bold hidden sm:block">Envoyer</span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">send</span>
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-text-muted">L&apos;IA peut faire des erreurs. Veuillez vérifier les informations importantes.</p>
        </div>
      </div>
    </div>
  )
}