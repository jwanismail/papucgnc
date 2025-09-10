import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
export { AuthContext };

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (password) => {
    // Basit demo: sabit şifre. Gerçekte backend doğrulaması gerekir.
    if (password === 'admin123') {
      setIsAdmin(true);
      return { ok: true };
    }
    return { ok: false, error: 'Şifre hatalı' };
  };

  const logout = () => setIsAdmin(false);

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


