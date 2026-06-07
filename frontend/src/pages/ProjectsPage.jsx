import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "@/components/ddls/Navigation";
import Footer from "@/components/ddls/Footer";
import { API, IMAGES } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { Calendar, MapPin, Users, Heart } from "lucide-react";

export default function ProjectsPage() {
  const { t } = useT();
  const FILTERS = [
    { key: "all", label: t("projects.filter_all") },
    { key: "completed", label: t("projects.filter_completed") },
    { key: "upcoming", label: t("projects.filter_upcoming") },
  ];
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get(`${API}/projects${filter === "all" ? "" : `?status=${filter}`}`)
      .then((r) => mounted && setProjects(r.data || []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E42] font-sans" data-testid="projects-page">
      <Navigation />

      <section className="py-16 md:py-24">
        <div className="ddls-container">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 max-w-3xl">
              <div className="text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">{t("projects.kicker")}</div>
              <h1 className="mt-4 font-serif text-5xl sm:text-6xl tracking-tight text-[#2C3E42] leading-[1.05]">
                {t("projects.page_title_1")} <span className="italic text-[#5A8896]">{t("projects.page_title_em")}</span>
              </h1>
              <p className="mt-6 text-lg text-[#5C757B] leading-relaxed">
                {t("projects.page_lead")}
              </p>
            </div>
            <div className="lg:col-span-5">
              <img
                src={IMAGES.village_school}
                alt="On the ground"
                className="w-full rounded-[2rem] object-cover aspect-[5/4]"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-10 flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                data-testid={`filter-${f.key}`}
                onClick={() => setFilter(f.key)}
                className={`px-5 py-2 rounded-full text-sm transition-all ${
                  filter === f.key
                    ? "bg-[#5A8896] text-white shadow-sm"
                    : "bg-white border border-[#EBE7E0] text-[#5C757B] hover:border-[#5A8896]/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="text-center text-[#5C757B] py-16">{t("projects.loading")}</div>
            ) : projects.length === 0 ? (
              <div className="bg-white border border-[#EBE7E0] rounded-[1.75rem] p-12 text-center max-w-2xl mx-auto">
                <Heart size={22} className="mx-auto text-[#D99F80]" />
                <p className="mt-4 font-serif italic text-xl text-[#5C757B] leading-relaxed">
                  {t("projects.empty_none")}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((p) => (
                  <article
                    key={p.id}
                    data-testid={`project-${p.id}`}
                    className="bg-white rounded-[1.75rem] border border-[#EBE7E0] overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[5/3] bg-[#F2EFE9] overflow-hidden">
                      {p.image_base64 ? (
                        <img src={p.image_base64} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-serif text-3xl text-[#D99F80]/40">Dosti Dil Se</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase">
                        <span
                          className={`px-2.5 py-1 rounded-full ${
                            p.status === "completed"
                              ? "bg-[#5A8896]/10 text-[#5A8896]"
                              : "bg-[#D99F80]/15 text-[#D99F80]"
                          }`}
                        >
                          {p.status === "completed" ? t("projects.status_completed") : t("projects.status_upcoming")}
                        </span>
                        <span className="text-[#5C757B] flex items-center gap-1">
                          <Calendar size={12} /> {p.date}
                        </span>
                      </div>
                      <h3 className="mt-3 font-serif text-2xl text-[#2C3E42] leading-snug">{p.title}</h3>
                      <p className="mt-2 text-sm text-[#5C757B] leading-relaxed">{p.description}</p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-[#5C757B]">
                        {p.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {p.location}
                          </span>
                        )}
                        {p.children_helped !== null && p.children_helped !== undefined && (
                          <span className="flex items-center gap-1">
                            <Users size={12} /> {p.children_helped} {t("projects.children")}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
