import { useEffect, useRef, useState } from "react";
import { LOGO_URL } from "@/lib/constants";
import { Download, Share2, X, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Loads an image (data URL or normal URL) into an HTMLImageElement with CORS handling
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
  return y;
}

export default function ShareCardModal({ open, onClose, donor }) {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open || !donor) return;
    setGenerating(true);

    const render = async () => {
      const size = 1080;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // Background — warm cream
      ctx.fillStyle = "#FDFBF7";
      ctx.fillRect(0, 0, size, size);

      // Soft corner blobs
      const g1 = ctx.createRadialGradient(size, 0, 0, size, 0, size * 0.7);
      g1.addColorStop(0, "rgba(217, 159, 128, 0.25)");
      g1.addColorStop(1, "rgba(217, 159, 128, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, size, size);

      const g2 = ctx.createRadialGradient(0, size, 0, 0, size, size * 0.7);
      g2.addColorStop(0, "rgba(90, 136, 150, 0.22)");
      g2.addColorStop(1, "rgba(90, 136, 150, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, size, size);

      // Rounded inner card
      const pad = 64;
      const cardX = pad;
      const cardY = pad;
      const cardW = size - pad * 2;
      const cardH = size - pad * 2;
      const radius = 56;
      ctx.beginPath();
      ctx.moveTo(cardX + radius, cardY);
      ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cardH, radius);
      ctx.arcTo(cardX + cardW, cardY + cardH, cardX, cardY + cardH, radius);
      ctx.arcTo(cardX, cardY + cardH, cardX, cardY, radius);
      ctx.arcTo(cardX, cardY, cardX + cardW, cardY, radius);
      ctx.closePath();
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = "#EBE7E0";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Kicker
      ctx.font = "600 22px Manrope, system-ui, sans-serif";
      ctx.fillStyle = "#D99F80";
      ctx.textAlign = "center";
      ctx.letterSpacing = "6px";
      ctx.fillText("· DOSTI DIL SE ·", size / 2, cardY + 90);

      // Donor photo (circle) — top center
      const photoSize = 280;
      const photoX = size / 2 - photoSize / 2;
      const photoY = cardY + 130;

      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      try {
        if (donor.photoDataUrl) {
          const img = await loadImage(donor.photoDataUrl);
          ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
        } else {
          ctx.fillStyle = "#F2EFE9";
          ctx.fillRect(photoX, photoY, photoSize, photoSize);
        }
      } catch {
        ctx.fillStyle = "#F2EFE9";
        ctx.fillRect(photoX, photoY, photoSize, photoSize);
      }
      ctx.restore();
      // Photo ring
      ctx.beginPath();
      ctx.arc(size / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#5A8896";
      ctx.lineWidth = 8;
      ctx.stroke();

      // Heart badge at bottom-right of photo
      const heartCx = size / 2 + photoSize / 2 - 20;
      const heartCy = photoY + photoSize - 20;
      ctx.fillStyle = "#D99F80";
      ctx.beginPath();
      ctx.arc(heartCx, heartCy, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      // small white heart
      ctx.font = "700 38px system-ui";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText("♥", heartCx, heartCy + 2);

      // Headline
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "center";
      ctx.fillStyle = "#2C3E42";
      ctx.font = '400 54px "Playfair Display", Georgia, serif';
      ctx.fillText("I just helped", size / 2, photoY + photoSize + 90);

      ctx.font = 'italic 600 64px "Playfair Display", Georgia, serif';
      ctx.fillStyle = "#5A8896";
      ctx.fillText("spread a little hope.", size / 2, photoY + photoSize + 160);

      // Name + amount
      ctx.font = "600 26px Manrope, system-ui, sans-serif";
      ctx.fillStyle = "#2C3E42";
      ctx.fillText(donor.name, size / 2, photoY + photoSize + 220);

      ctx.font = '400 46px "Playfair Display", Georgia, serif';
      ctx.fillStyle = "#D99F80";
      const inr = new Intl.NumberFormat("en-IN").format(donor.amount || 0);
      ctx.fillText(`₹${inr}  ·  contributed`, size / 2, photoY + photoSize + 272);

      // Tagline — dedication if gift, otherwise standard
      let taglineY = photoY + photoSize + 330;
      if (donor.gift_to) {
        ctx.font = '600 22px Manrope, system-ui, sans-serif';
        ctx.fillStyle = "#D99F80";
        ctx.fillText(
          `· ${(donor.gift_occasion || "In celebration of").toUpperCase()} ·`,
          size / 2,
          taglineY,
        );
        ctx.font = 'italic 500 32px "Playfair Display", Georgia, serif';
        ctx.fillStyle = "#2C3E42";
        wrapText(
          ctx,
          `In ${donor.gift_to}'s name.`,
          size / 2,
          taglineY + 44,
          cardW - 160,
          40,
        );
      } else {
        ctx.font = 'italic 400 28px "Playfair Display", Georgia, serif';
        ctx.fillStyle = "#5C757B";
        wrapText(
          ctx,
          "Every child deserves a chance to learn, dream, and be held.",
          size / 2,
          taglineY,
          cardW - 160,
          40,
        );
      }

      // Logo (bottom)
      try {
        const logoImg = await loadImage(LOGO_URL);
        const logoSize = 110;
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, cardY + cardH - 145, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          logoImg,
          size / 2 - logoSize / 2,
          cardY + cardH - 145 - logoSize / 2,
          logoSize,
          logoSize,
        );
        ctx.restore();
      } catch {
        // skip
      }

      // Brand line
      ctx.font = "600 20px Manrope, system-ui, sans-serif";
      ctx.fillStyle = "#2C3E42";
      ctx.fillText("Dosti Dil Se · dostidilse.org", size / 2, cardY + cardH - 70);
      ctx.font = "500 18px Manrope, system-ui, sans-serif";
      ctx.fillStyle = "#5C757B";
      ctx.fillText("Join the Wall of Hearts. The first heart could be yours.", size / 2, cardY + cardH - 42);

      const url = canvas.toDataURL("image/png");
      setImageUrl(url);
      setGenerating(false);
    };

    render();
  }, [open, donor]);

  if (!open || !donor) return null;

  const fileName = `dostidilse-${(donor.name || "friend").toLowerCase().replace(/\s+/g, "-")}.png`;

  const onDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Saved to your device. Share it with pride!");
  };

  const onShareWhatsApp = async () => {
    const msg = `I just supported Dosti Dil Se — spreading love & hope to children who need it most. Join me: https://dostidilse.org`;
    // Try native share with image first (works on mobile)
    try {
      if (navigator.share && imageUrl) {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Dosti Dil Se", text: msg });
          return;
        }
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
    // Fallback: open WhatsApp with text
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#2C3E42]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        data-testid="share-card-modal"
        className="bg-[#FDFBF7] rounded-[2rem] border border-[#EBE7E0] shadow-2xl w-full max-w-2xl my-8 relative"
      >
        <button
          onClick={onClose}
          data-testid="close-share-modal"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white border border-[#EBE7E0] flex items-center justify-center text-[#5C757B] hover:text-[#2C3E42] hover:border-[#5A8896] transition z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-8 md:p-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs tracking-[0.28em] uppercase text-[#D99F80] font-medium">
              <Heart size={14} fill="#D99F80" /> Thank You
            </div>
            <h3 className="mt-3 font-serif text-3xl md:text-4xl tracking-tight text-[#2C3E42] leading-tight">
              Your kindness deserves
              <br />
              <span className="italic text-[#5A8896]">a little noise.</span>
            </h3>
            <p className="mt-4 text-sm text-[#5C757B] leading-relaxed max-w-md mx-auto">
              Share this card on WhatsApp or Instagram. Let your friends know — quiet kindness,
              loudly multiplied.
            </p>
          </div>

          {/* Preview */}
          <div className="relative rounded-[1.5rem] overflow-hidden border border-[#EBE7E0] bg-white aspect-square shadow-inner">
            {generating || !imageUrl ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#5C757B]">
                <Loader2 size={24} className="animate-spin text-[#5A8896]" />
                <span className="text-sm">Painting your heart…</span>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="Your share card"
                data-testid="share-card-preview"
                className="w-full h-full object-contain"
              />
            )}
            {/* hidden canvas used for rendering */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onDownload}
              disabled={!imageUrl}
              data-testid="share-download-btn"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] disabled:opacity-60 px-6 py-3.5 rounded-full font-medium transition shadow-sm hover:shadow-md"
            >
              <Download size={18} /> Download
            </button>
            <button
              onClick={onShareWhatsApp}
              disabled={!imageUrl}
              data-testid="share-whatsapp-btn"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-[#5A8896]/60 text-[#5A8896] hover:bg-[#5A8896] hover:text-white disabled:opacity-60 px-6 py-3.5 rounded-full font-medium transition"
            >
              <Share2 size={18} /> Share on WhatsApp
            </button>
          </div>

          <p className="mt-4 text-xs text-center text-[#5C757B]">
            Tip — for Instagram, download the card and upload it to your story.
          </p>
        </div>
      </div>
    </div>
  );
}
