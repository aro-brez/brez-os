"use client";
import { Suspense } from "react";

function TasksContent() {
  return (
    <div className="min-h-screen bg-[#0D0D2A] p-6">
      <h1 className="text-2xl text-white mb-4">Tasks</h1>
      <p className="text-purple-300/60">Task management coming soon.</p>
    </div>
  );
}

export default function TasksPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#0D0D2A]" />}><TasksContent /></Suspense>;
}
