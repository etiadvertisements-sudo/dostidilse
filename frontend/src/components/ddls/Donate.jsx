import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API } from "@/lib/constants";
import { fileToBase64 } from "@/lib/api";
import { Heart, Loader2, Camera, X, Gift } from "lucide-react";
import ShareCardModal from "@/components/ddls/ShareCardModal";

const tiers = [
  { amount: 10, label: "A small hello", note: "Every rupee finds its way" },
  { amount: 500, label: "A gentle hand", note: "Helps one child walk a little further" },
  { amount: 1000, label: "A brighter start", note: "A fuller beginning for one child" },
  { amount: 2500, label: "A month of hope", note: "Supports five children" },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [photo, setPhoto] = useState(null); // { dataUrl, name }
  const [gift, setGift] = useState({ enabled: false, to: "", occasion: "Birthday" });
  const [loading, setLoading] = useState(false);
  const [share, setShare] = useState({ open: false, donor: null });
  const fileRef = useRef(null);

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
  const giftEligible = finalAmount >= 500;
  const giftActive = gift.enabled && giftEligible && gift.to.trim().length > 0;

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 1_200_000) {
      toast.error("Photo must be under 1.2 MB");
      return;
    }
    try {
      const dataUrl = await fileToBase64(file);
      setPhoto({ dataUrl, name: file.name });
    } catch {
      toast.error("Could not read that photo. Try a different one.");
    }
  };

  const onDonate = async (e) => {
    e.preventDefault();
    if (!finalAmount || finalAmount < 10) {
      toast.error("Minimum contribution is ₹10 — every rupee counts");
      return;
    }
    if (!form.name || !form.email) {
      toast.error("Please fill in your name and email");
      return;
    }
    if (!photo) {
      toast.error("Please add your photo — we'd love to show your kindness on the Wall of Hearts");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/donations/create-order`, {
        amount: finalAmount,
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: form.message || undefined,
        photo_base64: photo.dataUrl,
        gift_to: giftActive ? gift.to.trim() : undefined,
        gift_occasion: giftActive ? gift.occasion : undefined,
      });

      const scriptLoaded = await loadRazorpayScript();
      const gatewayReady =
        scriptLoaded &&
        data.key_id &&
        data.key_id !== "rzp_test_placeholder" &&
        data.key_id.length > 0;

      if (!gatewayReady) {
        // Demo path: mark donation as paid directly so it shows on Wall of Hearts
        await axios.post(`${API}/donations/verify`, {
          donation_id: data.donation_id,
          razorpay_order_id: data.order_id,
          razorpay_payment_id: `demo_${Date.now()}`,
          razorpay_signature: "demo",
        });
        toast.success(
          "Thank you! (Demo mode — your photo will appear on the Wall of Hearts. Add Razorpay keys to activate real payments.)",
        );
        const donorSnapshot = {
          name: form.name,
          amount: finalAmount,
          photoDataUrl: photo.dataUrl,
          gift_to: giftActive ? gift.to.trim() : null,
          gift_occasion: giftActive ? gift.occasion : null,
        };
        setForm({ name: "", email: "", phone: "", message: "" });
        setCustomAmount("");
        setSelectedAmount(500);
        setPhoto(null);
        setGift({ enabled: false, to: "", occasion: "Birthday" });
        setLoading(false);
        setShare({ open: true, donor: donorSnapshot });
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Dosti Dil Se",
        description: "Contribution — Spreading Love & Hope",
        order_id: data.order_id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone || "",
        },
        theme: { color: "#5A8896" },
        handler: async (response) => {
          try {
            await axios.post(`${API}/donations/verify`, {
              donation_id: data.donation_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Your kindness has reached us. Thank you! 💙");
            const donorSnapshot = {
              name: form.name,
              amount: finalAmount,
              photoDataUrl: photo.dataUrl,
              gift_to: giftActive ? gift.to.trim() : null,
              gift_occasion: giftActive ? gift.occasion : null,
            };
            setForm({ name: "", email: "", phone: "", message: "" });
            setCustomAmount("");
            setSelectedAmount(500);
            setPhoto(null);
            setGift({ enabled: false, to: "", occasion: "Birthday" });
            setShare({ open: true, donor: donorSnapshot });
          } catch {
            toast.error("Payment received, but we could not confirm it. We will reach out.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(
        err.response?.data?.detail?.[0]?.msg ||
          err.response?.data?.detail ||
          "Could not start contribution. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="donate" data-testid="donate-section" className="py-20 md:py-32 bg-[#FDFBF7]">
      <div className="ddls-container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">
            Contribute
          </div>
          <h2
            data-testid="donate-title"
            className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight text-[#2C3E42] leading-tight"
          >
            Your kindness,
            <br />
            <span className="italic text-[#5A8896]">their courage.</span>
          </h2>
          <p className="mt-6 text-lg text-[#5C757B] leading-relaxed">
            Every contribution — ten rupees or ten thousand — carries the same weight of
            kindness. Add your photo, and see your heart join our Wall of Hearts.
          </p>
        </div>

        <form
          onSubmit={onDonate}
          className="mt-14 max-w-3xl mx-auto bg-white rounded-[2rem] border border-[#EBE7E0] p-6 md:p-10 shadow-sm"
          data-testid="donate-form"
        >
          {/* Tiers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {tiers.map((t) => {
              const active = !customAmount && selectedAmount === t.amount;
              return (
                <button
                  type="button"
                  key={t.amount}
                  data-testid={`tier-${t.amount}`}
                  onClick={() => {
                    setSelectedAmount(t.amount);
                    setCustomAmount("");
                  }}
                  className={`text-left rounded-2xl p-4 md:p-5 border-2 transition-all duration-300 ${
                    active
                      ? "border-[#5A8896] bg-[#5A8896]/5 shadow-sm"
                      : "border-[#EBE7E0] hover:border-[#5A8896]/40 bg-[#FDFBF7]"
                  }`}
                >
                  <div className="font-serif text-xl md:text-2xl text-[#2C3E42]">
                    ₹{t.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs md:text-sm font-medium text-[#2C3E42] mt-1">
                    {t.label}
                  </div>
                  <div className="text-xs text-[#5C757B] mt-1">{t.note}</div>
                </button>
              );
            })}
          </div>

          {/* Custom amount */}
          <div className="mt-5">
            <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">
              Or enter a custom amount
            </label>
            <div className="mt-2 flex items-center border border-[#EBE7E0] rounded-full overflow-hidden focus-within:border-[#5A8896] transition">
              <span className="pl-5 text-[#5C757B] font-serif text-lg">₹</span>
              <input
                type="number"
                min="10"
                value={customAmount}
                data-testid="custom-amount-input"
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 750"
                className="flex-1 px-3 py-3.5 bg-transparent outline-none text-[#2C3E42] placeholder:text-[#5C757B]/60"
              />
            </div>
          </div>

          <div className="soft-divider my-8" />

          {/* Photo upload */}
          <div>
            <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">
              Your photo <span className="text-[#D99F80] normal-case tracking-normal">· joins our Wall of Hearts</span>
            </label>
            <div className="mt-3 flex items-center gap-4">
              {photo ? (
                <div className="relative">
                  <img
                    src={photo.dataUrl}
                    alt="Your kindness"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#5A8896]"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    data-testid="remove-photo-btn"
                    className="absolute -top-1 -right-1 bg-white border border-[#EBE7E0] rounded-full p-1 shadow-sm hover:bg-[#F2EFE9]"
                    aria-label="Remove photo"
                  >
                    <X size={14} className="text-[#5C757B]" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#EBE7E0] flex items-center justify-center text-[#5C757B]">
                  <Camera size={22} />
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  data-testid="upload-photo-btn"
                  className="bg-transparent border border-[#5A8896]/60 text-[#5A8896] hover:bg-[#5A8896] hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 text-sm font-medium"
                >
                  {photo ? "Change photo" : "Upload photo"}
                </button>
                <p className="text-xs text-[#5C757B] mt-2">
                  JPG/PNG · up to 1.2 MB · a happy face works best
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  data-testid="photo-file-input"
                  onChange={onPhotoChange}
                />
              </div>
            </div>
          </div>

          <div className="soft-divider my-8" />

          {/* Gift option — only visible when amount >= 500 */}
          {giftEligible && (
            <div className="rounded-2xl border border-[#EBE7E0] bg-[#F2EFE9]/40 p-5" data-testid="gift-block">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gift.enabled}
                  onChange={(e) => setGift({ ...gift, enabled: e.target.checked })}
                  data-testid="gift-toggle"
                  className="mt-1 h-4 w-4 accent-[#5A8896]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[#2C3E42] font-medium">
                    <Gift size={16} className="text-[#D99F80]" />
                    Name a child&rsquo;s dream
                  </div>
                  <div className="text-xs text-[#5C757B] mt-1 leading-relaxed">
                    Dedicate this contribution to someone — a birthday, an anniversary, a memory.
                    We&rsquo;ll bake their name into your share card.
                  </div>
                </div>
              </label>

              {gift.enabled && (
                <div className="mt-4 grid sm:grid-cols-2 gap-3" data-testid="gift-fields">
                  <div>
                    <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">In whose name</label>
                    <input
                      type="text"
                      value={gift.to}
                      onChange={(e) => setGift({ ...gift, to: e.target.value })}
                      data-testid="gift-to-input"
                      placeholder="e.g. Dadi, Arjun, Mom"
                      maxLength={100}
                      className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Occasion</label>
                    <select
                      value={gift.occasion}
                      onChange={(e) => setGift({ ...gift, occasion: e.target.value })}
                      data-testid="gift-occasion-input"
                      className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-white text-[#2C3E42]"
                    >
                      <option>Birthday</option>
                      <option>Anniversary</option>
                      <option>In loving memory</option>
                      <option>Festival</option>
                      <option>Just because</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="soft-divider my-8" />

          {/* Donor details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Your name</label>
              <input
                required
                type="text"
                value={form.name}
                data-testid="donor-name-input"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7]"
                placeholder="Who shall we thank?"
              />
            </div>
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Email</label>
              <input
                required
                type="email"
                value={form.email}
                data-testid="donor-email-input"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                data-testid="donor-phone-input"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7]"
                placeholder="+91 98XXXXXXXX"
              />
            </div>
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Message (optional)</label>
              <input
                type="text"
                value={form.message}
                data-testid="donor-message-input"
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7]"
                placeholder="A note of blessing"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="donate-submit-btn"
            className="mt-8 w-full inline-flex items-center justify-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] disabled:opacity-70 px-8 py-4 rounded-full transition-all duration-300 shadow-sm hover:shadow-md font-medium text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Processing…
              </>
            ) : (
              <>
                <Heart size={18} /> Contribute ₹
                {finalAmount ? Number(finalAmount).toLocaleString("en-IN") : "0"}
              </>
            )}
          </button>

          <p className="mt-4 text-xs text-center text-[#5C757B]">
            Secure payments by Razorpay · 100% reaches the cause · Every rupee counts
          </p>
        </form>
      </div>

      <ShareCardModal
        open={share.open}
        donor={share.donor}
        onClose={() => {
          setShare({ open: false, donor: null });
          setTimeout(() => {
            document.querySelector("#wall")?.scrollIntoView({ behavior: "smooth" });
          }, 200);
        }}
      />
    </section>
  );
}
