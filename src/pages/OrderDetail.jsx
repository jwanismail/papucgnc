import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/orders/${id}`);
        if (!res.ok) throw new Error('Sipariş bulunamadı');
        const data = await res.json();
        setOrder(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="no-products"><p>Yükleniyor...</p></div>;
  if (error) return <div className="no-products"><p>{error}</p></div>;
  if (!order) return null;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>🧾 Sipariş Detayı • {order.id}</h1>
          <p>{order.createdAt ? new Date(order.createdAt).toLocaleString('tr-TR') : ''}</p>
          <Link to="/admin/siparisler" className="add-product-btn" style={{textDecoration:'none', color:'inherit'}}>← Siparişlere Dön</Link>
        </div>
      </div>

      <div className="products-section">
        <div className="section-header"><h2>👤 Müşteri Bilgileri</h2></div>
        <div className="product-card admin">
          <div className="product-info">
            <p><strong>Ad Soyad:</strong> {order.fullName}</p>
            <p><strong>Telefon:</strong> {order.phone}</p>
            <p><strong>E-posta:</strong> {order.email || '-'}</p>
            <p><strong>Adres:</strong> {order.address}</p>
            <p><strong>Şehir/İlçe:</strong> {order.city} / {order.district}</p>
            <p><strong>Not:</strong> {order.note || '-'}</p>
          </div>
        </div>

        <div className="section-header"><h2>📦 Ürünler</h2></div>
        <div className="products-grid">
          {order.items.map((it, idx) => (
            <div key={it.id || idx} className="product-card admin">
              <div className="product-info">
                <h4>{it.name}</h4>
                <p className="stock">Adet: {it.quantity} • Numara: {it.size || '-'}</p>
                <p className="price">{it.price} ₺</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-header"><h2>💳 Ödeme ve Tutar</h2></div>
        <div className="product-card admin">
          <div className="product-info">
            <p><strong>Ödeme Yöntemi:</strong> {order.payment}</p>
            <p><strong>Ara Toplam:</strong> {order.subtotal} ₺</p>
            <p><strong>Kargo:</strong> {order.shipping === 0 ? 'Ücretsiz' : `${order.shipping} ₺`}</p>
            <p><strong>Toplam:</strong> {order.total} ₺</p>
            <p><strong>Durum:</strong> {order.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
