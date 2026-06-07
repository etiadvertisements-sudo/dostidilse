import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/lib/constants";
import { useT } from "@/lib/i18n";
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
  const { t } = useT();
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
              {t("impact.kicker")}
            </div>
            <h2
              id="transparency"
              data-testid="impact-title"
              className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight text-[#2C3E42] leading-tight"
            >
              {t("impact.title_1")}
              <br />
              <span className="italic text-[#5A8896]">{t("impact.title_em")}</span>
            </h2>
          </div>
          <p className="max-w-md text-[#5C757B] leading-relaxed">{t("impact.lead")}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard testId="stat-students" icon={Users} value={stats.students_helped} label={t("impact.stat_students")} />
          <StatCard testId="stat-raised" icon={Wallet} value={`₹${formatINR(stats.total_raised)}`} label={t("impact.stat_raised")} />
          <StatCard testId="stat-donors" icon={Heart} value={stats.donors_count} label={t("impact.stat_hearts")} />
          <StatCard testId="stat-projects" icon={Sprout} value={stats.projects_completed} label={t("impact.stat_projects")} />
        </div>

        <div className="mt-12 bg-[#F2EFE9]/60 border border-[#EBE7E0] rounded-[1.75rem] p-8 md:p-10">
          <h3 className="font-serif text-2xl text-[#2C3E42]">{t("impact.promise_title")}</h3>
          <p className="mt-3 text-[#5C757B] leading-relaxed max-w-3xl">{t("impact.promise_text")}</p>
        </div>
      </div>
    </section>
  );
}
