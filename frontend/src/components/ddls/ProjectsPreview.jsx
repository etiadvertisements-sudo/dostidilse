import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/lib/constants";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";

function ProjectCard({ p }) {
  return (
    <div
      data-testid={`project-card-${p.id}`}
      className="min-w-[320px] md:min-w-[380px] bg-white rounded-[1.75rem] border border-[#EBE7E0] overflow-hidden hover:shadow-lg transition-shadow duration-500 flex-shrink-0"
    >
      <div className="aspect-[5/3] bg-[#F2EFE9] overflow-hidden">
        {p.image_base64 ? (
          <img src={p.image_base64} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#EBE7E0]">
            <span className="font-serif text-4xl text-[#D99F80]/40">Dosti Dil Se</span>
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
            {p.status}
          </span>
          <span className="text-[#5C757B] flex items-center gap-1">
            <Calendar size={12} /> {p.date}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-2xl text-[#2C3E42] leading-snug">{p.title}</h3>
        <p className="mt-2 text-sm text-[#5C757B] line-clamp-3 leading-relaxed">{p.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-[#5C757B]">
          {p.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {p.location}
            </span>
          )}
          {p.children_helped !== null && p.children_helped !== undefined && (
            <span className="flex items-center gap-1">
              <Users size={12} /> {p.children_helped} children
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPreview() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API}/projects`)
      .then((r) => mounted && setProjects(r.data || []))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      id="projects-preview"
      data-testid="projects-preview-section"
      className="py-20 md:py-28 bg-[#FDFBF7]"
    >
      <div className="ddls-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">
              Our Work
            </div>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight text-[#2C3E42] leading-tight">
              Stories we&rsquo;re
              <br />
              <span className="italic text-[#5A8896]">writing together.</span>
            </h2>
          </div>
          <Link
            to="/projects"
            data-testid="view-all-projects-link"
            className="inline-flex items-center gap-2 text-[#5A8896] hover:text-[#46707C] transition font-medium"
          >
            View all projects <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="ddls-container">
          <div className="bg-white border border-[#EBE7E0] rounded-[1.75rem] p-10 text-center max-w-2xl mx-auto">
            <p className="font-serif italic text-xl text-[#5C757B] leading-relaxed">
              Our first stories are being quietly written.
              <br />
              Come back soon — or help us start one.
            </p>
            <a
              href="#donate"
              data-testid="projects-empty-cta"
              className="mt-6 inline-flex items-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] px-6 py-3 rounded-full font-medium text-sm transition"
            >
              Start a story
            </a>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar pb-6">
          <div className="flex gap-6 px-6 md:px-12 lg:px-20" style={{ width: "max-content" }}>
            {projects.map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
