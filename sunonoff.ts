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

  const devices: any[] = (await connection.getDevices()) || []
  console.log('Available devices:')
  console.log(devices.map((d) => d.name))
  const targetDeviceNames = process.env.TARGET_DEVICE_NAMES?.split(',') || []
  const targetDevices = targetDeviceNames.map((name) =>
    devices.find((device) => device.name === name)
  )

  if (targetDevices.includes(undefined)) {
    console.error(
      'One of the target device names cannot be found, check the name is correct',
      targetDeviceNames
    )
    return
  }

  if (
    flow.data.soc === 100 &&
    hours > 9 &&
    hours < 16 &&
    flow.data.loadOrEpsPower < 3000
  ) {
    console.log(
      `Criteria met, battery at ${flow.data.soc}%, time is in solar hours and usage is low`
    )

    for (const targetDevice of targetDevices) {
      console.log(`Setting device '${targetDevice.name}' state to ON`)
      const status = await connection.setDevicePowerState(
        targetDevice.deviceid,
        'on'
      )
      console.log(status)
    }
  } else {
    console.log('Criteria not met.')

    for (const targetDevice of targetDevices) {
      console.log(`Setting device '${targetDevice.name}' state to OFF`)
      const status = await connection.setDevicePowerState(
        targetDevice.deviceid,
        'off'
      )
      console.log(status)
    }
  }

  console.log(`Done, took ${(Date.now() - today.getTime()) / 1000}s`)
}

setInterval(main, 15 * 60 * 1000) // Run every 5 minutes
main()

process.on('SIGINT', () => {
  process.exit()
})
