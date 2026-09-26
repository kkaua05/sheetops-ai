/**
 * SheetOps AI — Home page.
 *
 * Marketing landing page. Server-rendered (no client state of its own);
 * interactive bits (sticky header, scroll-reveal) are isolated in small
 * client components so the bulk of the page ships zero extra JS.
 */

import Link from "next/link";
import { Button } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { SiteHeader } from "@/components/marketing/site-header";
import {
  ArrowRight,
  Check,
  FileSpreadsheet,
  GitCompareArrows,
  Layers,
  LockKeyhole,
  Rows3,
  Scale,
  ShieldCheck,
  Sparkles,
  Table2,
  Wand2,
  WandSparkles,
} from "lucide-react";

const CHECKLIST = [
  "Processamento local",
  "Sem cadastro",
  "XLSX e CSV",
  "Seus arquivos não são armazenados",
];

const FEATURES = [
  {
    number: "01",
    icon: Wand2,
    title: "Limpeza com IA",
    description: "Detecte inconsistências, campos vazios e problemas estruturais a partir de instruções em linguagem natural.",
  },
  {
    number: "02",
    icon: Layers,
    title: "Consolidação",
    description: "Combine múltiplas planilhas em uma única estrutura, preservando a origem de cada registro.",
  },
  {
    number: "03",
    icon: GitCompareArrows,
    title: "Comparação",
    description: "Identifique linhas adicionadas, removidas e alteradas entre dois arquivos em segundos.",
  },
  {
    number: "04",
    icon: Scale,
    title: "Reconciliação",
    description: "Cruze valores entre fontes distintas usando uma chave comum e tolerância explícita.",
  },
];

const STEPS = [
  { number: "01", title: "Importar", description: "Envie um arquivo XLSX ou CSV — o parsing acontece direto no navegador." },
  { number: "02", title: "Analisar", description: "Veja o índice de qualidade dos dados e os problemas detectados automaticamente." },
  { number: "03", title: "Corrigir", description: "Aplique um plano de operações sugerido pela IA ou ferramentas manuais determinísticas." },
  { number: "04", title: "Exportar", description: "Baixe o resultado em XLSX ou CSV, com fórmulas neutralizadas por segurança." },
];

const SECURITY_POINTS = [
  "Processamento local, direto no navegador",
  "Arquivos não são armazenados pela aplicação",
  "Nenhum cadastro é exigido para usar o workspace",
  "Contexto enviado à IA é reduzido a metadados e estatísticas agregadas",
];

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <SiteHeader />

      <div className="landing-surface bg-grid bg-grain pointer-events-none absolute inset-0 -z-10" />

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section id="produto" className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28 lg:pt-16">
        <Reveal as="section" className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Automação inteligente para planilhas
          </div>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-6xl">
            Suas planilhas.
            <br />
            Finalmente <span className="text-primary">sob controle.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Limpe, valide, consolide, compare e reconcilie arquivos XLSX e CSV em um fluxo rápido, local e seguro.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/workspace">
              <Button size="lg" className="gap-2">
                Começar análise
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/workspace">
              <Button size="lg" variant="outline">
                Explorar workspace
              </Button>
            </Link>
          </div>
          <ul className="mt-9 grid max-w-lg gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={150} as="section" aria-label="Prévia do workspace" className="relative">
          <div className="glow-primary animate-glow-pulse absolute -inset-6 -z-10 rounded-[32px]" aria-hidden="true" />
          <div className="animate-float relative overflow-hidden rounded-xl border border-border bg-card/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.10)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-border px-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-xs font-medium">Visão geral</span>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                Processamento local
              </span>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted p-3">
                <Rows3 className="size-4 text-primary" aria-hidden="true" />
                <p className="mt-4 text-[11px] text-muted-foreground">Linhas</p>
                <p className="text-xl font-semibold tabular-nums">12.480</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <Table2 className="size-4 text-primary" aria-hidden="true" />
                <p className="mt-4 text-[11px] text-muted-foreground">Colunas</p>
                <p className="text-xl font-semibold tabular-nums">18</p>
              </div>
              <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                <WandSparkles className="size-4" aria-hidden="true" />
                <p className="mt-4 text-[11px] text-primary-foreground/70">Saúde dos dados</p>
                <p className="text-xl font-semibold tabular-nums">92/100</p>
              </div>
            </div>
            <div className="mx-3 mb-3 overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-3 border-b border-border bg-muted px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Cliente</span>
                <span>Plano</span>
                <span>Status</span>
              </div>
              {["Ana Souza", "Bruno Lima", "Carla Mendes"].map((name, index) => (
                <div key={name} className="grid grid-cols-3 border-b border-border/70 px-3 py-3 text-xs last:border-0">
                  <span>{name}</span>
                  <span className="tabular-nums">{index === 1 ? "420MB" : "220MB"}</span>
                  <span className="text-primary">Validado</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg sm:flex">
            <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
            Seus arquivos não são armazenados
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Features                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section id="recursos" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Recursos</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Um fluxo completo para seus dados</h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 90}>
              <div className="group h-full rounded-xl border border-border bg-card p-6 transition-[border-color,box-shadow] duration-300 hover:border-border-hover hover:shadow-[0_16px_40px_rgba(34,197,94,0.08)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-subtle">{feature.number}</span>
                  <feature.icon
                    className="size-5 text-primary transition-transform duration-300 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-border bg-background-secondary/60 py-20 lg:py-28">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Como funciona</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Da planilha bruta ao dado confiável</h2>
          </Reveal>

          <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            <div
              className="absolute top-6 right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
              aria-hidden="true"
            />
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 100} className="relative flex flex-col items-center text-center lg:px-4">
                <span className="relative z-10 flex size-12 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-primary">
                  {step.number}
                </span>
                <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 max-w-[220px] text-sm text-muted-foreground">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Security                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section id="seguranca" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Segurança</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Seus dados permanecem sob seu controle.
            </h2>
            <ul className="mt-8 space-y-4">
              {SECURITY_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150} className="relative flex items-center justify-center">
            <div className="glow-primary animate-glow-pulse absolute inset-8 -z-10 rounded-full" aria-hidden="true" />
            <div className="relative flex size-56 items-center justify-center rounded-full border border-border bg-card sm:size-64">
              <div className="absolute inset-4 rounded-full border border-dashed border-border" />
              <ShieldCheck className="size-16 text-primary" aria-hidden="true" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Final CTA                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10 lg:pb-28">
        <Reveal className="relative overflow-hidden rounded-2xl border border-border bg-card px-8 py-16 text-center sm:px-16">
          <div className="glow-primary absolute inset-x-0 top-0 -z-10 h-full opacity-60" aria-hidden="true" />
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pronto para colocar suas planilhas em ordem?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Comece uma análise e transforme dados desorganizados em informações úteis.
          </p>
          <Link href="/workspace" className="mt-8 inline-flex">
            <Button size="lg" className="gap-2">
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              Começar análise
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Link>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between lg:px-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Table2 className="size-4" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold">SheetOps AI</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Operações inteligentes</p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:flex sm:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-subtle">Produto</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#recursos" className="text-muted-foreground hover:text-foreground">Recursos</a></li>
                <li><Link href="/workspace" className="text-muted-foreground hover:text-foreground">Workspace</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-subtle">Privacidade</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#seguranca" className="text-muted-foreground hover:text-foreground">Processamento local</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
