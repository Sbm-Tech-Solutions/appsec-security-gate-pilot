const express = require("express");
const mysql = require("mysql");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "test",
  database: "test"
});

// FIX 1: SQL Injection
// Use parameterized queries instead of string concatenation.

app.get("/sql-test", (req, res) => {
  const username = req.query.username;

  if (typeof username !== "string") {
    return res.status(400).send("Invalid username");
  }

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).send("Database error");
    }

    res.json(results);
  });
});

// FIX 2: Command Injection
// Use execFile with fixed arguments and strict input validation.
// Never pass user input to a shell command.

app.get("/command-test", (req, res) => {
  const hostname = req.query.host;

  if (
    typeof hostname !== "string" ||
    net.isIP(hostname) === 0
  ) {
    return res.status(400).send("Invalid IP address");
  }

  // In production, use an allowlist of approved destinations
  // to prevent server-side request abuse or internal probing.
  execFile(
    "ping",
    ["-c", "1", hostname],
    { timeout: 3000 },
    (err, stdout) => {
      if (err) {
        return res.status(500).send("Command failed");
      }

      res.type("text/plain").send(stdout);
    }
  );
});

// FIX 3: Path Traversal
// Use a fixed directory and allowlisted filenames.

const UPLOAD_DIR = path.resolve(__dirname, "uploads");

app.get("/file-test", (req, res) => {
  const filename = req.query.filename;

  if (
    typeof filename !== "string" ||
    !/^[a-zA-Z0-9_-]+\.txt$/.test(filename)
  ) {
    return res.status(400).send("Invalid filename");
  }

  const safePath = path.join(UPLOAD_DIR, filename);

  fs.readFile(safePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).send("File not found");
    }

    res.type("text/plain").send(data);
  });
});

// FIX 4: Reflected XSS
// Return user input as plain text, not untrusted HTML.

app.get("/xss-test", (req, res) => {
  const name = req.query.name;

  if (typeof name !== "string") {
    return res.status(400).send("Invalid name");
  }

  res.type("text/plain").send(`Hello ${name}`);
});

module.exports = app;

