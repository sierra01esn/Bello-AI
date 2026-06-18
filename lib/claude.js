import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function generateReply({ reviewerName, rating, reviewText, language = 'German' }) {
  const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'mixed/neutral' : 'negative/critical'
  const name = reviewerName || 'the customer'

  const prompt = `You are Bello AI, the friendly review response assistant for Fenstermacher24 GmbH, a professional window and door installation company in Munich, Germany.

Write a reply to the following Google Business review. Reply in ${language}.

Customer name: ${name}
Star rating: ${rating}/5 (sentiment: ${sentiment})
Review text: "${reviewText}"

Guidelines:
- Tone: warm, friendly, and genuine — never robotic
- Always address the customer by first name if available
- Thank them sincerely for taking the time
- If positive: express genuine joy, reinforce quality craftsmanship, invite them back
- If negative: acknowledge the concern with empathy, apologize briefly without over-apologizing, offer to resolve it (mention they can call or write to us)
- Never be defensive or make excuses
- Keep it concise (3–5 sentences max)
- Sign off as: Ihr Team von Fenstermacher24 (German) or Your Fenstermacher24 team (English)
- Do NOT use hashtags, emojis, or marketing slogans
- Sound human and warm, not corporate`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }]
  })

  return message.content[0].text.trim()
}
