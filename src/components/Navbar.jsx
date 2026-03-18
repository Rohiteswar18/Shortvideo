import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav">
        <div className="logo-container" onClick={() => navigate('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-amd" viewBox="0 0 16 16">
  <path d="m.334 0 4.358 4.359h7.15v7.15l4.358 4.358V0zM.2 9.72l4.487-4.488v6.281h6.28L6.48 16H.2z"/>
</svg>
          </div>

        <div className="search-container">
          <input
            type="text"
            className="search"
            placeholder="Search accounts and videos"
          />
          <span></span>
          <button>
            <ion-icon name="search-outline"></ion-icon>
          </button>
        </div>

        <ul>
          {isAuthenticated ? (
            <>
              <li>
                <ion-icon name="notifications-outline"></ion-icon>
              </li>
              <li onClick={() => navigate('/upload')} title="Upload Video">
                <ion-icon name="cloud-upload-outline"></ion-icon>
              </li>
              <li onClick={() => navigate('/my-videos')} title="My Videos" className="my-videos-icon">
                <ion-icon name="videocam-outline"></ion-icon>
              </li>
              <li className="profile-menu">
                <img src={user?.profileUrl || '/default-avatar.png'} alt={user?.username} />
                <div className="dropdown">
                  <button onClick={() => navigate('/my-videos')}>My Videos</button>
                  <button onClick={logout}>Logout</button>
                </div>
              </li>
            </>
          ) : (
            <li>
              <button onClick={() => navigate('/login')} className="login-btn">
                Login
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;