import { Link } from "react-router-dom";
import { LOGO_URL, CONTACT_EMAIL } from "@/lib/constants";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="border-t border-[#EBE7E0] bg-[#FDFBF7]">
      <div className="ddls-container py-16 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Dosti Dil Se"
              className="h-14 w-14 rounded-full object-cover border border-[#EBE7E0]"
            />
            <div>
              <div className="font-serif text-xl text-[#2C3E42]">Dosti Dil Se</div>
              <div className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">
                Spreading Love &amp; Hope
              </div>
            </div>
          </div>
          <p className="mt-6 text-[#5C757B] leading-relaxed max-w-sm">
            A friendship-first foundation working for children, nature, and anyone in need.
            Transparent, gentle, and built with heart.
          </p>
        </div>

        <div className="md:col-span-3">
          <div className="text-xs tracking-[0.22em] uppercase text-[#5C757B] mb-4">Explore</div>
          <ul className="space-y-3 text-[#2C3E42]">
            <li><Link to="/" className="hover:text-[#5A8896] transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-[#5A8896] transition">About</Link></li>
            <li><Link to="/projects" className="hover:text-[#5A8896] transition">Projects</Link></li>
            <li><Link to="/contact" className="hover:text-[#5A8896] transition">Contact</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="text-xs tracking-[0.22em] uppercase text-[#5C757B] mb-4">Reach Out</div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-testid="footer-email"
            className="text-[#2C3E42] hover:text-[#5A8896] transition font-serif text-lg"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-3 text-sm text-[#5C757B]">dostidilse.org</p>
          <Link
            to="/admin/login"
            data-testid="footer-admin-link"
            className="mt-6 inline-block text-xs text-[#5C757B]/70 hover:text-[#5A8896] transition"
          >
            Admin
          </Link>
        </div>
      </div>

      <div className="border-t border-[#EBE7E0]/70">
        <div className="ddls-container py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-[#5C757B]">
          <div className="flex items-center gap-2">
            Made with <Heart size={14} className="text-[#D99F80]" fill="#D99F80" /> in India
          </div>
          <div>© {new Date().getFullYear()} Dosti Dil Se Foundation. All hearts reserved.</div>
        </div>
      </div>
    </footer>
  );
}
