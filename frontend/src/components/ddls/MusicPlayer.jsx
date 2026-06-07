import { useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX, Play } from "lucide-react";
import { useT } from "@/lib/i18n";

const AUDIO_SRC = "/site-ambience.mp3";
const PREF_KEY = "ddls_music_pref"; // "on" | "off"

export default function MusicPlayer() {
  const { t } = useT();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [userTurnedOff, setUserTurnedOff] = useState(
    typeof window !== "undefined" && localStorage.getItem(PREF_KEY) === "off",
  );

  // Try to autoplay on mount
  useEffect(() => {
    if (userTurnedOff) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    audio.loop = true;

    const tryPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setNeedsGesture(false);
      } catch {
        // Browser blocked autoplay — wait for first user gesture
        setNeedsGesture(true);
      }
    };
    tryPlay();

    const onFirstGesture = async () => {
      if (userTurnedOff) return;
      if (audio.paused) {
        try {
          await audio.play();
          setIsPlaying(true);
          setNeedsGesture(false);
        } catch {
          /* user still needs to click the badge */
        }
      }
    };

    ["click", "touchstart", "keydown"].forEach((ev) =>
      window.addEventListener(ev, onFirstGesture, { once: true, passive: true }),
    );

    return () => {
      ["click", "touchstart", "keydown"].forEach((ev) =>
        window.removeEventListener(ev, onFirstGesture),
      );
    };
  }, [userTurnedOff]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
        setNeedsGesture(false);
        localStorage.setItem(PREF_KEY, "on");
        setUserTurnedOff(false);
      } catch {
        setNeedsGesture(true);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
      localStorage.setItem(PREF_KEY, "off");
      setUserTurnedOff(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? t("music.pause") : t("music.play")}
        data-testid="music-toggle"
        className={`fixed left-4 bottom-4 z-[60] inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-[#EBE7E0] rounded-full shadow-md hover:shadow-lg hover:border-[#5A8896] text-[#2C3E42] transition-all duration-300 overflow-hidden ${
          needsGesture ? "pl-3 pr-4 py-2 music-pulse" : "p-2.5"
        }`}
      >
        {needsGesture && !isPlaying ? (
          <>
            <Play size={14} className="text-[#5A8896]" fill="#5A8896" />
            <span className="text-xs font-medium whitespace-nowrap">{t("music.play")}</span>
          </>
        ) : isPlaying ? (
          <Volume2 size={16} className="text-[#5A8896]" />
        ) : (
          <VolumeX size={16} className="text-[#5C757B]" />
        )}
      </button>

      <style>{`
        @keyframes music-pulse-anim {
          0%, 100% { box-shadow: 0 0 0 0 rgba(90, 136, 150, 0.35); }
          50% { box-shadow: 0 0 0 10px rgba(90, 136, 150, 0); }
        }
        .music-pulse {
          animation: music-pulse-anim 2s ease-out infinite;
        }
      `}</style>
    </>
  );
}
