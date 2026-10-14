import { useEffect } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import Home from "./pages/Home.jsx";
import Build from "./pages/Build.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Subscription from "./pages/Subscription.jsx";
import Insights from "./pages/Insights.jsx";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function Nav() {
  const { count } = useCart();
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo" aria-label="Brü home">Brü</Link>
        <nav className="nav-links">
          <NavLink to="/build">Build your Brü</NavLink>
          <Link to="/#plans">Plans</Link>
          <NavLink to="/subscription">My subscription</NavLink>
          <NavLink to="/insights">Insights</NavLink>
        </nav>
        <NavLink to="/cart" className="cart-link">
          Cart
          <span className={`cart-count ${count ? "has-items" : ""}`}>{count}</span>
        </NavLink>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="logo small">Brü</span>
        <span>Good coffee, good days.</span>
      </div>
    </footer>
  );
}

export default function App() {
  const { error } = useCart();
  return (
    <>
      <ScrollToTop />
      <Nav />
      {error && <div className="banner-error" role="alert">{error}</div>}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/build" element={<Build />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <section className="page narrow center">
      <p className="eyebrow">Not found</p>
      <h1>This page isn't on the menu.</h1>
      <Link to="/" className="btn">Back home</Link>
    </section>
  );
}
