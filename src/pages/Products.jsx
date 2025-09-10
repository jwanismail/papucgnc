import { useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';

export default function Products() {
  const { brand, campaign } = useParams();
  const { products, addToCart } = useContext(ProductContext);
  
  // Debug için console.log ekleyelim
  console.log('Products component - products:', products);
  console.log('Products component - brand param:', brand);
  console.log('Products component - campaign param:', campaign);
  
  const [selectedBrand, setSelectedBrand] = useState(brand || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('newest');

  const brands = ['Vans', 'Nike', 'Adidas', 'New Balance', 'Converse'];
  const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];

  // Kampanya başlığı için mapping
  const campaignTitles = {
    '2-cift-949': '💖 2 ÇİFT 949 TL Kampanyası',
    '2-cift-1499': '🎉 2 ÇİFT 1499 TL Kampanyası', 
    'en-cok-satanlar': '🔥 EN ÇOK SATANLAR',
    'yeni-sezon': '✨ YENİ SEZON',
    'spor-ayakkabi': '⚽ SPOR AYAKKABI',
    'outlet': '🏷️ OUTLET'
  };

  const getPageTitle = () => {
    if (campaign) {
      return campaignTitles[campaign] || 'Kampanya Ürünleri';
    }
    if (brand) {
      return `${brand} Ürünleri`;
    }
    return 'Tüm Ürünler';
  };

  const filteredProducts = products.filter(product => {
    const brandMatch = !selectedBrand || product.brand === selectedBrand;
    const sizeMatch = !selectedSize || (product.sizes && product.sizes.includes(parseInt(selectedSize)));
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    const campaignMatch = !campaign || product.campaign === campaign;
    
    console.log(`Ürün ${product.id} (${product.name}):`, {
      brandMatch,
      sizeMatch,
      priceMatch,
      campaignMatch,
      campaign: product.campaign,
      sizes: product.sizes,
      selectedSize,
      price: product.price,
      priceRange
    });
    
    return brandMatch && sizeMatch && priceMatch && campaignMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return b.id - a.id; // newest first
    }
  });

  return (
    <div className="products-page">
      <div className="products-layout">
        <aside className="filters-sidebar">
          <div className="sidebar-section">
            <h4>Fiyat</h4>
            <div className="range-row">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              />
              <div className="range-values">{priceRange[0]}₺ - {priceRange[1]}₺</div>
            </div>
          </div>

          <div className="sidebar-section">
            <h4>İndirim</h4>
            <div className="checkbox-list">
              {[10,20,30,40].map((d) => (
                <label key={d} className="checkbox-item">
                  <input type="checkbox" /> %{d} ve üzeri
                </label>
              ))}
              </div>
            </div>

          <div className="sidebar-section">
            <h4>Marka</h4>
            <div className="brand-list">
              {brands.map((b) => (
                <button
                  key={b}
                  className={`brand-chip ${selectedBrand===b? 'active':''}`}
                  onClick={() => setSelectedBrand(selectedBrand===b? '' : b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

            <button 
            className="clear-filters full"
              onClick={() => {
                setSelectedBrand('');
                setSelectedSize('');
                setPriceRange([0, 5000]);
                setSortBy('newest');
              }}
            >
            Filtreleri temizle
            </button>
        </aside>

        <main className="products-main">
          {/* Sayfa Başlığı */}
          <div className="page-header" style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '20px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e5e5e5'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#000000',
              margin: '0 0 10px 0'
            }}>
              {getPageTitle()}
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#666666',
              margin: '0'
            }}>
              {filteredProducts.length} ürün bulundu
            </p>
          </div>

          <div className="top-tabs">
            <button className={`tab-btn ${sortBy==='price-high'?'active':''}`} onClick={()=>setSortBy('price-high')}>Fiyat artan</button>
            <button className={`tab-btn ${sortBy==='price-low'?'active':''}`} onClick={()=>setSortBy('price-low')}>Fiyat azalan</button>
            <button className={`tab-btn ${sortBy==='newest'?'active':''}`} onClick={()=>setSortBy('newest')}>İndirim oranı artan</button>
            <button className="tab-btn">İndirim oranı azalan</button>
            <button className="tab-btn">En çok satanlar</button>
            <button className="tab-btn">En çok değerlendirilen</button>
          </div>
          
          <div className="products-grid">
            {sortedProducts.map((product) => (
              <div key={product.id} className="product-card fade-in">
                <Link to={`/urun/${product.id}`} className="product-link">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <div className="product-brand">{product.brand}</div>
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-rating">
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className="star filled">★</span>
                        ))}
                      </div>
                      <span className="rating-text">1 değerlendirme</span>
                    </div>
                    <div className="product-price-container">
                      {product.discount > 0 && (
                        <div className="discount-badge">%{product.discount}</div>
                      )}
                      <span className="product-old-price">৳ {(product.price*1.54).toFixed(0)}</span>
                      <span className="product-price">৳ {product.price}</span>
                    </div>
                  </div>
                </Link>
                <button 
                  className="product-button"
                  onClick={() => addToCart({
                    ...product,
                    quantity: 1,
                    selectedSize: product.sizes && product.sizes[0] // İlk bedeni varsayılan olarak seç
                  })}
                >
                  SEPETE EKLE
                </button>
              </div>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="no-products">
              <p>Seçilen kriterlere uygun ürün bulunamadı.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
