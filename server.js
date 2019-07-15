const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const exphbs = require("express-handlebars");
const db = require("./models");
const PORT = 3000;
const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", (req, res) => {
  axios.get("http://www.echojs.com/").then(response => {
    let $ = cheerio.load(response.data);

    $("article h2").each(function(i, element) {
      let result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.summary = "Dummy summary for the moment";
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article.findOne({ title: result.title })
        .then(dbFoundArticle => {
          if (!dbFoundArticle) {
            db.Article.create(result)
              .then(dbArticle => {
                console.log("Added new article " + dbArticle._id);
              })
              .catch(err => {
                console.log(err);
              });
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    res.send("Scrape is complete, dude");
  });
});

app.get("/", function(req, res) {
  db.Article.find({})
    .then(dbArticles => {
      res.render("index", { dbArticles });
    })
    .catch(err => {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      console.log(dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      console.log(req.params.id);
      console.log(dbNote._id);
      // return db.Article.findOneAndUpdate({_id : req.params.id }, { $set: {title: "This is a great title" }}, { new: true });
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { note: dbNote._id } },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
