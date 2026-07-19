require("dotenv").config();

console.log("HOST:", process.env.DB_HOST);
console.log("USER:", process.env.DB_USER);
console.log("DB:", process.env.DB_NAME);
console.log("PORT:", process.env.DB_PORT);
const mysql = require("mysql2")

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})
connection.connect((err) => {
  if (err) {
    console.log("Error de conexión:", err)
  } else {
    console.log("MySQL esta conectado")
  }
})

module.exports = connection
