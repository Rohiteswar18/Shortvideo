const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Video = require('../models/Video');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all videos (feed)
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('user', 'username profileUrl')
      .populate('comments.user', 'username profileUrl')
      .sort({ createdAt: -1 });
    
    // Format response to match your frontend structure
    const formattedVideos = videos.map(video => ({
      id: video._id,
      username: video.user.username,
      videoUrl: video.videoUrl,
      isFollowed: false, // You can implement follow logic later
      title: video.title,
      profileUrl: video.user.profileUrl,
      reaction: {
        likes: video.likes.length.toString(),
        comments: video.comments.length.toString(),
        isLiked: false // Will be set by frontend based on user
      }
    }));
    
    res.json(formattedVideos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'short-app',
      eager: [
        { width: 300, height: 300, crop: 'pad', audio_codec: 'none' },
        { width: 160, height: 100, crop: 'crop', gravity: 'south', audio_codec: 'none' }
      ],
      eager_async: true
    });
    
    // Create video record
    const video = new Video({
      user: req.userId,
      title: req.body.title,
      description: req.body.description,
      videoUrl: result.secure_url,
      thumbnailUrl: result.secure_url.replace('.mp4', '.jpg')
    });
    
    await video.save();
    
    // Populate user info
    await video.populate('user', 'username profileUrl');
    
    res.status(201).json({
      id: video._id,
      username: video.user.username,
      videoUrl: video.videoUrl,
      isFollowed: false,
      title: video.title,
      profileUrl: video.user.profileUrl,
      reaction: {
        likes: '0',
        comments: '0',
        isLiked: false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike video
router.post('/:videoId/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const likeIndex = video.likes.indexOf(req.userId);
    let liked;
    
    if (likeIndex === -1) {
      video.likes.push(req.userId);
      liked = true;
    } else {
      video.likes.splice(likeIndex, 1);
      liked = false;
    }
    
    await video.save();
    
    res.json({
      likes: video.likes.length,
      liked
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:videoId/comments', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const comment = {
      user: req.userId,
      text: req.body.text
    };
    
    video.comments.push(comment);
    await video.save();
    
    // Get the user info for the new comment
    const user = await User.findById(req.userId).select('username profileUrl');
    
    res.status(201).json({
      user: {
        username: user.username,
        profileUrl: user.profileUrl
      },
      text: comment.text,
      createdAt: comment.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a video
router.get('/:videoId/comments', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId)
      .populate('comments.user', 'username profileUrl');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const comments = video.comments.map(comment => ({
      user: {
        username: comment.user.username,
        profileUrl: comment.user.profileUrl
      },
      text: comment.text,
      createdAt: comment.createdAt
    }));
    
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get videos by specific user (for "My Videos" page)
router.get('/user/:userId', async (req, res) => {
  try {
    const videos = await Video.find({ user: req.params.userId })
      .populate('user', 'username profileUrl')
      .populate('comments.user', 'username profileUrl')
      .sort({ createdAt: -1 });
    
    const formattedVideos = videos.map(video => ({
      id: video._id,
      username: video.user.username,
      videoUrl: video.videoUrl,
      isFollowed: false,
      title: video.title,
      description: video.description,
      profileUrl: video.user.profileUrl,
      reaction: {
        likes: video.likes.length.toString(),
        comments: video.comments.length.toString(),
        isLiked: false
      },
      createdAt: video.createdAt
    }));
    
    res.json(formattedVideos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's videos (authenticated)
router.get('/my-videos', auth, async (req, res) => {
  try {
    const videos = await Video.find({ user: req.userId })
      .populate('user', 'username profileUrl')
      .populate('comments.user', 'username profileUrl')
      .sort({ createdAt: -1 });
    
    const formattedVideos = videos.map(video => ({
      id: video._id,
      username: video.user.username,
      videoUrl: video.videoUrl,
      isFollowed: false,
      title: video.title,
      description: video.description,
      profileUrl: video.user.profileUrl,
      reaction: {
        likes: video.likes.length.toString(),
        comments: video.comments.length.toString(),
        isLiked: false
      },
      createdAt: video.createdAt
    }));
    
    res.json(formattedVideos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;