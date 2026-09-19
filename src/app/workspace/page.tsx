"use client";

/**
 * SheetOps AI — Workspace.
 *
 * The main application surface. Wraps the workspace state provider and lays
 * out the module navigation (sidebar on desktop, tabs on mobile) alongside
 * the active module's content.
 */

import * as React from "react";
import Link from "next/link";
import { WorkspaceProvider, useWorkspace } from "@/components/workspace/workspace-context";
import {
  ArrowLeft,
  BarChart3,
  GitCompareArrows,
  Layers,
  Sparkles,
  Table2,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { FileUpload } from "@/components/workspace/file-upload";
import { DataPreview } from "@/components/workspace/data-preview";
import { AiPlanningPanel } from "@/components/workspace/ai-planning-panel";
import { ExportToolbar } from "@/components/workspace/export-toolbar";
import { ChangesPreview } from "@/components/workspace/changes-preview";

type ModuleId = "overview" | "clean" | "merge" | "compare" | "reconcile" | "ai";

const MODULES: Array<{ id: ModuleId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Visão geral", icon: Table2 },
  { id: "clean", label: "Limpeza", icon: Wand2 },
  { id: "merge", label: "Consolidar", icon: Layers },
  { id: "compare", label: "Comparar", icon: GitCompareArrows },
  { id: "reconcile", label: "Reconciliar", icon: BarChart3 },
  { id: "ai", label: "Automações IA", icon: Sparkles },
];

function WorkspaceShell() {
  const { datasets, datasetOrder, activeDatasetId } = useWorkspace();
  const [activeModule, setActiveModule] = React.useState<ModuleId>("overview");

  const activeDataset = activeDatasetId ? datasets[activeDatasetId] : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card lg:flex">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Início
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="Módulos">
          {MODULES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveModule(id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeModule === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              aria-current={activeModule === id ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <div className="border-t p-3 text-xs text-muted-foreground">
          {datasetOrder.length} arquivo{datasetOrder.length === 1 ? "" : "s"} importado{datasetOrder.length === 1 ? "" : "s"}
        </div>
      </aside>

      {/* Mobile module tabs */}
      <div className="flex gap-1 overflow-x-auto border-b bg-card p-2 lg:hidden" role="tablist" aria-label="Módulos">
        {MODULES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeModule === id}
            onClick={() => setActiveModule(id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeModule === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
        {activeModule === "overview" && (
          <OverviewModule dataset={activeDataset} />
        )}
        {activeModule === "clean" && (
          <CleanModule dataset={activeDataset} />
        )}
        {activeModule === "ai" && (
          <AiModule dataset={activeDataset} />
        )}
        {(activeModule === "merge" || activeModule === "compare" || activeModule === "reconcile") && (
          <PlaceholderModule label={MODULES.find((m) => m.id === activeModule)?.label ?? ""} />
        )}
      </main>
    </div>
  );
}

function OverviewModule({ dataset }: { dataset?: import("@/types/dataset").Dataset }) {
  const { lastResult } = useWorkspace();
  if (!dataset) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <FileUpload />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <ExportToolbar dataset={dataset} />
      {lastResult && <ChangesPreview result={lastResult} />}
      <DataPreview dataset={dataset} />
    </div>
  );
}

function CleanModule({ dataset }: { dataset?: import("@/types/dataset").Dataset }) {
  if (!dataset) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <FileUpload />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <AiPlanningPanel dataset={dataset} />
    </div>
  );
}

function AiModule({ dataset }: { dataset?: import("@/types/dataset").Dataset }) {
  if (!dataset) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <FileUpload />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <AiPlanningPanel dataset={dataset} />
    </div>
  );
}

function PlaceholderModule({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
      <p className="text-lg font-medium">{label}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Este módulo estará disponível em breve. Importe arquivos para começar.
      </p>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}