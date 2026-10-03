import styles from "./Icon.module.css"

interface Props {
  /** Nome do ícone no Material Symbols Rounded (fonts.google.com/icons). */
  name: string
  /** Tamanho em px (a fonte escala junto). */
  size?: number
  /** Versão preenchida do ícone (eixo FILL da fonte variável). */
  filled?: boolean
  className?: string
  /** Se informado, o ícone é lido por leitor de tela; senão é decorativo. */
  label?: string
}

/*
 Ícones do Google (Material Symbols Rounded), carregados em `index.html` como
 um SUBCONJUNTO da fonte (`icon_names=...`): só os glifos usados entram no
 download. Ao usar um ícone novo, some o nome em `iconNames.ts` E na URL do
 `index.html` — o teste `Icon.test.ts` falha se os dois divergirem.

 O CSP já libera `fonts.googleapis.com` / `fonts.gstatic.com` (as fontes
 Cinzel/Cormorant vêm de lá), e o service worker deixa terceiros passarem
 direto — nenhuma mudança de infra.
*/
export default function Icon({ name, size = 24, filled = false, className, label }: Props) {
  const cls = [styles.icon, filled ? styles.filled : "", className ?? ""].filter(Boolean).join(" ")
  return (
    <span
      className={cls}
      style={{ fontSize: size, width: size, height: size }}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {name}
    </span>
  )
}
