/*
Monta o texto pronto pra compartilhar de uma leitura/salmo/evangelho —
título, referência, corpo e a resposta final (ex: "Palavra do Senhor.
℟. Graças a Deus."), formatado pra ficar bom em WhatsApp/Instagram/
qualquer lugar que só aceita texto puro (sem HTML).
*/

const ASSINATURA = "— Enviado pelo app Oratio"

// Os números de versículo vêm colados na palavra (ex: "1A palavra…"),
// pensados pra virar um <span> estilizado na tela. Em texto puro isso
// lê como erro de digitação — remove pra soar como o texto seria
// proclamado em voz alta.
function limparTexto(texto?: string){
  return (texto || "")
    .replace(/\d+(?=[A-Za-zÀ-ÿ"“'‘])/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()
}

function linhasFinal(final?: { padre?: string; assembleia?: string; todos?: string }[]){
  if(!final?.length) return []
  return final.map(item => item.padre || item.assembleia || item.todos || "").filter(Boolean)
}

export function buildLeituraShareText(
  heading: string,
  leitura: { titulo?: string; referencia?: string; texto?: string; final?: any[] }
){
  const linhas = [heading]

  if(leitura.titulo) linhas.push(leitura.titulo)
  if(leitura.referencia) linhas.push(leitura.referencia)

  linhas.push("", limparTexto(leitura.texto))

  const final = linhasFinal(leitura.final)
  if(final.length) linhas.push("", ...final)

  linhas.push("", ASSINATURA)

  return linhas.join("\n")
}

export function buildSalmoShareText(
  salmo: { referencia?: string; refrao?: string; texto?: string }
){
  const linhas = ["Salmo Responsorial"]

  if(salmo.referencia) linhas.push(salmo.referencia)

  linhas.push("")

  if(salmo.refrao) linhas.push(`℟. ${salmo.refrao}`, "")

  linhas.push(limparTexto(salmo.texto))
  linhas.push("", ASSINATURA)

  return linhas.join("\n")
}

export function buildEvangelhoShareText(
  evangelho: {
    abertura?: { padre?: string; assembleia?: string }[]
    referencia?: string
    texto?: string
    final?: any[]
  }
){
  const linhas = ["Evangelho"]

  const proclamacao = evangelho.abertura?.find(
    item => item.padre?.startsWith("Proclamação")
  )?.padre

  if(proclamacao) linhas.push(proclamacao)
  if(evangelho.referencia) linhas.push(evangelho.referencia)

  linhas.push("", limparTexto(evangelho.texto))

  const final = linhasFinal(evangelho.final)
  if(final.length) linhas.push("", ...final)

  linhas.push("", ASSINATURA)

  return linhas.join("\n")
}
