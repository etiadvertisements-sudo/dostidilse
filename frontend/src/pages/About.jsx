import Navigation from "@/components/ddls/Navigation";
import Footer from "@/components/ddls/Footer";
import { IMAGES } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { Heart, Sprout, BookOpen, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const { t } = useT();
  const values = [
    { icon: BookOpen, k: "about.v1", title: t("mission.p1.title") },
    { icon: Sprout, k: "about.v2", title: t("mission.p2.title") },
    { icon: HandHeart, k: "about.v3", title: t("about.help_form") },
  ];
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E42] font-sans" data-testid="about-page">
      <Navigation />

      <section className="py-16 md:py-24">
        <div className="ddls-container max-w-4xl">
          <div className="text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">{t("about.kicker")}</div>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-[#2C3E42]">
            {t("about.title_1")} <span className="italic text-[#5A8896]">{t("about.title_em")}</span>
            <br /> {t("about.title_2")}
          </h1>
          <p className="mt-8 text-lg md:text-xl leading-relaxed text-[#5C757B]">
            {t("about.lead")}
          </p>
        </div>

        {/* Image strip — Indian community context */}
        <div className="ddls-container mt-12 grid md:grid-cols-3 gap-4 max-w-5xl">
          <img src={IMAGES.village_school} alt="Village classroom" className="w-full h-48 md:h-64 object-cover rounded-2xl" />
          <img src={IMAGES.mother_child} alt="Mother and child" className="w-full h-48 md:h-64 object-cover rounded-2xl" />
          <img src={IMAGES.diya_lights} alt="Lights of hope" className="w-full h-48 md:h-64 object-cover rounded-2xl" />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#F2EFE9]/40 border-y border-[#EBE7E0]">
        <div className="ddls-container max-w-5xl grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <img
              src={IMAGES.kids_smile}
              alt={t("mission.alt_serving")}
              className="w-full rounded-[2rem] object-cover aspect-[4/5] shadow-lg"
            />
          </div>
          <div className="lg:col-span-7">
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight text-[#2C3E42] leading-tight">
              {t("about.stand_title_1")} <span className="italic text-[#5A8896]">{t("about.stand_title_em")}</span>
            </h2>
            <p className="mt-6 text-lg text-[#5C757B] leading-relaxed">
              {t("about.stand_p1")}
            </p>
            <p className="mt-5 text-lg text-[#5C757B] leading-relaxed">
              {t("about.stand_p2")}
            </p>

            <div className="mt-8 space-y-4">
              {values.map((v) => {
                const I = v.icon;
                return (
                  <div key={v.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#EBE7E0] flex items-center justify-center text-[#5A8896] flex-shrink-0">
                      <I size={18} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="font-medium text-[#2C3E42]">{v.title}</div>
                      <div className="text-[#5C757B] text-sm">{t(v.k)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="ddls-container max-w-3xl text-center">
          <Heart size={28} className="mx-auto text-[#D99F80]" fill="#D99F80" />
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl tracking-tight text-[#2C3E42] leading-tight">
            {t("about.seed_title_1")}
            <br /> <span className="italic text-[#5A8896]">{t("about.seed_title_em")}</span>
          </h2>
          <p className="mt-6 text-lg text-[#5C757B] leading-relaxed">
            {t("about.seed_text")}
          </p>
          <Link
            to="/#donate"
            data-testid="about-cta-btn"
            className="mt-10 inline-flex items-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Heart size={18} /> {t("about.walk_with_us")}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
