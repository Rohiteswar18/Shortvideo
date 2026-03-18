import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Short from './Short';
import './MyVideos.css';

const url = process.env.url || 'http://localhost:5000';

function MyVideos() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyVideos();
  }, [isAuthenticated, navigate]);

  const fetchMyVideos = async () => {
    try {
      const response = await axios.get(`${url}/api/videos/my-videos`);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load your videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await axios.delete(`${url}/api/videos/${videoId}`);
        setVideos(videos.filter(v => v.id !== videoId));
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading your videos...</div>;
  }

  return (
    <div className="my-videos-container">
      <div className="my-videos-header">
        <h1>My Videos</h1>
        <button onClick={() => navigate('/upload')} className="upload-btn">
          <ion-icon name="cloud-upload-outline"></ion-icon>
          Upload New Video
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {videos.length === 0 ? (
        <div className="no-videos">
          <ion-icon name="videocam-outline"></ion-icon>
          <h3>No videos yet</h3>
          <p>Upload your first short video to get started!</p>
          <button onClick={() => navigate('/upload')} className="upload-first-btn">
            Upload Now
          </button>
        </div>
      ) : (
        <>
          <div className="videos-stats">
            <span>Total Videos: {videos.length}</span>
            <span>Total Views: {videos.reduce((acc, v) => acc + (parseInt(v.reaction.likes) || 0), 0)}</span>
          </div>
          
          <div className="videos-grid">
            {videos.map((video) => (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  <video 
                    src={video.videoUrl} 
                    onMouseOver={(e) => e.target.play()}
                    onMouseOut={(e) => {
                      e.target.pause();
                      e.target.currentTime = 0;
                    }}
                    muted
                    loop
                  />
                  <div className="video-actions">
                    <button onClick={() => navigate(`/video/${video.id}`)} className="view-btn">
                      <ion-icon name="eye-outline"></ion-icon>
                    </button>
                    <button onClick={() => handleDeleteVideo(video.id)} className="delete-btn">
                      <ion-icon name="trash-outline"></ion-icon>
                    </button>
                  </div>
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <div className="video-meta">
                    <span>
                      <ion-icon name="heart-outline"></ion-icon>
                      {video.reaction.likes}
                    </span>
                    <span>
                      <ion-icon name="chatbubble-outline"></ion-icon>
                      {video.reaction.comments}
                    </span>
                    <span className="date">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyVideos;