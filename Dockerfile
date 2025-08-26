FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build          # TypeScript → JavaScript (dist folder)

EXPOSE 3000

CMD ["node", "dist/main.js"]   # Ishga tushirish
