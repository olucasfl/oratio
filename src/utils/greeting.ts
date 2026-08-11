/*
Saudação e "momento do dia" — tudo derivado apenas do
relógio local, sem depender de backend. Usado na Home
para dar a sensação de que o app acompanha o dia.
*/

export type Momento = "manha" | "tarde" | "noite"

export function getMomento(d: Date = new Date()): Momento {
  const h = d.getHours()
  if (h >= 5 && h < 12) return "manha"
  if (h >= 12 && h < 18) return "tarde"
  return "noite"
}

/*
Saudação com o primeiro nome, quando disponível.
Ex.: "Bom dia, Lucas" — ou só "Bom dia" para convidado.
*/
export function getSaudacao(nome?: string | null, d: Date = new Date()): string {
  const m = getMomento(d)
  const base =
    m === "manha" ? "Bom dia" :
    m === "tarde" ? "Boa tarde" :
    "Boa noite"

  const primeiro = nome?.trim().split(/\s+/)[0]

  return primeiro ? `${base}, ${primeiro}` : base
}

const MESES = [
  "janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro"
]

const DIAS = [
  "domingo","segunda-feira","terça-feira","quarta-feira",
  "quinta-feira","sexta-feira","sábado"
]

export function getDataLonga(d: Date = new Date()): string {
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`
}

/*
Versículo curto que muda conforme o período do dia — exibido logo
abaixo do logo, dando à Home um tom de oração que acompanha a hora.
*/
export function getFraseDoMomento(d: Date = new Date()): string {
  const m = getMomento(d)

  if (m === "manha") {
    return "“As misericórdias do Senhor se renovam a cada manhã” · Lm 3,23"
  }

  if (m === "tarde") {
    return "“Rezai sem cessar” · 1Ts 5,17"
  }

  return "“Em paz me deito e logo adormeço, Senhor” · Sl 4,9"
}

/*
Convite de oração conforme o horário — o "Neste momento".
Aponta sempre para telas que já existem no app.
*/
export type MomentoConvite = {
  titulo: string
  sub: string
  acaoLabel: string
  path: string
}

export function getMomentoConvite(d: Date = new Date()): MomentoConvite {
  const m = getMomento(d)

  if (m === "manha") {
    return {
      titulo: "Ofereça o seu dia",
      sub: "Comece com uma oração e o sinal da cruz.",
      acaoLabel: "Rezar",
      path: "/oratio/prayers"
    }
  }

  if (m === "tarde") {
    return {
      titulo: "Faça uma pausa e reze",
      sub: "Um instante com Deus no meio do dia.",
      acaoLabel: "Rezar",
      path: "/oratio/prayers"
    }
  }

  return {
    titulo: "Antes de dormir, examine o seu dia",
    sub: "Faça o exame de consciência e recolha-se em oração.",
    acaoLabel: "Iniciar",
    path: "/oratio/confissao"
  }
}
