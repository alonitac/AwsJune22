FROM node:lts-alpine
WORKDIR /app
COPY package.json .
COPY worker.js .
RUN sudo apt-get update -y  && sudo apt-get install nodejs npm ffmpeg -y
RUN npm install
CMD ["node", "worker.js"]