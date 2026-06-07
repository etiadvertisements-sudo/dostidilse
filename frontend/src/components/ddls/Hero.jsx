import { IMAGES } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { ArrowRight, Heart } from "lucide-react";

export default function Hero() {
  const { t } = useT();
  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative pt-6 md:pt-10 pb-20 md:pb-28 overflow-hidden"
    >
      <div className="ddls-container grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-6 relative z-10">
          <div className="fade-up inline-flex items-center gap-2 bg-[#F2EFE9] border border-[#EBE7E0] px-4 py-1.5 rounded-full">
            <Heart size={14} className="text-[#D99F80]" strokeWidth={2} />
            <span className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">
              {t("hero.kicker")}
            </span>
          </div>

          <h1
            data-testid="hero-title"
            className="fade-up fade-up-delay-1 mt-6 font-serif text-5xl sm:text-6xl lg:text-[5.5rem] leading-[1.02] tracking-tight text-[#2C3E42]"
          >
            {t("hero.title_1")} <span className="italic text-[#5A8896]">{t("hero.title_em")}</span>
            <br />
            {t("hero.title_2")}
            <br />
            {t("hero.title_3")}
          </h1>

          <p
            data-testid="hero-subtitle"
            className="fade-up fade-up-delay-2 mt-8 text-lg md:text-xl leading-relaxed text-[#5C757B] max-w-xl"
          >
            {t("hero.subtitle")}
          </p>

          <div className="fade-up fade-up-delay-3 mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="#donate"
              data-testid="hero-donate-btn"
              className="group inline-flex items-center justify-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] px-8 py-4 rounded-full transition-all duration-300 shadow-sm hover:shadow-md font-medium"
            >
              {t("hero.cta_donate")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#mission"
              data-testid="hero-mission-btn"
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-[#5A8896]/60 text-[#5A8896] hover:bg-[#5A8896] hover:text-white px-8 py-4 rounded-full transition-all duration-300 font-medium"
            >
              {t("hero.cta_mission")}
            </a>
          </div>

          <div className="fade-up fade-up-delay-4 mt-12 flex items-center gap-6 text-sm text-[#5C757B]">
            <div>
              <div className="font-serif text-2xl text-[#2C3E42]">₹10</div>
              <div className="text-xs uppercase tracking-wider">{t("hero.stat1_label")}</div>
            </div>
            <div className="h-8 w-px bg-[#EBE7E0]" />
            <div>
              <div className="font-serif text-2xl text-[#2C3E42]">100%</div>
              <div className="text-xs uppercase tracking-wider">{t("hero.stat2_label")}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="fade-up fade-up-delay-2 relative">
            <div className="absolute -inset-6 bg-[#F2EFE9] rounded-[2.5rem] -z-10" />
            <img
              src={IMAGES.hero_kids}
              alt="Children we stand with"
              className="w-full rounded-[2.5rem] shadow-xl border border-[#EBE7E0] object-cover aspect-[4/5]"
              data-testid="hero-image"
            />
            <div className="absolute -bottom-6 -left-4 md:-left-10 bg-white rounded-2xl shadow-lg border border-[#EBE7E0] px-5 py-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#D99F80]/15 flex items-center justify-center">
                <Heart size={18} className="text-[#D99F80]" fill="#D99F80" />
              </div>
              <div className="text-xs">
                <div className="font-medium text-[#2C3E42]">{t("hero.badge_l1")}</div>
                <div className="text-[#5C757B]">{t("hero.badge_l2")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#D99F80]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-32 w-96 h-96 rounded-full bg-[#5A8896]/10 blur-3xl" />
    </section>
  );
}
