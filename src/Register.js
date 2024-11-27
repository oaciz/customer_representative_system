import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';

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
        isAdmin: false,
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
    <div>
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Şifre:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Kayıt Ol</button>
      </form>
    </div>
  );
};

export default Register;