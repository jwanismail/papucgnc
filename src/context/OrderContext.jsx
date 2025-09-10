import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export { OrderContext };

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const createOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const value = { orders, createOrder, updateOrderStatus };
  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};


