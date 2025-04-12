const mongoose = require('mongoose');

// Define the Song schema
const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, // Trim whitespace from the title
  },
  artist: {
    type: String,
    required: true,
    trim: true, // Trim whitespace from the artist name
  },
  album: {
    type: String,
    trim: true, // Trim whitespace from the album name
  },
  duration: {
    type: String,
    required: true, // Assume songs should have a duration
  },
});

// Define the Playlist schema
const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Trim whitespace from the playlist name
  },
  description: {
    type: String,
    trim: true, // Trim whitespace from the description
  },
  songs: [SongSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Ensure the playlist has a creator
  },
  date: {
    type: Date,
    default: Date.now, // Default to current date if not provided
  },
});

// Export the Playlist model, ensuring no overwrite
module.exports = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
