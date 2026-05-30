"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, Github, Lock, Mail, User } from "lucide-react";

import { useAuthTransitionContext } from "@/contexts/auth-transition-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { registerUser } from "@/lib/api";
import { persistAuthToken } from "@/lib/auth";

const matrixGlyphs = ["\u00A7", "\u2593", "\u2591", "\u2592", "\u2588", "$", "\u20BF", "\u00A5"];

const floatingGlyphs = Array.from({ length: 18 }, (_, index) => ({
  character: matrixGlyphs[index % matrixGlyphs.length],
  left: `${(index * 11 + 7) % 100}%`,
  delay: `${(index % 6) * 1.7}s`,
  duration: `${11 + (index % 5) * 2.6}s`,
  size: `${0.75 + (index % 4) * 0.12}rem`,
  opacity: 0.08 + (index % 4) * 0.03
}));

const telemetryLines = [
  "[INFO] Conectando ao servidor...",
  "[OK] Autenticacao disponivel",
  "[INFO] MineStoreSync v1.0.0",
  "[SYNC] wallet.minecraft.balance",
  "[AUTH] handshake terminal://register",
  "[CACHE] profile-seed loaded"
];

const inputClassName =
  "h-12 rounded-none border border-[#22c55e]/40 bg-[#0a0a0a] pl-11 font-[family:var(--font-jetbrains-mono)] text-sm text-[#dcfce7] placeholder:text-[#3f5c46] shadow-[inset_0_0_0_1px_rgba(6,20,8,0.9)] transition-[border-color,box-shadow,color] duration-150 focus-visible:border-[#4ade80] focus-visible:ring-0 focus-visible:shadow-[0_0_0_1px_rgba(74,222,128,0.65),0_0_10px_rgba(34,197,94,0.35)]";

export default function RegisterPage() {
  const [activeTelemetry, setActiveTelemetry] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isTransitioning, navigateTo } = useAuthTransitionContext();
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTelemetry((current) => (current + 1) % telemetryLines.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!normalizedEmail.includes("@")) {
      setFormError("Informe um email válido.");
      return;
    }

    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("A confirmação de senha não confere.");
      return;
    }

    if (!acceptedTerms) {
      setFormError("Aceite os termos para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerUser({
        name: normalizedName,
        email: normalizedEmail,
        password
      });

      if (response.token) {
        persistAuthToken(response.token);
        router.replace("/dashboard");
        return;
      }

      router.push("/login?registered=1");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível criar a conta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative overflow-hidden text-[#dcfce7]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(163,230,53,0.12),transparent_22%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {floatingGlyphs.map((glyph, index) => (
          <span
            key={`${glyph.character}-${index}`}
            className="matrix-glyph absolute top-[-12%] font-[family:var(--font-share-tech-mono)] text-[#86efac]"
            style={{
              left: glyph.left,
              animationDelay: glyph.delay,
              animationDuration: glyph.duration,
              fontSize: glyph.size,
              opacity: glyph.opacity
            }}
          >
            {glyph.character}
          </span>
        ))}
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-3 border border-[#1a4a1a] bg-[#071107]/90 px-3 py-2 text-[11px] uppercase tracking-[0.32em] text-[#86efac] shadow-[0_0_22px_rgba(34,197,94,0.08)]">
              <span className="h-2 w-2 bg-[#22c55e]" />
              terminal://finance.minecraft
            </div>

            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-[#4d7458]">
                Register node :: secure onboarding
              </p>
              <div className="space-y-4">
                <h1
                  className="glitch-title font-[family:var(--font-share-tech-mono)] text-5xl uppercase tracking-[0.18em] text-[#f0fdf4] sm:text-6xl"
                  data-text="Criar conta"
                >
                  Criar conta
                </h1>
                <p className="max-w-xl text-sm leading-7 text-[#89a88f] sm:text-base">
                  Abra sua carteira operacional no ecossistema MineStoreSync com uma interface
                  que mistura grid de terminal, blocos de inventario e telemetria financeira em
                  tempo real.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-[#1a4a1a] bg-[#050805]/90 p-4 shadow-[0_0_18px_rgba(34,197,94,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#4d7458]">Latency</p>
                <p className="mt-3 font-[family:var(--font-share-tech-mono)] text-3xl text-[#4ade80]">
                  24ms
                </p>
              </div>
              <div className="border border-[#1a4a1a] bg-[#050805]/90 p-4 shadow-[0_0_18px_rgba(34,197,94,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#4d7458]">Wallets</p>
                <p className="mt-3 font-[family:var(--font-share-tech-mono)] text-3xl text-[#67e8f9]">
                  128k
                </p>
              </div>
              <div className="border border-[#1a4a1a] bg-[#050805]/90 p-4 shadow-[0_0_18px_rgba(34,197,94,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#4d7458]">Assets</p>
                <p className="mt-3 font-[family:var(--font-share-tech-mono)] text-3xl text-[#bef264]">
                  $MSS
                </p>
              </div>
            </div>

            <div className="grid gap-4 border border-[#1a4a1a] bg-[#050805]/80 p-5 shadow-[0_0_24px_rgba(34,197,94,0.08)]">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#4d7458]">
                bootstrap.log
              </p>
              <div className="space-y-3 text-sm text-[#9ac4a4]">
                <p>
                  <span className="text-[#4ade80]">$</span> init user-profile --world=overworld
                </p>
                <p>
                  <span className="text-[#67e8f9]">&gt;</span> secure vault bindings enabled
                </p>
                <p>
                  <span className="text-[#bef264]">#</span> oauth providers mapped to inventory
                  slots
                </p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute -inset-4 bg-[radial-gradient(circle,rgba(34,197,94,0.12),transparent_65%)] blur-2xl" />
            <div className="relative border border-[#1a4a1a] bg-[#050805]/95 shadow-[0_0_0_1px_rgba(20,83,45,0.9),0_0_30px_rgba(34,197,94,0.14)]">
              <div className="flex items-center justify-between border-b border-[#163a16] bg-[#081208] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#f87171]" />
                  <span className="h-3 w-3 rounded-full bg-[#fbbf24]" />
                  <span className="h-3 w-3 rounded-full bg-[#4ade80]" />
                </div>
                <p className="terminal-command text-[11px] uppercase tracking-[0.3em] text-[#7fc78f]">
                  &gt; minecraft-store --register
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-8 space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-[#4d7458]">
                    secure identity channel
                  </p>
                  <p className="text-sm leading-7 text-[#81a088]">
                    Preencha seus dados para provisionar acesso a transacoes, inventario e
                    rotinas administrativas.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="minecraft-button h-12 rounded-none border-2 border-[#2c7a2c] bg-[#0b140b] font-[family:var(--font-jetbrains-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[#d7ffe2] shadow-none hover:bg-[#163a16] hover:text-[#f0fdf4]"
                  >
                    <Github className="h-4 w-4" />
                    Github
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="minecraft-button h-12 rounded-none border-2 border-[#2c7a2c] bg-[#0b140b] font-[family:var(--font-jetbrains-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[#d7ffe2] shadow-none hover:bg-[#163a16] hover:text-[#f0fdf4]"
                  >
                    <Chrome className="h-4 w-4" />
                    Google
                  </Button>
                </div>

                <div className="my-7 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-[#5f7d68]">
                  <Separator className="flex-1 bg-[#163a16]" />
                  <span className="whitespace-nowrap font-[family:var(--font-jetbrains-mono)] text-[#6f9779]">
                    {"// ou continue com o email"}
                  </span>
                  <Separator className="flex-1 bg-[#163a16]" />
                </div>

                {formError ? (
                  <div
                    className="mb-5 border border-[#4a1a1a] bg-[#170909] px-4 py-3 text-sm leading-6 text-[#fca5a5]"
                    role="alert"
                  >
                    {formError}
                  </div>
                ) : null}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label
                      htmlFor="full-name"
                      className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]"
                    >
                      Nome completo
                    </Label>
                    <div className="group relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4d7458] transition-colors duration-150 group-focus-within:text-[#4ade80]" />
                      <Input
                        id="full-name"
                        placeholder="Seu Nome"
                        className={inputClassName}
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]"
                    >
                      Email
                    </Label>
                    <div className="group relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4d7458] transition-colors duration-150 group-focus-within:text-[#4ade80]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className={inputClassName}
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]"
                    >
                      Senha
                    </Label>
                    <div className="group relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4d7458] transition-colors duration-150 group-focus-within:text-[#4ade80]" />
                      <Input
                        id="password"
                        type="password"
                        className={inputClassName}
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]"
                    >
                      Confirmar senha
                    </Label>
                    <div className="group relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4d7458] transition-colors duration-150 group-focus-within:text-[#4ade80]" />
                      <Input
                        id="confirm-password"
                        type="password"
                        className={inputClassName}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      disabled={isSubmitting}
                      className="mt-0.5 rounded-none border-[#2f6d2f] bg-[#0a0a0a] focus-visible:ring-[#22c55e] focus-visible:ring-offset-[#050805] checked:border-[#22c55e] checked:bg-[#22c55e]"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal leading-6 text-[#81a088]"
                    >
                      Aceito os{" "}
                      <Link href="#" className="font-medium text-[#4ade80] hover:text-[#86efac]">
                        termos de uso
                      </Link>{" "}
                      e{" "}
                      <Link href="#" className="font-medium text-[#67e8f9] hover:text-[#a5f3fc]">
                        politica de privacidade
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="register-button relative h-12 w-full overflow-hidden rounded-none border border-[#4ade80] bg-[#22c55e] font-[family:var(--font-jetbrains-mono)] text-sm font-bold uppercase tracking-[0.32em] text-[#031404] hover:bg-[#4ade80]"
                  >
                    {isSubmitting ? "$ Criando conta..." : "$ Criar conta"}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>

      <p className="relative mx-auto -mt-4 w-full max-w-7xl px-4 pb-12 text-center text-sm text-[#6f8f77] sm:px-6 lg:px-8">
        Ja tem uma conta?{" "}
        <button
          type="button"
          disabled={isTransitioning}
          onClick={() => navigateTo("/login")}
          className="login-link relative cursor-pointer font-medium text-[#4ade80] disabled:cursor-default disabled:opacity-70"
        >
          Fazer login
        </button>
      </p>

      <div className="fixed bottom-5 right-5 hidden w-[320px] overflow-hidden border border-[#143414] bg-[#040604]/85 p-4 text-xs text-[#6f9779] shadow-[0_0_18px_rgba(34,197,94,0.08)] backdrop-blur-[2px] lg:block">
        <div className="space-y-2 font-[family:var(--font-jetbrains-mono)]">
          {telemetryLines.map((line, index) => (
            <p
              key={line}
              className={`telemetry-line ${
                activeTelemetry === index ? "text-[#b7f7c9]" : "text-[#5d7965]"
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <style jsx>{`
        .matrix-glyph {
          animation-name: matrix-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .glitch-title {
          position: relative;
          display: inline-block;
          text-shadow: 0 0 18px rgba(74, 222, 128, 0.14);
          animation: glitch-shift 7s infinite;
        }

        .glitch-title::before,
        .glitch-title::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
        }

        .glitch-title::before {
          color: rgba(74, 222, 128, 0.6);
          animation: glitch-layer-a 7s infinite;
        }

        .glitch-title::after {
          color: rgba(103, 232, 249, 0.6);
          animation: glitch-layer-b 7s infinite;
        }

        .terminal-command::after {
          content: "";
          display: inline-block;
          width: 0.55rem;
          height: 1em;
          margin-left: 0.45rem;
          vertical-align: -0.12em;
          background: #4ade80;
          animation: cursor-blink 1s steps(1) infinite;
        }

        .minecraft-button {
          transition-duration: 50ms;
          transition-timing-function: steps(2, end);
        }

        .register-button::before {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(220, 252, 231, 0.9), transparent);
          transform: translateX(-100%);
          opacity: 0.9;
          transition: transform 220ms steps(6, end);
        }

        .register-button:hover::before {
          transform: translateX(100%);
        }

        .login-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -0.15rem;
          width: 100%;
          height: 1px;
          background: currentColor;
          transform: scaleX(0.15);
          transform-origin: left center;
          transition: transform 180ms ease;
        }

        .login-link:hover::after {
          transform: scaleX(1);
        }

        .telemetry-line {
          animation: telemetry-pan 9s linear infinite;
        }

        @keyframes matrix-fall {
          0% {
            transform: translate3d(0, -10vh, 0);
          }
          100% {
            transform: translate3d(0, 120vh, 0);
          }
        }

        @keyframes glitch-shift {
          0%,
          86%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          88% {
            transform: translate3d(-1px, 0, 0);
          }
          90% {
            transform: translate3d(1px, 0, 0);
          }
          92% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes glitch-layer-a {
          0%,
          86%,
          100% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
          }
          88% {
            opacity: 1;
            transform: translate3d(-2px, -1px, 0);
          }
          90% {
            opacity: 0.6;
            transform: translate3d(2px, 1px, 0);
          }
          92% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes glitch-layer-b {
          0%,
          86%,
          100% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
          }
          89% {
            opacity: 0.9;
            transform: translate3d(2px, 0, 0);
          }
          91% {
            opacity: 0.55;
            transform: translate3d(-1px, 1px, 0);
          }
          93% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes cursor-blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }

        @keyframes telemetry-pan {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </main>
  );
}
