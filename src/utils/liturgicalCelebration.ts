/*
Interpreta o texto que a API de liturgia já retorna
(campo "liturgia") para separar o nome da celebração
do grau litúrgico (Solenidade/Festa/Memória) — sem
nunca depender de uma lista fixa de datas, que ficaria
desatualizada em anos em que memórias são suprimidas,
solenidades são transferidas etc. O nome de hoje é
sempre o mesmo texto que já sustenta as leituras da
Missa do dia.
*/

const GRAUS = [
  "Solenidade",
  "Festa",
  "Memória Obrigatória",
  "Memória Facultativa",
  "Memória"
]

export type Celebration = {
  nome: string
  grau: string | null
}

export function parseCelebration(liturgia?: string | null): Celebration | null {

  if(!liturgia) return null

  const partes = liturgia.split(",").map((p)=> p.trim())

  const ultima = partes[partes.length - 1]

  const grau = GRAUS.find((g)=>
    ultima?.toLowerCase() === g.toLowerCase()
  )

  if(!grau){
    return null
  }

  const nome = partes.slice(0, -1).join(", ").trim()

  if(!nome){
    return null
  }

  return { nome, grau }

}

/*
Cores litúrgicas reais — usadas como "arte" do card,
ao invés de qualquer ilustração inventada. Refletem o
que de fato é usado nas vestes/paramentos daquele dia.
*/

export const LITURGICAL_COLORS: Record<string, { hex:string, hexSoft:string }> = {
  "branco":   { hex:"#b8952f", hexSoft:"#faf6e8" },
  "dourado":  { hex:"#b8952f", hexSoft:"#faf6e8" },
  "vermelho": { hex:"#9a2846", hexSoft:"#fbe9ee" },
  "verde":    { hex:"#3f7d5c", hexSoft:"#e9f3ee" },
  "roxo":     { hex:"#6a4c93", hexSoft:"#f0ebf6" },
  "rosa":     { hex:"#c9789a", hexSoft:"#fbeef3" },
}

export function getLiturgicalColor(cor?: string | null){

  const key = (cor || "").trim().toLowerCase()

  return LITURGICAL_COLORS[key] || LITURGICAL_COLORS["verde"]

}

function normalize(text:string){

  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

}

export function normalizeCelebrationName(nome:string){
  return normalize(nome)
}
