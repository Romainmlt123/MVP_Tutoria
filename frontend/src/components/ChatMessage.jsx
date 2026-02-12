import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
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

/** Convertit \( \) et \[ \] en $ et $$ pour compatibilité remark-math */
function convertLatexDelimiters(text) {
  if (!text || typeof text !== 'string') return text
  return text
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')
}

const markdownComponents = {
  h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-2 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold mt-5 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-bold mt-4 mb-2">{children}</h3>,
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-primary">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ children, className }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      )
    }
    return <code className="block p-4 bg-slate-800 text-slate-300 rounded-lg overflow-x-auto font-mono text-sm">{children}</code>
  },
  pre: ({ children }) => <pre className="mb-3 overflow-x-auto">{children}</pre>,
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
        <div className="text-text-primary text-[15px] leading-7 space-y-4 [&_.katex]:text-[1.05em]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {convertLatexDelimiters(stripJsxGraphBlock(message.content))}
          </ReactMarkdown>

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