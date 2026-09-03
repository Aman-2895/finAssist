import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Handshake, Info, Plus, X, HandCoins, TrendingUp, TrendingDown, MessageCircle, Loader2, AlertCircle } from 'lucide-react'
import { MotionCard, SectionHeading, Badge, fmtINR } from '@/components/ui/Primitives'
import NegotiationPanel from '@/components/ui/NegotiationPanel'
import { useAuth } from '@/context/AuthContext'
import { p2pApi } from '@/lib/api'

export default function P2PLending() {
  const { user } = useAuth()
  const [role, setRole] = useState('borrower') // what I want to do: 'borrower' browses lenders, 'lender' browses borrowers
  const [openListings, setOpenListings] = useState([])
  const [myListings, setMyListings] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ amount: '', interestRate: '', tenureMonths: 3, purpose: '' })

  const [activeListing, setActiveListing] = useState(null)
  const [activeNegotiation, setActiveNegotiation] = useState(null)
  const [opening, setOpening] = useState(null) // listing._id currently being opened

  const browseType = role === 'borrower' ? 'lender' : 'borrower'

  const loadAll = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([p2pApi.listings(browseType), p2pApi.myListings(), p2pApi.matches()])
      .then(([open, mine, m]) => {
        setOpenListings(open.filter((l) => String(l.postedBy?._id) !== String(user?._id)))
        setMyListings(mine)
        setMatches(m)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [browseType, user])

  useEffect(() => { loadAll() }, [loadAll])

  const postListing = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.interestRate) return
    try {
      await p2pApi.createListing({
        postType: role,
        amount: Number(form.amount),
        interestRate: Number(form.interestRate),
        tenureMonths: Number(form.tenureMonths),
        purpose: role === 'borrower' ? form.purpose : undefined,
      })
      setForm({ amount: '', interestRate: '', tenureMonths: 3, purpose: '' })
      setShowForm(false)
      loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  const openNegotiation = async (listing) => {
    setOpening(listing._id)
    setError(null)
    try {
      const neg = await p2pApi.openNegotiation(listing._id)
      setActiveListing(listing)
      setActiveNegotiation(neg)
    } catch (err) {
      setError(err.message)
    } finally {
      setOpening(null)
    }
  }

  const sendMessage = async (payload) => {
    const { negotiation, match } = await p2pApi.postMessage(activeNegotiation._id, payload)
    setActiveNegotiation(negotiation)
    if (match) {
      setMatches((m) => [match, ...m])
      loadAll()
    }
  }

  const acceptOffer = async () => {
    const { negotiation, match } = await p2pApi.accept(activeNegotiation._id)
    setActiveNegotiation(negotiation)
    setMatches((m) => [match, ...m])
    loadAll()
  }

  const declineOffer = async () => {
    const negotiation = await p2pApi.decline(activeNegotiation._id)
    setActiveNegotiation(negotiation)
    loadAll()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading the marketplace…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="P2P lending marketplace"
        title="Borrow or lend, peer to peer"
        description="A simulated marketplace — post as a lender or borrower, browse the other side, and negotiate terms directly."
      />

      <MotionCard className="flex items-start gap-3" style={{ background: 'var(--bg-sunken)' }}>
        <Info size={18} style={{ color: 'var(--ink-soft)' }} className="shrink-0 mt-0.5" />
        <p className="text-sm text-ink-soft">
          This module demonstrates matching, chat-based negotiation, and repayment scheduling
          end-to-end. Counterparties shown here are seeded demo accounts (run{' '}
          <code>npm run seed:p2p</code> on the backend) that reply automatically — production
          deployment would sit behind a licensed NBFC-P2P business partner, intentionally out
          of scope here.
        </p>
      </MotionCard>

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Role switch */}
      <div className="inline-flex rounded-xl p-1" style={{ background: 'var(--bg-sunken)' }}>
        {[
          { id: 'borrower', label: 'I want to borrow', icon: HandCoins },
          { id: 'lender', label: 'I want to lend', icon: TrendingUp },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ color: role === r.id ? 'var(--accent-ink)' : 'var(--ink-soft)' }}
          >
            {role === r.id && (
              <motion.span
                layoutId="p2p-role"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <r.icon size={15} /> {r.label}
            </span>
          </button>
        ))}
      </div>

      {/* Post form */}
      <MotionCard>
        <div className="flex items-center justify-between mb-1">
          <SectionHeading title={role === 'borrower' ? 'Post a borrow request' : 'Post a lending offer'} action={null} />
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium shrink-0 -mt-8"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? 'Cancel' : 'New post'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={postListing}
              className="overflow-hidden"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  className="rounded-xl px-3.5 py-2.5 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border)' }}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder={role === 'borrower' ? 'Max rate willing to pay (%)' : 'Desired rate (%)'}
                  className="rounded-xl px-3.5 py-2.5 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border)' }}
                  value={form.interestRate}
                  onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))}
                />
                <select
                  className="rounded-xl px-3.5 py-2.5 text-sm bg-transparent border outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  value={form.tenureMonths}
                  onChange={(e) => setForm((f) => ({ ...f, tenureMonths: e.target.value }))}
                >
                  {[3, 6, 9, 12].map((m) => <option key={m} value={m}>{m} months</option>)}
                </select>
                {role === 'borrower' && (
                  <input
                    placeholder="Purpose (e.g. bike repair)"
                    className="rounded-xl px-3.5 py-2.5 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
                    style={{ borderColor: 'var(--border)' }}
                    value={form.purpose}
                    onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                  />
                )}
              </div>
              <button type="submit" className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'var(--teal)', color: 'white' }}>
                {role === 'borrower' ? 'Post request' : 'Post listing'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </MotionCard>

      {/* My own posts */}
      {myListings.length > 0 && (
        <div>
          <SectionHeading title="Your posts" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myListings.map((l) => (
              <MotionCard key={l._id}>
                <div className="flex items-center justify-between mb-2">
                  <Badge tone="accent">{l.postType === 'lender' ? 'Lending' : 'Borrowing'}</Badge>
                  <Badge tone={l.status === 'Open' ? 'good' : l.status === 'Matched' ? 'good' : 'warn'}>{l.status}</Badge>
                </div>
                <p className="font-mono-num font-semibold text-xl text-ink">{fmtINR(l.amount)}</p>
                <p className="text-sm text-ink-soft mt-1">{l.interestRate}% · {l.tenureMonths} months</p>
                {l.purpose && <p className="text-xs text-ink-faint mt-1">{l.purpose}</p>}
              </MotionCard>
            ))}
          </div>
        </div>
      )}

      {/* Browse the other side */}
      <div>
        <SectionHeading
          title={role === 'borrower' ? 'Available lenders' : 'Borrowers looking for funds'}
          description="Open a chat to negotiate rate, amount, or tenure directly."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {openListings.map((l, i) => {
            const poster = l.postedBy
            return (
              <MotionCard key={l._id} delay={i * 0.06}>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="grid place-items-center w-10 h-10 rounded-xl"
                    style={{ background: 'var(--bg-sunken)', color: 'var(--accent)' }}
                  >
                    {l.postType === 'lender' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </span>
                  <Badge tone={l.status === 'Open' ? 'good' : 'warn'}>{l.status}</Badge>
                </div>
                <p className="text-sm font-medium text-ink">{poster?.name}</p>
                <p className="text-xs text-ink-faint mb-2">Trust score {poster?.trustScore ?? '—'}</p>
                <p className="font-mono-num font-semibold text-2xl text-ink">{fmtINR(l.amount)}</p>
                {l.purpose && <p className="text-xs text-ink-soft mt-1">{l.purpose}</p>}
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div>
                    <p className="text-ink-faint text-xs">{l.postType === 'lender' ? 'Rate' : 'Willing to pay'}</p>
                    <p className="font-mono-num text-ink font-medium">{l.interestRate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-ink-faint text-xs">Tenure</p>
                    <p className="font-mono-num text-ink font-medium">{l.tenureMonths} months</p>
                  </div>
                </div>
                <button
                  onClick={() => openNegotiation(l)}
                  disabled={opening === l._id}
                  className="w-full mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-transform active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
                >
                  {opening === l._id ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
                  {opening === l._id ? 'Opening…' : 'Contact & negotiate'}
                </button>
              </MotionCard>
            )
          })}
          {openListings.length === 0 && (
            <p className="text-sm text-ink-faint">
              No open listings from the other side right now — try <code>npm run seed:p2p</code> on the backend.
            </p>
          )}
        </div>
      </div>

      {/* Completed matches */}
      {matches.length > 0 && (
        <div>
          <SectionHeading title="Agreed deals" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => {
              const counterparty = String(m.lenderId?._id) === String(user?._id) ? m.borrowerId?.name : m.lenderId?.name
              const roleLabel = String(m.lenderId?._id) === String(user?._id) ? 'You lent' : 'You borrowed'
              return (
                <MotionCard key={m._id} className="flex items-start gap-3">
                  <span
                    className="grid place-items-center w-9 h-9 rounded-lg shrink-0"
                    style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
                  >
                    <Handshake size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{roleLabel} with {counterparty}</p>
                    <p className="text-xs text-ink-soft font-mono-num mt-0.5">{fmtINR(m.amount)} · {m.interestRate}% · {m.tenureMonths} months</p>
                  </div>
                </MotionCard>
              )
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeListing && activeNegotiation && (
          <NegotiationPanel
            listing={activeListing}
            negotiation={activeNegotiation}
            currentUserId={user?._id}
            onSendMessage={sendMessage}
            onAccept={acceptOffer}
            onDecline={declineOffer}
            onClose={() => { setActiveListing(null); setActiveNegotiation(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
