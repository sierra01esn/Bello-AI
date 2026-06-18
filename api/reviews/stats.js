import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const [lastRun, totalReplies, logRaw] = await Promise.all([
      kv.get('last_cron_run'),
      kv.get('total_replies'),
      kv.lrange('reply_log', 0, 19)
    ])

    const log = (logRaw || []).map(entry =>
      typeof entry === 'string' ? JSON.parse(entry) : entry
    )

    return res.status(200).json({
      lastRun: lastRun || null,
      totalReplies: totalReplies || 0,
      recentReplies: log
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
