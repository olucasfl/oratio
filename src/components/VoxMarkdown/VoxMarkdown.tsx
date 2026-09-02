import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import styles from "./VoxMarkdown.module.css"

interface Props {
  children: string
}

/*
Renderiza uma resposta do Vox em Markdown com os mesmos overrides de
parágrafo / lista / blockquote usados no chat. Extraído do Vox.tsx para ser
reusado nos exemplos de cada perfil (VoxProfileDetailsModal).
*/
export default function VoxMarkdown({ children }: Props) {
  return (
    <div className={styles.content}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return <p className={styles.paragraph}>{children}</p>
          },
          ul({ children }) {
            return <ul className={styles.list}>{children}</ul>
          },
          ol({ children }) {
            return <ol className={styles.list}>{children}</ol>
          },
          li({ children }) {
            return <li className={styles.listItem}>{children}</li>
          },
          blockquote({ children }) {
            return <blockquote className={styles.quote}>{children}</blockquote>
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
