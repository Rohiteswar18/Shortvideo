const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Video = require('./models/Video');

dotenv.config();

// Sample users from your data.json
const users = [
  {
    username: 'Zach King',
    email: 'zach@example.com',
    password: 'password123',
    profileUrl: 'https://yt3.ggpht.com/ytc/AMLnZu_I4_Paw3h1eM6ASNhPpcfK4-E12zY7JSb7dn0iLA=s176-c-k-c0x00ffffff-no-rj-mo'
  },
  {
    username: 'Khaby Leme',
    email: 'khaby@example.com',
    password: 'password123',
    profileUrl: 'https://yt3.ggpht.com/-ieEoBkfKwx42qXBFbJy1L4BgBXMUOum85q9XJQMBzi50gWI8HRTT_ADsKdyufECc78DtMnG-Q=s176-c-k-c0x00ffffff-no-rj'
  },
  {
    username: 'Younes Zarou',
    email: 'younes@example.com',
    password: 'password123',
    profileUrl: 'https://yt3.ggpht.com/ytc/AMLnZu-TCFbN4LcWK7NVStpW_gXGHO2O-v7cRJM7hFsjKA=s176-c-k-c0x00ffffff-no-rj-mo'
  },
  {
    username: 'HiCoders',
    email: 'hicoders@example.com',
    password: 'password123',
    profileUrl: 'https://avatars.githubusercontent.com/u/69384657?v=4'
  },
  {
    username: 'Big Buck Bunny',
    email: 'bunny@example.com',
    password: 'password123',
    profileUrl: 'https://m.media-amazon.com/images/M/MV5BOTI5ZTNkYWQtNDg2Mi00MTBmLTliMGItNTI5YWI5OTZkM2Y2XkEyXkFqcGdeQXVyNzU1NzE3NTg@._V1_QL75_UX500_CR0,47,500,281_.jpg'
  }
];

// Sample videos from your data.json
const videos = [
  {
    title: "Trying to help speed up the supply chain",
    videoUrl: "https://github.com/hicodersofficial/images/blob/main/zach.mp4?raw=true",
    username: "Zach King"
  },
  {
    title: "Bro Jasonderulo it’s not my fault 🥹 please forgive me 🙏🏿🫶🏿 #shorts #khabylame #funny",
    videoUrl: "https://github.com/hicodersofficial/images/blob/main/khaby1.mp4?raw=true",
    username: "Khaby Leme"
  },
  {
    title: "stay hydrated this summer 🍉🍉🍉 #yzfamily",
    videoUrl: "https://github.com/hicodersofficial/images/blob/main/younes.mp4?raw=true",
    username: "Younes Zarou"
  },
  {
    title: "Welcome to my family bro, now your life will be simple 👓 🥸😎",
    videoUrl: "https://github.com/hicodersofficial/images/blob/main/khaby2.mp4?raw=true",
    username: "Khaby Leme"
  },
  {
    title: "✨ Figma loading animation! 😍🌈",
    videoUrl: "https://github.com/hicodersofficial/images/blob/main/figma%20loader.mp4?raw=true",
    username: "HiCoders"
  },
  {
    title: "This Skateboard sketch comes alive",
    videoUrl: "https://github.com/hicodersofficial/images/blob/main/zach2.mp4?raw=true",
    username: "Zach King"
  },
  {
    title: "Different aspect ratio check.",
    videoUrl: "https://www.w3schools.com/tags/mov_bbb.ogg",
    username: "Big Buck Bunny"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Video.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create a map of username to user ID
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.username] = user._id;
    });

    // Create videos
    for (const videoData of videos) {
      const userId = userMap[videoData.username];
      if (userId) {
        const video = new Video({
          user: userId,
          title: videoData.title,
          description: '',
          videoUrl: videoData.videoUrl,
          thumbnailUrl: videoData.videoUrl.replace('.mp4', '.jpg'),
          likes: [],
          comments: []
        });
        
        await video.save();
        console.log(`Created video: ${videoData.title}`);
      }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();