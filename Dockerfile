FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 8100

CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "8100"]
