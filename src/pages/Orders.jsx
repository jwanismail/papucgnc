import { useEffect, useState } from 'react';
import { API_BASE } from '../config';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setError('Siparişler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchOrders();
    } catch (e) {
      alert('Durum güncellenemedi');
    }
  };

  useEffect(() => {
    fetchOrders();
    // Real-time SSE
    const es = new EventSource(`${API_BASE.replace('/api','')}/api/stream`);
    es.addEventListener('order:new', () => fetchOrders());
    es.addEventListener('order:update', () => fetchOrders());
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>📋 Sipariş Yönetimi</h1>
          <p>Gelen siparişleri yönetin ve durumlarını güncelleyin</p>
        </div>
      </div>
      
      <div className="products-section">
        <div className="section-header">
          <h2>📑 Siparişler ({orders.length})</h2>
        </div>

      {loading && <div className="no-products"><p>Yükleniyor...</p></div>}
      {error && <div className="no-products"><p>{error}</p></div>}
      {!loading && orders.length === 0 && (
        <div className="no-products"><p>Henüz sipariş yok.</p></div>
      )}

      <div className="products-grid">
        {orders.map((o) => (
          <div key={o.id} className="product-card admin">
            <div className="product-info">
              <h4>{o.id} • {(o.fullName || (o.shipping && o.shipping.fullName) || '-')}</h4>
              <p className="brand">{o.phone || (o.shipping && o.shipping.phone) || '-'}</p>
              <p className="category">{(o.city || (o.shipping && o.shipping.city) || '-') + ' / ' + (o.district || (o.shipping && o.shipping.district) || '-')}</p>
              <p className="stock">Toplam: {(o.total ?? (o.totals && o.totals.grandTotal) ?? 0)} ₺ • Ödeme: {o.payment || o.paymentMethod}</p>
              <div style={{marginTop:10}}>
                <select value={o.status || 'yeni'} onChange={(e)=>updateOrderStatus(o.id, e.target.value)} className="form-select">
                  <option value="yeni">Yeni</option>
                  <option value="hazirlaniyor">Hazırlanıyor</option>
                  <option value="kargoda">Kargoda</option>
                  <option value="tamamlandi">Tamamlandı</option>
                  <option value="iptal">İptal</option>
                </select>
              </div>
            </div>
            <div className="product-actions">
              <Link to={`/admin/siparis/${o.id}`} className="edit-btn" style={{textDecoration:'none', textAlign:'center'}}>Detay</Link>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}


