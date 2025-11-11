import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/hustlelogo.png"

function Nav() {

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b bg-white sticky top-0 z-50">
      {/* LOGO */}
     <Link to="/" className="flex items-center gap-2">
  <img
    src={logoImg}
    alt="HustleWave360 Logo"
    className="h-28 w-auto" // bigger height for better visibility
  />
</Link>

      {/* DESKTOP NAV */}
      <nav className="hidden md:flex items-center space-x-6">
        <Link to="/" className="hover:text-orange-500">
          Home
        </Link>
        <Link to="/how-it-works" className="hover:text-orange-500">
          How It Works
        </Link>
        <Link to="/post-news" className="hover:text-orange-500">
          Radio Promotion
        </Link>
        <Link to="/influencer" className="hover:text-orange-500">
          Influencer Promotion
        </Link>
      </nav>

      {/* CTA BUTTON (desktop only) */}
      <div className="hidden md:block">
        <button 
          onClick={() => navigate("/post-news")}
        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
          Submit Post
        </button>
      </div>

      {/* MOBILE MENU ICON */}
      <button
        onClick={toggleMenu}
        className="md:hidden text-gray-800 focus:outline-none"
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* MOBILE MENU DROPDOWN */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-t shadow-md md:hidden">
          <nav className="flex flex-col items-start p-6 space-y-4">
            <Link
              to="/"
              className="block w-full text-gray-700 hover:text-orange-500"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/how-it-works"
              className="block w-full text-gray-700 hover:text-orange-500"
              onClick={toggleMenu}
            >
              How It Works
            </Link>
            <Link
              to="/influencer"
              className="block w-full text-gray-700 hover:text-orange-500"
              onClick={toggleMenu}
            >
              Influencer Promotion
            </Link>
             <Link
            to="/post-news"
            onClick={toggleMenu}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Radio Promotion
          </Link>
           
            {/*<button
              onClick={toggleMenu}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Submit Post
            </button>*/}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Nav