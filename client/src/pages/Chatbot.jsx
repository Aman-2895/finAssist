import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { MotionCard, SectionHeading } from '@/components/ui/Primitives'
import { chatApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const languages = [
  { label: 'English', code: 'en' },
  { label: 'हिंदी', code: 'hi' },
  { label: 'मराठी', code: 'mr' },
]

export default function Chatbot() {
  const { user } = useAuth()
  const [lang, setLang] = useState('en')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const endRef = useRef(null)

  useEffect(() => {
    chatApi.history()
      .then((logs) => {
        const flat = logs.flatMap((l) => [
          { role: 'user', text: l.message },
          { role: 'assistant', text: l.response },
        ])
        setMessages(flat.length ? flat : [{ role: 'assistant', text: `Namaste ${user?.name?.split(' ')[0] || ''}! I'm your FinAssist guide. Ask me anything about savings, loans, or your credit score.` }])
      })
      .catch(() => setMessages([{ role: 'assistant', text: "I'm your FinAssist guide. Ask me anything about savings, loans, or your credit score." }]))
      .finally(() => setLoadingHistory(false))
  }, [user])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setSending(true)
    try {
      const { response } = await chatApi.send(text, lang)
      setMessages((m) => [...m, { role: 'assistant', text: response }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: `Sorry, something went wrong: ${err.message}` }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <SectionHeading
        eyebrow="Financial literacy chatbot"
        title="Ask FinAssist anything"
        description="Powered by Gemini AI — explains credit, loans, savings, and insurance in plain language."
        action={
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm bg-transparent border outline-none"
            style={{ borderColor: 'var(--border)' }}
          >
            {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        }
      />

      <MotionCard className="flex flex-col h-[520px] p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full text-ink-faint gap-2 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading conversation…
            </div>
          ) : (
            messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                  style={{
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-sunken)',
                    color: m.role === 'user' ? 'var(--accent-ink)' : 'var(--ink)',
                  }}
                >
                  {m.role === 'assistant' && (
                    <span className="flex items-center gap-1.5 text-xs font-medium mb-1" style={{ color: 'var(--teal)' }}>
                      <Sparkles size={12} /> FinAssist
                    </span>
                  )}
                  {m.text}
                </div>
              </motion.div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2" style={{ background: 'var(--bg-sunken)', color: 'var(--ink-soft)' }}>
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex items-center gap-2 p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your score, savings, loans, insurance…"
            className="flex-1 rounded-xl px-4 py-2.5 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
            style={{ borderColor: 'var(--border)' }}
          />
          <button
            type="submit"
            disabled={sending}
            className="grid place-items-center w-10 h-10 rounded-xl shrink-0 disabled:opacity-60"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
      </MotionCard>
    </div>
  )
}
