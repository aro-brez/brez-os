import Papa from "papaparse";
import {
  WeeklySpendRow,
  WeeklyRetailVelocityRow,
  WeeklyProductionCashRow,
  WeeklyCashSnapshotRow,
  WeeklyWholesaleOrdersRow,
  SKUCatalogRow,
} from "./types";

export type CSVType =
  | "weeklySpend"
  | "weeklyRetailVelocity"
  | "weeklyProductionCash"
  | "weeklyCashSnapshot"
  | "weeklyWholesaleOrders"
  | "skuCatalog";

interface ParseResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

/**
 * Parse CSV file content and return typed data
 */
export function parseCSV<T>(
  content: string,
  expectedColumns: string[]
): ParseResult<T> {
  return new Promise<ParseResult<T>>((resolve) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        // Validate columns
        const headers = results.meta.fields || [];
        const missingColumns = expectedColumns.filter(
          (col) => !headers.includes(col)
        );

        if (missingColumns.length > 0) {
          resolve({
            success: false,
            error: `Missing required columns: ${missingColumns.join(", ")}`,
          });
          return;
        }

        resolve({
          success: true,
          data: results.data as T[],
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          error: error.message,
        });
      },
    });
  }) as unknown as ParseResult<T>;
}

/**
 * Parse weekly spend CSV
 */
export async function parseWeeklySpendCSV(
  content: string
): Promise<ParseResult<WeeklySpendRow>> {
  return new Promise((resolve) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const required = ["week_start", "spend_total"];
        const missing = required.filter((col) => !headers.includes(col));

        if (missing.length > 0) {
          resolve({
            success: false,
            error: `Missing required columns: ${missing.join(", ")}`,
          });
          return;
        }

        resolve({
          success: true,
          data: results.data as WeeklySpendRow[],
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          error: error.message,
        });
      },
    });
  });
}

/**
 * Parse weekly retail velocity CSV
 */
export async function parseWeeklyRetailVelocityCSV(
  content: string
): Promise<ParseResult<WeeklyRetailVelocityRow>> {
  return new Promise((resolve) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const required = ["week_start", "retail_revenue", "units", "doors"];
        const missing = required.filter((col) => !headers.includes(col));

        if (missing.length > 0) {
          resolve({
            success: false,
            error: `Missing required columns: ${missing.join(", ")}`,
          });
          return;
        }

        resolve({
          success: true,
          data: results.data as WeeklyRetailVelocityRow[],
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          error: error.message,
        });
      },
    });
  });
}

/**
 * Parse weekly production cash CSV
 */
export async function parseWeeklyProductionCashCSV(
  content: string
): Promise<ParseResult<WeeklyProductionCashRow>> {
  return new Promise((resolve) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const required = ["week_start", "production_cash_due"];
        const missing = required.filter((col) => !headers.includes(col));

        if (missing.length > 0) {
          resolve({
            success: false,
            error: `Missing required columns: ${missing.join(", ")}`,
          });
          return;
        }

        resolve({
          success: true,
          data: results.data as WeeklyProductionCashRow[],
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          error: error.message,
        });
      },
    });
  });
}

/**
 * Parse weekly cash snapshot CSV
 */
export async function parseWeeklyCashSnapshotCSV(
  content: string
): Promise<ParseResult<WeeklyCashSnapshotRow>> {
  return new Promise((resolve) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const required = [
          "week_start",
          "cash_on_hand",
          "ap_due_next_2w",
          "ar_expected_next_2w",
        ];
        const missing = required.filter((col) => !headers.includes(col));

        if (missing.length > 0) {
          resolve({
            success: false,
            error: `Missing required columns: ${missing.join(", ")}`,
          });
          return;
        }

        resolve({
          success: true,
          data: results.data as WeeklyCashSnapshotRow[],
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          error: error.message,
        });
      },
    });
  });
}

/**
 * Parse weekly wholesale orders CSV
 */
export async function parseWeeklyWholesaleOrdersCSV(
  content: string
): Promise<ParseResult<WeeklyWholesaleOrdersRow>> {
  return new Promise((resolve) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const required = ["week_start", "wholesale_orders", "wholesale_revenue"];
        const missing = required.filter((col) => !headers.includes(col));

        if (missing.length > 0) {
          resolve({
            success: false,
            error: `Missing required columns: ${missing.join(", ")}`,
          });
          return;
        }

        resolve({
          success: true,
          data: results.data as WeeklyWholesaleOrdersRow[],
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          error: error.message,
        });
      },
    });
  });
}

/**
 * Parse SKU catalog CSV
 */
export async function parseSKUCatalogCSV(
  content: string
): Promise<ParseResult<SKUCatalogRow>> {
  return new Promise((resolve) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const required = ["item_name", "units_per_case"];
        const missing = required.filter((col) => !headers.includes(col));

        if (missing.length > 0) {
          resolve({
            success: false,
            error: `Missing required columns: ${missing.join(", ")}`,
          });
          return;
        }

        resolve({
          success: true,
          data: results.data as SKUCatalogRow[],
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          error: error.message,
        });
      },
    });
  });
}

/**
 * Parse CSV file based on type
 */
export async function parseCSVByType(
  content: string,
  type: CSVType
): Promise<ParseResult<unknown>> {
  switch (type) {
    case "weeklySpend":
      return parseWeeklySpendCSV(content);
    case "weeklyRetailVelocity":
      return parseWeeklyRetailVelocityCSV(content);
    case "weeklyProductionCash":
      return parseWeeklyProductionCashCSV(content);
    case "weeklyCashSnapshot":
      return parseWeeklyCashSnapshotCSV(content);
    case "weeklyWholesaleOrders":
      return parseWeeklyWholesaleOrdersCSV(content);
    case "skuCatalog":
      return parseSKUCatalogCSV(content);
    default:
      return { success: false, error: "Unknown CSV type" };
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
