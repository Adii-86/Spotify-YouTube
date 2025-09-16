const express = require("express");
const spotifyRoutes = require("./routes/spotifyRoutes.js");
const youtubeRoutes = require("./routes/youtubeRoutes.js");
const app = express();

app.use("/spotify", spotifyRoutes);
app.use("/youtube", youtubeRoutes);

app.listen(3000, () => {
  console.log("Server Running at port number 3000.");
});
