"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  FolderTree,
  GitBranch,
  ChevronRight,
  Settings,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  {
    id: "overview",
    label: "Project Overview",
    icon: LayoutDashboard,
  },
  {
    id: "explorer",
    label: "File Explorer",
    icon: FolderTree,
  },
  {
    id: "flowcharts",
    label: "Flowcharts",
    icon: GitBranch,
  },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isHovered, setIsHovered] = useState<string | null>(null)

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground tracking-tight">
              CodeFlow
            </h1>
            <p className="text-xs text-muted-foreground">v2.4.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Workspace
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  onMouseEnter={() => setIsHovered(item.id)}
                  onMouseLeave={() => setIsHovered(null)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-primary" : ""
                    )}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-all duration-200",
                      isActive || isHovered === item.id
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2"
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  )
}
