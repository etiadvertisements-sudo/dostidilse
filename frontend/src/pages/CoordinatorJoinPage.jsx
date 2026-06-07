import { useState } from "react";
import { toast } from "sonner";
import { apiClient, fileToBase64 } from "@/lib/api";
import Navigation from "@/components/ddls/Navigation";
import Footer from "@/components/ddls/Footer";
import { Loader2, Heart, MapPin, Clock, Camera, CheckCircle2, Sparkles } from "lucide-react";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  role_preference: "city",
  occupation: "",
  age: "",
  profile_url: "",
  why_join: "",
  impact_goal: "",
  monthly_hours: "",
  past_experience: "",
  referral_source: "",
  photo_base64: "",
};

export default function CoordinatorJoinPage() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_200_000) {
      toast.error("Photo must be under 1.2 MB");
      return;
    }
    const dataUrl = await fileToBase64(file);
    set("photo_base64", dataUrl);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.why_join.trim().length < 20) {
      toast.error("Tell us a little more in 'why you want to join' (at least 20 characters).");
      return;
    }
    if (form.impact_goal.trim().length < 20) {
      toast.error("Tell us a little more about the impact you want to make (at least 20 characters).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        age: form.age === "" ? null : Number(form.age),
        monthly_hours: Number(form.monthly_hours),
        occupation: form.occupation || null,
        profile_url: form.profile_url || null,
        past_experience: form.past_experience || null,
        referral_source: form.referral_source || null,
        photo_base64: form.photo_base64 || null,
      };
      await apiClient.post("/coordinators/apply", payload);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not submit your application. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E42] font-sans" data-testid="coordinator-success-page">
        <Navigation />
        <main className="ddls-container py-20">
          <div className="max-w-2xl mx-auto bg-white border border-[#EBE7E0] rounded-[2rem] p-12 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#5A8896]/10 text-[#5A8896] mb-6">
              <CheckCircle2 size={32} />
            </div>
            <div className="text-xs tracking-[0.22em] uppercase text-[#D99F80] mb-3">Application received</div>
            <h1 className="font-serif text-4xl text-[#2C3E42] leading-tight">
              Thank you, <span className="italic text-[#5A8896]">{form.name.split(" ")[0]}</span>.
            </h1>
            <p className="mt-5 text-[#5C757B] leading-relaxed">
              We&rsquo;ve received your application and sent a quiet confirmation to <strong className="text-[#2C3E42]">{form.email}</strong>. Our team reads every word. We&rsquo;ll be in touch within 5&ndash;7 days.
            </p>
            <p className="mt-4 font-serif italic text-[#2C3E42]">
              &ldquo;Showing up is the first half of changing something.&rdquo;
            </p>
            <a href="/" data-testid="coordinator-back-home" className="inline-block mt-8 bg-[#5A8896] text-white hover:bg-[#46707C] px-8 py-3 rounded-full font-medium transition">Back to home</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E42] font-sans" data-testid="coordinator-join-page">
      <Navigation />

      {/* Hero */}
      <section className="ddls-container pt-12 pb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white border border-[#EBE7E0] rounded-full px-4 py-1.5 text-xs tracking-[0.22em] uppercase text-[#5C757B]">
            <Sparkles size={12} className="text-[#D99F80]" /> Join as Coordinator
          </div>
          <h1 className="mt-6 font-serif text-5xl md:text-6xl leading-[1.05] text-[#2C3E42]">
            Lead our work in <span className="italic text-[#5A8896]">your city.</span>
          </h1>
          <p className="mt-6 text-lg text-[#5C757B] leading-relaxed max-w-2xl">
            Coordinators are the heart of Dosti Dil Se on the ground &mdash; the people who show up at schools, sit with parents, and turn intent into action. If you&rsquo;ve felt the pull to do more than donate, this is your invitation.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-2xl">
            {[
              { icon: MapPin, title: "Hyper-local", text: "Lead in your own city or state" },
              { icon: Clock, title: "Flexible", text: "As little as a few hours / month" },
              { icon: Heart, title: "Meaningful", text: "Direct impact on children" },
            ].map((b) => (
              <div key={b.title} className="bg-white border border-[#EBE7E0] rounded-2xl p-5">
                <b.icon size={18} className="text-[#5A8896]" />
                <div className="mt-3 font-medium text-[#2C3E42]">{b.title}</div>
                <div className="text-xs text-[#5C757B] mt-1">{b.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="ddls-container pb-24">
        <form
          onSubmit={submit}
          data-testid="coordinator-form"
          className="bg-white border border-[#EBE7E0] rounded-[2rem] p-8 md:p-12 max-w-4xl"
        >
          <FormSection title="About you" subtitle="Tell us who you are.">
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Full name" required>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="coord-name"
                  className="input" placeholder="Your full name" />
              </Field>
              <Field label="Email" required>
                <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="coord-email"
                  className="input" placeholder="you@example.com" />
              </Field>
              <Field label="Phone" required>
                <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="coord-phone"
                  className="input" placeholder="+91 98xxxxxx" />
              </Field>
              <Field label="Occupation">
                <input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} data-testid="coord-occupation"
                  className="input" placeholder="Student, Engineer, Teacher…" />
              </Field>
              <Field label="Age">
                <input type="number" min="16" max="100" value={form.age} onChange={(e) => set("age", e.target.value)} data-testid="coord-age"
                  className="input" placeholder="Optional" />
              </Field>
              <Field label="LinkedIn / profile link">
                <input value={form.profile_url} onChange={(e) => set("profile_url", e.target.value)} data-testid="coord-profile-url"
                  className="input" placeholder="https://…" />
              </Field>
            </div>

            {/* Photo */}
            <div className="mt-6">
              <Label>Profile photo (optional)</Label>
              <div className="mt-2 flex items-center gap-4">
                {form.photo_base64 ? (
                  <img src={form.photo_base64} alt="Preview" className="h-20 w-20 rounded-full object-cover border border-[#EBE7E0]" />
                ) : (
                  <div className="h-20 w-20 rounded-full border-2 border-dashed border-[#EBE7E0] flex items-center justify-center text-[#5C757B]">
                    <Camera size={20} />
                  </div>
                )}
                <label className="bg-transparent border border-[#5A8896]/60 text-[#5A8896] hover:bg-[#5A8896] hover:text-white px-5 py-2.5 rounded-full transition text-sm font-medium cursor-pointer">
                  {form.photo_base64 ? "Change" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={onPhoto} data-testid="coord-photo-input" />
                </label>
                {form.photo_base64 && (
                  <button type="button" onClick={() => set("photo_base64", "")} className="text-sm text-[#5C757B] hover:text-[#2C3E42]">Remove</button>
                )}
              </div>
              <p className="mt-2 text-xs text-[#5C757B]">JPG/PNG · up to 1.2 MB</p>
            </div>
          </FormSection>

          <FormSection title="Where you&rsquo;d like to coordinate" subtitle="Pick the scope you can hold space for.">
            <div className="grid md:grid-cols-3 gap-5">
              <Field label="City" required>
                <input required value={form.city} onChange={(e) => set("city", e.target.value)} data-testid="coord-city"
                  className="input" placeholder="e.g. Pune" />
              </Field>
              <Field label="State" required>
                <input required value={form.state} onChange={(e) => set("state", e.target.value)} data-testid="coord-state"
                  className="input" placeholder="e.g. Maharashtra" />
              </Field>
              <Field label="Role preference" required>
                <select value={form.role_preference} onChange={(e) => set("role_preference", e.target.value)} data-testid="coord-role"
                  className="input">
                  <option value="city">City Coordinator</option>
                  <option value="state">State Coordinator</option>
                </select>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Your story" subtitle="The part that matters most. Take your time.">
            <Field label="Why do you want to join Dosti Dil Se?" required>
              <textarea required rows={4} value={form.why_join} onChange={(e) => set("why_join", e.target.value)} data-testid="coord-why-join"
                className="textarea" placeholder="What pulled you here?" />
            </Field>
            <Field label="What impact do you want to make?" required>
              <textarea required rows={4} value={form.impact_goal} onChange={(e) => set("impact_goal", e.target.value)} data-testid="coord-impact"
                className="textarea" placeholder="The change you want to see — for one child, one classroom, one neighbourhood." />
            </Field>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="How many hours / month can you give?" required>
                <input required type="number" min="1" max="200" value={form.monthly_hours} onChange={(e) => set("monthly_hours", e.target.value)} data-testid="coord-hours"
                  className="input" placeholder="e.g. 10" />
              </Field>
              <Field label="How did you hear about us?">
                <input value={form.referral_source} onChange={(e) => set("referral_source", e.target.value)} data-testid="coord-referral"
                  className="input" placeholder="Instagram, friend, search…" />
              </Field>
            </div>
            <Field label="Past volunteering / community experience">
              <textarea rows={3} value={form.past_experience} onChange={(e) => set("past_experience", e.target.value)} data-testid="coord-past"
                className="textarea" placeholder="Anything you'd like us to know — even a one-time event counts." />
            </Field>
          </FormSection>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <button
              type="submit"
              disabled={saving}
              data-testid="coord-submit"
              className="bg-[#5A8896] text-white hover:bg-[#46707C] disabled:opacity-70 px-8 py-3.5 rounded-full font-medium transition flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
              {saving ? "Sending your application…" : "Send my application"}
            </button>
            <p className="text-xs text-[#5C757B] max-w-md">
              By applying you agree we may contact you about your application. We never share your details.
            </p>
          </div>
        </form>
      </section>

      <Footer />

      {/* Tailwind utility classes used above */}
      <style>{`
        .input { margin-top: 0.5rem; width: 100%; border: 1px solid #EBE7E0; border-radius: 9999px; padding: 0.75rem 1.25rem; outline: none; background: #FDFBF7; color: #2C3E42; transition: border-color .2s; }
        .input:focus { border-color: #5A8896; }
        .textarea { margin-top: 0.5rem; width: 100%; border: 1px solid #EBE7E0; border-radius: 1.25rem; padding: 0.75rem 1.25rem; outline: none; background: #FDFBF7; color: #2C3E42; resize: none; transition: border-color .2s; }
        .textarea:focus { border-color: #5A8896; }
      `}</style>
    </div>
  );
}

function FormSection({ title, subtitle, children }) {
  return (
    <div className="border-t border-[#EBE7E0] first:border-t-0 pt-8 first:pt-0 mt-8 first:mt-0">
      <h2 className="font-serif text-2xl text-[#2C3E42]" dangerouslySetInnerHTML={{ __html: title }} />
      {subtitle && <p className="text-sm text-[#5C757B] mt-1 mb-6">{subtitle}</p>}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <Label>{label}{required && <span className="text-[#C77373] ml-1">*</span>}</Label>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">{children}</label>;
}
