import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { useEffect, useState } from "react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const fetchQuote = async () => {
    try {
      const response = await fetch("https://quotes-api-self.vercel.app/quote");
      const data = await response.json();
      setQuote(data.quote);
      setIsModalOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleReset = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <nav className="navbar">
      <h1 className="logo">Expense Tracker</h1>
      <ul className="nav-links">
        <li className={location.pathname === "/" ? "active" : ""}>
          <Link to={"/"}>📊 Dashboard</Link>
        </li>
        <li className={location.pathname === "/transaction" ? "active" : ""}>
          <Link to={"/transaction"}>📄 Transaction</Link>
        </li>
        <li className={location.pathname === "/report" ? "active" : ""}>
          <Link to={"/report"}>⏳ Reports</Link>
        </li>
        <li>
          <button onClick={fetchQuote} className="nav-button">💡 Get Quote</button>
        </li>
        <li>
          <button onClick={handleReset} className="nav-button">🔄 Restart</button>
        </li>
        <li>
          <button onClick={toggleTheme} className="nav-button">
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </li>
      </ul>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{quote}</p>
            <button className="cls-btn" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
