"use client";

/**
 * SheetOps AI — Home page.
 *
 * Hero landing with a clear call-to-action that routes the user into the
 * workspace. No file processing happens here; it is purely presentational.
 */

import Link from "next/link";
import { Button } from "@/components/ui/primitives";
import {
  ArrowRight,
  Check,
  FileSpreadsheet,
  LockKeyhole,
  Rows3,
  ShieldCheck,
  Sparkles,
  Table2,
  WandSparkles,
} from "lucide-react";

const CHECKLIST = [
  "Processamento local",
  "Sem cadastro",
  "XLSX e CSV",
  "Seus arquivos não são armazenados",
];

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="landing-surface pointer-events-none absolute inset-0 -z-10" />
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Table2 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">SheetOps AI</p>
            <p className="text-[11px] text-muted-foreground">Operações inteligentes</p>
          </div>
        </div>
        <Link href="/workspace" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          Abrir workspace <ArrowRight className="ml-1 inline size-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-24 lg:pt-12">
        <section className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Automação segura com IA
          </div>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-6xl">
            Suas planilhas, finalmente sob controle.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Limpe, valide, consolide, compare e reconcilie arquivos XLSX e CSV em um fluxo claro, local e seguro.
          </p>
          <Link href="/workspace" className="mt-8 inline-flex">
            <Button size="lg" className="gap-2">
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              Começar análise
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Link>
          <ul className="mt-8 grid max-w-lg gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="size-3" aria-hidden="true" /></span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Prévia do workspace" className="relative">
          <div className="absolute -inset-5 rounded-[32px] bg-primary/5 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[0_24px_70px_rgba(32,61,42,0.14)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-border px-3 pb-3">
              <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-primary" /><span className="text-xs font-medium">Visão geral</span></div>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">Processamento local</span>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f5f8f4] p-3"><Rows3 className="size-4 text-primary" /><p className="mt-4 text-[11px] text-muted-foreground">Linhas</p><p className="text-xl font-semibold">12.480</p></div>
              <div className="rounded-xl bg-[#f5f8f4] p-3"><Table2 className="size-4 text-primary" /><p className="mt-4 text-[11px] text-muted-foreground">Colunas</p><p className="text-xl font-semibold">18</p></div>
              <div className="rounded-xl bg-primary p-3 text-primary-foreground"><WandSparkles className="size-4" /><p className="mt-4 text-[11px] text-primary-foreground/70">Saúde dos dados</p><p className="text-xl font-semibold">92 / 100</p></div>
            </div>
            <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-border bg-white">
              <div className="grid grid-cols-3 border-b bg-[#f8faf8] px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Cliente</span><span>Plano</span><span>Status</span></div>
              {["Ana Souza", "Bruno Lima", "Carla Mendes"].map((name, index) => <div key={name} className="grid grid-cols-3 border-b border-border/70 px-3 py-3 text-xs last:border-0"><span>{name}</span><span>{index === 1 ? "420MB" : "220MB"}</span><span className="text-primary">Validado</span></div>)}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg sm:flex"><LockKeyhole className="size-4 text-primary" /> Seus arquivos não são armazenados</div>
        </section>
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-6 pb-6 text-xs text-muted-foreground lg:px-10"><ShieldCheck className="size-4 text-primary" aria-hidden="true" /> Apenas instruções sanitizadas podem ser enviadas à IA.</div>
    </main>
  );
}
