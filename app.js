const express = require("express");
const mysql = require("mysql");

const app = express();

app.get("/user", (req, res) => {
  const username = req.query.username;

  const query =
    "SELECT * FROM users WHERE username = '" + username + "'";

  connection.query(query, (error, results) => {
    res.json(results);
  });
});
