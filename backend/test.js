const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hola, servidor funcionando");
});

app.listen(3000, () => {
  console.log("Servidor de prueba en puerto 3000");
});