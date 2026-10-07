
const express = require("express");
const mysql = require("mysql");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "test",
  database: "test"
});

// TEST 1: SQL Injection
app.get("/sql-test", (req, res) => {
  const username = req.query.username;

  const sql =
    "SELECT * FROM users WHERE username = '" +
    username + "'";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("Error");
    res.json(results);
  });
});

// TEST 2: Command Injection
app.get("/command-test", (req, res) => {
  const hostname = req.query.host;

  exec("ping -c 1 " + hostname, (err, output) => {
    if (err) return res.status(500).send("Error");
    res.send(output);
  });
});

// TEST 3: Path Traversal
app.get("/file-test", (req, res) => {
  const filename = req.query.filename;

  fs.readFile("./uploads/" + filename, "utf8",
    (err, data) => {
      if (err) return res.status(404).send("Not found");
      res.send(data);
    }
  );
});

// TEST 4: Reflected XSS
app.get("/xss-test", (req, res) => {
  const name = req.query.name;

  res.send("<html><body><h1>Hello " +
    name + "</h1></body></html>");
});
