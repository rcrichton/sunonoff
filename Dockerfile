FROM node:alpine as build
WORKDIR /usr/sunonoff
COPY . .
RUN npm install
RUN npm run build

FROM node:alpine
WORKDIR /usr/sunonoff
COPY --from=build /usr/sunonoff/dist/* .
COPY --from=build /usr/sunonoff/node_modules/ ./node_modules/
CMD ["node", "./sunonoff.js"]
