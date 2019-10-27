
# Meetapp

Meetapp is an api built to organize and participate in meetups. In this api the user can create and subscribe to meetups organized by other people.

This app consists of an api built with NodeJS and Express, a web app built with ReactJS, and a mobile app built with React Native. You can reach these repositories following the list below:
	 
 - **Meetapp Backend:**: https://github.com/hmhallak/meetapp
 - **Meetapp Web:** https://github.com/hmhallak/meetapp-web
 - **Meetapp Mobile:** https://github.com/hmhallak/meetapp-mobile

## Environment
 - To run the system you'll need the following docker containers running:
	 - Postgres (https://hub.docker.com/_/postgres)
	 - Redis (https://hub.docker.com/_/redis)
	 - Mongo (https://hub.docker.com/_/mongo)
   
 - Install and run these containers and then proceed to the Setup section.

## Setup
 - Install dependencies:
<code>yarn</code>

- Copy .env.example and rename to .env, then set your environment configs in .env file

- Create your database in postgres and then run migrations:
 <code>yarn sequelize db:migrate</code>

- Run server backend:
<code>yarn dev</code>

- Run queue:
<code>yarn queue</code>

Ready to go! You can use the insomnia.json file to make api requests with Insomnia (https://insomnia.rest/) or Postman (https://www.getpostman.com/)
