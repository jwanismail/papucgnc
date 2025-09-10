import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import { ProductProvider } from "./context/ProductContext";
import { OrderProvider } from "./context/OrderContext";
import Orders from "./pages/Orders";
import AdminLogin from "./pages/AdminLogin";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import OrderDetail from "./pages/OrderDetail";

function App() {
  return (
    <AuthProvider>
    <ProductProvider>
      <OrderProvider>
      <Router>
        <div>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/urunler" element={<Products />} />
              <Route path="/urun/:id" element={<ProductDetail />} />
              <Route path="/sepet" element={<Cart />} />
              <Route path="/odeme" element={<Checkout />} />
              <Route path="/iletisim" element={<Contact />} />
              <Route path="/marka/:brand" element={<Products />} />
              <Route path="/kampanya/:campaign" element={<Products />} />
              <Route path="/admin-giris" element={<AdminLogin />} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
              <Route path="/admin/siparisler" element={<PrivateRoute><Orders /></PrivateRoute>} />
              <Route path="/admin/siparis/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
      </OrderProvider>
    </ProductProvider>
    </AuthProvider>
  );
}

export default App;
