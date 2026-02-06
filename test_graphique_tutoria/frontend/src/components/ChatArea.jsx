/**
 * ChatArea - Zone de chat avec toggle texte/vocal
 */
import { useRef, useEffect, useState } from 'react'
import { FaTrashAlt, FaRobot, FaUser, FaPhone, FaKeyboard, FaPaperPlane } from 'react-icons/fa'
import useChatStore from '../store/chatStore'
import ReactMarkdown from 'react-markdown'
import VoiceChat from './VoiceChat'

export default function ChatArea() {
  const { messages, clearMessages, sendMessage, isLoading } = useChatStore()
  const [voiceMode, setVoiceMode] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <header className="h-16 px-6 bg-white border-b flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">TutorIA</h1>
          <p className="text-sm text-slate-400">Assistant pédagogique</p>
        </div>
        <button onClick={clearMessages} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <FaTrashAlt />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center">
              <FaRobot />
            </div>
            <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        {/* Toggle */}
        <div className="flex justify-center gap-2 mb-4">
          <ModeButton active={!voiceMode} onClick={() => setVoiceMode(false)} icon={<FaKeyboard />} label="Texte" />
          <ModeButton active={voiceMode} onClick={() => setVoiceMode(true)} icon={<FaPhone />} label="Vocal" />
        </div>

        {voiceMode ? (
          <VoiceChat />
        ) : (
          <div className="max-w-3xl mx-auto flex gap-3 bg-slate-50 border-2 border-slate-200 rounded-xl p-2 focus-within:border-primary-500 transition-colors">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Pose ta question... (Ex: Trace sin(x))"
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-slate-800 placeholder-slate-400 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="w-11 h-11 bg-primary-500 text-white rounded-lg flex items-center justify-center hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
            >
              <FaPaperPlane />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ModeButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon} {label}
    </button>
  )
}

function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-emerald-500 text-white' : 'bg-primary-100 text-primary-500'
      }`}>
        {isUser ? <FaUser /> : <FaRobot />}
      </div>

      <div className={`rounded-2xl px-4 py-3 ${
        isUser ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-white border rounded-bl-sm'
      }`}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
