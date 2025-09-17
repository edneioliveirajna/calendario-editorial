FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install --production

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["node", "index.js"]
