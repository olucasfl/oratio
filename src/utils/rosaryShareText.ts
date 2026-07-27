const ASSINATURA = "— Enviado pelo app Oratio"

/*
Textinho simples + link — igual ao padrão de compartilhar oração,
sem tentar levar o texto do terço inteiro (ele é rezado passo a
passo, não faz sentido como texto corrido).
*/
export function buildRosaryShareText(title: string, link: string){
  return [
    title,
    "",
    `Reze esse terço comigo: ${link}`,
    "",
    ASSINATURA
  ].join("\n")
}
