const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('followers', 'username profileUrl')
      .populate('following', 'username profileUrl');
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/Unfollow user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    if (req.userId === req.params.userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.userId);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const followIndex = currentUser.following.indexOf(req.params.userId);
    let followed;
    
    if (followIndex === -1) {
      currentUser.following.push(req.params.userId);
      userToFollow.followers.push(req.userId);
      followed = true;
    } else {
      currentUser.following.splice(followIndex, 1);
      userToFollow.followers.pull(req.userId);
      followed = false;
    }
    
    await currentUser.save();
    await userToFollow.save();
    
    res.json({
      followers: userToFollow.followers.length,
      followed
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;