import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import '../assets/style.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useContext(ProductContext);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // URL'den gelen ID'ye göre ürünü bul
  const product = products.find(p => p.id === parseInt(id));

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container">
        <div className="no-products">
          <h2>Ürün bulunamadı</h2>
          <p>Aradığınız ürün mevcut değil.</p>
          <button 
            onClick={() => navigate('/urunler')}
            className="btn-primary-modern"
          >
            Ürünlere Dön
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Lütfen bir beden seçin');
      return;
    }
    
    addToCart({
      ...product,
      selectedSize,
      quantity
    });
    
    alert('Ürün sepete eklendi!');
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">Ana Sayfa</button>
          <span className="breadcrumb-separator">/</span>
          <button onClick={() => navigate('/urunler')} className="breadcrumb-link">Ürünler</button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-detail-container">
          {/* Sol taraf - Ürün resimleri */}
          <div className="product-images-section">
            <div className="main-image-container">
              <img 
                src={product.images && product.images[selectedImage] ? product.images[selectedImage] : product.image} 
                alt={product.name}
                className="main-product-image"
              />
              {product.discount > 0 && (
                <div className="discount-badge-large">
                  %{product.discount}
                </div>
              )}
            </div>
            
            {/* Küçük resimler */}
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className={`thumbnail-image ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sağ taraf - Ürün bilgileri */}
          <div className="product-info-section">
            <div className="product-header">
              <div className="product-brand">{product.brand}</div>
              <h1 className="product-title-large">{product.name}</h1>
              
              {/* Rating */}
              <div className="product-rating-large">
                <div className="stars">
                  {renderStars(product.rating || 5)}
                </div>
                <span className="rating-text">
                  {product.reviews || 1} değerlendirme
                </span>
              </div>
            </div>

            {/* Fiyat bilgisi */}
            <div className="product-price-section">
              {product.discount > 0 ? (
                <>
                  <div className="discount-badge">{product.discount}% İndirim</div>
                  <div className="price-container">
                    <span className="old-price">৳ {product.originalPrice || product.price}</span>
                    <span className="current-price">৳ {product.price}</span>
                  </div>
                </>
              ) : (
                <div className="current-price">৳ {product.price}</div>
              )}
            </div>

            {/* Beden seçimi */}
            <div className="size-selection">
              <h3>Beden Seçimi</h3>
              <div className="size-options">
                {product.sizes && product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Miktar seçimi */}
            <div className="quantity-selection">
              <h3>Miktar</h3>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Sepete ekle butonu */}
            <div className="add-to-cart-section">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                SEPETE EKLE
              </button>
            </div>

            {/* Ürün açıklaması */}
            <div className="product-description">
              <h3>Ürün Açıklaması</h3>
              <p>{product.description || 'Bu ürün hakkında detaylı bilgi yakında eklenecektir.'}</p>
            </div>

            {/* Özellikler */}
            {product.features && (
              <div className="product-features">
                <h3>Özellikler</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Benzer ürünler */}
        <div className="similar-products">
          <h2>Benzer Ürünler</h2>
          <div className="similar-products-grid">
            {products
              .filter(p => p.brand === product.brand && p.id !== product.id)
              .slice(0, 4)
              .map(similarProduct => (
                <div 
                  key={similarProduct.id} 
                  className="similar-product-card"
                  onClick={() => navigate(`/urun/${similarProduct.id}`)}
                >
                  <img 
                    src={similarProduct.image} 
                    alt={similarProduct.name}
                    className="similar-product-image"
                  />
                  <div className="similar-product-info">
                    <div className="similar-product-brand">{similarProduct.brand}</div>
                    <div className="similar-product-name">{similarProduct.name}</div>
                    <div className="similar-product-price">৳ {similarProduct.price}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
