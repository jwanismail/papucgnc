import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { isAdmin } = useContext(AuthContext);
  if (!isAdmin) {
    return <Navigate to="/admin-giris" replace />;
  }
  return children;
}


