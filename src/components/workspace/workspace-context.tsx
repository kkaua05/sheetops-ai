"use client";

/**
 * Workspace state: the single source of truth for the SheetOps client app.
 *
 * Holds imported datasets, the active dataset, the AI operation plan, and an
 * undo history (bounded by LIMITS.MAX_UNDO_HISTORY). All mutations are
 * immutable and produce new state snapshots for undo.
 */

import * as React from "react";
import type { Dataset } from "@/types/dataset";
import type { OperationPlan } from "@/types/operations";
import type { ProcessingResult } from "@/types/results";
import { LIMITS } from "@/config/limits";

export interface WorkspaceSnapshot {
  datasets: Record<string, Dataset>;
  /** Ordered list of dataset ids (import order). */
  datasetOrder: string[];
  activeDatasetId: string | null;
  plan: OperationPlan | null;
  /** Result of the last applied plan (for preview/undo). */
  lastResult: ProcessingResult | null;
}

interface WorkspaceContextValue extends WorkspaceSnapshot {
  addDataset: (dataset: Dataset) => void;
  removeDataset: (id: string) => void;
  setActiveDataset: (id: string | null) => void;
  setPlan: (plan: OperationPlan | null) => void;
  /** Replace a dataset (e.g. after applying operations) and push undo state. */
  applyResult: (result: ProcessingResult) => void;
  undo: () => void;
  canUndo: boolean;
  reset: () => void;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(
  null,
);

const EMPTY: WorkspaceSnapshot = {
  datasets: {},
  datasetOrder: [],
  activeDatasetId: null,
  plan: null,
  lastResult: null,
};

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshot] = React.useState<WorkspaceSnapshot>(EMPTY);
  const [history, setHistory] = React.useState<WorkspaceSnapshot[]>([]);

  const commit = React.useCallback(
    (updater: (prev: WorkspaceSnapshot) => WorkspaceSnapshot) => {
      setSnapshot((prev) => {
        const next = updater(prev);
        setHistory((h) => {
          const bounded = [...h, prev].slice(-LIMITS.MAX_UNDO_HISTORY);
          return bounded;
        });
        return next;
      });
    },
    [],
  );

  const addDataset = React.useCallback(
    (dataset: Dataset) => {
      commit((prev) => ({
        ...prev,
        datasets: { ...prev.datasets, [dataset.id]: dataset },
        datasetOrder: prev.datasetOrder.includes(dataset.id)
          ? prev.datasetOrder
          : [...prev.datasetOrder, dataset.id],
        activeDatasetId: dataset.id,
      }));
    },
    [commit],
  );

  const removeDataset = React.useCallback(
    (id: string) => {
      commit((prev) => {
        const datasets = { ...prev.datasets };
        delete datasets[id];
        const datasetOrder = prev.datasetOrder.filter((d) => d !== id);
        return {
          ...prev,
          datasets,
          datasetOrder,
          activeDatasetId:
            prev.activeDatasetId === id
              ? (datasetOrder[0] ?? null)
              : prev.activeDatasetId,
        };
      });
    },
    [commit],
  );

  const setActiveDataset = React.useCallback(
    (id: string | null) => {
      setSnapshot((prev) => ({ ...prev, activeDatasetId: id }));
    },
    [],
  );

  const setPlan = React.useCallback((plan: OperationPlan | null) => {
    setSnapshot((prev) => ({ ...prev, plan }));
  }, []);

  const applyResult = React.useCallback(
    (result: ProcessingResult) => {
      commit((prev) => ({
        ...prev,
        datasets: {
          ...prev.datasets,
          [result.dataset.id]: result.dataset,
        },
        activeDatasetId: result.dataset.id,
        lastResult: result,
      }));
    },
    [commit],
  );

  const undo = React.useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setSnapshot(previous);
      return h.slice(0, -1);
    });
  }, []);

  const reset = React.useCallback(() => {
    setSnapshot(EMPTY);
    setHistory([]);
  }, []);

  const value = React.useMemo<WorkspaceContextValue>(
    () => ({
      ...snapshot,
      addDataset,
      removeDataset,
      setActiveDataset,
      setPlan,
      applyResult,
      undo,
      canUndo: history.length > 0,
      reset,
    }),
    [
      snapshot,
      history,
      addDataset,
      removeDataset,
      setActiveDataset,
      setPlan,
      applyResult,
      undo,
      reset,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}