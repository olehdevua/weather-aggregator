FROM node:24.3-bookworm-slim

USER node
WORKDIR /home/node/app

COPY --chown=1000:1000 ./package.json ./package-lock.json /home/node/app/
RUN npm ci -f --only-production && npm cache clean --force

COPY --chown=1000:1000 . /home/node/app

CMD ["npm", "start"]
