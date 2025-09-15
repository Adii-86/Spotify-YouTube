const express = require("express");
const spotifyRoutes = require("./routes/spotifyServices.js");
const youtubeRoutes = require("./routes/youtubeServices.js");
const app = express();
const keys = require("./config/spotifyKeys.js");

app.use("/spotify", spotifyRoutes);

app.listen(3000, () => {
  console.log("Server Running at port number 3000.");
});
