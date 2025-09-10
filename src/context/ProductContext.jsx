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
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        setProducts(data);
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
        discount: product.discount || 0
      };
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const created = await res.json();
      setProducts(prev => [created, ...prev]);
    } catch (e) {
      console.error('Ürün ekleme hatası', e);
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const res = await fetch(`${API_BASE}/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      const saved = await res.json();
      setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
    } catch (e) {
      console.error('Ürün güncelleme hatası', e);
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
