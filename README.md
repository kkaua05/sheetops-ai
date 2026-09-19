# SheetOps AI

> Plataforma inteligente e segura para limpeza, validação, consolidação,
> comparação e transformação de planilhas XLSX e CSV.

[![Qualidade](https://img.shields.io/badge/qualidade-107%20testes%20aprovados-16a34a?style=for-the-badge)](package.json)
[![Next.js](https://img.shields.io/badge/Next.js-16-111827?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Licença](https://img.shields.io/badge/licença-privada-lightgrey?style=for-the-badge)](#licença)

O SheetOps AI transforma tarefas repetitivas de planilhas em um fluxo de
trabalho organizado, auditável e seguro. O usuário importa seus arquivos,
analisa a qualidade dos dados, aplica operações determinísticas, solicita um
plano de transformação por IA, revisa as alterações e exporta o resultado.

O processamento dos arquivos ocorre localmente no navegador. Os arquivos de
origem não são enviados nem armazenados em um servidor.

## Por que este projeto existe

Automação de planilhas costuma seguir dois caminhos problemáticos: processos
manuais demais para escalar ou automações opacas demais para serem confiáveis.
O SheetOps AI foi construído com os seguintes princípios:

- **Privacidade por padrão:** os arquivos são processados localmente.
- **Operações explicáveis:** cada transformação é representada por operações
  tipadas e validadas, em vez de scripts arbitrários.
- **Aprovação humana:** sugestões da IA aparecem como plano e pré-visualização
  antes de alterar o conjunto de dados.
- **Segurança desde a arquitetura:** contexto sensível é sanitizado, a chave da
  API fica no servidor e fórmulas perigosas são neutralizadas na exportação.
- **Domínio testável:** as regras de dados ficam separadas da interface e são
  cobertas por testes unitários e testes de navegador.

## Funcionalidades

### Workspace de dados

- Importação por arrastar e soltar ou seleção de arquivos `.csv` e `.xlsx`.
- Parsing no navegador com limites de tamanho, linhas, colunas e formatos.
- Gerenciamento de datasets e dataset ativo por contexto de workspace.
- Pré-visualização tabular com metadados, tipos inferidos e linhas de exemplo.

### Qualidade e transformação

- Perfil automático dos dados e cálculo de **Data Health Score**.
- Detecção de valores ausentes, duplicidades, valores inválidos e conflitos de
  tipo.
- Validadores para CPF, CNPJ, e-mail, telefone e datas.
- Limpeza de texto, normalização de datas, normalização de telefones e
  deduplicação.
- Pré-visualização das mudanças e suporte a desfazer antes da aplicação.

### Consolidação, comparação e reconciliação

- Consolidação de datasets com mapeamento explícito de colunas.
- Comparação para identificar registros adicionados, removidos e alterados.
- Reconciliação numérica com parsing tolerante de valores monetários e relatório
  de diferenças.

### Planejamento assistido por IA

- Solicitações em linguagem natural convertidas em planos estruturados pelo
  Groq.
- Planos validados com Zod antes de entrarem no fluxo do cliente.
- Contexto enviado à IA reduzido a metadados e amostras sanitizadas, nunca ao
  arquivo original completo.
- Ferramentas manuais continuam disponíveis sem uma chave do Groq configurada.

### Exportação segura

- Exportação do resultado transformado em CSV ou XLSX.
- Neutralização de células que começam com `=`, `+`, `-` ou `@`, reduzindo o
  risco de CSV formula injection ao abrir o arquivo em planilhas.

## Arquitetura

```text
Navegador
  |
  |-- Upload -> Parser CSV/XLSX -> Dataset normalizado
  |                                  |
  |                                  +-> profiler / Data Health Score
  |                                  +-> limpeza / comparação / reconciliação
  |                                  +-> preview / aplicação / desfazer
  |                                  +-> exportação CSV/XLSX
  |
  +-- Painel de IA -> /api/ai/plan -> Groq
                           |
                           +-> contexto sanitizado
                           +-> plano validado com Zod
```

O projeto separa a orquestração da interface da lógica de domínio:

```text
src/
  app/                  Rotas Next.js e telas da aplicação
  components/ui/        Primitivas reutilizáveis de interface
  components/workspace Componentes do fluxo de trabalho
  config/               Limites do sistema e configuração de IA
  lib/ai/               Prompts, planejamento e sanitização de contexto
  lib/compare/          Algoritmos de comparação de datasets
  lib/export/           Exportação CSV/XLSX e sanitização de fórmulas
  lib/merge/            Consolidação de datasets
  lib/profiler/         Inferência de tipos e detecção de problemas
  lib/quality/          Cálculo de qualidade dos dados
  lib/reconcile/        Parsing monetário e reconciliação
  lib/spreadsheet/      Parsing e normalização de planilhas
  lib/transformations/  Operações determinísticas de limpeza
  lib/validation/       Validadores de domínio
  schemas/              Contratos de operações com Zod
  types/                Tipos compartilhados do domínio
e2e/                    Testes de navegador com Playwright
```

## Stack tecnológica

| Área | Tecnologia |
| --- | --- |
| Aplicação | Next.js 16 App Router, React 19 e TypeScript strict |
| Interface | Tailwind CSS v4, Radix UI e Lucide |
| Planilhas | ExcelJS e Papa Parse |
| Inteligência artificial | Groq SDK com rota server-side |
| Validação | Zod e módulos de validação de domínio |
| Testes unitários | Vitest, Testing Library e jsdom |
| Testes E2E | Playwright com Chromium |
| Qualidade | ESLint, TypeScript e build de produção |

## Como executar

### Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Chave da API Groq somente se o planejamento por IA for utilizado

### Instalação e desenvolvimento

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Configuração opcional da IA

Copie `.env.example` para `.env.local` e informe a chave exclusivamente no
servidor:

```env
GROQ_API_KEY=sua_chave_groq
# GROQ_MODEL=llama-3.3-70b-versatile
```

Nunca utilize o prefixo `NEXT_PUBLIC_` nessa chave. Sem ela, todas as operações
locais continuam disponíveis; somente o planejamento por IA fica desabilitado.

## Scripts disponíveis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Executa o ESLint |
| `npm run typecheck` | Executa o TypeScript sem gerar arquivos |
| `npm test` | Executa os testes unitários com Vitest |
| `npm run test:e2e` | Executa os testes de navegador com Playwright |

## Qualidade e testes

O projeto possui gates automatizados para reduzir regressões:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Estado atual validado:

- **107 testes unitários aprovados** em 17 arquivos.
- **6 testes E2E aprovados** com Playwright.
- Build de produção verificado com Next.js 16.3.5.
- TypeScript strict e ESLint aprovados.

## Segurança e privacidade

- Arquivos de origem são lidos no navegador e não são persistidos pela aplicação.
- Somente a solicitação de planejamento por IA atravessa a fronteira do servidor.
- O contexto da IA é reduzido a metadados e amostras sanitizadas.
- A chave do Groq é acessada apenas por código server-side.
- Planos de operações são validados por schema antes da execução.
- Valores exportados para CSV são protegidos contra injeção de fórmulas.
- Tamanho de arquivo e dimensões do dataset são limitados antes do processamento.

## Deploy

A aplicação pode ser publicada na Vercel ou em qualquer plataforma compatível
com Next.js. Para habilitar o planejamento por IA em produção, configure
`GROQ_API_KEY` como variável de ambiente server-side. O fluxo local de
planilhas não precisa de banco de dados nem de armazenamento de arquivos.

## Status do projeto

Este é um projeto de portfólio funcional que demonstra um fluxo completo de
produto de dados: modelagem de domínio tipada, processamento de arquivos no
navegador, transformações determinísticas, integração segura com IA, interface
acessível e gates automatizados de qualidade.

## Licença

Este projeto é privado e destinado a portfólio e demonstração técnica.
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
