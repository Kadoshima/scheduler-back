FROM node:23-alpine3.20

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
COPY .env.local .env.local

RUN npm run build
CMD ["npm", "start"]