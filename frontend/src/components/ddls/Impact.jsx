import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/lib/constants";
import { Users, Sprout, Heart, Wallet } from "lucide-react";

function StatCard({ icon: Icon, value, label, suffix, testId }) {
  return (
    <div
      data-testid={testId}
      className="bg-white rounded-2xl p-8 border border-[#EBE7E0] hover:shadow-md transition-shadow"
    >
      <Icon size={20} className="text-[#5A8896]" strokeWidth={1.75} />
      <div className="mt-6 font-serif text-4xl md:text-5xl text-[#2C3E42] tracking-tight">
        {value}
        {suffix && <span className="text-[#D99F80]">{suffix}</span>}
      </div>
      <div className="mt-2 text-xs tracking-[0.22em] uppercase text-[#5C757B]">{label}</div>
    </div>
  );
}

export default function Impact() {
  const [stats, setStats] = useState({
    total_raised: 0,
    donors_count: 0,
    students_helped: 0,
    projects_completed: 0,
  });

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API}/donations/stats`)
      .then((r) => mounted && setStats(r.data))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

  return (
    <section id="impact" data-testid="impact-section" className="py-20 md:py-32">
      <div className="ddls-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">
              Transparency
            </div>
            <h2
              id="transparency"
              data-testid="impact-title"
              className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight text-[#2C3E42] leading-tight"
            >
              We&rsquo;re starting today.
              <br />
              <span className="italic text-[#5A8896]">Every number begins at zero.</span>
            </h2>
          </div>
          <p className="max-w-md text-[#5C757B] leading-relaxed">
            We&rsquo;re building this from scratch — with honesty as our first currency.
            These numbers update live, so you&rsquo;ll always see where we stand.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            testId="stat-students"
            icon={Users}
            value={stats.students_helped}
            label="Students Supported"
          />
          <StatCard
            testId="stat-raised"
            icon={Wallet}
            value={`₹${formatINR(stats.total_raised)}`}
            label="Contributions Received"
          />
          <StatCard
            testId="stat-donors"
            icon={Heart}
            value={stats.donors_count}
            label="Kind Hearts"
          />
          <StatCard
            testId="stat-projects"
            icon={Sprout}
            value={stats.projects_completed}
            label="Projects Completed"
          />
        </div>

        <div className="mt-12 bg-[#F2EFE9]/60 border border-[#EBE7E0] rounded-[1.75rem] p-8 md:p-10">
          <h3 className="font-serif text-2xl text-[#2C3E42]">Our transparency promise</h3>
          <p className="mt-3 text-[#5C757B] leading-relaxed max-w-3xl">
            100% of every contribution will go directly to the cause. We&rsquo;ll publish
            where your kindness went — which community, which school, which tree — so you can
            follow it from the moment it leaves your hands to the moment it reaches a child&rsquo;s.
          </p>
        </div>
      </div>
    </section>
  );
}
