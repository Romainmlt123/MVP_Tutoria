import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import GraphPanel from './components/GraphPanel'
import useChatStore from './store/chatStore'

function App() {
  const { showGraphPanel } = useChatStore()

  return (
    <div className="flex h-screen w-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex min-w-0">
        <ChatArea />
        {showGraphPanel && <GraphPanel />}
      </main>
    </div>
  )
}

export default App
