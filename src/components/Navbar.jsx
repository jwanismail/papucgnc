
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';

export default function Navbar() {
  const { cart } = useContext(ProductContext);
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const categories = [
    { name: 'EN ÇOK SATANLAR', path: '/marka/populer' },
    { name: 'YENİ SEZON', path: '/marka/yeni' },
    { name: 'SPOR AYAKKABI', path: '/marka/spor' },
    { name: 'OUTLET', path: '/marka/outlet' },
  ];


  return (
    <nav className="navbar v2">
      <div className="info-bar">ŞEFFAF KARGO İLE GÜVENLİ ALIŞVERİŞ</div>

      <div className="header-bar">
        <div className="header-inner">
          <Link to="/" className="logo">
            <img src="/pic/logo.png" alt="PAPUCGNC" />
            <span>PAPUCGNC</span>
          </Link>

          <div className="promo-chips">
            <Link to="/kampanya/2-cift-949" className="promo-chip">
              <span>💖</span>
              <span>2 ÇİFT 949 TL</span>
            </Link>
            <Link to="/kampanya/2-cift-1499" className="promo-chip">
              <span>🎉</span>
              <span>2 ÇİFT 1499 TL</span>
            </Link>
            <Link to="/kampanya/en-cok-satanlar" className="promo-chip ghost">
              <span>🔥</span>
              <span>EN ÇOK SATANLAR</span>
            </Link>
          </div>

          <div className="header-icons">
            <Link to="/sepet" className="icon-btn" aria-label="Sepet">🛒<span className="badge">{cartCount}</span></Link>
          </div>
        </div>
      </div>

      <div className="category-tabs">
        <div className="tabs-inner">
          <div className="tabs">
            {categories.map((c) => (
              <Link key={c.name} to={c.path} className="category-tab">{c.name}</Link>
            ))}
          </div>
          <div className="view-toggles">
            <button className="view-btn" aria-label="Liste görünümü">☰</button>
            <button className="view-btn active" aria-label="Izgara görünümü">▦</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
