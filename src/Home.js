import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h2>Hoş Geldiniz!</h2>
      <p>Bu, ana sayfadır. Aşağıdaki bağlantıları kullanarak diğer sayfalara gidebilirsiniz.</p>
      <nav>
        <ul>
          <li>
            <Link to="/login">Giriş Yap</Link>
          </li>
          <li>
            <Link to="/register">Kayıt Ol</Link>
          </li>
          <li>
            <Link to="/chat">Mesajlaşma</Link>
          </li>
          <li>
            <Link to="/videocall">Videolu Görüşme</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;