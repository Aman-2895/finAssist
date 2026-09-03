import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Send, HandCoins, Check, XCircle, Sparkles, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/Primitives'

function fmtTerms(amount, rate, months) {
  return `₹${Number(amount).toLocaleString('en-IN')} at ${rate}% for ${months} months`
}

function lastOfferOf(messages) {
  return [...messages].reverse().find((m) => m.offerRate !== undefined)
}

function MessageBubble({ msg, isMe, posterName }) {
  const isOffer = msg.offerRate !== undefined
  const isAccept = msg.kind === 'accept'
  const isDecline = msg.kind === 'decline'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-[85%]">
        {!isMe && <p className="text-xs text-ink-faint mb-1 ml-1">{posterName}</p>}
        <div
          className="rounded-2xl px-4 py-2.5 text-sm"
          style={{
            background: isAccept ? 'var(--teal-soft)' : isDecline ? 'var(--coral-soft)' : isMe ? 'var(--accent)' : 'var(--bg-sunken)',
            color: isAccept ? 'var(--teal)' : isDecline ? 'var(--coral)' : isMe ? 'var(--accent-ink)' : 'var(--ink)',
          }}
        >
          {isOffer && !isAccept && (
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1 opacity-90">
              <HandCoins size={12} /> {msg.kind === 'offer' ? 'Offer' : 'Counter-offer'}: {fmtTerms(msg.offerAmount, msg.offerRate, msg.offerTenureMonths)}
            </div>
          )}
          {isAccept && (
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
              <Check size={12} /> Accepted
            </div>
          )}
          {isDecline && (
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
              <XCircle size={12} /> Declined
            </div>
          )}
          {msg.text}
        </div>
      </div>
    </motion.div>
  )
}

export default function NegotiationPanel({ listing, negotiation, currentUserId, onSendMessage, onAccept, onDecline, onClose }) {
  const [input, setInput] = useState('')
  const [proposedRate, setProposedRate] = useState(listing.interestRate)
  const [showOfferBar, setShowOfferBar] = useState(false)
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)
  const poster = listing.postedBy // populated { _id, name, isDemoBot, trustScore }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [negotiation.messages.length])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || busy) return
    setBusy(true)
    try {
      await onSendMessage({ text: input.trim() })
      setInput('')
    } finally {
      setBusy(false)
    }
  }

  const sendOffer = async () => {
    const last = lastOfferOf(negotiation.messages)
    setBusy(true)
    try {
      await onSendMessage({
        kind: 'counter_offer',
        offerRate: proposedRate,
        offerAmount: last?.offerAmount ?? listing.amount,
        offerTenureMonths: last?.offerTenureMonths ?? listing.tenureMonths,
        text: `Proposing ${proposedRate}% — ${fmtTerms(last?.offerAmount ?? listing.amount, proposedRate, last?.offerTenureMonths ?? listing.tenureMonths)}.`,
      })
      setShowOfferBar(false)
    } finally {
      setBusy(false)
    }
  }

  const handleAccept = async () => {
    setBusy(true)
    try { await onAccept() } finally { setBusy(false) }
  }

  const handleDecline = async () => {
    setBusy(true)
    try { await onDecline() } finally { setBusy(false) }
  }

  const latest = lastOfferOf(negotiation.messages)
  const isAgreed = negotiation.status === 'agreed'
  const isDeclined = negotiation.status === 'declined'

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className="fixed right-0 top-0 z-50 h-full w-full sm:w-[420px] flex flex-col"
        style={{ background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="min-w-0">
            <p className="font-display font-semibold text-ink truncate">{poster?.name}</p>
            <p className="text-xs text-ink-faint">
              {listing.postType === 'lender' ? 'Lending' : 'Borrowing'} · Trust score {poster?.trustScore ?? '—'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-ink-soft hover:text-ink shrink-0" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div
          className="px-5 py-3 flex items-center justify-between text-xs border-b"
          style={{ background: 'var(--bg-sunken)', borderColor: 'var(--border)' }}
        >
          <span className="text-ink-soft">Original listing</span>
          <span className="font-mono-num font-medium text-ink">{fmtTerms(listing.amount, listing.interestRate, listing.tenureMonths)}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {negotiation.messages.map((m, i) => (
            <MessageBubble key={m._id || i} msg={m} isMe={String(m.senderId) === String(currentUserId)} posterName={poster?.name} />
          ))}
          <div ref={endRef} />
        </div>

        {isAgreed && (
          <div className="mx-5 mb-3 rounded-xl p-3 flex items-start gap-2.5" style={{ background: 'var(--teal-soft)' }}>
            <Sparkles size={16} style={{ color: 'var(--teal)' }} className="shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: 'var(--teal)' }}>
              Terms locked: {fmtTerms(negotiation.agreedAmount, negotiation.agreedRate, negotiation.agreedTenureMonths)}. A simulated repayment schedule has been generated.
            </p>
          </div>
        )}

        {!isAgreed && !isDeclined && showOfferBar && (
          <div className="px-5 pb-2">
            <div className="rounded-xl p-3 mb-2" style={{ background: 'var(--bg-sunken)' }}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-ink-soft">Propose rate</span>
                <span className="font-mono-num font-semibold text-ink">{proposedRate}%</span>
              </div>
              <input
                type="range"
                min={4}
                max={20}
                step={0.5}
                value={proposedRate}
                onChange={(e) => setProposedRate(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <button
                onClick={sendOffer}
                disabled={busy}
                className="w-full mt-2 py-2 rounded-lg text-xs font-medium disabled:opacity-60"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                {busy ? <Loader2 size={13} className="animate-spin mx-auto" /> : `Send offer at ${proposedRate}%`}
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
          {!isAgreed && !isDeclined ? (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOfferBar((s) => !s)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border shrink-0"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                >
                  <HandCoins size={14} /> Counter
                </button>
                {latest && (
                  <button
                    onClick={handleAccept}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium shrink-0 disabled:opacity-60"
                    style={{ background: 'var(--teal)', color: 'white' }}
                  >
                    <Check size={14} /> Accept {latest.offerRate}%
                  </button>
                )}
                <button
                  onClick={handleDecline}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border shrink-0 disabled:opacity-60"
                  style={{ borderColor: 'var(--border)', color: 'var(--coral)' }}
                >
                  <XCircle size={14} />
                </button>
              </div>
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message…"
                  className="flex-1 rounded-xl px-3.5 py-2.5 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border)' }}
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="grid place-items-center w-10 h-10 rounded-xl shrink-0 disabled:opacity-60"
                  style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
                  aria-label="Send"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </>
          ) : (
            <Badge tone={isAgreed ? 'good' : 'warn'}>
              {isAgreed ? 'Deal agreed — closed thread' : 'Negotiation declined'}
            </Badge>
          )}
        </div>
      </motion.div>
    </>
  )
}
