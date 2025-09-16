const querystring = require("querystring");
const keys = require("../config/spotifyKeys.js");
const axios = require("axios");
const playlist = require("../data/playlists.js");
const tracks = require("../data/tracks.js");
const tokens = require("../token/spotifyTokens.js");
const crypto = require("crypto");

function auth(req, res) {
  const state = crypto.randomBytes(32).toString("hex");
  const scope =
    "playlist-read-private playlist-read-collaborative user-read-private user-read-email";

  const authURL =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: keys.spotify_client_id,
      scope: scope,
      redirect_uri: keys.spotify_redirect_uri,
      state: state,
    });
  res.redirect(authURL);
}

async function callback(req, res, next) {
  const code = req.query.code;
  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: keys.spotify_redirect_uri,
        client_id: keys.spotify_client_id,
        client_secret: keys.spotify_client_secret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    tokens.access_token = access_token;
    tokens.refresh_token = refresh_token;
    tokens.expires_at = expires_in;

    console.log("Authentication Succesfull");
    next();
  } catch (error) {
    console.error(
      "Error getting tokens:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to get access token. Please try again.");
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

async function fetchMe(req, res) {
  try {
    const access_token = tokens.access_token;

    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching user profile:",
      error.response?.data || error.message
    );
    if (error.message.includes("No access token")) {
      return res
        .status(401)
        .json({ error: "Please login first", login_url: "/spotify/login" });
    }

    res.status(500).json({ error: "Failed to fetch user profile" });
  }
}

async function fetchPlaylist(req, res) {
  try {
    const access_token = tokens.access_token;

    const response = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    let html = "";
    const items = response.data["items"];

    for (let i = 0; i < items.length; i++) {
      console.log(items[i].name);
      playlist.push(items[i].name);
      html += `<li><a href="/spotify/playlists/${items[i].id}/tracks">${items[i].name}</a></li>`;
    }

    res.send(`
      <h1>Your playlists- </h1>       
      <ul>
        ${html}
      </ul>
    `);
  } catch (error) {
    console.error(
      "Error fetching playlists:",
      error.response?.data || error.message
    );

    if (error.message.includes("No access token")) {
      return res
        .status(401)
        .json({ error: "Please login first", login_url: "/spotify/login" });
    }

    res.status(500).json({ error: "Failed to fetch playlists" });
  }
}

async function loadPlaylist(req, res) {
  try {
    const access_token = tokens.access_token;
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${req.params.id}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const items = response.data["items"];
    for (let i = 0; i < items.length; i++) {
      const songName = items[i].track.name;
      const albumName = items[i].track.album.name;
      const artist = items[i].track.album.artists[0].name;
      tracks.push({
        songName: songName,
        albumName: albumName,
        artist: artist,
      });
    }

    console.log(tracks);
  } catch (error) {
    console.error("Can't get the tracks");
    console.log(error.message);
  }
}

module.exports = {
  auth,
  callback,
  callbackResponse,
  fetchMe,
  fetchPlaylist,
  loadPlaylist,
};
