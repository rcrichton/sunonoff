import 'dotenv/config'
import ewelink from 'ewelink-api'
import { login, fetchFlow, fetchPlants } from './sunsynk'

const connection = new ewelink({
  email: process.env.EWELINK_EMAIL || '',
  password: process.env.EWELINK_PASS || ''
})

const START_HOUR = parseInt(process.env.START_HOUR || '9')
const STOP_HOUR = parseInt(process.env.STOP_HOUR || '16')
const LOAD_LIMIT = parseInt(process.env.LOAD_LIMIT || '3000')

async function main() {
  try {
    const today = new Date()
    const hours = today.getHours()
    console.log(today.toISOString())

    if (hours < START_HOUR || hours >= STOP_HOUR) {
      console.log(
        `Outside of control hours (${START_HOUR}-${STOP_HOUR}), do nothing.`
      )
      return
    }

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

    if (flow.data.soc >= 99 && flow.data.loadOrEpsPower < LOAD_LIMIT) {
      console.log(
        `Criteria met, battery at ${flow.data.soc}%, time is in control hours (${START_HOUR}-${STOP_HOUR}) and usage is < ${LOAD_LIMIT}kw`
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
  } catch (err) {
    console.error('An error occurred:', err)
  }
}

setInterval(main, parseInt(process.env.INTERVAL || '15') * 60 * 1000) // Run every x minutes
main()

process.on('SIGINT', () => {
  process.exit()
})
