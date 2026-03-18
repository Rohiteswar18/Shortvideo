import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Comments from "./Comments";

const url = process.env.url || 'http://localhost:5000';

function Short({ short, shortContainerRef, onUpdate }) {
  const playPauseRef = useRef();
  const videoRef = useRef();
  const { isAuthenticated, user } = useAuth();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(short.reaction.isLiked);
  const [likesCount, setLikesCount] = useState(parseInt(short.reaction.likes.replace(/[^0-9]/g, '')) || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isFollowing, setIsFollowing] = useState(short.isFollowed);

  useEffect(() => {
    shortContainerRef.current.addEventListener("scroll", handleVideo);
    setIsPlaying(!videoRef.current.paused);
    setIsMuted(videoRef.current.muted);
    
    window.addEventListener("blur", () => {
      if (isActiveVideo(videoRef)) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    });

    window.addEventListener("focus", () => {
      if (isActiveVideo(videoRef)) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    });

    return () => {
      shortContainerRef.current.removeEventListener("scroll", handleVideo);
    };
  }, [shortContainerRef]);

  async function handleVideo() {
    const videoTop = videoRef.current.getBoundingClientRect().top;

    if (videoTop > 0 && videoTop <= 150) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
        videoRef.current.pause();
      }
    } else {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like videos');
      return;
    }

    try {
      const response = await axios.post(`${url}/api/videos/${short.id}/like`);
      setLikesCount(response.data.likes);
      setIsLiked(response.data.liked);
      
      // Update parent component
      if (onUpdate) {
        onUpdate(short.id, {
          reaction: {
            ...short.reaction,
            likes: response.data.likes.toString(),
            isLiked: response.data.liked
          }
        });
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert('Please login to follow users');
      return;
    }

    try {
      // You'll need to get the user ID from the short data
      // This assumes short has a userId field
      const response = await axios.post(`${url}/api/users/${short.userId}/follow`);
      setIsFollowing(response.data.followed);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await axios.get(`${url}/api/videos/${short.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
    if (!showComments) {
      loadComments();
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
    // Update comment count in parent
    if (onUpdate) {
      onUpdate(short.id, {
        reaction: {
          ...short.reaction,
          comments: (parseInt(short.reaction.comments) + 1).toString()
        }
      });
    }
  };

  return (
    <div className="reel">
      <div className="reel-video">
        <div className="video">
          <video
            ref={videoRef}
            onClick={() => {
              if (!isPlaying) {
                videoRef.current.play();
                setIsPlaying(true);
              } else {
                videoRef.current.pause();
                setIsPlaying(false);
              }
            }}
            disableRemotePlayback
            playsInline
            loop
            src={short.videoUrl}
          ></video>
          
          <div className="controls">
            <span onClick={() => {
              if (!isPlaying) {
                videoRef.current.play();
                setIsPlaying(true);
              } else {
                videoRef.current.pause();
                setIsPlaying(false);
              }
            }}>
              <ion-icon name={`${isPlaying ? "pause" : "play"}-outline`}></ion-icon>
            </span>
            <span onClick={() => {
              videoRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }}>
              <ion-icon name={`volume-${isMuted ? "mute" : "medium"}-outline`}></ion-icon>
            </span>
          </div>
          
          <div
            ref={playPauseRef}
            onClick={() => {
              videoRef.current.play();
              setIsPlaying(true);
            }}
            className={`play-pause ${isPlaying ? "" : "show-play-pause"}`}
          >
            <ion-icon name="play-outline"></ion-icon>
          </div>
          
          <div className="foot">
            <div className="title">{short.title}</div>
            <div className="user-info">
              <div>
                <img src={short.profileUrl} alt="" />
                <span>{short.username}</span>
              </div>
              {!isFollowing && (
                <button onClick={handleFollow}>Follow</button>
              )}
            </div>
          </div>
        </div>
        
        <div className="reaction">
          <div onClick={handleLike}>
            {isLiked ? (
              <span className="like">
                <ion-icon name="heart"></ion-icon>
              </span>
            ) : (
              <span className="unlike">
                <ion-icon name="heart-outline"></ion-icon>
              </span>
            )}
            <span className="value">{likesCount.toLocaleString()}</span>
          </div>
          
          <div onClick={handleCommentClick}>
            <ion-icon name="chatbubble-outline"></ion-icon>
            <span className="value">{short.reaction.comments}</span>
          </div>
          
          <div>
            <ion-icon name="arrow-redo-outline"></ion-icon>
          </div>
          
          <div>
            <ion-icon name="ellipsis-vertical-outline"></ion-icon>
          </div>
        </div>
      </div>

      {showComments && (
        <Comments
          videoId={short.id}
          comments={comments}
          onCommentAdded={handleCommentAdded}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
}

function isActiveVideo(videoRef) {
  const videoTop = videoRef.current.getBoundingClientRect().top;
  return videoTop > 0 && videoTop <= 150;
}

export default Short;