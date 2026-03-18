import React, { useRef, useState, useEffect } from "react";
import Short from "./Short";
import axios from "axios";
import staticData from "../data/data.json";

const url = process.env.url || 'http://localhost:5000';

function ShortContainer() {
  const shortContainerRef = useRef();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingStaticData, setUsingStaticData] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      // Try to fetch from API first
      const response = await axios.get(`${url}/api/videos`);
      if (response.data && response.data.length > 0) {
        setVideos(response.data);
        setUsingStaticData(false);
      } else {
        // If API returns empty array, use static data
        console.log('No videos in database, using static data');
        setVideos(staticData);
        setUsingStaticData(true);
      }
    } catch (error) {
      // If API fails (backend not running), use static data
      console.log('Backend not available, using static data');
      setVideos(staticData);
      setUsingStaticData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpdate = (videoId, updatedData) => {
    setVideos(videos.map(video => 
      video.id === videoId ? { ...video, ...updatedData } : video
    ));
  };

  if (loading) {
    return <div className="loading">Loading videos...</div>;
  }

  return (
    <>
      {usingStaticData && (
        <div className="dev-notice">
          Using demo data. Start your backend to see real videos.
        </div>
      )}
      
      <section ref={shortContainerRef} className="short-container">
        {videos.map((video) => (
          <Short
            key={video.id}
            shortContainerRef={shortContainerRef}
            short={video}
            onUpdate={handleVideoUpdate}
          />
        ))}
      </section>

      <div className="navigation-container">
        <div
          onClick={() => {
            shortContainerRef.current.scrollTo(
              0,
              shortContainerRef.current.scrollTop - window.innerHeight
            );
          }}
          className="nav-up"
        >
          <ion-icon name="arrow-up-outline"></ion-icon>
        </div>
        <div
          onClick={() => {
            shortContainerRef.current.scrollTo(
              0,
              shortContainerRef.current.scrollTop + window.innerHeight
            );
          }}
          className="nav-down"
        >
          <ion-icon name="arrow-down-outline"></ion-icon>
        </div>
      </div>
    </>
  );
}

export default ShortContainer;