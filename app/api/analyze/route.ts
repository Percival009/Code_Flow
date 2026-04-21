import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type AnalyzeRequestBody = {
  files: Array<{
    path: string
    content: string
  }>
}

function cleanupMermaid(raw: string) {
  // Remove common markdown wrappers / accidental tokens.
  let s = raw.trim()
  s = s.replace(/```+/g, "")
  s = s.replace(/\bmermaid\b/gi, "")
  s = s.trim()

  // Ensure output starts exactly with `graph TD`.
  const graphTd = /graph\s+TD\b/i.exec(s)
  if (graphTd?.index !== undefined) {
    s = s.slice(graphTd.index).replace(/graph\s+TD\b/i, "graph TD").trim()
    return s
  }

  // Some models may emit `flowchart TD`; normalize it.
  const flowchartTd = /flowchart\s+TD\b/i.exec(s)
  if (flowchartTd?.index !== undefined) {
    s = s
      .slice(flowchartTd.index)
      .replace(/flowchart\s+TD\b/i, "graph TD")
      .trim()
    return s
  }

  return `graph TD\n${s}`.trim()
}

export async function POST(req: Request) {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY" },
      { status: 500 }
    )
  }

  let body: AnalyzeRequestBody
  try {
    body = (await req.json()) as AnalyzeRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const files = Array.isArray(body?.files) ? body.files : []
  if (files.length === 0) {
    return NextResponse.json(
      { error: "No files provided" },
      { status: 400 }
    )
  }

  const combined = files
    .map((f) => `// FILE: ${f.path}\n${f.content}\n`)
    .join("\n")

  // Keep prompt size sane to avoid large payloads.
  const maxChars = 160_000
  const codePayload =
    combined.length > maxChars ? combined.slice(0, maxChars) : combined

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel(
    { model: "gemini-3-flash-preview" },
    { apiVersion: "v1beta" }
  )

  const prompt = [
    "Return ONLY the raw mermaid code. DO NOT include ```mermaid or any other markdown formatting.",
    "Make sure the flowchart starts exactly with: graph TD",
    "Then output the rest of the Mermaid graph.",
    "",
    "CODE:",
    codePayload,
  ].join("\n")

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const mermaid = cleanupMermaid(text)
    return NextResponse.json({ mermaid })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

