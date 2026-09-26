"use client";

/**
 * FileUpload — accessible drag-and-drop + click-to-browse file importer.
 *
 * Parses files client-side via useFileParser and registers the resulting
 * dataset in the workspace. Shows loading and error states inline, and
 * exposes an imperative `open()` handle so the workspace header's
 * "Importar arquivo" button can trigger the same file picker.
 */

import * as React from "react";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { useFileParser, type FileError } from "@/components/workspace/use-file-parser";
import { Button, Card, Spinner } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
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

export interface FileUploadHandle {
  open: () => void;
}

export const FileUpload = React.forwardRef<FileUploadHandle>(function FileUpload(_props, ref) {
  const { addDataset } = useWorkspace();
  const { toast } = useToast();
  const { status, error, parseFile, reset } = useFileParser();
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const busy = status === "reading" || status === "parsing";

  const onBrowse = React.useCallback(() => {
    reset();
    inputRef.current?.click();
  }, [reset]);

  React.useImperativeHandle(ref, () => ({ open: onBrowse }), [onBrowse]);

  const handleFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files)[0];
      if (!file) return;
      const dataset = await parseFile(file);
      if (dataset) {
        addDataset(dataset);
        toast({
          variant: "success",
          title: "Arquivo importado com sucesso.",
          description: `${dataset.name} · ${dataset.rows.length.toLocaleString("pt-BR")} linhas`,
        });
      }
    },
    [parseFile, addDataset, toast],
  );

  React.useEffect(() => {
    if (error) {
      toast({
        variant: "error",
        title: "Não foi possível importar o arquivo.",
        description: ERROR_MESSAGES[error.code] ?? error.message,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

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

  return (
    <Card className="w-full max-w-2xl">
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
          "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-10 text-center transition-colors sm:p-14",
          isDragging
            ? "border-primary bg-accent"
            : "border-border hover:border-border-hover hover:bg-accent/50",
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
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300",
                isDragging && "scale-110",
              )}
            >
              <Upload className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-semibold">Arraste sua planilha aqui</p>
              <p className="mt-1 text-sm text-muted-foreground">
                XLSX ou CSV · até {LIMITS.MAX_FILE_SIZE_MB} MB
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
});
