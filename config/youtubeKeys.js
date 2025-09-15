const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  youtube_client_id: process.env.YOUTUBE_CLIENT_ID,
  youtube_client_secret: process.env.YOUTUBE_CLIENT_SECRET,
  youtube_redirect_uri: process.env.YOUTUBE_REDIRECT_URL,
};
