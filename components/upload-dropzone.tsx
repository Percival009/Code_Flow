"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Upload, FolderGit2, FileCode2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadDropzoneProps {
  onFilesSelect: (files: File[]) => void
  isAnalyzing?: boolean
  error?: string | null
}

export function UploadDropzone({
  onFilesSelect,
  isAnalyzing,
  error,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const busy = isUploading || Boolean(isAnalyzing)

  const allowedLabel = useMemo(() => "Supports .js, .ts, .py", [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const dropped = Array.from(e.dataTransfer.files || [])
      if (dropped.length > 0) {
        setIsUploading(true)
        setTimeout(() => {
          onFilesSelect(dropped)
          setIsUploading(false)
        }, 800)
      }
    },
    [onFilesSelect]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        setIsUploading(true)
        setTimeout(() => {
          onFilesSelect(files)
          setIsUploading(false)
        }, 800)
      }
    },
    [onFilesSelect]
  )

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Upload Repository
          </h2>
          <p className="text-muted-foreground">
            Drag and drop your code files to generate interactive flowcharts
          </p>
        </div>

        {/* Dropzone */}
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
            busy && "pointer-events-none"
          )}
          onClick={(e) => {
            e.preventDefault()
            fileInputRef.current?.click()
          }}
        >
          <input
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept=".js,.ts,.py"
            multiple
            ref={fileInputRef}
          />
          <input
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept=".js,.ts,.py"
            multiple
            ref={folderInputRef}
            {...({
              webkitdirectory: "",
              directory: "",
            } as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
          />

          {busy ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isAnalyzing ? "Analyzing with Gemini..." : "Processing..."}
              </p>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                  isDragging
                    ? "bg-primary/20 scale-110"
                    : "bg-muted"
                )}
              >
                <Upload
                  className={cn(
                    "w-8 h-8 transition-colors",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragging
                  ? "Drop to analyze"
                  : "Click to browse or drag files here"}
              </p>
              <p className="text-xs text-muted-foreground">
                {allowedLabel}
              </p>
            </>
          )}

          {/* Decorative corner accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-border/50 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-border/50 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-border/50 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-border/50 rounded-br-lg" />
        </label>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group disabled:opacity-50 disabled:pointer-events-none"
            disabled={busy}
            onClick={() => folderInputRef.current?.click()}
            type="button"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FolderGit2 className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                Select Folder
              </p>
              <p className="text-xs text-muted-foreground">
                Analyze a directory
              </p>
            </div>
          </button>
          <button
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group disabled:opacity-50 disabled:pointer-events-none"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center group-hover:bg-chart-2/20 transition-colors">
              <FileCode2 className="w-5 h-5 text-chart-2" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                Select Files
              </p>
              <p className="text-xs text-muted-foreground">
                Analyze one or more files
              </p>
            </div>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
