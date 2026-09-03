// Central API client — every backend call in the app goes through here.
// Base URL comes from VITE_API_URL (see .env.example). Auth is handled by
// Clerk: AuthContext registers a `getToken` function (from Clerk's useAuth
// hook) via setClerkTokenGetter, and every request fetches a fresh session
// token through it — Clerk tokens are short-lived, so we can't just cache
// one in localStorage the way the old custom JWT flow did.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

let clerkTokenGetter = null
export function setClerkTokenGetter(fn) {
  clerkTokenGetter = fn
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {}
  const token = clerkTokenGetter ? await clerkTokenGetter() : null
  if (token) headers.Authorization = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  let data = null
  try { data = await res.json() } catch { /* empty body */ }

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status)
  }
  return data
}

const get = (path) => request(path)
const post = (path, body) => request(path, { method: 'POST', body })
const put = (path, body) => request(path, { method: 'PUT', body })
const del = (path) => request(path, { method: 'DELETE' })

// ---- Resource-specific API groups ----

export const userApi = {
  me: () => get('/users/me'),
  update: (updates) => put('/users/me', updates),
}

export const expenseApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return get(`/expenses${qs ? `?${qs}` : ''}`)
  },
  create: (expense) => post('/expenses', expense),
  remove: (id) => del(`/expenses/${id}`),
  monthlySummary: () => get('/expenses/summary/monthly'),
}

export const goalApi = {
  list: () => get('/goals'),
  create: (goal) => post('/goals', goal),
  update: (id, updates) => put(`/goals/${id}`, updates),
  remove: (id) => del(`/goals/${id}`),
  accelerate: (id, desiredMonths) => post(`/goals/${id}/accelerate`, { desiredMonths }),
}

export const creditScoreApi = {
  me: () => get('/credit-score/me'),
  history: () => get('/credit-score/history'),
}

export const investmentApi = {
  list: () => get('/investments'),
  create: (inv) => post('/investments', inv),
  suggest: (monthlyIncome, monthlyExpense) => post('/investments/suggest', { monthlyIncome, monthlyExpense }),
}

export const insuranceApi = {
  schemes: () => get('/insurance/schemes'),
  myMatches: () => get('/insurance/my-matches'),
}

export const simulationApi = {
  list: () => get('/simulations'),
  run: (income, categories) => post('/simulations', { income, categories }),
}

export const plannedExpenseApi = {
  list: () => get('/planned-expenses'),
  create: (item) => post('/planned-expenses', item),
  remove: (id) => del(`/planned-expenses/${id}`),
  advisory: (id) => get(`/planned-expenses/${id}/advisory`),
}

export const chatApi = {
  send: (message, language) => post('/chat/message', { message, language }),
  history: () => get('/chat/history'),
}

export const p2pApi = {
  listings: (postType) => get(`/p2p/listings${postType ? `?postType=${postType}` : ''}`),
  myListings: () => get('/p2p/listings/mine'),
  createListing: (listing) => post('/p2p/listings', listing),
  closeListing: (id) => post(`/p2p/listings/${id}/close`),
  openNegotiation: (listingId) => post(`/p2p/listings/${listingId}/negotiate`),
  myNegotiations: () => get('/p2p/negotiations'),
  getNegotiation: (id) => get(`/p2p/negotiations/${id}`),
  postMessage: (id, message) => post(`/p2p/negotiations/${id}/messages`, message),
  accept: (id) => post(`/p2p/negotiations/${id}/accept`),
  decline: (id) => post(`/p2p/negotiations/${id}/decline`),
  matches: () => get('/p2p/matches'),
}

export const statementApi = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('statement', file)
    return request('/statements/upload', { method: 'POST', body: formData, isFormData: true })
  },
}

export { ApiError }
