const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models");

module.exports = function(app) {
  app.get("/scrape", (req, res) => {
    axios.get("https://www.dailyherald.com/entertainment/").then(response => {
      //   console.log(response);
      let $ = cheerio.load(response.data);

      let results = [];
      $(".secStoryBoxOdd").each(function(i, element) {
        let result = {};

        result.title = $(this)
          .find(".secStoryHed")
          .children("span")
          .text();
        $(this)
          .find(".secStoryBoxInner")
          .find("span")
          .each(function(index, element) {
            if (index == 1) {
              result.summary = $(this).text();
            }
          });
        result.link =
          "https://www.dailyherald.com" +
          $(this)
            .children("a")
            .attr("href");
        result.pictureLink =
          "https://www.dailyherald.com" +
          $(this)
            .find("img")
            .attr("src");
        result.notes = [];

        console.log(result);
        results.push(result);
      });

      db.Article.create(results, { unordered: true })
        .then(dbArticles => {
          console.log("Added new articles" + dbArticles);
          res.send("Scrape is complete, dude");
        })
        .catch(err => {
          console.log(err);
          res.send(err);
        });
    });
  });

  app.get("/", function(req, res) {
    db.Article.find({}).sort({_id: -1})
      .then(dbArticles => {
        res.render("index", { dbArticles });
      })
      .catch(err => {
        res.json(err);
      });
  });

  app.get("/comments/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("notes")
      .then(function(dbArticle) {
        res.render("comments", { dbArticle });
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.post("/comments/:id", function(req, res) {
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { notes: dbNote._id } },
          { new: true, useFindAndModify: false }
        );
      })
      .then(function(dbArticle) {
        res.end();
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.delete("/comments/:articleid/:commentid", function(req, res) {
    db.Note.deleteOne({ _id: req.params.commentid }).then(dbNote => {
      db.Article.findOneAndUpdate(
        { _id: req.params.articleid },
        { $pull: { notes: req.params.commentid } },
        { useFindAndModify: false }
      ).then(dbArticle => {
        res.end();
      });
    });
  });
};
