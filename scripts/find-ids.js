import { google } from 'googleapis'

// Run this once after OAuth is set up to find your GMB_ACCOUNT_ID and GMB_LOCATION_ID
// Usage: node scripts/find-ids.js

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
})

async function main() {
  const token = (await oauth2Client.getAccessToken()).token

  // Get accounts
  const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${token}` }
  })
  const accounts = await accountsRes.json()
  console.log('\n=== GMB ACCOUNTS ===')
  console.log(JSON.stringify(accounts, null, 2))

  if (accounts.accounts?.length) {
    const accountName = accounts.accounts[0].name
    const accountId = accountName.split('/')[1]
    console.log('\nYour GMB_ACCOUNT_ID:', accountId)

    // Get locations
    const locationsRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const locations = await locationsRes.json()
    console.log('\n=== GMB LOCATIONS ===')
    console.log(JSON.stringify(locations, null, 2))

    if (locations.locations?.length) {
      const locationId = locations.locations[0].name.split('/')[1]
      console.log('\nYour GMB_LOCATION_ID:', locationId)
    }
  }
}

main().catch(console.error)
