import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';

export default function Home() {
  const { products, addToCart } = useContext(ProductContext);

  // Debug için console.log ekleyelim
  console.log('Home component - products:', products);
  console.log('Home component - products count:', products.length);

  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('newest');

  const brands = ['Adidas', 'Converse', 'Nike', 'Vans'];

  const filtered = products.filter((p) => {
    const brandOk = !selectedBrand || p.brand === selectedBrand;
    const priceOk = p.price >= priceRange[0] && p.price <= priceRange[1];
    
    console.log(`Home - Ürün ${p.id} (${p.name}):`, {
      brandOk,
      priceOk,
      brand: p.brand,
      selectedBrand,
      price: p.price,
      priceRange
    });
    
    return brandOk && priceOk;
  });
  
  console.log('Home - Filtrelenmiş ürünler:', filtered);
  console.log('Home - Filtrelenmiş ürün sayısı:', filtered.length);

  const sorted = [...filtered].sort((a,b) => {
    if (sortBy === 'price-high') return a.price - b.price;
    if (sortBy === 'price-low') return b.price - a.price;
    return b.id - a.id;
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
                onChange={(e)=>setPriceRange([priceRange[0], parseInt(e.target.value)])}
              />
              <div className="range-values">{priceRange[0]}₺ - {priceRange[1]}₺</div>
            </div>
                  </div>
                  
          <div className="sidebar-section">
            <h4>Marka</h4>
            <div className="brand-list">
              {brands.map((b)=> (
                <button key={b} className={`brand-chip ${selectedBrand===b?'active':''}`} onClick={()=>setSelectedBrand(selectedBrand===b?'':b)}>{b}</button>
              ))}
            </div>
          </div>

          <button className="clear-filters full" onClick={()=>{ setSelectedBrand(''); setPriceRange([0,5000]); setSortBy('newest'); }}>Filtreleri temizle</button>
        </aside>

        <main className="products-main">
          <div className="top-tabs">
            <button className={`tab-btn ${sortBy==='price-high'?'active':''}`} onClick={()=>setSortBy('price-high')}>Fiyat artan</button>
            <button className={`tab-btn ${sortBy==='price-low'?'active':''}`} onClick={()=>setSortBy('price-low')}>Fiyat azalan</button>
            <button className={`tab-btn ${sortBy==='newest'?'active':''}`} onClick={()=>setSortBy('newest')}>En çok satanlar</button>
            <button className="tab-btn">Yeni sezon</button>
            <button className="tab-btn">Outlet</button>
          </div>

          <div className="products-grid">
            {sorted.map((product) => (
              <div key={product.id} className="product-card fade-in">
                <Link to={`/urun/${product.id}`} className="product-link">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <div className="product-brand">{product.brand}</div>
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-rating">
                      <div className="stars">{[1,2,3,4,5].map(s=> <span key={s} className="star filled">★</span>)}</div>
                      <span className="rating-text">1 değerlendirme</span>
                    </div>
                    <div className="product-price-container">
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

          {sorted.length === 0 && (
            <div className="no-products">
              <p>Seçilen kriterlere uygun ürün bulunamadı.</p>
              <p>Toplam ürün sayısı: {products.length}</p>
            </div>
          )}
        </main>
        </div>
    </div>
  );
}
