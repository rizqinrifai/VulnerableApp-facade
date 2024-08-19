const mysql = require("mysql");
const fs = require("fs");
const readline = require("readline");
const crypto = require("crypto");
const http = require("http");

// Global variable - Maintainability issue
var globalVar = "I am global";

// Connection details - Security issue
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "test",
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Missing 'use strict' - Maintainability issue
function vulnerableFunction() {
  // Hardcoded sensitive information - Security issue
  const apiKey = "12345-abcde";
  const password = "password";

  rl.question("Enter username: ", (username) => {
    // SQL Injection vulnerability - Security issue
    const query = `SELECT * FROM users WHERE username = '${username}'`;

    connection.query(query, (error, results) => {
      if (error) throw error;
      results.forEach((result) => {
        console.log(`User ID: ${result.id}`);
        console.log(`Username: ${result.username}`);
      });
      connection.end();
      rl.close();
    });
  });
}

// Resource leak - Reliability issue
fs.readFile("nonexistentfile.txt", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});

// Unused variables - Maintainability issue
const unusedVariable = "I am not used anywhere";

// Poor error handling - Maintainability issue
try {
  let riskyOperation = JSON.parse("invalid json");
} catch (e) {
  // Do nothing
}

// Deprecated API usage - Maintainability issue
fs.exists("somefile.txt", (exists) => {
  console.log(exists ? "File exists" : "File does not exist");
});

// Duplicate code - Duplications issue
function duplicateCode() {
  console.log("This is a duplicate code block.");
  console.log("This is a duplicate code block.");
  console.log("This is a duplicate code block.");
}

duplicateCode();
duplicateCode();
duplicateCode();
duplicateCode();
duplicateCode();

// Inefficient loop - Maintainability issue
const arr = [1, 2, 3, 4, 5];
for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr.length; j++) {
    console.log(arr[i] + arr[j]);
  }
}

// Inconsistent naming convention - Maintainability issue
let my_variable = 1;
let myVariable = 2;
let MyVariable = 3;

// Using eval - Security issue
let code = 'console.log("Eval is dangerous")';
eval(code);

// Synchronous file read - Maintainability issue
let data = fs.readFileSync("file.txt", "utf8");
console.log(data);

// Lack of modularization - Maintainability issue
function hugeFunction() {
  console.log("This function does too many things");
  // Simulating a lot of code here
  for (let i = 0; i < 100; i++) {
    console.log(i);
  }
}
hugeFunction();

// Empty catch block - Maintainability issue
try {
  let data = fs.readFileSync("file.txt", "utf8");
} catch (e) {}

// Using var instead of let/const - Maintainability issue
var oldWay = "Use let or const instead";

// Long function - Maintainability issue
function longFunction() {
  for (let i = 0; i < 1000; i++) {
    console.log(i);
  }
}
longFunction();

// Unnecessary comments - Maintainability issue
// This is a comment
// Another comment
// Yet another comment

// Usage of insecure random generator - Security issue
let insecureRandom = Math.random();

// Unused function - Maintainability issue
function unusedFunction() {
  console.log("I am not used anywhere");
}

// Usage of MD5 for hashing - Security issue
let hash = crypto.createHash("md5").update("password").digest("hex");
console.log(hash);

// HTTP without SSL - Security issue
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
  })
  .listen(8080);

// Unsafe deserialization - Security issue
const unsafeDeserialize = (data) => {
  return eval("(" + data + ")");
};

// Hardcoded credentials - Security issue
const hardcodedUsername = "admin";
const hardcodedPassword = "admin123";

// Insecure URL construction - Security issue
const user = "user";
const url = `http://example.com/user/${user}`;

// Use of innerHTML - Security issue
document.getElementById("example").innerHTML = "This is unsafe";

// Ignoring security headers - Security issue
res.setHeader("X-Frame-Options", "ALLOW-FROM http://example.com");

// Lack of input validation - Security issue
function validateInput(input) {
  return input; // No validation performed
}

// Failure to escape output - Security issue
function escapeOutput(data) {
  return data; // No escaping performed
}

console.log("End of script");
