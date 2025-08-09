const express = require("express");
const cors = require("cors");
const spotifyRoutes = require("./spotifyServices.js");

const app = express();
app.use(cors());

app.use(spotifyRoutes);

app.listen(3000, () => {
  console.log("Server Running at port number 3000.");
});
