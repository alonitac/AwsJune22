FROM node:18.6.0-buster-slim
WORKDIR /app
COPY . .
RUN apt update -y  && apt install ffmpeg -y
RUN npm install
CMD ["node", "index.js"]