import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LOGO_URL } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { Menu, X, Globe } from "lucide-react";

export default function Navigation({ transparent = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t, lang, setLang } = useT();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { key: "home", label: t("nav.home"), to: "/" },
    { key: "about", label: t("nav.about"), to: "/about" },
    { key: "projects", label: t("nav.projects"), to: "/projects" },
    { key: "join", label: t("nav.join"), to: "/join" },
    { key: "contact", label: t("nav.contact"), to: "/contact" },
  ];

  const LangToggle = ({ mobile = false }) => (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      data-testid={mobile ? "nav-mobile-lang-toggle" : "nav-lang-toggle"}
      aria-label={t("lang.toggle_aria")}
      className={`inline-flex items-center gap-1.5 border border-[#EBE7E0] rounded-full text-xs font-medium transition hover:border-[#5A8896] hover:text-[#5A8896] ${
        mobile ? "px-4 py-2 self-start text-[#2C3E42]" : "px-3 py-1.5 text-[#5C757B]"
      }`}
    >
      <Globe size={13} />
      <span className={lang === "en" ? "text-[#2C3E42] font-semibold" : ""}>EN</span>
      <span className="text-[#EBE7E0]">|</span>
      <span className={lang === "hi" ? "text-[#2C3E42] font-semibold" : ""}>हिं</span>
    </button>
  );

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

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`nav-link-${l.key}`}
                className={`text-sm transition-colors ${
                  active ? "text-[#2C3E42]" : "text-[#5C757B] hover:text-[#2C3E42]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <LangToggle />
          <Link
            to="/#donate"
            data-testid="nav-donate-btn"
            className="bg-[#5A8896] text-white hover:bg-[#46707C] px-6 py-2.5 rounded-full transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
          >
            {t("nav.donate")}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#2C3E42]"
          data-testid="nav-mobile-toggle"
          aria-label={t("nav.toggle_menu")}
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
                data-testid={`nav-mobile-link-${l.key}`}
                className="text-base text-[#2C3E42] py-2 border-b border-[#EBE7E0]/60"
              >
                {l.label}
              </Link>
            ))}
            <LangToggle mobile />
            <Link
              to="/#donate"
              onClick={() => setOpen(false)}
              data-testid="nav-mobile-donate-btn"
              className="mt-2 bg-[#5A8896] text-white px-6 py-3 rounded-full text-center text-sm font-medium"
            >
              {t("nav.donate")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
