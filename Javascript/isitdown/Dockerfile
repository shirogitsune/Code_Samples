FROM node:latest
RUN mkdir -p /usr/hatteam3/src/app
WORKDIR /usr/hatteam3/src/app
COPY ./hackathon022017 /usr/hatteam3/src/app/
EXPOSE 5500
RUN npm install
CMD ["npm","start"]
