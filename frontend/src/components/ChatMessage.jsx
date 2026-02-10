import { user } from '../data/mockData'
import CodeBlock from './CodeBlock'
import GraphPanel from './GraphPanel'

/** Retire le bloc ```jsxgraph ... ``` du texte pour ne jamais afficher la config JSON à l'écran. */
function stripJsxGraphBlock(text) {
  if (!text || typeof text !== 'string') return text
  let out = text.replace(/```\s*jsxgraph\s*[\s\S]*?```/gi, '')
  out = out.replace(/\n{3,}/g, '\n\n').trim()
  return out || ''
}

function renderWithCode(text) {
  const parts = text.split(/(<code>.*?<\/code>)/g)
  return parts.map((part, i) => {
    const match = part.match(/^<code>(.*?)<\/code>$/)
    if (match) {
      return (
        <code key={`code-${i}`} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
          {match[1]}
        </code>
      )
    }
    return <span key={`text-${i}`}>{part}</span>
  })
}

export default function ChatMessage({ message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end gap-4">
        <div className="flex flex-col items-end gap-1 max-w-[80%]">
          <div className="bg-gradient-to-r from-primary to-accent-purple text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md text-[15px] leading-relaxed">
            <p>{message.content}</p>
          </div>
          <span className="text-[11px] text-text-muted pr-1">Vous</span>
        </div>
        <img src={user.avatar} alt="Vous" className="h-8 w-8 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-md text-white" aria-hidden="true">
        <span className="material-symbols-outlined text-[20px]">smart_toy</span>
      </div>
      <div className="flex flex-col gap-2 max-w-[85%] w-full">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">Tutor&apos;IA</span>
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide">PRO</span>
        </div>
        <div className="text-text-primary text-[15px] leading-7 space-y-4">
          <p>{renderWithCode(stripJsxGraphBlock(message.content))}</p>

          {message.graph && (
            <div className="mt-4">
              <GraphPanel inline graphData={{ data: message.graph }} />
            </div>
          )}

          {message.hasFormula && (
            <>
              <p>Voici la formule exprimée élégamment :</p>
              <div className="bg-slate-50 border border-border rounded-lg p-6 flex justify-center items-center my-2 shadow-inner" role="math" aria-label="Formule quadratique">
                <span className="text-2xl text-text-primary font-serif italic tracking-wide">
                  x = (-b ± √(b² - 4ac)) / 2a
                </span>
              </div>
              <p>Où :</p>
              <ul className="list-disc pl-5 space-y-1 marker:text-primary">
                <li><code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded text-sm">a</code> est le coefficient de x²</li>
                <li><code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded text-sm">b</code> est le coefficient de x</li>
                <li><code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded text-sm">c</code> est le terme constant</li>
              </ul>
              <p>Souhaitez-vous essayer de résoudre un problème avec, ou voir l&apos;implémentation Python ?</p>
            </>
          )}

          {message.hasCode && message.code && (
            <CodeBlock filename={message.code.filename} content={message.code.content} />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1">
          <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded transition-colors" aria-label="Copier le message">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">content_copy</span>
          </button>
          <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded transition-colors" aria-label="Régénérer la réponse">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span>
          </button>
          <div className="h-4 w-[1px] bg-border mx-1" aria-hidden="true" />
          <button className="p-1.5 text-text-muted hover:text-green-500 hover:bg-green-50 rounded transition-colors" aria-label="Utile">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">thumb_up</span>
          </button>
          <button className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-50 rounded transition-colors" aria-label="Pas utile">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">thumb_down</span>
          </button>
        </div>
      </div>
    </div>
  )
}