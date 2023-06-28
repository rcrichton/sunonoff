import fetch from 'node-fetch'

let token: String = ''
let expiresIn: Number | null = null

export async function login(options: { email: String; password: String }) {
  const { email: username, password } = options
  const body = await fetch('https://api.sunsynk.net/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    body: JSON.stringify({
      username,
      password,
      grant_type: 'password',
      client_id: 'csp-web',
      source: 'sunsynk',
      areaCode: 'sunsynk'
    })
  }).then((response) => response.json())

  token = body.data?.access_token || ''
  expiresIn = body.data?.expires_in || null
}

export async function fetchFlow(options: { plantId: String }) {
  const body = await fetch(
    `https://api.sunsynk.net/api/v1/plant/energy/${options.plantId}/flow`,
    { headers: { Authorization: `Bearer ${token}` } }
  ).then((response) => response.json())
  return body
}

export async function fetchPlants() {
  const body = await fetch(
    'https://api.sunsynk.net/api/v1/plants?page=1&limit=10',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  ).then((response) => response.json())
  return body
}
