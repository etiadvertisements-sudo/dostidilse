import { Link } from "react-router-dom";
import { LOGO_URL, CONTACT_EMAIL } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { Heart } from "lucide-react";

export default function Footer() {
  const { t } = useT();
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
          <p className="mt-6 text-[#5C757B] leading-relaxed max-w-sm">{t("footer.tagline")}</p>
        </div>

        <div className="md:col-span-3">
          <div className="text-xs tracking-[0.22em] uppercase text-[#5C757B] mb-4">{t("footer.explore")}</div>
          <ul className="space-y-3 text-[#2C3E42]">
            <li><Link to="/" className="hover:text-[#5A8896] transition">{t("nav.home")}</Link></li>
            <li><Link to="/about" className="hover:text-[#5A8896] transition">{t("nav.about")}</Link></li>
            <li><Link to="/projects" className="hover:text-[#5A8896] transition">{t("nav.projects")}</Link></li>
            <li><Link to="/join" className="hover:text-[#5A8896] transition">{t("nav.join")}</Link></li>
            <li><Link to="/contact" className="hover:text-[#5A8896] transition">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="text-xs tracking-[0.22em] uppercase text-[#5C757B] mb-4">{t("footer.reach_out")}</div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-testid="footer-email"
            className="text-[#2C3E42] hover:text-[#5A8896] transition font-serif text-lg"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-3 text-sm text-[#5C757B]">dostidilse.org</p>
        </div>
      </div>

      <div className="border-t border-[#EBE7E0]/70">
        <div className="ddls-container py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-[#5C757B]">
          <div className="flex items-center gap-2">
            {t("footer.made_with")} <Heart size={14} className="text-[#D99F80]" fill="#D99F80" /> {t("footer.in_india")}
          </div>
          <div>© {new Date().getFullYear()} Dosti Dil Se Foundation. {t("footer.rights")}</div>
        </div>
      </div>
    </footer>
  );
}
