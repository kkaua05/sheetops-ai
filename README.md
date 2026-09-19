enviados para um servidor. Apenas instruções anonimizadas são enviadas à IA
# SheetOps AI

> A privacy-first spreadsheet operations workspace for cleaning, validating,
> comparing, reconciling, and transforming XLSX and CSV data.

[![CI quality gates](https://img.shields.io/badge/quality-107%20tests%20passing-16a34a?style=for-the-badge)](package.json)
[![Next.js](https://img.shields.io/badge/Next.js-16-111827?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-private-lightgrey?style=for-the-badge)](#license)

SheetOps AI turns repetitive spreadsheet work into an auditable workflow. Users
can import files locally, inspect data quality, apply deterministic operations,
ask an AI planner for a safe operation plan, preview every change, and export a
clean result without uploading their source files.

**Resumo em português:** uma plataforma local e segura para limpeza,
validação, consolidação, comparação e reconciliação de planilhas, com
automação opcional por IA.

## Why This Project

Spreadsheet automation often fails in two ways: it is either too manual to
scale, or too opaque to trust. SheetOps AI is designed around the opposite
principles:

- **Local-first processing:** the browser parses and transforms the file.
- **Explainable operations:** transformations are represented as typed,
  validated operations instead of arbitrary scripts.
- **Human approval:** AI suggestions are shown as a plan and preview before
  they can affect the working dataset.
- **Production-minded security:** sensitive context is sanitized, API keys stay
  server-side, and exported CSV formulas are neutralized.
- **Testable domain logic:** data operations live outside the UI and are covered
  by focused unit tests plus browser-level smoke tests.

## Product Capabilities

### Data workspace

- Drag-and-drop or click-to-import for `.csv` and `.xlsx` files.
- In-browser parsing with file size, row, column, and format limits.
- Dataset tabs and active-dataset state managed through a dedicated workspace
  context.
- Table preview with column metadata, inferred types, and representative rows.

### Data quality and transformation

- Automatic profiling and a Data Health Score.
- Issue detection for missing values, duplicates, invalid values, and type
  inconsistencies.
- CPF, CNPJ, e-mail, phone, and date validation helpers.
- Text cleanup, date normalization, phone normalization, and deduplication.
- Change previews and undo support before the user commits an operation.

### Consolidation, comparison, and reconciliation

- Merge datasets with explicit column mapping.
- Compare datasets to identify added, removed, and changed records.
- Reconcile numeric values with tolerant money parsing and difference reports.

### AI-assisted planning

- Natural-language requests are converted into structured operation plans by
  Groq.
- Plans are validated with Zod before they enter the client workflow.
- AI context contains sanitized metadata and samples, never the original file.
- Manual tools remain available when no Groq API key is configured.

### Safe exports

- Export transformed data as CSV or XLSX.
- Neutralize cells beginning with `=`, `+`, `-`, or `@` to mitigate CSV formula
  injection when files are opened in spreadsheet software.

## Architecture

```text
Browser
  |
  |-- FileUpload -> CSV/XLSX parser -> normalized Dataset
  |                                      |
  |                                      +-> profiler / quality score
  |                                      +-> transformations / compare / reconcile
  |                                      +-> preview / apply / undo
  |                                      +-> CSV/XLSX export
  |
  +-- AI Planning Panel -> /api/ai/plan -> Groq
                              |
                              +-> sanitized context only
                              +-> Zod-validated operation plan
```

The project uses a clear separation between UI orchestration and domain logic:

```text
src/
  app/                  Next.js routes and application screens
  components/ui/        Reusable UI primitives
  components/workspace Workspace workflow components
  config/               Limits and AI configuration
  lib/ai/               Prompting, planning, and AI context sanitization
  lib/compare/          Dataset comparison algorithms
  lib/export/           CSV/XLSX export and formula sanitization
  lib/merge/            Dataset consolidation
  lib/profiler/         Type inference and data issue detection
  lib/quality/          Data health calculations
  lib/reconcile/        Money parsing and reconciliation algorithms
  lib/spreadsheet/      CSV/XLSX parsing and normalization
  lib/transformations/  Deterministic cleaning operations
  lib/validation/       Domain validators
  schemas/              Zod schemas for operation contracts
  types/                Shared domain types
e2e/                    Playwright browser tests
```

## Technology Stack

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript strict mode |
| Styling | Tailwind CSS v4, Radix UI primitives, Lucide icons |
| Spreadsheet processing | ExcelJS, Papa Parse |
| AI | Groq SDK with server-side API route |
| Validation | Zod, domain-specific validation modules |
| Unit testing | Vitest, Testing Library, jsdom |
| E2E testing | Playwright Chromium |
| Code quality | ESLint, TypeScript compiler, production build |

## Getting Started

### Requirements

- Node.js 20 or newer
- npm 10 or newer
- A Groq API key only if AI planning is required

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional AI configuration

Copy `.env.example` to `.env.local` and add the server-only key:

```env
GROQ_API_KEY=your_groq_api_key
# GROQ_MODEL=llama-3.3-70b-versatile
```

Never expose this key with a `NEXT_PUBLIC_` prefix. Without it, all local data
operations remain available and only AI planning is disabled.

## Quality Gates

The project is validated with the following commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Current baseline:

- **107 unit tests passing** across 17 test files.
- **6 Playwright E2E tests passing**.
- Production build verified with Next.js 16.3.5.
- TypeScript strict check and ESLint passing.

## Security and Privacy

- Source files are parsed in the browser and are not stored by the application.
- Only the AI planning request crosses the server boundary.
- AI context is reduced to metadata and sanitized samples.
- The Groq API key is read only in server-side code.
- Operation plans are schema-validated before execution.
- Exported CSV values are sanitized against spreadsheet formula injection.
- File size and dataset dimensions are bounded before processing.

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm test` | Run the Vitest unit suite |
| `npm run test:e2e` | Run Playwright browser tests |

## Deployment

The application can be deployed to Vercel or another Next.js-compatible host.
For AI planning, configure `GROQ_API_KEY` as a server-side production
environment variable. The local spreadsheet workflow does not require any
backend database or file storage.

## Project Status

This repository is a functional portfolio project demonstrating a complete
data-product workflow: typed domain modeling, secure AI integration, browser
file processing, deterministic transformations, accessible UI, and automated
quality gates.

## License

This project is private and intended for portfolio and demonstration purposes.
