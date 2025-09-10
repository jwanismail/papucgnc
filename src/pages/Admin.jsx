import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';

const Admin = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useContext(ProductContext);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',
    description: '',
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    stockBySize: {},
    gender: 'Unisex',
    category: 'sneaker',
    tags: '',
    isActive: true,
    campaign: '' // Kampanya seçimi için alan
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);
  const dragAreaRef = useRef(null);

  useEffect(() => {
    console.log('Admin component - products:', products);
  }, [products]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (size, checked) => {
    setFormData(prev => ({
      ...prev,
      sizes: checked 
        ? [...prev.sizes, size]
        : prev.sizes.filter(s => s !== size)
    }));
  };

  const handleStockChange = (size, value) => {
    setFormData(prev => ({
      ...prev,
      stockBySize: {
        ...prev.stockBySize,
        [size]: parseInt(value) || 0
      }
    }));
  };

  // Drag & Drop işlemleri
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processImageFiles(files);
  };

  const processImageFiles = (files) => {
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} dosyası 10MB'dan büyük!`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} geçerli bir resim dosyası değil!`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Yeni resimleri ekle
    const newImages = [...selectedImages, ...validFiles];
    setSelectedImages(newImages);

    // Önizlemeleri oluştur
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, { 
          file, 
          preview: e.target.result, // base64 string
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          isExisting: false
        }]);
      };
      reader.readAsDataURL(file);
    });

    console.log(`${validFiles.length} resim seçildi`);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    processImageFiles(files);
  };

  const removeImage = (index) => {
    const previewToRemove = imagePreviews[index];
    
    // Eğer yeni yüklenen bir resimse, selectedImages'dan da kaldır
    if (previewToRemove.file) {
      const newImages = selectedImages.filter(img => img !== previewToRemove.file);
      setSelectedImages(newImages);
    }
    
    // Önizlemelerden kaldır
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...selectedImages];
    const newPreviews = [...imagePreviews];
    
    // Sadece yeni yüklenen resimleri selectedImages'da tut
    const movedPreview = newPreviews[fromIndex];
    if (movedPreview.file) {
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      setSelectedImages(newImages);
    }
    
    // Önizlemeleri yeniden sırala
    const [movedPreviewItem] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedPreviewItem);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedImages.length === 0 && imagePreviews.filter(p => !p.isExisting).length === 0) {
      alert('Lütfen en az bir resim seçin!');
      return;
    }

    if (!formData.name || !formData.price || !formData.brand) {
      alert('Lütfen gerekli alanları doldurun!');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simüle edilmiş yükleme progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Resim URL'lerini hazırla
      let imageUrls = [];
      
      // Mevcut resimleri ekle (düzenleme sırasında)
      const existingImages = imagePreviews.filter(p => p.isExisting).map(p => p.preview);
      imageUrls = [...existingImages];
      
      // Yeni seçilen resimleri ekle
      if (selectedImages.length > 0) {
        // Yeni resimleri base64 olarak ekle
        const newImageUrls = imagePreviews
          .filter(p => !p.isExisting && p.file)
          .map(p => p.preview);
        imageUrls = [...imageUrls, ...newImageUrls];
      }
      
      console.log('Toplam resim sayısı:', imageUrls.length);
      console.log('Resim URL\'leri:', imageUrls);
      
      const newProduct = {
        id: editingProduct ? editingProduct.id : Date.now(),
        ...formData,
        images: imageUrls,
        image: imageUrls[0] || '', // Ana resim
        price: parseInt(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Yeni ürün oluşturuldu:', newProduct);

      if (editingProduct) {
        console.log('Ürün güncelleniyor...');
        updateProduct(newProduct);
        setEditingProduct(null);
      } else {
        console.log('Ürün ekleniyor...');
        addProduct(newProduct);
      }

      resetForm();
      setIsFormOpen(false);
      setUploadProgress(0);
      
      // Başarı mesajı
      alert(editingProduct ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!');

    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      alert('Ürün eklenirken bir hata oluştu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      brand: '',
      description: '',
      sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
      stockBySize: {},
      gender: 'Unisex',
      category: '',
      tags: '',
      isActive: true,
      campaign: ''
    });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      brand: product.brand,
      description: product.description || '',
      sizes: product.sizes || [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
      stockBySize: product.stockBySize || {},
      gender: product.gender || 'Unisex',
      category: product.category || '',
      tags: product.tags ? product.tags.join(', ') : '',
      isActive: product.isActive !== false,
      campaign: product.campaign || ''
    });
    
    // Mevcut resimleri önizleme olarak göster
    if (product.images && product.images.length > 0) {
      setImagePreviews(product.images.map((img, index) => ({
        file: null,
        preview: img,
        isExisting: true,
        index,
        id: `existing-${index}`,
        name: img.split('/').pop(),
        size: 0
      })));
    }
    
    setSelectedImages([]);
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      deleteProduct(productId);
    }
  };

  const openForm = () => {
    setIsFormOpen(true);
    resetForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
    setEditingProduct(null);
    setUploadProgress(0);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>🛍️ Admin Paneli</h1>
          <p>Ürün yönetimi ve e-ticaret kontrolü</p>
          <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
            <button className="add-product-btn" onClick={openForm}>
              <span>+</span>
              Ürün Ekle
            </button>
            <button className="add-product-btn" onClick={()=>window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'})}>
              📦 Ürün Listesi
            </button>
            <Link to="/admin/siparisler" className="add-product-btn" style={{textDecoration:'none', color:'inherit'}}>
              📋 Siparişler
            </Link>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>{editingProduct ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün Ekle'}</h2>
              <button className="close-btn" onClick={closeForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form">
              {/* Temel Bilgiler */}
              <div className="form-section">
                <h3>📋 Temel Bilgiler</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ürün Adı *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Ürün adını girin"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Fiyat (₺) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      placeholder="Fiyat girin"
                      className="form-input"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Marka *</label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">Marka seçin</option>
                      <option value="Nike">Nike</option>
                      <option value="Adidas">Adidas</option>
                      <option value="Vans">Vans</option>
                      <option value="New Balance">New Balance</option>
                      <option value="Converse">Converse</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Kategori</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Cinsiyet</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Erkek">Erkek</option>
                      <option value="Kadın">Kadın</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Etiketler</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Etiketleri virgülle ayırın"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Kampanya Seçimi */}
              <div className="form-section">
                <h3>🎯 Kampanya Kategorisi</h3>
                <div className="form-group">
                  <label>Kampanya</label>
                  <select
                    name="campaign"
                    value={formData.campaign}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Kampanya seçin (opsiyonel)</option>
                    <option value="2-cift-949">💖 2 ÇİFT 949 TL</option>
                    <option value="2-cift-1499">🎉 2 ÇİFT 1499 TL</option>
                    <option value="en-cok-satanlar">🔥 EN ÇOK SATANLAR</option>
                    <option value="yeni-sezon">✨ YENİ SEZON</option>
                    <option value="spor-ayakkabi">⚽ SPOR AYAKKABI</option>
                    <option value="outlet">🏷️ OUTLET</option>
                  </select>
                  <p style={{fontSize: '0.9rem', color: '#666', marginTop: '8px'}}>
                    Seçilen kampanya navbar'da görünecek ve ürün o kategoride listelenecektir.
                  </p>
                </div>
              </div>

              {/* Resim Yükleme */}
              <div className="form-section">
                <h3>🖼️ Ürün Resimleri</h3>
                <div className="image-upload-area">
                  <div 
                    ref={dragAreaRef}
                    className={`drag-drop-area ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                  >
                    <div className="upload-placeholder">
                      <div className="upload-icon">📷</div>
                      <p>Resimleri buraya sürükleyin veya tıklayın</p>
                      <span>PNG, JPG, JPEG (Max: 10MB) - Birden fazla seçebilirsiniz</span>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden-input"
                  />
                </div>
                
                {/* Resim Önizlemeleri */}
                {imagePreviews.length > 0 && (
                  <div className="image-previews-section">
                    <div className="section-header-row">
                      <h4>Seçilen Resimler ({imagePreviews.length})</h4>
                      {imagePreviews.filter(p => p.isExisting).length > 0 && (
                        <button
                          type="button"
                          className="add-more-images-btn"
                          onClick={openFileDialog}
                        >
                          + Yeni Resim Ekle
                        </button>
                      )}
                    </div>
                    <div className="image-previews-grid">
                      {imagePreviews.map((preview, index) => (
                        <div key={preview.id} className="image-preview-item">
                          <div className="image-preview-header">
                            <span className="image-number">{index + 1}</span>
                            <div className="image-actions">
                              {index > 0 && (
                                <button
                                  type="button"
                                  className="move-btn move-up"
                                  onClick={() => moveImage(index, index - 1)}
                                  title="Yukarı taşı"
                                >
                                  ↑
                                </button>
                              )}
                              {index < imagePreviews.length - 1 && (
                                <button
                                  type="button"
                                  className="move-btn move-down"
                                  onClick={() => moveImage(index, index + 1)}
                                  title="Aşağı taşı"
                                >
                                  ↓
                                </button>
                              )}
                              <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => removeImage(index)}
                                title="Kaldır"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <img 
                            src={preview.preview} 
                            alt={`Önizleme ${index + 1}`}
                            className="preview-image"
                          />
                          <div className="image-info">
                            <span className="image-name">{preview.name}</span>
                            <span className="image-size">
                              {preview.size > 0 ? `${(preview.size / 1024 / 1024).toFixed(2)} MB` : 'Mevcut'}
                            </span>
                          </div>
                          {preview.isExisting && (
                            <div className="existing-image-badge">Mevcut</div>
                          )}
                          {!preview.isExisting && (
                            <div className="new-image-badge">Yeni</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Beden ve Stok */}
              <div className="form-section">
                <h3>👟 Beden ve Stok</h3>
                <div className="sizes-grid">
                  {[36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46].map(size => (
                    <div key={size} className="size-item">
                      <label className="size-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.sizes.includes(size)}
                          onChange={(e) => handleSizeChange(size, e.target.checked)}
                        />
                        <span className="size-label">{size}</span>
                      </label>
                      {formData.sizes.includes(size) && (
                        <input
                          type="number"
                          value={formData.stockBySize[size] || 0}
                          onChange={(e) => handleStockChange(size, e.target.value)}
                          placeholder="Stok"
                          className="stock-input"
                          min="0"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Açıklama */}
              <div className="form-section">
                <h3>📝 Ürün Açıklaması</h3>
                <div className="form-group">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ürün açıklaması girin..."
                    rows="4"
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* Durum */}
              <div className="form-section">
                <h3>⚙️ Ürün Durumu</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Ürün aktif (satışta)</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" onClick={closeForm} className="cancel-btn">
                  İptal
                </button>
                <button type="submit" className="save-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      {uploadProgress < 100 ? 'Yükleniyor...' : 'Kaydediliyor...'}
                    </>
                  ) : (
                    editingProduct ? 'Güncelle' : 'Kaydet'
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              {isSubmitting && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Ürün Listesi */}
      <div className="products-section">
        <div className="section-header">
          <h2>📦 Mevcut Ürünler ({products.length})</h2>
          <div className="section-actions">
            <input 
              type="text" 
              placeholder="Ürün ara..." 
              className="search-input"
            />
          </div>
        </div>
        
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card admin">
              <div className="product-image">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="no-image" style={{ display: product.image ? 'none' : 'flex' }}>
                  📷
                </div>
                
                {/* Birden fazla resim varsa göster */}
                {product.images && product.images.length > 1 && (
                  <div className="multiple-images-badge">
                    +{product.images.length - 1}
                  </div>
                )}

                {/* Ürün durumu */}
                <div className={`product-status ${product.isActive !== false ? 'active' : 'inactive'}`}>
                  {product.isActive !== false ? 'Aktif' : 'Pasif'}
                </div>
              </div>
              
              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="brand">{product.brand}</p>
                <p className="price">{product.price} ₺</p>
                <p className="stock">
                  Stok: {Object.values(product.stockBySize || {}).reduce((a, b) => a + b, 0)} adet
                </p>
                {product.campaign && (
                  <p className="campaign" style={{
                    background: '#000000',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'inline-block',
                    marginTop: '8px'
                  }}>
                    🎯 {product.campaign.replace('-', ' ').toUpperCase()}
                  </p>
                )}
                {product.images && product.images.length > 1 && (
                  <p className="image-count">{product.images.length} resim</p>
                )}
                {product.category && (
                  <p className="category">{product.category}</p>
                )}
              </div>
              
              <div className="product-actions">
                <button onClick={() => handleEdit(product)} className="edit-btn">
                  ✏️ Düzenle
                </button>
                <button onClick={() => handleDelete(product.id)} className="delete-btn">
                  🗑️ Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
