import React from 'react';
import { Link } from 'react-router-dom';
import './css/Home.css';

const Home = () => {
  return (
    <div className="container">
      <div className="glass-card">
        <header className="header">
          <h1 className="title">Hoş Geldiniz!</h1>
          <p className="subtitle">Keşfetmek için bağlantıları kullanın.</p>
        </header>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/login" className="nav-link">Giriş Yap</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link">Kayıt Ol</Link>
            </li>
            <li className="nav-item">
              <Link to="/chat" className="nav-link">Mesajlaşma</Link>
            </li>
            <li className="nav-item">
              <Link to="/videocall" className="nav-link">Videolu Görüşme</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Home;
