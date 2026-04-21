export const LANGUAGES = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "php", label: "PHP" },
  { id: "sql", label: "SQL" },
  { id: "ruby", label: "Ruby" },
  { id: "kotlin", label: "Kotlin" },
  { id: "swift", label: "Swift" },
  { id: "cpp", label: "C++" },
  { id: "html", label: "HTML/CSS" },
] as const;

export const MODES = [
  { id: "chat", label: "Conversar" },
  { id: "generate", label: "Gerar" },
  { id: "explain", label: "Explicar" },
  { id: "refactor", label: "Refatorar" },
  { id: "fix", label: "Corrigir bug" },
] as const;