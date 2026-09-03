// Server-side mirror of client/src/lib/p2pEngine.js's simulateCounterpartyReply.
// When a human negotiates against a seeded demo-bot counterparty (see
// config/seedP2P.js), this generates that counterparty's reply so the
// marketplace has someone to talk to without needing two live sessions.

function fmtTerms(amount, rate, months) {
  return `₹${amount.toLocaleString('en-IN')} at ${rate}% for ${months} months`
}

function lastOfferFrom(messages) {
  return [...messages].reverse().find((m) => m.offerRate !== undefined)
}

/**
 * @param {Object} negotiation - Mongoose Negotiation document (or plain object)
 * @param {Object} listing - Mongoose LoanListing document
 * @param {String} botUserId - the bot's User _id (the poster in this thread)
 */
function generateBotReply(negotiation, listing, botUserId) {
  const myLastOffer = lastOfferFrom(negotiation.messages)
  if (!myLastOffer) return null

  const postedRate = listing.interestRate
  const isPosterLender = listing.postType === 'lender'
  const target = isPosterLender
    ? Math.max(postedRate - 0.5, myLastOffer.offerRate - 1)
    : Math.min(postedRate + 0.5, myLastOffer.offerRate + 1)
  const movedEnough = Math.abs(myLastOffer.offerRate - postedRate) <= 0.5

  if (movedEnough) {
    return {
      senderId: botUserId,
      kind: 'accept',
      text: `That works for me — let's lock in ${fmtTerms(myLastOffer.offerAmount, myLastOffer.offerRate, myLastOffer.offerTenureMonths)}.`,
      autoAccept: true,
      offerRate: myLastOffer.offerRate,
      offerAmount: myLastOffer.offerAmount,
      offerTenureMonths: myLastOffer.offerTenureMonths,
    }
  }

  const newRate = Math.round(target * 2) / 2
  return {
    senderId: botUserId,
    kind: 'counter_offer',
    offerRate: newRate,
    offerAmount: myLastOffer.offerAmount,
    offerTenureMonths: myLastOffer.offerTenureMonths,
    text: `Appreciate the offer. I can meet you closer at ${newRate}% — that works better on my end for ${myLastOffer.offerTenureMonths} months.`,
  }
}

module.exports = { generateBotReply }
