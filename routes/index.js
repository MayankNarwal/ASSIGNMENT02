// routes/index.js
const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');

/* GET home page - Splash page */
router.get('/', (req, res) => {
  res.render('index', { title: 'QuickTracks Home' });
});

/* GET public playlists - read-only view */
router.get('/public-playlists', async (req, res) => {
  try {
    // If a keyword search query exists, filter the playlists.
    let query = {};
    if (req.query.keyword) {
      query = {
        name: { $regex: req.query.keyword, $options: 'i' } // case-insensitive search
      };
    }
    const playlists = await Playlist.find(query).populate('createdBy', 'username');
    res.render('playlists', { title: 'Public Playlists', playlists, keyword: req.query.keyword });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
