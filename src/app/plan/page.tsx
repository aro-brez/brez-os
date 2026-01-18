"use client";
import { Suspense } from "react";

function PlanContent() {
  return (
    <div className="min-h-screen bg-[#0D0D2A] p-6">
      <h1 className="text-2xl text-white mb-4">Plan</h1>
      <p className="text-purple-300/60">Planning features coming soon.</p>
    </div>
  );
}

export default function PlanPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#0D0D2A]" />}><PlanContent /></Suspense>;
}
