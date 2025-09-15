const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const youtubeConfig = require("../config/youtubeKeys.js");

const router = express.Router();

router.get("/login", (req, res) => {
  const scope =
    "playlist-read-private playlist-read-collaborative user-read-private user-read-email";

  const authURL =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: youtubeConfig.client_id,
      scope: scope,
      redirect_uri: youtubeConfig.redirect_uri,
      state: state,
    });
  res.redirect(authURL);
});
