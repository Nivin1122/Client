import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Products from "./pages/product/products";
import SignUp from "./pages/authentication/signup";
import Login from "./pages/authentication/login";
import Cart from "./pages/cart";
import ProductDetail from "./pages/product/detail";
import Wishlist from "./pages/wishlist";
import AdminLogin from "./admin/authentication/login";
import Dashboard from "./admin/dashboard/dashboard";
import AuthCallback from "./pages/callback/authCallback";
import SearchResults from "./pages/search/searchResults";
import Checkout from "./pages/checkout/checkout";
import Orders from "./pages/orders/orders";
import Account from "./pages/account/account";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastClassName="custom-toast"
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/detail/:id" element={<ProductDetail />} />
        <Route path="/account" element={<Account />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;
