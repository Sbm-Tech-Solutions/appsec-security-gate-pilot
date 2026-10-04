const express = require("express");
const mysql = require("mysql");

const app = express();

const connection = mysql.createConnection({
  host: "localhost",
  user: "test",
  database: "test"
});

app.get("/user", function(req, res) {
  const username = req.query.username;

  connection.query(
    "SELECT * FROM users WHERE username = '" + username + "'",
    function(error, results) {
      if (error) {
        res.status(500).send("Error");
        return;
      }

      res.json(results);
    }
  );
});
