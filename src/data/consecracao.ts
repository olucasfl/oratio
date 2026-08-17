/*
Conteúdo estático da aba "Sobre" da Consagração a Nossa Senhora — texto e
estrutura, sem nenhuma lógica de data (ao contrário da Quaresma de São
Miguel, a consagração não tem calendário fixo: começa no dia que a pessoa
escolher). As etapas (títulos, descrições, quantidade de dias) continuam
vindas do backend — são conteúdo editável pelo admin.
*/

export type ConsecracaoIcon =
  | "book" | "heart" | "sparkles" | "route" | "crown" | "scroll" | "sun" | "feather"

export const CONSECRACAO_MOTTO = {
  latim: "Totus Tuus",
  traducao: "Todo Vosso — eu sou todo Vosso, e tudo o que tenho é Vosso",
  nota: "A fórmula de entrega de São Luís Maria Grignion de Montfort, adotada como lema por São João Paulo II"
}

export const CONSECRACAO_ABOUT: {
  icon: ConsecracaoIcon
  title: string
  lead: string
  text: string
}[] = [
  {
    icon: "book",
    title: "O método de Montfort",
    lead: "Um caminho, não um ato isolado",
    text: "São Luís Maria Grignion de Montfort propôs, em \"Tratado da Verdadeira Devoção a Maria\", uma preparação de 33 dias antes do dia da consagração — tempo suficiente para se libertar do espírito do mundo e se revestir de Jesus Cristo pelas mãos de Maria."
  },
  {
    icon: "sparkles",
    title: "Por que 33 dias",
    lead: "Um dia para cada ano de Cristo",
    text: "O número lembra os anos da vida terrena de Jesus. A preparação é dividida em quatro etapas — cada uma com um propósito espiritual próprio, da renúncia ao mundo até o conhecimento de Jesus Cristo."
  },
  {
    icon: "heart",
    title: "Por Maria, a Jesus",
    lead: "Ela não desvia — conduz",
    text: "Consagrar-se a Nossa Senhora não é substituir a Cristo: é entregar-se a Ele pelas mãos da Mãe, o caminho mais seguro e mais rápido, como ensina a tradição mariana da Igreja."
  }
]

export const CONSECRACAO_TIPS: {
  icon: ConsecracaoIcon
  title: string
  text: string
}[] = [
  {
    icon: "sun",
    title: "Escolha uma data com significado",
    text: "Uma festa mariana é tradicional (8/12, 15/08, 13/05...), mas qualquer dia que tenha valor para você serve — o essencial é a preparação de 33 dias antes dele."
  },
  {
    icon: "route",
    title: "Um dia de cada vez",
    text: "Cada dia só abre depois do anterior estar concluído — não é possível adiantar nem pular. Se atrasar, os dias pendentes ficam esperando, sem pressa."
  },
  {
    icon: "feather",
    title: "Poucos minutos, todos os dias",
    text: "As orações de cada dia são curtas. O que importa é a constância — reserve um momento tranquilo, sempre no mesmo horário, se possível."
  }
]

export const CONSECRACAO_SEQUENCE: { id: string; title: string }[] = [
  { id: "silencio",   title: "Reserve um momento de silêncio" },
  { id: "leitura",    title: "Leia as orações do dia com atenção" },
  { id: "oferta",     title: "Ofereça esse momento a Nossa Senhora" },
  { id: "conclusao",  title: "Marque o dia como concluído" }
]

/* Ícone por etapa (fallback, quando a etapa não tem um específico). */
export const STAGE_ICONS: ConsecracaoIcon[] = ["route", "scroll", "heart", "crown"]
