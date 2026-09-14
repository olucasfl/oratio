import type { ReactNode } from "react"

/*
 Modelo de bloco para os dois documentos legais (Termos de Uso, Política de
 Privacidade — spec consentimento-privacidade.md). O texto vem de
 docs/legal/2026-09-11-*.md (real, aprovado por Lucas), transcrito aqui em
 blocos porque o componente É a fonte em produção (não há fetch nem parser
 de Markdown em runtime).

 NUNCA dangerouslySetInnerHTML (RULES.md §4 — já houve stored-XSS real por
 esse caminho, e este projeto não tem DOMPurify). `renderInline` segue o
 mesmo espírito de `formatVerses()` (LiturgiaFull.tsx): array de strings e
 elementos React construídos por código, nunca uma string HTML.
*/
export type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }

/*
 Suporte só a **negrito** (o único marcador inline usado nos dois
 documentos-fonte). Não é um parser de Markdown genérico de propósito — o
 conteúdo é fixo e conhecido, não input de usuário.
*/
export function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export function renderLegalBlocks(blocks: LegalBlock[]): ReactNode {
  return blocks.map((block, i) => {
    switch (block.type) {

      case "h2":
        return <h2 key={i}>{renderInline(block.text)}</h2>

      case "h3":
        return <h3 key={i}>{renderInline(block.text)}</h3>

      case "p":
        return <p key={i}>{renderInline(block.text)}</p>

      case "ul":
        return (
          <ul key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ul>
        )

      case "quote":
        return <blockquote key={i}>{renderInline(block.text)}</blockquote>

      case "table":
        return (
          <div key={i} style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {block.headers.map((h, j) => (
                    <th key={j}>{renderInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, j) => (
                  <tr key={j}>
                    {row.map((cell, k) => (
                      <td key={k}>{renderInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

    }
  })
}
