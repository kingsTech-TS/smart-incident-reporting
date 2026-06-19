"use client";
import React from "react";
import { Search, Bell, Settings, Menu } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useSidebar } from "./DashboardLayout";

const TopBar = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <header className="flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 bg-[#050816]/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-10">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search incidents, users, or reports..."
          className="pl-10 bg-slate-900/50 border-slate-700 focus:border-cyan-500 rounded-full h-11"
        />
      </div>
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Settings className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-700">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-slate-400">System Online</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
