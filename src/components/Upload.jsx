import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Upload.css';

const url = process.env.url || 'http://localhost:5000';

function Upload() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setFormData({ ...formData, video: file });
    } else {
      setError('Please select a valid video file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.video) {
      setError('Please select a video');
      return;
    }

    setUploading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('video', formData.video);

    try {
      await axios.post(`${url}/api/videos/upload`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Video</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength="150"
            />
          </div>
          
          <div className="form-group">
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength="500"
              rows="4"
            />
          </div>
          
          <div className="form-group file-input">
            <label htmlFor="video-upload">
              <ion-icon name="cloud-upload-outline"></ion-icon>
              <span>{formData.video ? formData.video.name : 'Choose a video'}</span>
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
            />
          </div>
          
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Upload;