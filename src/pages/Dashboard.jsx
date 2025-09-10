import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Real-time SSE for live stats
    const es = new EventSource(`${API_BASE.replace('/api','')}/api/stream`);
    const refresh = () => fetchDashboardData();
    es.addEventListener('order:new', refresh);
    es.addEventListener('order:update', refresh);
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/dashboard`);
      if (!response.ok) throw new Error('Dashboard verileri alınamadı');
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Sipariş durumu güncellenemedi');
      
      // Dashboard verilerini yenile
      fetchDashboardData();
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div className="admin-header-content">
            <h1>📊 Dashboard</h1>
            <p>Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div className="admin-header-content">
            <h1>📊 Dashboard</h1>
            <p style={{color: 'red'}}>Hata: {error}</p>
            <button onClick={fetchDashboardData} className="add-product-btn">
              🔄 Yeniden Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || { total: 0, new: 0, completed: 0, revenue: 0 };
  const recentOrders = dashboardData?.recentOrders || [];
  const products = dashboardData?.products || 0;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>📊 Satıcı Dashboard</h1>
          <p>İşletmenizin genel durumu ve sipariş takibi</p>
          <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
            <Link to="/admin" className="add-product-btn" style={{textDecoration:'none', color:'inherit'}}>
              🛍️ Ürün Yönetimi
            </Link>
            <Link to="/admin/siparisler" className="add-product-btn" style={{textDecoration:'none', color:'inherit'}}>
              📋 Siparişler
            </Link>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Toplam Sipariş</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <h3>{stats.new}</h3>
            <p>Yeni Sipariş</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Tamamlanan</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.revenue.toLocaleString('tr-TR')} ₺</h3>
            <p>Toplam Ciro</p>
          </div>
        </div>
      </div>

      {/* Son Siparişler */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📋 Son Siparişler</h2>
          <Link to="/admin/siparisler" className="view-all-btn">Tümünü Gör</Link>
        </div>
        
        <div className="orders-table">
          {recentOrders.length === 0 ? (
            <div className="no-orders">
              <p>Henüz sipariş bulunmuyor.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Müşteri</th>
                  <th>Telefon</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.fullName || (order.shipping && order.shipping.fullName) || '-'}</td>
                    <td>{order.phone || (order.shipping && order.shipping.phone) || '-'}</td>
                    <td>{(order.total ?? (order.totals && order.totals.grandTotal) ?? 0)} ₺</td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="yeni">Yeni</option>
                        <option value="hazirlaniyor">Hazırlanıyor</option>
                        <option value="kargoda">Kargoda</option>
                        <option value="tamamlandi">Tamamlandı</option>
                        <option value="iptal">İptal</option>
                      </select>
                    </td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR') : '-'}</td>
                    <td>
                      <Link to={`/admin/siparisler`} className="view-btn">
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>⚡ Hızlı İşlemler</h2>
        </div>
        
        <div className="quick-actions">
          <Link to="/admin" className="quick-action-card">
            <div className="action-icon">➕</div>
            <h3>Yeni Ürün Ekle</h3>
            <p>Ürün kataloğunuza yeni ürün ekleyin</p>
          </Link>
          
          <Link to="/admin/siparisler" className="quick-action-card">
            <div className="action-icon">📋</div>
            <h3>Siparişleri Yönet</h3>
            <p>Tüm siparişleri görüntüleyin ve yönetin</p>
          </Link>
          
          <div className="quick-action-card" onClick={fetchDashboardData}>
            <div className="action-icon">🔄</div>
            <h3>Verileri Yenile</h3>
            <p>Dashboard verilerini güncelleyin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
