import { useMemo } from 'react'
import katex from 'katex'
import useChatStore from '../store/chatStore'

function renderLatex(latex, displayMode = true) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
    })
  } catch {
    return latex
  }
}

export default function WhiteboardPanel() {
  const { whiteboardContent, showWhiteboard, clearWhiteboard } = useChatStore()

  const htmlItems = useMemo(
    () =>
      whiteboardContent.map((latex, i) => ({
        key: i,
        html: renderLatex(latex),
      })),
    [whiteboardContent]
  )

  if (!showWhiteboard || whiteboardContent.length === 0) return null

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-border shadow-lg h-full min-h-[200px]">
      {/* En-tête style maquette */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50/80">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">school</span>
          <h3 className="text-base font-bold text-text-primary">Tableau Blanc Interactif</h3>
        </div>
        <button
          onClick={clearWhiteboard}
          className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
          aria-label="Effacer le tableau"
        >
          <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
        </button>
      </div>

      {/* Zone contenu avec grille style maquette */}
      <div
        className="flex-1 min-h-[200px] p-6 overflow-y-auto"
        style={{
          backgroundSize: '20px 20px',
          backgroundImage: `
            linear-gradient(to right, rgba(108, 92, 231, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(108, 92, 231, 0.05) 1px, transparent 1px)
          `,
        }}
      >
        <div className="flex flex-col gap-4 max-w-2xl">
          {htmlItems.map(({ key, html }) => (
            <div
              key={key}
              className="text-lg text-text-primary [&_.katex]:text-[1.1em]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
