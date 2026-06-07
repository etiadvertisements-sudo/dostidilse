import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { apiClient } from "@/lib/api";
import { LOGO_URL } from "@/lib/constants";
import { Loader2, Lock, Smartphone, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [step, setStep] = useState("credentials"); // credentials | setup | code
  const [email, setEmail] = useState("admin@dostidilse.org");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [preAuthToken, setPreAuthToken] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("ddls_admin_token")) navigate("/admin");
  }, [navigate]);

  const submitCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post("/admin/login", { email, password });
      setPreAuthToken(data.pre_auth_token);
      if (data.step === "setup") {
        setProvisioningUri(data.provisioning_uri);
        setStep("setup");
      } else {
        setStep("code");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the 6-digit code from your authenticator app");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post("/admin/verify-totp", {
        pre_auth_token: preAuthToken,
        code,
      });
      localStorage.setItem("ddls_admin_token", data.access_token);
      localStorage.setItem("ddls_admin_email", data.email);
      toast.success("Welcome back.");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid code");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const secretFromUri =
    provisioningUri && /secret=([A-Z0-9]+)/i.exec(provisioningUri)?.[1];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6 py-12 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-[#EBE7E0] shadow-sm p-8 md:p-10">
        <div className="flex flex-col items-center">
          <img src={LOGO_URL} alt="Dosti Dil Se" className="h-16 w-16 rounded-full border border-[#EBE7E0]" />
          <h1 className="mt-5 font-serif text-3xl text-[#2C3E42]">Admin access</h1>
          <p className="mt-2 text-sm text-[#5C757B] text-center">
            Protected by two-factor authentication.
          </p>
        </div>

        {step === "credentials" && (
          <form onSubmit={submitCredentials} className="mt-8 space-y-4" data-testid="admin-login-form">
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="admin-email-input"
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="admin-password-input"
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              data-testid="admin-login-submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] disabled:opacity-70 px-8 py-3.5 rounded-full transition shadow-sm font-medium"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : <><Lock size={16} /> Continue</>}
            </button>
          </form>
        )}

        {step === "setup" && (
          <div className="mt-8" data-testid="admin-setup-step">
            <div className="flex items-start gap-3 bg-[#F2EFE9]/60 border border-[#EBE7E0] rounded-2xl p-4">
              <Smartphone size={20} className="text-[#5A8896] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#5C757B] leading-relaxed">
                <span className="text-[#2C3E42] font-medium">First-time setup.</span> Scan this QR code with{" "}
                <span className="text-[#2C3E42]">Google Authenticator</span>,{" "}
                <span className="text-[#2C3E42]">Authy</span>, or any TOTP app, then enter the 6-digit code it gives you.
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="bg-white border border-[#EBE7E0] p-4 rounded-2xl shadow-sm">
                {provisioningUri && (
                  <QRCodeSVG
                    value={provisioningUri}
                    size={200}
                    bgColor="#FFFFFF"
                    fgColor="#2C3E42"
                    level="M"
                    data-testid="totp-qr"
                  />
                )}
              </div>
            </div>

            {secretFromUri && (
              <div className="mt-4 text-center">
                <div className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Or enter this secret manually</div>
                <div className="mt-1 font-mono text-sm text-[#2C3E42] tracking-widest">{secretFromUri}</div>
              </div>
            )}

            <form onSubmit={submitCode} className="mt-6 space-y-4">
              <div>
                <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Enter 6-digit code</label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  data-testid="admin-totp-input"
                  autoFocus
                  placeholder="••••••"
                  className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7] font-mono tracking-[0.5em] text-center text-xl"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                data-testid="admin-totp-submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] disabled:opacity-70 px-8 py-3.5 rounded-full transition shadow-sm font-medium"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying…</> : <><ShieldCheck size={16} /> Verify & enter</>}
              </button>
            </form>
          </div>
        )}

        {step === "code" && (
          <form onSubmit={submitCode} className="mt-8 space-y-4" data-testid="admin-code-step">
            <div className="flex items-start gap-3 bg-[#F2EFE9]/60 border border-[#EBE7E0] rounded-2xl p-4">
              <ShieldCheck size={20} className="text-[#5A8896] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#5C757B] leading-relaxed">
                Open your authenticator app and enter the current 6-digit code for <span className="text-[#2C3E42]">Dosti Dil Se</span>.
              </div>
            </div>

            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Authenticator code</label>
              <input
                required
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                data-testid="admin-totp-input"
                autoFocus
                placeholder="••••••"
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] transition bg-[#FDFBF7] font-mono tracking-[0.5em] text-center text-xl"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              data-testid="admin-totp-submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#5A8896] text-white hover:bg-[#46707C] disabled:opacity-70 px-8 py-3.5 rounded-full transition shadow-sm font-medium"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying…</> : <><ShieldCheck size={16} /> Sign in</>}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setCode("");
                setPassword("");
              }}
              className="w-full text-sm text-[#5C757B] hover:text-[#2C3E42] transition"
            >
              ← Start over
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
