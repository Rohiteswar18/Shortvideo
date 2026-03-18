import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import "./App.css";
import ShortContainer from "./components/ShortContainer";
import Login from "./components/Login";
import Upload from "./components/Upload";
import MyVideos from "./components/MyVideos";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div>
          <Navbar />
          <main className="main">
            <Sidebar />
            <Routes>
              <Route path="/" element={<ShortContainer />} />
              <Route path="/login" element={<Login />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/my-videos" element={<MyVideos />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;