import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Navigation from "@/components/ddls/Navigation";
import Footer from "@/components/ddls/Footer";
import { API, CONTACT_EMAIL, IMAGES } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { Mail, Send, Loader2, Heart } from "lucide-react";

export default function ContactPage() {
  const { t } = useT();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Thank you — we've received your message with gratitude.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Could not send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E42] font-sans" data-testid="contact-page">
      <Navigation />

      <section className="py-16 md:py-24">
        <div className="ddls-container grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <div className="text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">{t("contact.kicker")}</div>
            <h1 className="mt-4 font-serif text-5xl sm:text-6xl tracking-tight text-[#2C3E42] leading-[1.05]">
              {t("contact.title_1")}
              <br />
              <span className="italic text-[#5A8896]">{t("contact.title_em")}</span>
            </h1>
            <p className="mt-6 text-[#5C757B] leading-relaxed text-lg">
              {t("contact.lead")}
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              data-testid="contact-email-link"
              className="mt-10 inline-flex items-center gap-3 group"
            >
              <span className="w-12 h-12 rounded-full bg-white border border-[#EBE7E0] flex items-center justify-center group-hover:border-[#5A8896] transition-colors">
                <Mail size={18} className="text-[#5A8896]" />
              </span>
              <div>
                <div className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">{t("contact.email_us")}</div>
                <div className="font-serif text-xl text-[#2C3E42] group-hover:text-[#5A8896] transition">
                  {CONTACT_EMAIL}
                </div>
              </div>
            </a>

            <div className="mt-10 bg-[#F2EFE9]/60 border border-[#EBE7E0] rounded-[1.5rem] p-6">
              <Heart className="text-[#D99F80]" size={18} fill="#D99F80" />
              <p className="mt-3 font-serif italic text-lg text-[#2C3E42] leading-relaxed">
                {t("contact.quote")}
              </p>
            </div>

            <img
              src={IMAGES.mother_child}
              alt="Family"
              className="mt-10 w-full rounded-[1.5rem] object-cover aspect-[5/3]"
            />
          </div>

          <form
            onSubmit={submit}
            className="lg:col-span-7 bg-white rounded-[2rem] border border-[#EBE7E0] p-6 md:p-10 shadow-sm h-fit"
            data-testid="contact-form"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">{t("contact.your_name")}</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  data-testid="contact-name-input"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7]"
                  placeholder={t("contact.name_placeholder")}
                />
              </div>
              <div>
                <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">{t("contact.email")}</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  data-testid="contact-email-input"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">{t("contact.your_message")}</label>
              <textarea
                required
                rows={7}
                value={form.message}
                data-testid="contact-message-input"
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-2 w-full border border-[#EBE7E0] rounded-3xl px-5 py-4 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7] resize-none"
                placeholder={t("contact.message_placeholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="contact-submit-btn"
              className="mt-6 inline-flex items-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] disabled:opacity-70 px-8 py-3.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md font-medium"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> {t("contact.sending")}</>
              ) : (
                <><Send size={16} /> {t("contact.send")}</>
              )}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
