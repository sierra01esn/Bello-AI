import { google } from 'googleapis'

// Step 1: Visit /api/auth/google to get the auth URL
// Step 2: Approve in browser → Google redirects to /api/auth/callback
// Step 3: Copy the refresh_token from the response and save as GOOGLE_REFRESH_TOKEN env var

export default async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  const scopes = [
    'https://www.googleapis.com/auth/business.manage'
  ]

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  })

  return res.status(200).json({
    message: 'Visit the URL below in your browser to authorize Bello AI',
    authUrl
  })
}
