"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { UploadDropzone } from "@/components/upload-dropzone"
import { FlowchartViewer } from "@/components/flowchart-viewer"
import { readSelectedCodeFiles } from "@/lib/read-code-files"
import {
  Activity,
  Clock,
  TrendingUp,
  FileCode,
  Folder,
  ChevronRight,
  GitBranch,
} from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("flowcharts")
  const [selectionLabel, setSelectionLabel] = useState<string | null>(null)
  const [mermaidChart, setMermaidChart] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFilesSelect = async (files: File[]) => {
    setError(null)
    setIsAnalyzing(true)
    setMermaidChart(null)

    try {
      const codeFiles = await readSelectedCodeFiles(files)
      if (codeFiles.length === 0) {
        throw new Error("No .js, .ts, or .py files were selected.")
      }

      const label =
        codeFiles.length === 1
          ? codeFiles[0].path
          : `${codeFiles.length} files`
      setSelectionLabel(label)

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: codeFiles }),
      })

      const data = (await res.json()) as
        | { mermaid: string }
        | { error: string }

      if (!res.ok) {
        const msg = "error" in data ? data.error : "Analyze request failed"
        throw new Error(msg)
      }

      if (!("mermaid" in data) || !data.mermaid?.trim()) {
        throw new Error("No Mermaid output returned.")
      }

      setMermaidChart(data.mermaid)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analyze failed")
      setSelectionLabel(null)
      setMermaidChart(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectionLabel(null)
    setMermaidChart(null)
    setError(null)
    setIsAnalyzing(false)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Workspace</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium capitalize">
              {activeTab === "overview"
                ? "Project Overview"
                : activeTab === "explorer"
                ? "File Explorer"
                : "Flowcharts"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground">
              <Activity className="w-3 h-3 text-primary" />
              <span>System Online</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">JD</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "overview" && <ProjectOverview />}
          {activeTab === "explorer" && <FileExplorer />}
          {activeTab === "flowcharts" && (
            <>
              {mermaidChart ? (
                <FlowchartViewer
                  fileName={selectionLabel ?? "Selection"}
                  chart={mermaidChart}
                  onReset={handleReset}
                />
              ) : (
                <UploadDropzone
                  onFilesSelect={handleFilesSelect}
                  isAnalyzing={isAnalyzing}
                  error={error}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function ProjectOverview() {
  const stats = [
    { label: "Total Files", value: "247", icon: FileCode, trend: "+12" },
    { label: "Functions", value: "1,832", icon: GitBranch, trend: "+45" },
    { label: "Lines of Code", value: "48.2K", icon: TrendingUp, trend: "+2.1K" },
    { label: "Last Updated", value: "2m ago", icon: Clock, trend: null },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Project Overview
        </h2>
        <p className="text-muted-foreground">
          Analyze your codebase structure and dependencies at a glance
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                {stat.trend && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold text-foreground mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { file: "auth.controller.ts", action: "Flowchart generated", time: "2m ago" },
              { file: "user.service.ts", action: "Dependencies mapped", time: "15m ago" },
              { file: "api/routes.ts", action: "Complexity analyzed", time: "1h ago" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileCode className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.file}</p>
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Code Complexity
          </h3>
          <div className="space-y-4">
            {[
              { label: "Low Complexity", value: 68, color: "bg-primary" },
              { label: "Medium Complexity", value: 24, color: "bg-chart-2" },
              { label: "High Complexity", value: 8, color: "bg-chart-4" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FileExplorer() {
  const files = [
    { name: "src", type: "folder", children: 12 },
    { name: "components", type: "folder", children: 24 },
    { name: "lib", type: "folder", children: 8 },
    { name: "app", type: "folder", children: 15 },
    { name: "package.json", type: "file" },
    { name: "tsconfig.json", type: "file" },
    { name: "README.md", type: "file" },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          File Explorer
        </h2>
        <p className="text-muted-foreground">
          Browse and select files to generate flowcharts
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Folder className="w-4 h-4" />
              <span>my-project</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {files.map((file) => (
              <button
                key={file.name}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
              >
                {file.type === "folder" ? (
                  <Folder className="w-4 h-4 text-chart-2" />
                ) : (
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors">
                  {file.name}
                </span>
                {file.children && (
                  <span className="text-xs text-muted-foreground">
                    {file.children} items
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
