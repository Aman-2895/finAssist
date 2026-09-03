const mongoose = require('mongoose')

// One negotiation thread per (listing, counterparty) pair. Holds both the
// free-text chat and a structured offer history so the UI can show "who
// proposed what rate, when" alongside the conversation.
const negotiationSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanListing', required: true, index: true },
    // The two participants — whoever posted the listing, and whoever opened the thread against it
    posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    counterpartyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String },
        // If present, this message also carries a structured rate offer —
        // lets the UI render "proposed 11%" as a chat bubble with an Accept button.
        offerRate: { type: Number },
        offerAmount: { type: Number },
        offerTenureMonths: { type: Number },
        kind: { type: String, enum: ['message', 'offer', 'counter_offer', 'accept', 'decline'], default: 'message' },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    agreedRate: { type: Number },
    agreedAmount: { type: Number },
    agreedTenureMonths: { type: Number },
    status: { type: String, enum: ['open', 'agreed', 'declined', 'closed'], default: 'open' },
  },
  { timestamps: true }
)

negotiationSchema.index({ listingId: 1, counterpartyId: 1 }, { unique: true })

module.exports = mongoose.model('Negotiation', negotiationSchema)
