import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import './css/Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const history = useHistory();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        email,
        password,
        createdAt: new Date().toISOString()
      });

      // Kullanıcı bilgilerini localStorage'a kaydet
      localStorage.setItem('currentUser', JSON.stringify({ email, id: docRef.id }));

      alert('Kayıt başarılı!');
      history.push('/login');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setError('Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="register-container">
      <div className="card">
        <h2 className="register-title">Kayıt Ol</h2>
        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Şifre:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="register-button">Kayıt Ol</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
