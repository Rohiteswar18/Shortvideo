import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Comments.css';

const url = process.env.url || 'http://localhost:5000';

function Comments({ videoId, comments, onCommentAdded, onClose }) {
  const { isAuthenticated, user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`${url}/api/videos/${videoId}/comments`, {
        text: newComment
      });
      onCommentAdded(response.data);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-overlay">
      <div className="comments-container">
        <div className="comments-header">
          <h3>Comments ({comments.length})</h3>
          <button onClick={onClose} className="close-btn">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment, index) => (
              <div key={index} className="comment-item">
                <img src={comment.user.profileUrl} alt={comment.user.username} />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="username">@{comment.user.username}</span>
                    <span className="timestamp">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {isAuthenticated && (
          <form onSubmit={handleSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength="500"
            />
            <button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Comments;