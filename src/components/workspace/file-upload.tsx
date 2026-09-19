"use client";

/**
 * FileUpload — accessible drag-and-drop + click-to-browse file importer.
 *
 * Parses files client-side via useFileParser and registers the resulting
 * dataset in the workspace. Shows loading and error states inline.
 */

import * as React from "react";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { useFileParser, type FileError } from "@/components/workspace/use-file-parser";
import { Button, Card, Spinner } from "@/components/ui/primitives";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { LIMITS } from "@/config/limits";

const ERROR_MESSAGES: Record<FileError["code"], string> = {
  UNSUPPORTED_FILE: "Formato não suportado. Use .xlsx ou .csv.",
  FILE_TOO_LARGE: `O arquivo excede o limite de ${LIMITS.MAX_FILE_SIZE_MB} MB.`,
  TOO_MANY_ROWS: `O arquivo excede o limite de ${LIMITS.MAX_ROWS.toLocaleString("pt-BR")} linhas.`,
  TOO_MANY_COLUMNS: `O arquivo excede o limite de ${LIMITS.MAX_COLUMNS} colunas.`,
  INVALID_CSV: "Não foi possível ler o arquivo CSV.",
  INVALID_XLSX: "Não foi possível ler o arquivo XLSX.",
  EMPTY_FILE: "O arquivo está vazio.",
  NO_HEADER: "Não foi possível detectar o cabeçalho do arquivo.",
  PARSING_ERROR: "Ocorreu um erro ao processar o arquivo.",
};

const STATUS_LABELS: Record<string, string> = {
  reading: "Lendo arquivo...",
  parsing: "Analisando estrutura...",
};

export function FileUpload() {
  const { addDataset } = useWorkspace();
  const { status, error, parseFile, reset } = useFileParser();
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const busy = status === "reading" || status === "parsing";

  const handleFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files)[0];
      if (!file) return;
      const dataset = await parseFile(file);
      if (dataset) {
        addDataset(dataset);
      }
    },
    [parseFile, addDataset],
  );

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files.length > 0) {
        void handleFiles(event.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const onBrowse = () => {
    reset();
    inputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-xl">
      <div
        role="button"
        tabIndex={0}
        aria-label="Enviar arquivo XLSX ou CSV"
        onClick={onBrowse}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onBrowse();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {busy ? (
          <>
            <Spinner className="size-8 text-primary" />
            <p className="text-sm text-muted-foreground">
              {STATUS_LABELS[status] ?? "Processando..."}
            </p>
          </>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium">Arraste um arquivo aqui</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ou clique para selecionar (.xlsx ou .csv, até {LIMITS.MAX_FILE_SIZE_MB} MB)
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              Selecionar arquivo
            </Button>
          </>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{ERROR_MESSAGES[error.code] ?? error.message}</span>
        </div>
      )}
    </Card>
  );
}