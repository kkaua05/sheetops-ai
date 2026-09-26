"use client";

/**
 * Sticky marketing header. Gains a subtle glass background and border once
 * the page scrolls past the hero, tracked with a passive scroll listener
 * (no layout thrash — only a boolean flips a class).
 */

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Table2 } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "#produto", label: "Produto" },
  { href: "#recursos", label: "Recursos" },
  { href: "#seguranca", label: "Segurança" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "glass border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.02)]"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:rotate-6">
            <Table2 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">SheetOps AI</p>
            <p className="text-[11px] text-muted-foreground">Operações inteligentes</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/workspace"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-light"
        >
          Abrir workspace
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
