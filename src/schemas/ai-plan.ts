/**
 * Zod schemas for the AI planning API.
 *
 * These validate the request body and the Groq response. Every Groq response
 * MUST pass through `operationPlanSchema` before any operation is executed.
 */

import { z } from "zod";
import { operationSchema } from "./operations";

/** A minimized, sanitized column profile sent to the AI. */
export const aiColumnProfileSchema = z.object({
  columnId: z.string().min(1),
  name: z.string().min(1),
  inferredType: z.enum([
    "string",
    "number",
    "date",
    "boolean",
    "email",
    "phone",
    "document",
    "unknown",
  ]),
  nonEmpty: z.number().int().min(0),
  empty: z.number().int().min(0),
  unique: z.number().int().min(0),
});

/** A minimized, sanitized dataset profile sent to the AI. */
export const aiDatasetProfileSchema = z.object({
  datasetId: z.string().min(1),
  name: z.string().min(1),
  rowCount: z.number().int().min(0),
  columnCount: z.number().int().min(0),
  columns: z.array(aiColumnProfileSchema).max(100),
});

/** The request body for `POST /api/ai/plan`. */
export const aiPlanRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  datasets: z.array(aiDatasetProfileSchema).min(1).max(10),
});

/** The validated operation plan returned by Groq. */
export const operationPlanSchema = z.object({
  version: z.literal(1),
  summary: z.string().min(1).max(2000),
  operations: z.array(operationSchema).max(20),
  warnings: z.array(z.string().max(500)).max(50),
});

export type AiPlanRequest = z.infer<typeof aiPlanRequestSchema>;
export type AiDatasetProfile = z.infer<typeof aiDatasetProfileSchema>;
export type OperationPlanSchema = z.infer<typeof operationPlanSchema>;