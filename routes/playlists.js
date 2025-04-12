const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');

// Middleware to protect routes – ensures the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error_msg', 'Please log in to view that resource');
  res.redirect('/users/login');
}

/* GET Dashboard: display user-specific playlists */
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user._id });
    res.render('dashboard', { title: 'Dashboard', playlists });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

/* GET Add Playlist Page */
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('addPlaylist', { title: 'Add Playlist' });
});

/* POST Add Playlist - Create new playlist */
router.post('/add', ensureAuthenticated, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newPlaylist = new Playlist({
      name,
      description,
      createdBy: req.user._id
    });
    await newPlaylist.save();
    req.flash('success_msg', 'Playlist added successfully');
    res.redirect('/playlists/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error adding playlist');
    res.redirect('/playlists/dashboard');
  }
});

/* GET Edit Playlist Page */
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      req.flash('error_msg', 'Playlist not found');
      return res.redirect('/playlists/dashboard');
    }
    res.render('editPlaylist', { title: 'Edit Playlist', playlist });
  } catch (err) {
    console.error(err);
    res.redirect('/playlists/dashboard');
  }
});

/* PUT Edit Playlist - Update existing playlist */
router.put('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { name, description } = req.body;
    await Playlist.findByIdAndUpdate(req.params.id, { name, description });
    req.flash('success_msg', 'Playlist updated successfully');
    res.redirect('/playlists/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating playlist');
    res.redirect('/playlists/dashboard');
  }
});

/* DELETE Playlist */
router.delete('/delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Playlist deleted successfully');
    res.redirect('/playlists/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting playlist');
    res.redirect('/playlists/dashboard');
  }
});

/* GET Add Song to Playlist Page */
router.get('/add-song/:playlistId', ensureAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) {
      req.flash('error_msg', 'Playlist not found');
      return res.redirect('/playlists/dashboard');
    }
    res.render('addSong', { title: 'Add Song', playlist });
  } catch (err) {
    console.error(err);
    res.redirect('/playlists/dashboard');
  }
});

/* POST Add Song to Playlist */
router.post('/add-song/:playlistId', ensureAuthenticated, async (req, res) => {
  try {
    const { title, artist, album, duration } = req.body;
    const playlist = await Playlist.findById(req.params.playlistId);

    if (!playlist) {
      req.flash('error_msg', 'Playlist not found');
      return res.redirect('/playlists/dashboard');
    }

    // Add the new song to the playlist
    playlist.songs.push({ title, artist, album, duration });
    await playlist.save();

    req.flash('success_msg', 'Song added to playlist successfully');
    res.redirect(`/playlists/edit/${playlist._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error adding song to playlist');
    res.redirect('/playlists/dashboard');
  }
});

/* GET Edit Song in Playlist */
router.get('/edit-song/:playlistId/:songIndex', ensureAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) {
      req.flash('error_msg', 'Playlist not found');
      return res.redirect('/playlists/dashboard');
    }

    const song = playlist.songs[req.params.songIndex];
    if (!song) {
      req.flash('error_msg', 'Song not found');
      return res.redirect(`/playlists/edit/${playlist._id}`);
    }

    res.render('editSong', { title: 'Edit Song', playlist, song, songIndex: req.params.songIndex });
  } catch (err) {
    console.error(err);
    res.redirect('/playlists/dashboard');
  }
});

/* POST Edit Song in Playlist */
router.post('/edit-song/:playlistId/:songIndex', ensureAuthenticated, async (req, res) => {
  try {
    const { title, artist, album, duration } = req.body;
    const playlist = await Playlist.findById(req.params.playlistId);

    if (!playlist) {
      req.flash('error_msg', 'Playlist not found');
      return res.redirect('/playlists/dashboard');
    }

    const song = playlist.songs[req.params.songIndex];
    if (!song) {
      req.flash('error_msg', 'Song not found');
      return res.redirect(`/playlists/edit/${playlist._id}`);
    }

    // Update the song information
    song.title = title;
    song.artist = artist;
    song.album = album;
    song.duration = duration;

    await playlist.save();

    req.flash('success_msg', 'Song updated successfully');
    res.redirect(`/playlists/edit/${playlist._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating song');
    res.redirect('/playlists/dashboard');
  }
});

/* DELETE Song from Playlist */
router.delete('/delete-song/:playlistId/:songIndex', ensureAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) {
      req.flash('error_msg', 'Playlist not found');
      return res.redirect('/playlists/dashboard');
    }

    playlist.songs.splice(req.params.songIndex, 1);
    await playlist.save();

    req.flash('success_msg', 'Song removed from playlist successfully');
    res.redirect(`/playlists/edit/${playlist._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error removing song from playlist');
    res.redirect('/playlists/dashboard');
  }
});

module.exports = router;
