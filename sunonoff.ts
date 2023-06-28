import 'dotenv/config'
import ewelink from 'ewelink-api'
import { login, fetchFlow, fetchPlants } from './sunsynk'

const connection = new ewelink({
  email: process.env.EWELINK_EMAIL || '',
  password: process.env.EWELINK_PASS || ''
})

async function main() {
  const today = new Date()
  const hours = today.getHours()
  console.log(today.toISOString())

  console.log('Logging into Sunsynk account...')
  await login({
    email: process.env.SUNSYNK_EMAIL || '',
    password: process.env.SUNSYNK_PASS || ''
  })

  console.log('Fetching solar plantID...')
  const plantId = (await fetchPlants()).data?.infos[0]?.id
  console.log(plantId)

  console.log(`Fetching solar flow data...`)
  const flow = await fetchFlow({ plantId })
  console.debug(flow)

  const devices: any[] = await connection.getDevices()
  console.log('Available devices:')
  console.log(devices.map((d) => d.name))
  const targetDevice = devices.find(
    (device) => device.name === process.env.TARGET_DEVICE_NAME
  )

  if (flow.data.soc === 100 && hours > 10 && hours < 16) {
    console.log(
      `Criteria met, battery at ${flow.data.soc}% and time is in solar hours`
    )

    console.log(`Setting device '${targetDevice.name}' state to ON`)
    const status = await connection.setDevicePowerState(
      targetDevice.deviceid,
      'on'
    )
    console.log(status)
  } else {
    console.log('Criteria not met.')

    console.log(`Setting device '${targetDevice.name}' state to OFF`)
    const status = await connection.setDevicePowerState(
      targetDevice.deviceid,
      'off'
    )
    console.log(status)
  }

  console.log(`Done, took ${(Date.now() - today.getTime()) / 1000}s`)
}

setInterval(main, 5 * 60 * 1000) // Run every 5 minutes
main()
