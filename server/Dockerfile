FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# MODE should be provided via runtime env; default to dev
ENV MODE=dev
EXPOSE 3001

CMD ["npm", "start"]
