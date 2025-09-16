const express = require("express");
const middleware = require("../middlewares/youtube.js");

const router = express.Router();

router.get("/login", middleware.oauth2youtube);

router.get("/callback", middleware.callback, middleware.callbackResponse);

module.exports = router;
