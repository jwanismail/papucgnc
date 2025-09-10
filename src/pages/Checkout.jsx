import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { OrderContext } from '../context/OrderContext';
import { API_BASE } from '../config';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useContext(ProductContext);
  const { createOrder } = useContext(OrderContext);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('kapida');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal >= 1500 ? 0 : 99;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // WhatsApp gönderimi devre dışı. Siparişler panele kaydedilecek.

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!kvkkAccepted) {
      alert('KVKK aydınlatma metnini kabul etmelisiniz.');
      return;
    }

    if (cart.length === 0) {
      alert('Sepetiniz boş!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sipariş oluştur
      const order = {
        id: `SIP-${Date.now()}`,
        items: cart,
        shipping: formData,
        paymentMethod,
        totals: { subtotal, shipping, grandTotal: total }
      };

      console.log('Sipariş:', order);

      // Siparişi hem OrderContext'e hem de backend'e kaydet
      createOrder({ ...order, status: 'yeni', createdAt: new Date().toISOString() });
      
      // Backend'e de gönder
      try {
        await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...order, status: 'yeni', createdAt: new Date().toISOString() })
        });
      } catch (backendError) {
        console.log('Backend kayıt hatası:', backendError);
        // Backend hatası olsa bile sipariş local'de kaydedildi
      }

      // Sepeti temizle
      clearCart();

      // Başarı mesajı
      alert('Siparişiniz başarıyla alındı! En kısa sürede size ulaşacağız.');

      // Müşteriyi ana sayfaya yönlendir
      navigate('/');

    } catch (error) {
      console.error('Sipariş hatası:', error);
      alert('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.fullName && formData.phone && formData.address && 
                     formData.city && formData.district && kvkkAccepted && cart.length > 0;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Ödeme</h1>
        
        <div className="checkout-layout">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Teslimat Bilgileri</h3>
                
                <div className="form-group">
                  <label htmlFor="fullName">Ad Soyad *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefon *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-posta (Opsiyonel)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Açık Adres *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="form-textarea"
                    rows="3"
                    placeholder="Mahalle, sokak, bina no, daire no"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">İl *</label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">İl Seçiniz</option>
                      <option value="İstanbul">İstanbul</option>
                      <option value="Ankara">Ankara</option>
                      <option value="İzmir">İzmir</option>
                      <option value="Bursa">Bursa</option>
                      <option value="Antalya">Antalya</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="district">İlçe *</label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="note">Teslimat Notu (Opsiyonel)</label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="2"
                    placeholder="Örn: Zil çalışmıyor, kapıda bekleyin"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Ödeme Yöntemi</h3>
                
                <div className="payment-methods">
                  <div className="payment-option">
                    <input
                      type="radio"
                      id="kapida"
                      name="paymentMethod"
                      value="kapida"
                      checked={paymentMethod === 'kapida'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="kapida" className="payment-label">
                      <span className="payment-icon">💳</span>
                      <div className="payment-info">
                        <strong>Kapıda Ödeme</strong>
                        <p>Nakit veya kart ile kapıda ödeme</p>
                      </div>
                    </label>
                  </div>

                  <div className="payment-option">
                    <input
                      type="radio"
                      id="eft"
                      name="paymentMethod"
                      value="eft"
                      checked={paymentMethod === 'eft'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="eft" className="payment-label">
                      <span className="payment-icon">🏦</span>
                      <div className="payment-info">
                        <strong>EFT/Havale</strong>
                        <p>Banka hesabına transfer</p>
                      </div>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'eft' && (
                  <div className="eft-info">
                    <h4>EFT/Havale Bilgileri</h4>
                    <div className="bank-details">
                      <p><strong>Banka:</strong> Örnek Bank</p>
                      <p><strong>IBAN:</strong> TR00 0000 0000 0000 0000 0000 00</p>
                      <p><strong>Alıcı:</strong> PAPUCGNC</p>
                      <p><strong>Açıklama:</strong> SIP-{Date.now()}-{formData.fullName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-section">
                <div className="kvkk-checkbox">
                  <input
                    type="checkbox"
                    id="kvkk"
                    checked={kvkkAccepted}
                    onChange={(e) => setKvkkAccepted(e.target.checked)}
                  />
                  <label htmlFor="kvkk">
                    <a href="/kvkk" target="_blank">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum. *
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <Link to="/sepet" className="back-button">
                  ← Sepete Dön
                </Link>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? 'Sipariş Oluşturuluyor...' : 'Siparişi Onayla'}
                </button>
              </div>
            </form>
          </div>

          <div className="order-summary">
            <h3>Sipariş Özeti</h3>
            
            <div className="order-items">
              {cart.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-info">
                    <h4>{item.name}</h4>
                    <p>Numara: {item.size} | Adet: {item.quantity}</p>
                  </div>
                  <div className="order-item-price">
                    {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Ara Toplam:</span>
                <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="total-row">
                <span>Kargo:</span>
                <span>
                  {shipping === 0 ? (
                    <span className="free-shipping">Ücretsiz</span>
                  ) : (
                    `${shipping.toLocaleString('tr-TR')} ₺`
                  )}
                </span>
              </div>
              <div className="total-row grand-total">
                <span>Toplam:</span>
                <span>{total.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
