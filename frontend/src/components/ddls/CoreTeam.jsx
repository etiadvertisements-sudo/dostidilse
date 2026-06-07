import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

function TeamCard({ m }) {
  return (
    <div
      data-testid={`team-card-${m.id}`}
      className="group relative min-w-[280px] md:min-w-[320px] h-[420px] rounded-[1.75rem] overflow-hidden border border-[#EBE7E0] flex-shrink-0 shadow-sm hover:shadow-xl transition-all duration-500"
    >
      {/* Photo */}
      <div className="absolute inset-0 bg-[#F2EFE9]">
        {m.photo_base64 ? (
          <img
            src={m.photo_base64}
            alt={m.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users size={40} className="text-[#D99F80]/40" strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Bottom gradient + name (always visible) */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#2C3E42]/90 via-[#2C3E42]/60 to-transparent transition-opacity duration-500 group-hover:opacity-0">
        <div className="text-xs tracking-[0.22em] uppercase text-[#D99F80]">{m.role}</div>
        <div className="font-serif text-2xl text-white mt-1">{m.name}</div>
      </div>

      {/* Hover overlay with bio */}
      <div className="absolute inset-0 bg-[#2C3E42]/92 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
        <div className="text-xs tracking-[0.22em] uppercase text-[#D99F80]">{m.role}</div>
        <div className="font-serif text-3xl text-white mt-2 leading-tight">{m.name}</div>
        <div className="h-px w-12 bg-[#D99F80] my-4" />
        <p className="text-sm text-white/80 leading-relaxed line-clamp-[10]">{m.bio}</p>
      </div>
    </div>
  );
}

export default function CoreTeam() {
  const [team, setTeam] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API}/team`)
      .then((r) => mounted && setTeam(r.data || []))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  if (team.length === 0) return null;

  return (
    <section
      id="team"
      data-testid="core-team-section"
      className="py-20 md:py-32 bg-[#FDFBF7]"
    >
      <div className="ddls-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">
              The Heart Behind
            </div>
            <h2
              data-testid="team-title"
              className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#2C3E42] leading-[1.05]"
            >
              Ordinary people,
              <br />
              <span className="italic text-[#5A8896]">extraordinary intent.</span>
            </h2>
            <p className="mt-6 text-lg text-[#5C757B] leading-relaxed">
              The hands and hearts who show up every day so a child somewhere can keep going. Hover
              to know them a little better.
            </p>
          </div>

          {team.length > 3 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scroll(-1)}
                data-testid="team-scroll-left"
                className="w-11 h-11 rounded-full border border-[#EBE7E0] bg-white hover:border-[#5A8896] hover:text-[#5A8896] text-[#5C757B] transition flex items-center justify-center"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                data-testid="team-scroll-right"
                className="w-11 h-11 rounded-full border border-[#EBE7E0] bg-white hover:border-[#5A8896] hover:text-[#5A8896] text-[#5C757B] transition flex items-center justify-center"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        data-testid="team-carousel"
        className="overflow-x-auto no-scrollbar pb-6 scroll-smooth"
      >
        <div className="flex gap-6 px-6 md:px-12 lg:px-20" style={{ width: "max-content" }}>
          {team.map((m) => (
            <TeamCard key={m.id} m={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
