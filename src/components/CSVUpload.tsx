"use client";

import { useRef } from "react";
import {
  parseWeeklySpendCSV,
  parseWeeklyRetailVelocityCSV,
  parseWeeklyProductionCashCSV,
  parseWeeklyCashSnapshotCSV,
  parseWeeklyWholesaleOrdersCSV,
  parseSKUCatalogCSV,
  readFileAsText,
} from "@/lib/csv-parser";
import { CSVData } from "@/lib/types";

interface CSVUploadProps {
  csvData: CSVData;
  onUpdate: (csvData: CSVData) => void;
}

export function CSVUpload({ csvData, onUpdate }: CSVUploadProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#8533fc]/20 flex items-center justify-center text-sm shadow-md">
          📁
        </span>
        <div>
          <h3 className="text-sm font-bold text-white">Data Uploads</h3>
          <p className="text-xs text-[#676986]">Import CSV files to override inputs</p>
        </div>
      </div>

      <div className="space-y-2">
        <UploadRow
          label="Weekly Spend"
          icon="💸"
          hasData={!!csvData.weeklySpend?.length}
          count={csvData.weeklySpend?.length}
          onUpload={async (file) => {
            const content = await readFileAsText(file);
            const result = await parseWeeklySpendCSV(content);
            if (result.success && result.data) {
              onUpdate({ ...csvData, weeklySpend: result.data });
            } else {
              alert(result.error || "Failed to parse CSV");
            }
          }}
          onClear={() => onUpdate({ ...csvData, weeklySpend: undefined })}
        />

        <UploadRow
          label="Retail Velocity"
          icon="🏪"
          hasData={!!csvData.weeklyRetailVelocity?.length}
          count={csvData.weeklyRetailVelocity?.length}
          onUpload={async (file) => {
            const content = await readFileAsText(file);
            const result = await parseWeeklyRetailVelocityCSV(content);
            if (result.success && result.data) {
              onUpdate({ ...csvData, weeklyRetailVelocity: result.data });
            } else {
              alert(result.error || "Failed to parse CSV");
            }
          }}
          onClear={() =>
            onUpdate({ ...csvData, weeklyRetailVelocity: undefined })
          }
        />

        <UploadRow
          label="Production Cash"
          icon="🏭"
          hasData={!!csvData.weeklyProductionCash?.length}
          count={csvData.weeklyProductionCash?.length}
          onUpload={async (file) => {
            const content = await readFileAsText(file);
            const result = await parseWeeklyProductionCashCSV(content);
            if (result.success && result.data) {
              onUpdate({ ...csvData, weeklyProductionCash: result.data });
            } else {
              alert(result.error || "Failed to parse CSV");
            }
          }}
          onClear={() =>
            onUpdate({ ...csvData, weeklyProductionCash: undefined })
          }
        />

        <UploadRow
          label="Cash Snapshot"
          icon="📸"
          hasData={!!csvData.weeklyCashSnapshot?.length}
          count={csvData.weeklyCashSnapshot?.length}
          onUpload={async (file) => {
            const content = await readFileAsText(file);
            const result = await parseWeeklyCashSnapshotCSV(content);
            if (result.success && result.data) {
              onUpdate({ ...csvData, weeklyCashSnapshot: result.data });
            } else {
              alert(result.error || "Failed to parse CSV");
            }
          }}
          onClear={() => onUpdate({ ...csvData, weeklyCashSnapshot: undefined })}
        />

        <UploadRow
          label="Wholesale Orders"
          icon="📦"
          hasData={!!csvData.weeklyWholesaleOrders?.length}
          count={csvData.weeklyWholesaleOrders?.length}
          onUpload={async (file) => {
            const content = await readFileAsText(file);
            const result = await parseWeeklyWholesaleOrdersCSV(content);
            if (result.success && result.data) {
              onUpdate({ ...csvData, weeklyWholesaleOrders: result.data });
            } else {
              alert(result.error || "Failed to parse CSV");
            }
          }}
          onClear={() => onUpdate({ ...csvData, weeklyWholesaleOrders: undefined })}
        />

        <UploadRow
          label="SKU Catalog"
          icon="🏷️"
          hasData={!!csvData.skuCatalog?.length}
          count={csvData.skuCatalog?.length}
          onUpload={async (file) => {
            const content = await readFileAsText(file);
            const result = await parseSKUCatalogCSV(content);
            if (result.success && result.data) {
              onUpdate({ ...csvData, skuCatalog: result.data });
            } else {
              alert(result.error || "Failed to parse CSV");
            }
          }}
          onClear={() => onUpdate({ ...csvData, skuCatalog: undefined })}
        />
      </div>
    </div>
  );
}

function UploadRow({
  label,
  icon,
  hasData,
  count,
  onUpload,
  onClear,
}: {
  label: string;
  icon: string;
  hasData: boolean;
  count?: number;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        hasData
          ? "bg-[#6BCB77]/10 border-[#6BCB77]/30"
          : "bg-[#242445]/50 border-white/5 hover:border-[#e3f98a]/30"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-white">{label}</span>
        {hasData && (
          <span className="text-xs font-semibold text-[#6BCB77] bg-[#6BCB77]/20 px-2 py-0.5 rounded-full">
            {count} rows
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file);
              e.target.value = "";
            }
          }}
        />
        {hasData ? (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium bg-[#0D0D2A] border border-white/10 rounded-lg text-[#a8a8a8] hover:border-[#e3f98a]/50 transition-all"
            >
              Replace
            </button>
            <button
              onClick={onClear}
              className="px-3 py-1.5 text-xs font-medium text-[#ff6b6b] hover:bg-[#ff6b6b]/10 rounded-lg transition-all"
            >
              Clear
            </button>
          </>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-1.5 text-xs font-semibold bg-[#e3f98a] text-[#0D0D2A] rounded-lg shadow-md shadow-[#e3f98a]/20 hover:shadow-lg hover:shadow-[#e3f98a]/30 transition-all"
          >
            Upload
          </button>
        )}
      </div>
    </div>
  );
}
