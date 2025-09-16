const express = require("express");
const middleware = require("../middlewares/spotify.js");

const router = express.Router();

router.get("/login", middleware.auth);

router.get("/callback", middleware.callback, middleware.callbackResponse);

router.get("/me", middleware.fetchMe);

router.get("/playlists", middleware.fetchPlaylist);

router.get("/playlists/:id/tracks", middleware.loadPlaylist);

module.exports = router;
