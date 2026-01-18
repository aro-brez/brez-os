"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, BarChart3, CheckSquare, Settings } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Hide nav on OWL page for full immersion
  const isOwlPage = pathname === "/owl";
  
  if (isOwlPage) {
    return <>{children}</>;
  }

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: BarChart3, path: "/growth", label: "Growth" },
    { icon: CheckSquare, path: "/tasks", label: "Tasks" },
    { icon: Settings, path: "/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D2A] pb-20">
      {children}
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D0D2A]/95 backdrop-blur-lg border-t border-purple-500/10 px-4 py-2 z-50">
        <div className="flex items-center justify-around max-w-lg mx-auto relative">
          {navItems.slice(0, 2).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center p-2 ${pathname === item.path ? "text-purple-400" : "text-purple-300/40"}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          ))}
          
          {/* Center OWL Button */}
          <button
            onClick={() => router.push("/owl")}
            className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 border-4 border-[#0D0D2A]"
          >
            <span className="text-2xl">🦉</span>
          </button>
          
          {navItems.slice(2).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center p-2 ${pathname === item.path ? "text-purple-400" : "text-purple-300/40"}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default AppShell;
