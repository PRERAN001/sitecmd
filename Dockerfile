FROM node:22

WORKDIR /app

RUN npm install -g sitecmd

RUN npx playwright install --with-deps chromiumdocker run --rm sitecmd-engine --version

ENTRYPOINT ["sitecmd"]