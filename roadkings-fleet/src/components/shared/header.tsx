"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground -mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across fleet..."
            className="w-64 pl-9 h-9 rounded-lg bg-muted/50 border-0 text-sm"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary text-[10px] text-white rounded-full flex items-center justify-center font-bold">
            3
          </span>
        </Button>
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
