import { useState } from 'react'
const COPY_FEEDBACK_MS = 2000

export default function CodeBlock({ filename, content }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    } catch {
      /* Fallback pour les contextes sans API Clipboard (HTTP, iframes…) */
      const textarea = document.createElement('textarea')
      textarea.value = content
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg font-mono text-sm w-full">
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
        <span className="text-slate-400 text-xs font-semibold">{filename}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          aria-label={copied ? 'Code copié' : 'Copier le code'}
        >
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Copié !' : 'Copier le code'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-slate-300">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  )
}