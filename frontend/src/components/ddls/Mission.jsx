import { BookOpen, Leaf, HandHeart, Sparkles } from "lucide-react";
import { IMAGES } from "@/lib/constants";

const pillars = [
  {
    icon: BookOpen,
    title: "Education",
    description:
      "We show up where learning is hardest — the quiet support a child needs to dream further.",
    accent: "#5A8896",
  },
  {
    icon: Leaf,
    title: "Nature Projects",
    description:
      "Tree plantations, clean-up drives, green classrooms — because caring for children means caring for their world.",
    accent: "#7BA07A",
  },
  {
    icon: HandHeart,
    title: "Help for Anyone in Need",
    description:
      "Whenever we can, wherever we can — without asking who, why, or how much.",
    accent: "#D99F80",
  },
];

export default function Mission() {
  return (
    <section
      id="mission"
      data-testid="mission-section"
      className="py-20 md:py-32 bg-[#F2EFE9]/40 border-y border-[#EBE7E0]"
    >
      <div className="ddls-container">
        <div className="max-w-3xl">
          <div className="text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium flex items-center gap-2">
            <Sparkles size={14} /> What We Do
          </div>
          <h2
            data-testid="mission-title"
            className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight text-[#2C3E42] leading-tight"
          >
            Small gestures,
            <br />
            <span className="italic text-[#5A8896]">big belonging.</span>
          </h2>
          <p className="mt-6 text-lg text-[#5C757B] leading-relaxed">
            Three causes, one promise — to show up with warmth and walk away
            only when the need is met.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                data-testid={`mission-card-${idx}`}
                className="group bg-white rounded-[1.75rem] p-8 border border-[#EBE7E0] hover:shadow-lg hover:-translate-y-1 transition-all duration-500"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${p.accent}15`, color: p.accent }}
                >
                  <Icon size={26} strokeWidth={1.75} />
                </div>
                <h3 className="font-serif text-2xl text-[#2C3E42] leading-snug">
                  {p.title}
                </h3>
                <p className="mt-4 text-[#5C757B] leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Wide visual strip */}
        <div className="mt-16 grid md:grid-cols-3 gap-4">
          <img
            src={IMAGES.kids_studying}
            alt="Children learning"
            className="w-full h-56 md:h-72 object-cover rounded-2xl hover:scale-[1.02] transition-transform duration-700"
          />
          <img
            src={IMAGES.nature_planting}
            alt="Planting for the future"
            className="w-full h-56 md:h-72 object-cover rounded-2xl hover:scale-[1.02] transition-transform duration-700"
          />
          <img
            src={IMAGES.kids_looking}
            alt="Children we serve"
            className="w-full h-56 md:h-72 object-cover rounded-2xl hover:scale-[1.02] transition-transform duration-700"
          />
        </div>
      </div>
    </section>
  );
}
