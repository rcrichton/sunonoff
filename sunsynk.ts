import fetch from 'node-fetch'

export async function fetchFlow(options: { plantId: String }) {
  const body = await fetch(
    `https://api.sunsynk.net/api/v1/plant/energy/${options.plantId}/flow`,
    { headers: { Authorization: `Bearer ${process.env.SUNSYNK_TOKEN}` } }
  ).then((response) => response.json())
  return body
}

export async function fetchPlants() {
  const body = await fetch(
    'https://api.sunsynk.net/api/v1/plants?page=1&limit=10',
    {
      headers: { Authorization: `Bearer ${process.env.SUNSYNK_TOKEN}` }
    }
  ).then((response) => response.json())
  return body
}
