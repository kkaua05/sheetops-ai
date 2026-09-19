"use client";

/**
 * Client-side file parsing hook.
 *
 * Parses XLSX/CSV files entirely in the browser (ExcelJS/PapaParse are
 * dynamically imported so they never reach the server bundle). Enforces the
 * configured limits and maps failures to user-facing error codes.
 */

import * as React from "react";
import type { Dataset } from "@/types/dataset";
import {
  LIMITS,
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_EXTENSIONS,
  REJECTED_EXTENSIONS,
} from "@/config/limits";

export type FileErrorCode =
  | "UNSUPPORTED_FILE"
  | "FILE_TOO_LARGE"
  | "TOO_MANY_ROWS"
  | "TOO_MANY_COLUMNS"
  | "INVALID_CSV"
  | "INVALID_XLSX"
  | "EMPTY_FILE"
  | "NO_HEADER"
  | "PARSING_ERROR";

export interface FileError {
  code: FileErrorCode;
  message: string;
}

export type ParseStatus = "idle" | "reading" | "parsing" | "done" | "error";

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function toFileError(error: unknown): FileError {
  const message = error instanceof Error ? error.message : "Unknown error.";
  const lower = message.toLowerCase();

  if (lower.includes("too many rows") || lower.includes("max rows")) {
    return { code: "TOO_MANY_ROWS", message };
  }
  if (lower.includes("too many columns") || lower.includes("max columns")) {
    return { code: "TOO_MANY_COLUMNS", message };
  }
  if (lower.includes("header")) {
    return { code: "NO_HEADER", message };
  }
  if (lower.includes("empty")) {
    return { code: "EMPTY_FILE", message };
  }
  if (lower.includes("csv")) {
    return { code: "INVALID_CSV", message };
  }
  if (lower.includes("xlsx") || lower.includes("worksheet")) {
    return { code: "INVALID_XLSX", message };
  }
  return { code: "PARSING_ERROR", message };
}

export function validateFile(file: File): FileError | null {
  const ext = extensionOf(file.name);

  if ((REJECTED_EXTENSIONS as readonly string[]).includes(ext)) {
    return {
      code: "UNSUPPORTED_FILE",
      message: `O formato "${ext}" não é suportado. Use .xlsx ou .csv.`,
    };
  }
  if (!(SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)) {
    return {
      code: "UNSUPPORTED_FILE",
      message: "Formato não suportado. Use .xlsx ou .csv.",
    };
  }
  if (file.size === 0) {
    return { code: "EMPTY_FILE", message: "O arquivo está vazio." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      code: "FILE_TOO_LARGE",
      message: `O arquivo excede o limite de ${LIMITS.MAX_FILE_SIZE_MB} MB.`,
    };
  }
  return null;
}

export function useFileParser() {
  const [status, setStatus] = React.useState<ParseStatus>("idle");
  const [error, setError] = React.useState<FileError | null>(null);

  const parseFile = React.useCallback(async (file: File): Promise<Dataset | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setStatus("error");
      return null;
    }

    setError(null);
    setStatus("reading");

    try {
      const ext = extensionOf(file.name);

      if (ext === ".csv") {
        const text = await file.text();
        setStatus("parsing");
        const { parseCsv } = await import("@/lib/spreadsheet/parse-csv");
        const dataset = parseCsv(text, {
          fileName: file.name,
          fileSizeBytes: file.size,
          hasHeader: true,
        });
        setStatus("done");
        return dataset;
      }

      // .xlsx
      const buffer = await file.arrayBuffer();
      setStatus("parsing");
      const { parseXlsx } = await import("@/lib/spreadsheet/parse-xlsx");
      const dataset = await parseXlsx(buffer, {
        fileName: file.name,
        fileSizeBytes: file.size,
      });
      setStatus("done");
      return dataset;
    } catch (err) {
      const fileError = toFileError(err);
      setError(fileError);
      setStatus("error");
      return null;
    }
  }, []);

  const reset = React.useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { status, error, parseFile, reset };
}