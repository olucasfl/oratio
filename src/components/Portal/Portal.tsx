import type { ReactNode } from "react"
import { createPortal } from "react-dom"

/*
Renderiza os filhos num nó fora do #root (#overlay-root no index.html,
com fallback pro document.body). É onde TODO overlay position:fixed do
app deve viver — navbar, composer do Vox, modais, sheets, drawers,
banners.

Por quê: qualquer ancestral com transform, filter, perspective, zoom,
backdrop-filter, contain:paint/layout ou will-change:transform vira
"containing block" dos descendentes position:fixed. Aí bottom:0 deixa de
significar "rodapé da tela" e passa a significar "rodapé daquele
ancestral" — foi a causa-raiz da navbar voando e do input do Vox
flutuando (ver o comentário em global.css sobre .page-enter). Vivendo
fora do #root, o overlay é sempre relativo à viewport de verdade.

App client-only (Vite SPA), então o document sempre existe no render —
o mesmo padrão que BottomNavbar já usava com createPortal direto.
*/

let cachedRoot: HTMLElement | null = null

function getOverlayRoot(): HTMLElement {
  if (cachedRoot && cachedRoot.isConnected) return cachedRoot

  const existing = document.getElementById("overlay-root")
  if (existing) {
    cachedRoot = existing
    return existing
  }

  // index.html deveria ter o nó; se não tiver (teste, ambiente estranho),
  // cria um na hora pra nunca quebrar.
  const el = document.createElement("div")
  el.id = "overlay-root"
  document.body.appendChild(el)
  cachedRoot = el
  return el
}

interface Props {
  children: ReactNode
}

export default function Portal({ children }: Props) {
  return createPortal(children, getOverlayRoot())
}
