FROM node:12.2.0

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install 

EXPOSE 8080

COPY . .

CMD ["npm", "start"]
