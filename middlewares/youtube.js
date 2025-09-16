const keys = require("../config/youtubeKeys.js");
const tokens = require("../token/youtubeTokens.js");
const { google } = require("googleapis");
const crypto = require("crypto");

const oauth2Client = new google.auth.OAuth2(
  keys.youtube_client_id,
  keys.youtube_client_secret,
  keys.youtube_redirect_uri
);

function oauth2youtube(req, res) {
  const scope = "https://www.googleapis.com/auth/youtube";
  const state = crypto.randomBytes(32).toString("hex");

  const authURL = oauth2Client.generateAuthUrl({
    scope: scope,
    state: state,
    response_type: "code",
  });

  res.redirect(authURL);
}

async function callback(req, res, next) {
  const code = req.query.code;
  const error = req.query.error;

  if (error) {
    console.error("OAuth Error:", error);
    return res.status(400).send(`Authentication failed: ${error}`);
  }

  try {
    const { tokens: _tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(_tokens);
    tokens.access_token = _tokens.access_token;
    next();
  } catch (error) {
    console.log(error);
    res.send("Authorizatize again:");
  }
}

function callbackResponse(req, res) {
  res.send(`
    <h1>Authentication Successful!</h1>
    <p>You can now use the app.</p>
    <ul>
      <li><a href="/spotify/me">View Profile</a></li>
      <li><a href="/spotify/playlists">View Playlists</a></li>
    </ul>
  `);
}

module.exports = { oauth2youtube, callback, callbackResponse };
