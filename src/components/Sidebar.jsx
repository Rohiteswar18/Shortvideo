function Sidebar() {
  return (
    <aside>
      <ul className="user-nav">
        <li className="active">
          <ion-icon name="home-outline"></ion-icon>
          <span>For You</span>
        </li>
        <li>
          <ion-icon name="planet-outline"></ion-icon>
          <span>Enjoy</span>
        </li>
        <li>
          <ion-icon name="videocam-outline"></ion-icon>
          <span>Scroll</span>
        </li>
        <li>
          <ion-icon name="people-outline"></ion-icon>
          <span>Like</span>
        </li>
      </ul>
      <ul className="nav-help">
        <li>
          <ion-icon name="settings-outline"></ion-icon>
          <span>Comment</span>
        </li>
        <li>
          <ion-icon name="help-circle-outline"></ion-icon>
          <span>Add a new Video</span>
        </li>
        <li>
          <ion-icon name="flag-outline"></ion-icon>
          <span>Report</span>
        </li>
        <li>
          <ion-icon name="chatbox-outline"></ion-icon>
          <span>Send Feedback</span>
        </li>
      </ul>

      <footer>
        <small>© 2026 Rohit Eswar</small>
      </footer>
    </aside>
  );
}

export default Sidebar;