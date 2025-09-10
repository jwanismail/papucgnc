import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

const ProductContext = createContext();

export { ProductContext };

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [categories] = useState([
    { id: 'sneaker', name: 'Sneaker' },
    { id: 'spor', name: 'Spor Ayakkabı' },
    { id: 'bot', name: 'Bot' },
    { id: 'gundelik', name: 'Gündelik' },
    { id: 'kosu', name: 'Koşu' }
  ]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        console.log('ProductContext - Ürünler yükleniyor...');
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        console.log('ProductContext - Backend\'den gelen ürünler:', data);
        
        // Backend'den gelen ürünleri formatla
        const formattedProducts = data.map(product => {
          let sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
          let stockBySize = {};
          
          try {
            if (product.sizes && typeof product.sizes === 'string') {
              sizes = JSON.parse(product.sizes);
            } else if (Array.isArray(product.sizes)) {
              sizes = product.sizes;
            }
          } catch (e) {
            console.warn('Sizes JSON parse hatası:', e);
            sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
          }
          
          try {
            if (product.stockBySize && typeof product.stockBySize === 'string') {
              stockBySize = JSON.parse(product.stockBySize);
            } else if (typeof product.stockBySize === 'object') {
              stockBySize = product.stockBySize;
            }
          } catch (e) {
            console.warn('StockBySize JSON parse hatası:', e);
            stockBySize = {};
          }
          
          return {
            ...product,
            sizes,
            stockBySize
          };
        });
        
        console.log('ProductContext - Formatlanmış ürünler:', formattedProducts);
        setProducts(formattedProducts);
      } catch (e) {
        console.error('Ürünler alınamadı', e);
      }
    };
    load();
  }, []);

  const [cart, setCart] = useState([]);

  const addProduct = async (product) => {
    try {
      const payload = {
        name: product.name,
        price: parseInt(product.price),
        brand: product.brand,
        description: product.description || '',
        gender: product.gender || 'Unisex',
        image: (product.images && product.images[0]) || product.image || '',
        sizes: product.sizes || [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
        stockBySize: product.stockBySize || {},
        discount: product.discount || 0,
        campaign: product.campaign || null
      };
      
      console.log('Ürün ekleniyor:', payload);
      
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const created = await res.json();
      console.log('Backend\'den dönen ürün:', created);
      
      // Backend'den dönen ürünü formatla
      let sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
      let stockBySize = {};
      
      try {
        if (created.sizes && typeof created.sizes === 'string') {
          sizes = JSON.parse(created.sizes);
        } else if (Array.isArray(created.sizes)) {
          sizes = created.sizes;
        }
      } catch (e) {
        console.warn('AddProduct - Sizes JSON parse hatası:', e);
        sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
      }
      
      try {
        if (created.stockBySize && typeof created.stockBySize === 'string') {
          stockBySize = JSON.parse(created.stockBySize);
        } else if (typeof created.stockBySize === 'object') {
          stockBySize = created.stockBySize;
        }
      } catch (e) {
        console.warn('AddProduct - StockBySize JSON parse hatası:', e);
        stockBySize = {};
      }
      
      const formattedProduct = {
        ...created,
        sizes,
        stockBySize
      };
      
      console.log('Formatlanmış ürün:', formattedProduct);
      
      setProducts(prev => {
        const newProducts = [formattedProduct, ...prev];
        console.log('Yeni ürün listesi:', newProducts);
        return newProducts;
      });
      
    } catch (e) {
      console.error('Ürün ekleme hatası', e);
      alert('Ürün eklenirken hata oluştu: ' + e.message);
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const payload = {
        name: updatedProduct.name,
        price: parseInt(updatedProduct.price),
        brand: updatedProduct.brand,
        description: updatedProduct.description || '',
        gender: updatedProduct.gender || 'Unisex',
        image: (updatedProduct.images && updatedProduct.images[0]) || updatedProduct.image || '',
        sizes: updatedProduct.sizes || [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
        stockBySize: updatedProduct.stockBySize || {},
        discount: updatedProduct.discount || 0,
        campaign: updatedProduct.campaign || null
      };
      
      const res = await fetch(`${API_BASE}/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const saved = await res.json();
      
      // Backend'den dönen ürünü formatla
      let sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
      let stockBySize = {};
      
      try {
        if (saved.sizes && typeof saved.sizes === 'string') {
          sizes = JSON.parse(saved.sizes);
        } else if (Array.isArray(saved.sizes)) {
          sizes = saved.sizes;
        }
      } catch (e) {
        console.warn('UpdateProduct - Sizes JSON parse hatası:', e);
        sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
      }
      
      try {
        if (saved.stockBySize && typeof saved.stockBySize === 'string') {
          stockBySize = JSON.parse(saved.stockBySize);
        } else if (typeof saved.stockBySize === 'object') {
          stockBySize = saved.stockBySize;
        }
      } catch (e) {
        console.warn('UpdateProduct - StockBySize JSON parse hatası:', e);
        stockBySize = {};
      }
      
      const formattedProduct = {
        ...saved,
        sizes,
        stockBySize
      };
      
      setProducts(prev => prev.map(p => p.id === formattedProduct.id ? formattedProduct : p));
    } catch (e) {
      console.error('Ürün güncelleme hatası', e);
      alert('Ürün güncellenirken hata oluştu: ' + e.message);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await fetch(`${API_BASE}/products/${productId}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (e) {
      console.error('Ürün silme hatası', e);
    }
  };

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = {
    products,
    categories,
    cart,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    removeFromCart,
    clearCart
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
