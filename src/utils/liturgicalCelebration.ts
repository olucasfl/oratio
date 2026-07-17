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
  grau: string
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

/*
==========================================================
COR DA FÉRIA (estação litúrgica)
==========================================================

Usada quando uma Memória é Facultativa (opcional): nesse
caso, a cor "correta" para exibir é a da estação em curso
(normalmente verde, no Tempo Comum), não a do santo — a
memória fica só como informação extra, já que a Igreja
permite ao celebrante optar por não celebrá-la.

Calculada a partir da data da Páscoa daquele ano
(algoritmo de Gauss/Meeus, o mesmo usado por qualquer
calendário litúrgico de verdade) — nunca por uma lista
fixa, que teria que ser refeita todo ano.
*/

function addDays(date:Date, days:number){
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function mostRecentSunday(date:Date){
  return addDays(date, -date.getDay())
}

export function getEasterSunday(year:number){

  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19*a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2*e + 2*i - h - k) % 7
  const m = Math.floor((a + 11*h + 22*l) / 451)
  const month = Math.floor((h + l - 7*m + 114) / 31)
  const day = ((h + l - 7*m + 114) % 31) + 1

  return new Date(year, month - 1, day)

}

export function getFerialColor(date:Date){

  const year = date.getFullYear()
  const easter = getEasterSunday(year)

  const ashWednesday = addDays(easter, -46)
  const pentecost = addDays(easter, 49)

  // 4º domingo do Advento = domingo mais próximo (igual ou antes) de 24/12
  const advent4 = mostRecentSunday(new Date(year, 11, 24))
  const adventStart = addDays(advent4, -21)

  const christmasStart = new Date(year, 11, 25)
  // fim aproximado do Tempo do Natal (Batismo do Senhor),
  // contando o rabicho de janeiro que pertence ao Natal do
  // ano anterior
  const christmasEndPrevYear = new Date(year, 0, 12)

  const time = date.getTime()

  if(time >= adventStart.getTime() && time < christmasStart.getTime()){
    return "roxo"
  }

  if(
    time >= christmasStart.getTime() ||
    time <= christmasEndPrevYear.getTime()
  ){
    return "branco"
  }

  if(time >= ashWednesday.getTime() && time < easter.getTime()){
    return "roxo"
  }

  if(time >= easter.getTime() && time <= pentecost.getTime()){
    return "branco"
  }

  return "verde"

}
