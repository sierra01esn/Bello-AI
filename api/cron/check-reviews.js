import { kv } from '@vercel/kv'
import { getOAuthClient, fetchReviews, postReply, parseStarRating } from '../../lib/google.js'
import { generateReply } from '../../lib/claude.js'

export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  // Protect the cron endpoint — Vercel automatically sets this header for cron invocations
  // For manual triggers during testing, pass ?secret=YOUR_CRON_SECRET
  const isVercelCron = req.headers['x-vercel-cron'] === '1'
  const isManual = req.query.secret === process.env.CRON_SECRET

  if (!isVercelCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const accountId = process.env.GMB_ACCOUNT_ID
  const locationId = process.env.GMB_LOCATION_ID
  const language = process.env.REPLY_LANGUAGE || 'German'

  const results = {
    checked: 0,
    replied: 0,
    skipped: 0,
    errors: []
  }

  try {
    const auth = getOAuthClient()
    const reviews = await fetchReviews(auth, accountId, locationId)
    results.checked = reviews.length

    for (const review of reviews) {
      const reviewId = review.reviewId

      // Skip if we've already replied to this review
      const alreadyReplied = await kv.get(`replied:${reviewId}`)
      if (alreadyReplied) {
        results.skipped++
        continue
      }

      // Skip if GMB already shows a reply exists
      if (review.reviewReply) {
        await kv.set(`replied:${reviewId}`, true)
        results.skipped++
        continue
      }

      // Skip reviews with no text (star-only reviews get a generic reply)
      const reviewText = review.comment || '(No text — star rating only)'
      const reviewerName = review.reviewer?.displayName || ''
      const rating = parseStarRating(review.starRating)

      try {
        const replyText = await generateReply({
          reviewerName,
          rating,
          reviewText,
          language
        })

        await postReply(auth, accountId, locationId, reviewId, replyText)

        // Mark as replied in KV store
        await kv.set(`replied:${reviewId}`, true)

        // Log the reply for the dashboard
        await kv.lpush('reply_log', JSON.stringify({
          reviewId,
          reviewerName,
          rating,
          reviewText: reviewText.slice(0, 120),
          replyText,
          repliedAt: new Date().toISOString()
        }))
        await kv.ltrim('reply_log', 0, 99) // keep last 100

        results.replied++

        // Small delay between API calls to be polite
        await new Promise(r => setTimeout(r, 1000))

      } catch (replyErr) {
        results.errors.push({
          reviewId,
          error: replyErr.message
        })
      }
    }

    // Update last run timestamp
    await kv.set('last_cron_run', new Date().toISOString())
    await kv.incrby('total_replies', results.replied)

    console.log('Bello AI cron result:', results)
    return res.status(200).json({ ok: true, ...results })

  } catch (err) {
    console.error('Bello AI cron error:', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}
