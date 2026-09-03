const Expense = require('../models/Expense')

// Demo-grade parser: expects a CSV with columns date,description,amount,type
// A production build would route PDFs to the Python microservice for
// pdfplumber-based extraction (see /python-scoring/statement_parser.py).
function parseCsvBuffer(buffer) {
  const text = buffer.toString('utf-8')
  const lines = text.split('\n').filter(Boolean)
  const [header, ...rows] = lines
  const cols = header.split(',').map((c) => c.trim().toLowerCase())

  return rows.map((row) => {
    const values = row.split(',')
    const record = {}
    cols.forEach((c, i) => { record[c] = values[i]?.trim() })
    return {
      date: new Date(record.date),
      amount: Math.abs(Number(record.amount)),
      type: Number(record.amount) >= 0 ? 'credit' : 'debit',
      category: record.category || 'Other',
      note: record.description || '',
    }
  })
}

async function uploadStatement(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    let parsed = []
    if (req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel') {
      parsed = parseCsvBuffer(req.file.buffer)
    } else {
      return res.status(400).json({
        message: 'PDF parsing runs through the Python microservice in production — CSV supported directly here for the demo.',
      })
    }

    const docs = parsed.map((p) => ({ ...p, userId: req.userId, source: 'statement' }))
    const created = await Expense.insertMany(docs)

    res.status(201).json({ imported: created.length, expenses: created })
  } catch (err) { next(err) }
}

module.exports = { uploadStatement }
