const ASSINATURA = "— Enviado pelo app Oratio"

/*
Diferente da liturgia (que compartilha o texto inteiro da leitura),
aqui é só um textinho simples convidando a pessoa a rezar + o link
que abre essa oração específica no app — orações podem ser longas
demais pra valer a pena mandar o texto todo por mensagem.
*/
export function buildPrayerShareText(title: string, link: string){
  return [
    title,
    "",
    `Reze comigo essa oração: ${link}`,
    "",
    ASSINATURA
  ].join("\n")
}
