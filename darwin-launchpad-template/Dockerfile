FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE ${PORT:-3000}
CMD ["npm", "run", "dev"]
