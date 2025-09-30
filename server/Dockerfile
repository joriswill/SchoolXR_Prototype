FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production
ENV MODE=dev  # LTI bleibt deaktiviert
EXPOSE 3001

CMD ["npm", "start"]
