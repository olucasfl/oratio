const ASSINATURA = "— Enviado pelo app Oratio"

/*
Só o convite + link, igual ao compartilhamento de oração — capítulos
da Bíblia podem ter dezenas/centenas de versículos, texto longo demais
pra mandar inteiro numa mensagem.
*/
export function buildBibleChapterShareText(
  book: string,
  chapter: number | string,
  link: string
){
  return [
    `${book} ${chapter}`,
    "",
    `Leia comigo esse capítulo: ${link}`,
    "",
    ASSINATURA
  ].join("\n")
}
