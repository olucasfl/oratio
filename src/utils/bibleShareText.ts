const ASSINATURA = "— Enviado pelo app Oratio"

/*
Compartilha o capítulo inteiro, com cada versículo numerado igual ao
que a pessoa vê na tela — formatado pra ficar legível em texto puro
(WhatsApp, Instagram etc, sem HTML).
*/
export function buildBibleChapterShareText(
  book: string,
  chapter: number | string,
  versiculos: { versiculo: number; texto: string }[],
  link?: string
){
  const linhas = [`${book} ${chapter}`, ""]

  for(const v of versiculos){
    linhas.push(`${v.versiculo} ${v.texto}`)
  }

  if(link) linhas.push("", `Leia no app: ${link}`)

  linhas.push("", ASSINATURA)

  return linhas.join("\n")
}
