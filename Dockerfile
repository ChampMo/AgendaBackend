FROM node:20

WORKDIR /user/src/app

COPY ./package.json ./

RUN npm install

COPY ./app.js ./ 

COPY ./routes ./routes

COPY ./.env ./.env

EXPOSE 8000

CMD ["npm", "start"]