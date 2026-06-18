import { google } from 'googleapis'

export default async function handler(req, res) {
  const { code } = req.query

  if (!code) {
    return res.status(400).json({ error: 'No code provided' })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)

    return res.status(200).send(`
      <html><body style="font-family:sans-serif;padding:2rem;max-width:600px">
        <h2>✅ Bello AI authorized!</h2>
        <p>Copy your <strong>refresh_token</strong> below and save it as the <code>GOOGLE_REFRESH_TOKEN</code> environment variable in Vercel:</p>
        <textarea style="width:100%;height:120px;font-family:monospace;font-size:12px">${tokens.refresh_token}</textarea>
        <p style="color:#666;font-size:13px">You only need to do this once. The refresh token doesn't expire unless you revoke access.</p>
        <hr/>
        <p style="font-size:12px;color:#999">Full token object for reference: <br/><pre>${JSON.stringify(tokens, null, 2)}</pre></p>
      </body></html>
    `)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
