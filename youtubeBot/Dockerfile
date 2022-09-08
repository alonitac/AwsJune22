FROM node:18.6.0-buster-slim
WORKDIR /app
RUN apt update -y  && apt install ffmpeg -y
COPY . .
RUN npm install
CMD ["node", "index.js"]