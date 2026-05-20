import Link from "next/link";
import { Chrome, Github, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const inputClassName =
  "h-11 border-white/10 bg-[#0d0f18] pl-10 text-white placeholder:text-slate-500 focus-visible:ring-white/20";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Criar conta</h1>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Preencha seus dados para acessar a plataforma.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#13151f] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 border-white/10 bg-[#0d0f18] text-white hover:bg-white/5 hover:text-white"
            >
              <Github className="h-4 w-4" />
              Github
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 border-white/10 bg-[#0d0f18] text-white hover:bg-white/5 hover:text-white"
            >
              <Chrome className="h-4 w-4" />
              Google
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <Separator className="flex-1 bg-white/10" />
            <span className="whitespace-nowrap">Ou continue com o email</span>
            <Separator className="flex-1 bg-white/10" />
          </div>

          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-sm text-slate-200">
                Nome completo
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input id="full-name" placeholder="Seu Nome" className={inputClassName} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-slate-200">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input id="email" type="email" placeholder="seu@email.com" className={inputClassName} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-slate-200">
                Senha
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input id="password" type="password" className={inputClassName} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm text-slate-200">
                Confirmar senha
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input id="confirm-password" type="password" className={inputClassName} />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox id="terms" className="mt-0.5" />
              <Label htmlFor="terms" className="text-sm font-normal leading-6 text-slate-400">
                Aceito os{" "}
                <Link href="#" className="font-medium text-green-500 hover:text-green-400">
                  termos de uso
                </Link>{" "}
                e{" "}
                <Link href="#" className="font-medium text-blue-400 hover:text-blue-300">
                  política de privacidade
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-green-500 text-base font-bold text-white hover:bg-green-600"
            >
              Criar conta →
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Já tem uma conta?{" "}
          <Link href="#" className="font-medium text-green-500 hover:text-green-400">
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
