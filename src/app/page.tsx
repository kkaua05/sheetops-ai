"use client";

/**
 * SheetOps AI — Home page.
 *
 * Hero landing with a clear call-to-action that routes the user into the
 * workspace. No file processing happens here; it is purely presentational.
 */

import Link from "next/link";
import { Button } from "@/components/ui/primitives";
import { Check, FileSpreadsheet, ShieldCheck, Sparkles } from "lucide-react";

const CHECKLIST = [
  "Processamento local",
  "Sem cadastro",
  "XLSX e CSV",
  "Seus arquivos não são armazenados",
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          Automação segura com IA
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          SheetOps AI
        </h1>

        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Automatize o trabalho repetitivo das suas planilhas.
        </p>

        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Limpe, valide, consolide, compare e reconcilie arquivos XLSX e CSV
          usando automação segura e IA.
        </p>

        <Link href="/workspace" className="mt-8">
          <Button size="lg" className="gap-2">
            <FileSpreadsheet className="size-4" aria-hidden="true" />
            Começar análise
          </Button>
        </Link>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check className="size-4 text-emerald-500" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Seus dados nunca saem do seu navegador — apenas instruções são
          enviadas à IA.
        </div>
      </div>
    </main>
  );
}
