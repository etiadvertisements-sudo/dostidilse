import { useEffect, useState } from "react";
import axios from "axios";
import { API, IMAGES } from "@/lib/constants";
import { Heart, Gift } from "lucide-react";

// 30 points arranged on a heart curve, normalised to a 100x100 grid.
// Computed from parametric heart equation — tuned visually.
const HEART_POINTS = [
  // Outer outline (top & sides)
  { x: 50, y: 14, r: 14 },
  { x: 30, y: 10, r: 13 }, { x: 70, y: 10, r: 13 },
  { x: 16, y: 20, r: 13 }, { x: 84, y: 20, r: 13 },
  { x: 8, y: 34, r: 12 }, { x: 92, y: 34, r: 12 },
  { x: 11, y: 48, r: 12 }, { x: 89, y: 48, r: 12 },
  { x: 20, y: 62, r: 11 }, { x: 80, y: 62, r: 11 },
  { x: 32, y: 74, r: 11 }, { x: 68, y: 74, r: 11 },
  { x: 44, y: 84, r: 10 }, { x: 56, y: 84, r: 10 },
  { x: 50, y: 92, r: 10 },
  // Inner fill
  { x: 28, y: 28, r: 11 }, { x: 72, y: 28, r: 11 },
  { x: 42, y: 24, r: 10 }, { x: 58, y: 24, r: 10 },
  { x: 24, y: 44, r: 11 }, { x: 76, y: 44, r: 11 },
  { x: 38, y: 42, r: 10 }, { x: 62, y: 42, r: 10 },
  { x: 50, y: 40, r: 10 },
  { x: 34, y: 58, r: 11 }, { x: 66, y: 58, r: 11 },
  { x: 50, y: 58, r: 11 },
  { x: 46, y: 72, r: 10 }, { x: 54, y: 72, r: 10 },
];

const FALLBACK_AVATARS = [IMAGES.hero_kids, IMAGES.kids_looking, IMAGES.kids_smile, IMAGES.nature_planting];

export default function WallOfHearts() {
  const [donors, setDonors] = useState([]);
  const [rotationIdx, setRotationIdx] = useState(0);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API}/donations/wall`)
      .then((r) => mounted && setDonors(r.data || []))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Gently rotate displayed donors if more than HEART_POINTS.length
  useEffect(() => {
    if (donors.length <= HEART_POINTS.length) return;
    const t = setInterval(() => setRotationIdx((i) => (i + 1) % donors.length), 3200);
    return () => clearInterval(t);
  }, [donors.length]);

  const getSlot = (slotIdx) => {
    if (donors.length === 0) return null;
    const idx = (slotIdx + rotationIdx) % donors.length;
    return donors[idx] || null;
  };

  const isEmpty = donors.length === 0;

  return (
    <section
      id="wall"
      data-testid="wall-of-hearts-section"
      className="py-20 md:py-32 bg-gradient-to-b from-[#FDFBF7] to-[#F2EFE9]/40"
    >
      <div className="ddls-container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">
            <Heart size={14} fill="#D99F80" /> Wall of Hearts
          </div>
          <h2
            data-testid="wall-title"
            className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#2C3E42] leading-[1.05]"
          >
            The faces behind
            <br />
            <span className="italic text-[#5A8896]">every smile we create.</span>
          </h2>
          <p className="mt-6 text-lg text-[#5C757B] leading-relaxed">
            Each photo here is a heart that chose to help. Every time someone new gives,
            this heart grows fuller — just like ours.
          </p>
        </div>

        <div className="mt-16 relative mx-auto" style={{ maxWidth: 640 }}>
          {/* Heart shape container */}
          <div className="relative w-full aspect-square">
            {/* Background soft heart */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="heartBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D99F80" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#5A8896" stopOpacity="0.12" />
                </linearGradient>
              </defs>
              <path
                d="M50,90 C20,70 5,50 5,30 C5,15 18,6 30,6 C40,6 47,12 50,20 C53,12 60,6 70,6 C82,6 95,15 95,30 C95,50 80,70 50,90 Z"
                fill="url(#heartBg)"
                stroke="#EBE7E0"
                strokeWidth="0.5"
              />
            </svg>

            {HEART_POINTS.map((p, i) => {
              const donor = getSlot(i);
              const photo =
                donor?.photo_base64 ||
                FALLBACK_AVATARS[i % FALLBACK_AVATARS.length];
              const isPlaceholder = !donor;
              const isGift = !!donor?.gift_to;
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.r * 1.5}%`,
                    height: `${p.r * 1.5}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseEnter={() => donor && setHovered({ ...donor, idx: i })}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    data-testid={`heart-slot-${i}`}
                    className={`relative w-full h-full rounded-full overflow-hidden border-2 transition-all duration-500 ${
                      isPlaceholder
                        ? "border-[#EBE7E0] opacity-40"
                        : isGift
                          ? "border-[#D99F80] shadow-md hover:scale-110 cursor-pointer"
                          : "border-white shadow-md hover:scale-110 cursor-pointer"
                    }`}
                    style={{
                      animation: `fade-in-slot 0.8s ease-out ${i * 0.03}s both`,
                    }}
                  >
                    <img
                      src={photo}
                      alt={donor?.name || "future kind heart"}
                      className="w-full h-full object-cover"
                    />
                    {isPlaceholder && (
                      <div className="absolute inset-0 bg-[#FDFBF7]/70 flex items-center justify-center">
                        <Heart size={12} className="text-[#D99F80]/60" />
                      </div>
                    )}
                    {isGift && !isPlaceholder && (
                      <div
                        data-testid={`heart-gift-badge-${i}`}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#D99F80] text-white flex items-center justify-center shadow-md ring-2 ring-white"
                        title={`In ${donor.gift_to}'s name`}
                      >
                        <Gift size={11} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Hover card */}
            {hovered && (
              <div
                data-testid="donor-hover-card"
                className="absolute left-1/2 -translate-x-1/2 -bottom-24 bg-white rounded-2xl shadow-lg border border-[#EBE7E0] px-5 py-3 z-20 min-w-[260px] text-center"
              >
                <div className="font-serif text-lg text-[#2C3E42]">{hovered.name}</div>
                <div className="text-sm text-[#5A8896] font-medium">
                  ₹{new Intl.NumberFormat("en-IN").format(hovered.amount)} contributed
                </div>
                {hovered.gift_to && (
                  <div
                    data-testid="hover-gift-line"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D99F80]/12 text-[#D99F80] text-xs"
                  >
                    <Gift size={11} strokeWidth={2.5} />
                    <span className="font-medium">
                      In {hovered.gift_to}&rsquo;s name
                      {hovered.gift_occasion ? ` · ${hovered.gift_occasion}` : ""}
                    </span>
                  </div>
                )}
                {hovered.message && (
                  <div className="text-xs italic text-[#5C757B] mt-2">&ldquo;{hovered.message}&rdquo;</div>
                )}
              </div>
            )}
          </div>

          {isEmpty && (
            <div
              data-testid="wall-empty"
              className="text-center mt-10 max-w-md mx-auto"
            >
              <p className="font-serif italic text-lg text-[#5C757B]">
                The first heart on this wall could be yours.
              </p>
              <a
                href="#donate"
                data-testid="wall-cta-btn"
                className="mt-5 inline-flex items-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] px-6 py-3 rounded-full transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
              >
                <Heart size={14} /> Be the first
              </a>
            </div>
          )}

          {!isEmpty && donors.length > HEART_POINTS.length && (
            <p className="text-center mt-12 text-sm text-[#5C757B]">
              {donors.length} hearts are rotating above — each one a story.
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in-slot {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </section>
  );
}
