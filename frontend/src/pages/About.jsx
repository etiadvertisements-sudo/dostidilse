import Navigation from "@/components/ddls/Navigation";
import Footer from "@/components/ddls/Footer";
import { IMAGES } from "@/lib/constants";
import { Heart, Sprout, BookOpen, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E42] font-sans" data-testid="about-page">
      <Navigation />

      <section className="py-16 md:py-24">
        <div className="ddls-container max-w-4xl">
          <div className="text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">About</div>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-[#2C3E42]">
            Born from <span className="italic text-[#5A8896]">kitchens,</span>
            <br /> not boardrooms.
          </h1>
          <p className="mt-8 text-lg md:text-xl leading-relaxed text-[#5C757B]">
            Dosti Dil Se was not planned on a whiteboard. It began at dinner tables where
            stories of long walks to school and quiet hunger were passed down like heirlooms —
            followed by the quiet resolve of elders who&rsquo;d say,{" "}
            <span className="italic text-[#2C3E42]">&ldquo;Do something, beta. Even small is enough.&rdquo;</span>
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#F2EFE9]/40 border-y border-[#EBE7E0]">
        <div className="ddls-container max-w-5xl grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <img
              src={IMAGES.kids_smile}
              alt="Children we stand with"
              className="w-full rounded-[2rem] object-cover aspect-[4/5] shadow-lg"
            />
          </div>
          <div className="lg:col-span-7">
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight text-[#2C3E42] leading-tight">
              What we <span className="italic text-[#5A8896]">stand for.</span>
            </h2>
            <p className="mt-6 text-lg text-[#5C757B] leading-relaxed">
              We believe showing up is the quiet revolution. A child standing a little taller. A
              mother&rsquo;s anxious shoulders softening. A classroom that feels seen. Dignity,
              belonging, a sense of being held — these are the things we try to leave behind.
            </p>
            <p className="mt-5 text-lg text-[#5C757B] leading-relaxed">
              Dosti Dil Se — friendship from the heart — is how we&rsquo;d like you to know us.
              Not as a charity. As a friend who shows up.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: BookOpen, t: "Education", d: "Showing up where learning is hardest." },
                { icon: Sprout, t: "Nature projects", d: "Tree drives, clean-ups, green classrooms." },
                { icon: HandHeart, t: "Help in any form", d: "Whenever we can, wherever we can — no questions asked." },
              ].map((v) => {
                const I = v.icon;
                return (
                  <div key={v.t} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#EBE7E0] flex items-center justify-center text-[#5A8896] flex-shrink-0">
                      <I size={18} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="font-medium text-[#2C3E42]">{v.t}</div>
                      <div className="text-[#5C757B] text-sm">{v.d}</div>
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
            The seed of kindness
            <br /> <span className="italic text-[#5A8896]">was planted at home.</span>
          </h2>
          <p className="mt-6 text-lg text-[#5C757B] leading-relaxed">
            This work is not in our hands alone. It is in yours too. Every rupee, every hour,
            every kind word you send our way becomes part of a child&rsquo;s story. We will carry
            them with gratitude — and publish every step transparently.
          </p>
          <Link
            to="/#donate"
            data-testid="about-cta-btn"
            className="mt-10 inline-flex items-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Heart size={18} /> Walk with us
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
