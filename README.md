# SunOnOff

Sunsynk/Sonoff integration and automation

## dev setup

```bash
npm i
cp template.env .env
# populate .env
npm start
```

## docker

```bash
npm run docker:build
npm run docker:run
```

Or once built locally:

```bash
docker run --env-file .env sunonoff
```
