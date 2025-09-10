import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>PAPUCGNC</h3>
          <p>En trend ayakkabıları uygun fiyatlarla sunuyoruz. Vans, Nike, Adidas ve daha fazlası.</p>
          <div className="social-links">
            <a href="https://instagram.com/papucgnc" target="_blank" rel="noopener noreferrer">
              📱 Instagram
            </a>
            <a href="https://wa.me/905XXXXXXXXX" target="_blank" rel="noopener noreferrer">
              💬 WhatsApp
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Hızlı Linkler</h3>
          <ul>
            <li><Link to="/">Ana Sayfa</Link></li>
            <li><Link to="/urunler">Tüm Ürünler</Link></li>
            <li><Link to="/marka/vans">Vans</Link></li>
            <li><Link to="/marka/nike">Nike</Link></li>
            <li><Link to="/marka/adidas">Adidas</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Müşteri Hizmetleri</h3>
          <ul>
            <li><Link to="/hakkimizda">Hakkımızda</Link></li>
            <li><Link to="/iade-kosullari">İade Koşulları</Link></li>
            <li><Link to="/iletisim">İletişim</Link></li>
            <li><Link to="/sss">Sık Sorulan Sorular</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>İletişim</h3>
          <p>📞 +90 5XX XXX XX XX</p>
          <p>📧 info@papucgnc.com</p>
          <p>📍 İstanbul, Türkiye</p>
          <p>⏰ Pazartesi - Cumartesi: 09:00 - 18:00</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2024 PAPUCGNC. Tüm hakları saklıdır.</p>
          <div className="footer-links">
            <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
