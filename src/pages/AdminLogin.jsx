import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(password);
    if (res.ok) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Giriş başarısız');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>🔐 Admin Girişi</h1>
          <p>Dashboard'a erişmek için şifre giriniz</p>
        </div>
      </div>
      <div className="products-section" style={{maxWidth:480}}>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <div className="form-group">
              <label>Şifre</label>
              <input type="password" className="form-input" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>
            {error && <p style={{color:'red'}}>{error}</p>}
            <div className="form-actions">
              <button type="submit" className="save-btn">Giriş Yap</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


