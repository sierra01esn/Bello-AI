import { google } from 'googleapis'

export function getOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  })
  return client
}

// Fetch all reviews for the location
export async function fetchReviews(auth, accountId, locationId) {
  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
    {
      headers: {
        Authorization: `Bearer ${(await auth.getAccessToken()).token}`
      }
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GMB fetch reviews failed: ${err}`)
  }
  const data = await res.json()
  return data.reviews || []
}

// Post a reply to a specific review
export async function postReply(auth, accountId, locationId, reviewId, replyText) {
  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comment: replyText })
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GMB post reply failed: ${err}`)
  }
  return await res.json()
}

// Extract star count as number from GMB rating string
export function parseStarRating(ratingStr) {
  const map = {
    ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5
  }
  return map[ratingStr] || 3
}
