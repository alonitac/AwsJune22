FROM node:lts-alpine
WORKDIR /app
COPY package.json package.josn
COPY worker.js worker.js
RUN npm install
CMD ['node', 'worker.js']