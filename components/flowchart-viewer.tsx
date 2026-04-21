"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  RefreshCw,
  FileCode2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FlowchartViewerProps {
  fileName: string
  chart: string
  onReset: () => void
}

export function FlowchartViewer({ fileName, chart, onReset }: FlowchartViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(100)
  const [isRendered, setIsRendered] = useState(false)
  const [lastSvg, setLastSvg] = useState<string | null>(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#1a1a2e",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#4ade80",
        lineColor: "#4ade80",
        secondaryColor: "#2a2a4e",
        tertiaryColor: "#1a1a2e",
        background: "#0a0a14",
        mainBkg: "#1a1a2e",
        secondBkg: "#2a2a4e",
        fontFamily: "Geist, sans-serif",
      },
      flowchart: {
        htmlLabels: true,
        curve: "basis",
        padding: 20,
      },
    })
  }, [])

  useEffect(() => {
    const renderChart = async () => {
      if (containerRef.current) {
        setIsRendered(false)
        containerRef.current.innerHTML = ""
        const id = `mermaid-${Date.now()}`
        try {
          const { svg } = await mermaid.render(id, chart)
          if (containerRef.current) {
            containerRef.current.innerHTML = svg
            setIsRendered(true)
            setLastSvg(svg)
          }
        } catch {
          if (containerRef.current) {
            containerRef.current.innerHTML = `<p class="text-destructive">Error rendering flowchart</p>`
          }
        }
      }
    }
    renderChart()
  }, [chart])

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 40))
  const handleResetZoom = () => setZoom(100)

  const handleDownloadSvg = () => {
    if (!lastSvg) return
    const blob = new Blob([lastSvg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName || "flowchart"}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {fileName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-background transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="w-12 text-center text-xs font-medium text-foreground">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-background transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <button
            onClick={handleResetZoom}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            title="Fit to screen"
          >
            <Maximize2 className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            title="Export SVG"
            onClick={handleDownloadSvg}
            disabled={!lastSvg}
          >
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            New File
          </button>
        </div>
      </div>

      {/* Flowchart canvas */}
      <div className="flex-1 overflow-auto bg-background p-8">
        <div
          className="min-h-full flex items-center justify-center"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center center",
          }}
        >
          <div
            ref={containerRef}
            className={cn(
              "transition-opacity duration-300",
              isRendered ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 py-2 border-t border-border bg-card/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Type:{" "}
            <span className="text-foreground font-medium">
              {"TD"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </div>
  )
}
