import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';
import { ProductContext } from '../context/ProductContext';

export default function Dashboard() {
  const { products } = useContext(ProductContext);
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
  const totalProductsCount = dashboardData?.products || 0;

  // Ürünleri kampanya kategorilerine göre gruplandır
  const campaignGroups = {
    '2-cift-949': {
      title: '💖 2 ÇİFT 949 TL',
      products: products.filter(p => p.campaign === '2-cift-949'),
      color: '#ff6b9d'
    },
    '2-cift-1499': {
      title: '🎉 2 ÇİFT 1499 TL',
      products: products.filter(p => p.campaign === '2-cift-1499'),
      color: '#ff9f43'
    },
    'en-cok-satanlar': {
      title: '🔥 EN ÇOK SATANLAR',
      products: products.filter(p => p.campaign === 'en-cok-satanlar'),
      color: '#ff3838'
    },
    'yeni-sezon': {
      title: '✨ YENİ SEZON',
      products: products.filter(p => p.campaign === 'yeni-sezon'),
      color: '#2ed573'
    },
    'spor-ayakkabi': {
      title: '⚽ SPOR AYAKKABI',
      products: products.filter(p => p.campaign === 'spor-ayakkabi'),
      color: '#3742fa'
    },
    'outlet': {
      title: '🏷️ OUTLET',
      products: products.filter(p => p.campaign === 'outlet'),
      color: '#ff6348'
    },
    'kampanyasiz': {
      title: '📦 KAMPANYASIZ ÜRÜNLER',
      products: products.filter(p => !p.campaign || p.campaign === ''),
      color: '#747d8c'
    }
  };

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

      {/* Kampanya Kategorilerine Göre Ürünler */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>🎯 Kampanya Kategorileri</h2>
          <p>Ürünleriniz kampanya kategorilerine göre gruplandırılmıştır</p>
        </div>
        
        <div className="campaign-groups">
          {Object.entries(campaignGroups).map(([key, group]) => (
            <div key={key} className="campaign-group" style={{ borderLeft: `4px solid ${group.color}` }}>
              <div className="campaign-header">
                <h3 style={{ color: group.color }}>{group.title}</h3>
                <span className="product-count">{group.products.length} ürün</span>
              </div>
              
              {group.products.length > 0 ? (
                <div className="campaign-products">
                  {group.products.slice(0, 3).map(product => (
                    <div key={product.id} className="campaign-product">
                      <img src={product.image} alt={product.name} className="product-thumb" />
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p>{product.brand}</p>
                        <span className="product-price">{product.price} ₺</span>
                      </div>
                    </div>
                  ))}
                  {group.products.length > 3 && (
                    <div className="more-products">
                      +{group.products.length - 3} ürün daha
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-products">
                  <p>Bu kategoride henüz ürün bulunmuyor.</p>
                  <Link to="/admin" className="add-product-btn">
                    Ürün Ekle
                  </Link>
                </div>
              )}
            </div>
          ))}
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
