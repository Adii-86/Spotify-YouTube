const express = require("express");
const playlist = require("./data/playlists.js");
const tracks = require("./data/tracks.js");
const router = express.Router();
const axios = require("axios");
const querystring = require("querystring");
const dotenv = require("dotenv");

dotenv.config();

// Spotify credentials
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URL;

let tokenStore = {
  access_token: null,
  refresh_token: null,
  expires_at: null,
};

function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    possible.charAt(Math.floor(Math.random() * possible.length))
  ).join("");
} // protection from csrf attack

router.get("/login", (req, res) => {
  const state = generateRandomString(16);
  const scope =
    "playlist-read-private playlist-read-collaborative user-read-private user-read-email";

  const authURL =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
    });
  res.redirect(authURL);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;

  if (error) {
    console.error("Authorization error:", error);
    return res.status(400).send(`Authorization failed: ${error}`);
  }

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
        client_id: client_id,
        client_secret: client_secret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    tokenStore.access_token = access_token;
    tokenStore.refresh_token = refresh_token;
    tokenStore.expires_at = expires_in;

    console.log("Authentication successful");
    res.send(`
      <h1>Authentication Successful!</h1>
      <p>You can now use the app.</p>
      <ul>
        <li><a href="/me">View Profile</a></li>
        <li><a href="/playlists">View Playlists</a></li>
      </ul>
    `);
  } catch (error) {
    console.error(
      "Error getting tokens:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to get access token. Please try again.");
  }
});

router.get("/me", async (req, res) => {
  try {
    const access_token = tokenStore.access_token;

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
        .json({ error: "Please login first", login_url: "/login" });
    }

    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

router.get("/playlists", async (req, res) => {
  try {
    const access_token = tokenStore.access_token;

    const response = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    //res.json(response.data);
    console.log(response.data);

    let html = "";
    const items = response.data["items"];

    for (let i = 0; i < items.length; i++) {
      console.log(items[i].name);
      playlist.push(items[i].name);
      html += `<li><a href="/playlists/${items[i].id}/tracks">${items[i].name}</a></li>`;
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
        .json({ error: "Please login first", login_url: "/login" });
    }

    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

router.get("/", (req, res) => {
  res.json({
    message: "Spotify API Server is running",
    endpoints: {
      login: "/login",
      profile: "/me",
      playlists: "/playlists",
    },
  });
});

router.get("/playlists/:id/tracks", async (req, res) => {
  try {
    const access_token = tokenStore.access_token;
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
});

module.exports = router;
