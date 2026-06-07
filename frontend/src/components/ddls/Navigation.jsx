import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LOGO_URL } from "@/lib/constants";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Contact", to: "/contact" },
];

export default function Navigation({ transparent = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-nav"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        transparent && !scrolled
          ? "bg-transparent"
          : "bg-[#FDFBF7]/92 backdrop-blur-md border-b border-[#EBE7E0]/70"
      }`}
    >
      <div className="ddls-container flex items-center justify-between py-4">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 group">
          <img
            src={LOGO_URL}
            alt="Dosti Dil Se"
            className="h-11 w-11 rounded-full object-cover ring-1 ring-[#EBE7E0] group-hover:ring-[#5A8896]/50 transition"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-lg text-[#2C3E42]">Dosti Dil Se</span>
            <span className="text-[10px] tracking-[0.22em] uppercase text-[#5C757B]">
              Spreading Love &amp; Hope
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={`text-sm transition-colors ${
                  active ? "text-[#2C3E42]" : "text-[#5C757B] hover:text-[#2C3E42]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            to="/#donate"
            data-testid="nav-donate-btn"
            className="bg-[#5A8896] text-white hover:bg-[#46707C] px-6 py-2.5 rounded-full transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
          >
            Donate
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#2C3E42]"
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div data-testid="nav-mobile-menu" className="md:hidden bg-[#FDFBF7] border-t border-[#EBE7E0]/70">
          <div className="ddls-container py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                className="text-base text-[#2C3E42] py-2 border-b border-[#EBE7E0]/60"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/#donate"
              onClick={() => setOpen(false)}
              data-testid="nav-mobile-donate-btn"
              className="mt-2 bg-[#5A8896] text-white px-6 py-3 rounded-full text-center text-sm font-medium"
            >
              Donate
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
