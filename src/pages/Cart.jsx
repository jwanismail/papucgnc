import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useContext(ProductContext);
  
  const shippingFee = 99;
  const freeShippingThreshold = 1500;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal + shipping;

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Bu fonksiyonu context'e taşıyabiliriz
    console.log('Update quantity:', itemId, newQuantity);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">Sepetim</h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Sepetiniz Boş</h2>
            <p>Alışverişe başlamak için ürünlerimize göz atın.</p>
            <Link to="/urunler" className="cta-button">
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Sepetim</h1>
        
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
                <div className="cart-item-details">
                  <h3 className="cart-item-title">{item.name}</h3>
                  <p className="cart-item-size">Numara: {item.selectedSize || 'Belirtilmemiş'}</p>
                  <p className="cart-item-price">{item.price.toLocaleString('tr-TR')} ₺</p>
                </div>

                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{item.quantity || 1}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <p>{(item.price * (item.quantity || 1)).toLocaleString('tr-TR')} ₺</p>
                </div>

                <button 
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Sepet Özeti</h3>
            
            <div className="summary-row">
              <span>Ara Toplam:</span>
              <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
            </div>
            
            <div className="summary-row">
              <span>Kargo:</span>
              <span>
                {shipping === 0 ? (
                  <span className="free-shipping">Ücretsiz</span>
                ) : (
                  `${shipping.toLocaleString('tr-TR')} ₺`
                )}
              </span>
            </div>

            {subtotal < freeShippingThreshold && (
              <div className="shipping-notice">
                <p>
                  {freeShippingThreshold - subtotal} ₺ daha alışveriş yapın, kargo ücretsiz olsun!
                </p>
              </div>
            )}

            <div className="summary-row total">
              <span>Toplam:</span>
              <span>{total.toLocaleString('tr-TR')} ₺</span>
            </div>

            <div className="cart-actions">
              <Link to="/odeme" className="checkout-button">
                Ödemeye Geç
              </Link>
              
              <button 
                className="clear-cart-button"
                onClick={clearCart}
              >
                Sepeti Temizle
              </button>
            </div>

            <div className="payment-methods">
              <h4>Ödeme Yöntemleri</h4>
              <div className="payment-options">
                <div className="payment-option">
                  <span>💳</span>
                  <span>Kapıda Ödeme</span>
                </div>
                <div className="payment-option">
                  <span>🏦</span>
                  <span>EFT/Havale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
