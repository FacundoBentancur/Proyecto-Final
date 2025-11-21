const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

app.use("/data", express.static(path.join(__dirname, "../frontend/Data")));

app.listen(3000, () => {
  console.log("Backend corriendo en http://localhost:3000");
});
