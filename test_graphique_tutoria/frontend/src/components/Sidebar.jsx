import { FaGraduationCap, FaChartLine, FaDrawPolygon, FaCircleNotch } from 'react-icons/fa'
import useChatStore from '../store/chatStore'

const examples = [
  { icon: FaChartLine, label: 'Tracer une parabole', prompt: 'Trace la courbe de f(x) = x² - 4x + 3 et ses racines' },
  { icon: FaDrawPolygon, label: 'Triangle 3-4-5', prompt: 'Dessine un triangle rectangle avec les côtés 3, 4 et 5' },
  { icon: FaCircleNotch, label: 'Cercle trigonométrique', prompt: 'Montre le cercle trigonométrique avec un angle de 60°' },
]

export default function Sidebar() {
  const { sendMessage } = useChatStore()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <FaGraduationCap className="text-3xl text-primary-500" />
          <span className="text-xl font-bold text-primary-500">TutorIA</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Assistant pédagogique IA</p>
      </div>

      {/* Exemples rapides */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-3 px-2">Exemples rapides</h3>
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => sendMessage(ex.prompt)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1.5 bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-all text-sm text-left"
          >
            <ex.icon className="text-primary-500 flex-shrink-0" />
            <span>{ex.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 text-xs text-slate-400 text-center">
        Mode texte & vocal disponibles
      </div>
    </aside>
  )
}
