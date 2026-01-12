import { Inputs, CSVData, AppState } from "./types";

const STORAGE_KEY = "brez-growth-generator-state";

export interface StoredState {
  actualsInputs: Inputs;
  scenarioInputs: Inputs;
  csvData: CSVData;
  retailAlphaMode: "sellThroughProxy" | "sellInScaled";
  lastUpdated: string;
}

/**
 * Save app state to localStorage
 */
export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;

  const stored: StoredState = {
    ...state,
    lastUpdated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
  }
}

/**
 * Load app state from localStorage
 */
export function loadState(): StoredState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StoredState;
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
    return null;
  }
}

/**
 * Clear stored state
 */
export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if state exists
 */
export function hasStoredState(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}
