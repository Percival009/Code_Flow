export type CodeFile = {
  path: string
  content: string
}

const ALLOWED_EXTENSIONS = new Set([".js", ".ts", ".py"])

function getExtensionLower(path: string) {
  const idx = path.lastIndexOf(".")
  return idx === -1 ? "" : path.slice(idx).toLowerCase()
}

export function isAllowedCodeFileName(path: string) {
  return ALLOWED_EXTENSIONS.has(getExtensionLower(path))
}

export async function readSelectedCodeFiles(files: File[]) {
  const codeFiles = files
    .filter((f) => isAllowedCodeFileName(f.name))
    .map(async (f) => {
      const anyFile = f as File & { webkitRelativePath?: string }
      const path = anyFile.webkitRelativePath?.trim() || f.name
      const content = await f.text()
      return { path, content } satisfies CodeFile
    })

  return Promise.all(codeFiles)
}

