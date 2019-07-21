# Scraper Deluxe

## Application Deployed on Heroku

[https://scraper-peb.herokuapp.com/](https://scraper-peb.herokuapp.com/)

## Video Demonstration

[https://youtu.be/3qs6iDNj5MM](https://youtu.be/3qs6iDNj5MM)

### To run the application:

* npm start

### Technologies used: 

* JavaScript
* Modules
* Node
* Express
* Handlebars
* MVC
* MongoDB
* Mongoose
* Cheerio

## Overview

Scraper Deluxe is a simple news scraper program that scrapes articles from the Daily Herald Entertainment page. The application searches for article titles, summaries, article links and thumbnail photos and stores them in a Mongo database. The user may select a particular article to view, add or delete comments. The comments are also persisted in the Mongo database. 

## Architecture

This application is a Node/Express application with a full HTML front-end using the MVC framework. The back-end database is MonoDB with Mongoose as an ORM. The article and comment cards in the HTML pages were generated using the Handlebars template library. The HTML controller handles page routes.  

There are two Mongo collections, Article and Note. Each article may have many notes. This is reflected in the notes field referencing the Note collection. The Scraping screen references just the article collection. The comments screen queries a single article populated with the notes via the Mongoose populate functionality. When a comment is deleted the note is removed both from the Article's note list as well as the Note collection. 