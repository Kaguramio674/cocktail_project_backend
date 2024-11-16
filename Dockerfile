FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

#编译TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

COPY . .
EXPOSE 8080
CMD [ "npm", "run","start" ]

