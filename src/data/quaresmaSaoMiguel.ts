/**
 * Quaresma de São Miguel — devoção sazonal de 40 dias.
 *
 * Começa em 15/08 (Assunção) e termina NA Festa de São Miguel (29/09),
 * pulando os domingos — dia de descanso e Missa, como na Quaresma da
 * Páscoa. Um "dia" da devoção é sempre uma data que não cai em domingo.
 *
 * A regra dos domingos tem uma exceção — é ela que faz a conta fechar em
 * 40: os domingos do período são de descanso, MENOS o último, que entra
 * na contagem oficial de oração. Em 2026 são 46 dias de calendário, 39
 * deles fora de domingo, mais o domingo 27/09 = 40 dias, terminando
 * exatamente na Festa dos Arcanjos.
 *
 * O total sai do calendário do ano, não de uma constante.
 *
 * A agenda é calculada aqui e no backend com a MESMA regra (veja
 * `src/modules/oratio/quaresma/quaresma.schedule.ts` na API). O backend é
 * a fonte de verdade do progresso; este arquivo existe pra que as datas,
 * a contagem e as orações funcionem offline, sem depender de rede.
 *
 * Volta sozinha todo ano: tudo deriva do ano civil de "hoje".
 */

/** 15 de agosto — Assunção de Nossa Senhora. */
const START_MONTH = 8
const START_DAY = 15

/** 29 de setembro — Festa de São Miguel Arcanjo. */
const FEAST_MONTH = 9
const FEAST_DAY = 29

/**
 * Depois do último dia a devoção sai da Home, mas a página continua
 * aberta por um tempo pra quem ficou pra trás conseguir terminar.
 */
const GRACE_DAYS_AFTER_END = 15

/**
 * Por quantos dias o aviso de estreia aparece na Home: o dia da abertura
 * e mais 6. Depois disso a devoção já não é novidade e a faixa sozinha
 * basta — o popup vira incômodo.
 */
const ANNOUNCEMENT_DAYS = 7

/* =========================
DATAS (ISO "YYYY-MM-DD", sem fuso)
========================= */

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function isoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`
}

/** Data de hoje no fuso do aparelho, como ISO curto. */
export function todayISO(now: Date = new Date()) {
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

/** Dia da semana (0 = domingo) de uma data ISO — montado e lido em UTC. */
export function weekdayOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number)
  const base = new Date(Date.UTC(y, m - 1, d))
  base.setUTCDate(base.getUTCDate() + days)
  return isoDate(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate())
}

/** Diferença em dias entre duas datas ISO (b − a). */
export function diffDays(a: string, b: string) {
  const [ay, am, ad] = a.split("-").map(Number)
  const [by, bm, bd] = b.split("-").map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000)
}

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
]

const DIAS_SEMANA = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado"
]

/** "15/08" — usado nas células compactas da grade. */
export function formatShort(iso: string) {
  const [, m, d] = iso.split("-")
  return `${d}/${m}`
}

/** "sábado, 15 de agosto" — usado nos cabeçalhos. */
export function formatLong(iso: string) {
  const [, m, d] = iso.split("-").map(Number)
  return `${DIAS_SEMANA[weekdayOf(iso)]}, ${d} de ${MESES[m - 1]}`
}

/* =========================
AGENDA
========================= */

export function quaresmaStart(year: number) {
  return isoDate(year, START_MONTH, START_DAY)
}

export function quaresmaFeast(year: number) {
  return isoDate(year, FEAST_MONTH, FEAST_DAY)
}

/**
 * As datas de oração: `buildSchedule(y)[n - 1]` é a data do dia `n`.
 * De 15/08 até a Festa (29/09), sem os domingos — exceto o último deles,
 * que conta (veja o comentário no topo do arquivo).
 */
export function buildSchedule(year: number): string[] {
  const feast = quaresmaFeast(year)

  const all: string[] = []
  for (let cursor = quaresmaStart(year); cursor <= feast; cursor = addDays(cursor, 1)) {
    all.push(cursor)
  }

  const lastSunday = [...all].reverse().find((date) => weekdayOf(date) === 0)

  return all.filter((date) => weekdayOf(date) !== 0 || date === lastSunday)
}

/** Quantos dias de oração a edição do ano tem (40 em 2026). */
export function totalDays(year: number): number {
  return buildSchedule(year).length
}

/**
 * Linha do tempo com TODAS as datas do período — inclusive os domingos de
 * descanso. É o que a grade da Jornada desenha: 1, 2, 3, domingo, 4, 5, 6…
 * O domingo de descanso não tem `dayNumber`: é uma pausa visível, não um
 * dia pulado. Já o último domingo aparece como dia normal, porque é.
 */
export type TimelineEntry =
  | { kind: "day"; date: string; dayNumber: number; isFeast: boolean; isSunday: boolean }
  | { kind: "rest"; date: string; isFeast: boolean }

export function buildTimeline(year: number): TimelineEntry[] {
  const schedule = buildSchedule(year)
  const prayerDays = new Set(schedule)

  const last = schedule[schedule.length - 1]
  const feast = quaresmaFeast(year)

  const timeline: TimelineEntry[] = []
  let cursor = quaresmaStart(year)
  let dayNumber = 0

  while (cursor <= last) {
    const isFeast = cursor === feast

    if (prayerDays.has(cursor)) {
      dayNumber++
      timeline.push({
        kind: "day",
        date: cursor,
        dayNumber,
        isFeast,
        isSunday: weekdayOf(cursor) === 0
      })
    } else {
      timeline.push({ kind: "rest", date: cursor, isFeast })
    }

    cursor = addDays(cursor, 1)
  }

  return timeline
}

/** Quantos dias já abriram até hoje: 0 antes de começar, 40 no fim. */
export function getCurrentDay(schedule: string[], today: string) {
  let count = 0
  for (const date of schedule) {
    if (date <= today) count++
    else break
  }
  return count
}

/**
 * Dias em atraso: os que ABRIRAM ANTES DE HOJE e não foram rezados.
 *
 * O dia que abriu hoje ainda está em aberto — contá-lo como atraso faria
 * a pessoa ver "1 em atraso" no dia 1, antes mesmo de poder rezar. Num
 * dia de descanso não abre dia novo, então tudo que está aberto já é
 * passado.
 */
export function countLateDays(
  currentDay: number,
  completedCount: number,
  todayIsPrayerDay: boolean
) {
  const opened = todayIsPrayerDay ? Math.max(currentDay - 1, 0) : currentDay
  return Math.max(opened - completedCount, 0)
}

export type QuaresmaWindow = {
  year: number
  today: string
  /** A devoção está acontecendo agora (mostra o botão na Home). */
  active: boolean
  /** A página ainda pode ser aberta (inclui o prazo extra pra atrasados). */
  reachable: boolean
  startDate: string
  /** Último dia da devoção — sempre a própria Festa. */
  endDate: string
  feastDate: string
  schedule: string[]
  /** Quantos dias de oração a edição deste ano tem. */
  total: number
  /** Dias já liberados (1..total). 0 antes de 15/08. */
  currentDay: number
  /** Hoje é uma data da agenda — abriu dia novo. */
  todayIsPrayerDay: boolean
  /** Domingo de descanso: não abre dia, não há penitência. */
  isRestDay: boolean
  /** Dias até a Festa de São Miguel. 0 no próprio dia, negativo depois. */
  daysToFeast: number
  /** A Festa já passou. */
  feastPassed: boolean
  /** Estamos na semana de estreia — o aviso da Home ainda vale. */
  isAnnouncement: boolean
}

export function getQuaresmaWindow(now: Date = new Date()): QuaresmaWindow {
  const today = todayISO(now)
  const year = now.getFullYear()

  const schedule = buildSchedule(year)
  const startDate = schedule[0]
  const endDate = schedule[schedule.length - 1]
  const feastDate = quaresmaFeast(year)

  const daysToFeast = diffDays(today, feastDate)

  const todayIsPrayerDay = schedule.includes(today)

  return {
    year,
    today,
    active: today >= startDate && today <= endDate,
    reachable: today >= startDate && today <= addDays(endDate, GRACE_DAYS_AFTER_END),
    startDate,
    endDate,
    feastDate,
    schedule,
    total: schedule.length,
    currentDay: getCurrentDay(schedule, today),
    todayIsPrayerDay,
    isRestDay: weekdayOf(today) === 0 && !todayIsPrayerDay,
    isAnnouncement:
      today >= startDate &&
      today <= addDays(startDate, ANNOUNCEMENT_DAYS - 1),
    daysToFeast,
    feastPassed: daysToFeast < 0
  }
}

/* =========================
A SEQUÊNCIA DIÁRIA
(igual todo dia — muda a intenção, não o texto)
========================= */

export type QuaresmaStep = {
  id: string
  title: string
  /** Frase curta que aparece acima do texto, orientando a oração. */
  hint: string
  content: string
}

export const QUARESMA_STEPS: QuaresmaStep[] = [

  {
    id: "inicial",
    title: "Oração Inicial",
    hint: "Faça o sinal da cruz e acalme o coração antes de começar.",
    content: `São Miguel Arcanjo, defendei-nos no combate, sede nosso refúgio contra a maldade e as ciladas do demônio!
Ordene-lhe, Deus, instantemente o pedimos; e vós, príncipe da milícia celeste, pela virtude divina, precipitai ao inferno satanás e todos os espíritos malignos que andam pelo mundo para perder as almas. Amém.

Sacratíssimo Coração de Jesus! Tende Piedade de nós. (3x)`
  },

  {
    id: "ladainha",
    title: "Ladainha de São Miguel Arcanjo",
    hint: "Reze com calma. A cada invocação, responda no coração.",
    content: `Senhor, tende piedade de nós.
Jesus Cristo, tende piedade de nós.
Senhor, tende piedade de nós.
Jesus Cristo, ouvi-nos.
Jesus Cristo, atendei-nos.

Pai Celeste, que sois Deus, tende piedade de nós.
Filho Redentor do Mundo, que sois Deus, tende piedade de nós.
Espírito Santo, que sois Deus, tende piedade de nós.
Trindade Santa, que sois um único Deus, tende piedade de nós.

Santa Maria, Rainha dos Anjos, rogai por nós.
São Miguel, rogai por nós.
São Miguel, cheio da graça de Deus, rogai por nós.
São Miguel, perfeito adorador do Verbo Divino, rogai por nós.
São Miguel, coroado de honra e de glória, rogai por nós.
São Miguel, poderosíssimo príncipe dos exércitos do Senhor, rogai por nós.
São Miguel, porta-estandarte da Santíssima Trindade, rogai por nós.
São Miguel, guardião do Paraíso, rogai por nós.
São Miguel, guia e consolador do povo israelita, rogai por nós.
São Miguel, esplendor e fortaleza da Igreja militante, rogai por nós.
São Miguel, honra e alegria da Igreja triunfante, rogai por nós.
São Miguel, luz dos anjos, rogai por nós.
São Miguel, baluarte dos cristãos, rogai por nós.
São Miguel, força daqueles que combatem pelo estandarte da cruz, rogai por nós.
São Miguel, luz e confiança das almas no último momento da vida, rogai por nós.
São Miguel, socorro muito certo, rogai por nós.
São Miguel, nosso auxílio em todas as adversidades, rogai por nós.
São Miguel, arauto da sentença eterna, rogai por nós.
São Miguel, consolador das almas que estão no Purgatório, rogai por nós.
São Miguel, a quem o Senhor incumbiu de receber as almas que estão no Purgatório, rogai por nós.
São Miguel, nosso príncipe, rogai por nós.
São Miguel, nosso advogado, rogai por nós.

Cordeiro de Deus, que tirais o pecado do mundo, perdoai-nos, Senhor.
Cordeiro de Deus, que tirais o pecado do mundo, ouvi-nos, Senhor.
Cordeiro de Deus, que tirais o pecado do mundo, tende piedade de nós, Senhor.`
  },

  {
    id: "consagracao",
    title: "Consagração",
    hint: "Um ato pessoal — reze sem pressa, colocando-se de verdade sob a proteção do Arcanjo.",
    content: `Ó Príncipe nobilíssimo dos Anjos, valoroso guerreiro do Altíssimo, zeloso defensor da glória do Senhor, terror dos espíritos rebeldes, amor e delícia de todos os Anjos justos, meu diletíssimo Arcanjo São Miguel, desejando eu fazer parte do número dos vossos devotos e servos, a vós hoje me consagro, me dou e me ofereço e ponho-me a mim próprio, a minha família e tudo o que me pertence, debaixo da vossa poderosíssima proteção.

É pequena a oferta do meu serviço, sendo como sou um miserável pecador, mas vós engrandecereis o afeto do meu coração; recordai-vos que de hoje em diante estou debaixo do vosso sustento e deveis assistir-me em toda a minha vida e obter-me o perdão dos meus muitos e graves pecados, a graça de amar a Deus de todo coração, ao meu querido Salvador Jesus Cristo e a minha Mãe Maria Santíssima.

Obtende-me aqueles auxílios que me são necessários para obter a coroa da eterna glória. Defendei-me dos inimigos da alma, especialmente na hora da morte. Vinde, ó príncipe gloriosíssimo, assistir-me na última luta e com a vossa arma poderosa lançai para longe, precipitando nos abismos do inferno, aquele anjo quebrador de promessas e soberbo que um dia prostrastes no combate no Céu.

São Miguel Arcanjo, defendei-nos no combate para que não pereçamos no supremo juízo.`
  },

  {
    id: "final",
    title: "Oração Final",
    hint: "Encerre com firmeza e confiança, fazendo o sinal da cruz.",
    content: `Levanta-se Deus, pela intercessão da bem-aventurada Virgem Maria, São Miguel Arcanjo e todas as milícias celestes; sejam dispersos os seus inimigos e fujam de sua face todos os que o odeiam.

Em nome do Pai, e do Filho e do Espírito Santo. Amém.`
  }

]

/* =========================
MARCOS DA DEVOÇÃO
(a faixa visual do topo da aba Sobre)
========================= */

export type QuaresmaMilestone = {
  icon: QuaresmaIcon
  date: string
  title: string
  sub: string
}

export function getMilestones(year: number): QuaresmaMilestone[] {
  return [
    {
      icon: "flower",
      date: "15/08",
      title: "Assunção",
      sub: "a devoção começa"
    },
    {
      icon: "swords",
      date: `${totalDays(year)} dias`,
      title: "Oração",
      sub: "sem os domingos"
    },
    {
      icon: "crown",
      date: "29/09",
      title: "Festa",
      sub: "São Miguel Arcanjo"
    }
  ]
}

/* =========================
ANTES DE COMEÇAR (tutorial)
========================= */

/** Chaves de ícone — a página mapeia cada uma para um componente lucide. */
export type QuaresmaIcon =
  | "flame"
  | "image"
  | "hand"
  | "clock"
  | "sun"
  | "swords"
  | "crown"
  | "scroll"
  | "route"
  | "gift"
  | "flower"

export type QuaresmaTip = {
  icon: QuaresmaIcon
  title: string
  text: string
}

export const QUARESMA_TIPS: QuaresmaTip[] = [

  {
    icon: "flame",
    title: "Acenda uma vela benta",
    text:
      "O gesto é pequeno, mas separa aquele momento do resto do dia."
  },

  {
    icon: "image",
    title: "Tenha uma imagem de São Miguel",
    text:
      "Uma estampa ou medalha bastam. Rezar olhando para quem se invoca " +
      "torna a devoção um encontro, não uma ideia."
  },

  {
    icon: "hand",
    title: "Ofereça uma penitência",
    text:
      "Algo pequeno e possível até a Festa — um jejum, uma renúncia, " +
      "uma esmola. Anote na aba Penitências."
  },

  {
    icon: "clock",
    title: "Reze sempre no mesmo horário",
    text:
      "O horário fixo é o que sustenta os 40 dias. Escolha um que caiba " +
      "de verdade na sua rotina e defenda esse horário."
  },

  {
    icon: "sun",
    title: "Domingo é descanso",
    text:
      "Não há dia a rezar nem penitência a cumprir — vá à Missa. " +
      "A exceção é o último domingo, que entra na contagem."
  }

]

/* =========================
SOBRE A DEVOÇÃO
========================= */

/** A frase que dá nome ao Arcanjo — vira destaque na aba Sobre. */
export const QUARESMA_MOTTO = {
  latim: "Quis ut Deus?",
  traducao: "Quem como Deus?",
  nota: "o grito de São Miguel contra a soberba"
}

export type QuaresmaAbout = {
  icon: QuaresmaIcon
  title: string
  /** Resumo de uma linha, em destaque acima do texto. */
  lead: string
  text: string
}

export const QUARESMA_ABOUT: QuaresmaAbout[] = [

  {
    icon: "swords",
    title: "O que é",
    lead: "40 dias de oração e penitência, da Assunção à Festa.",
    text:
      "Como na Quaresma que prepara a Páscoa, os domingos são de descanso " +
      "e ficam fora da contagem. A exceção é o último domingo antes da " +
      "Festa: é ele que faz os 40 dias fecharem em 29 de setembro."
  },

  {
    icon: "scroll",
    title: "De onde vem",
    lead: "Atribuída a São Francisco de Assis.",
    text:
      "Ele fazia deste período um tempo de jejum e oração intensa em honra " +
      "do Arcanjo. Foi numa dessas quaresmas, no monte Alverne, que recebeu " +
      "os estigmas."
  },

  {
    icon: "crown",
    title: "Por que São Miguel",
    lead: "Príncipe das milícias celestes.",
    text:
      "A Igreja o venera como defensor do povo de Deus e protetor das almas " +
      "na hora da morte. Recorrer a ele é pedir socorro para as batalhas " +
      "que não se vencem sozinho."
  },

  {
    icon: "route",
    title: "Como funciona aqui",
    lead: "Reze, marque o dia, o próximo abre na data seguinte.",
    text:
      "A sequência é a mesma todos os dias. Nada se perde: o progresso fica " +
      "salvo na sua conta, e se você atrasar, os dias em falta continuam " +
      "esperando por você."
  },

  {
    icon: "gift",
    title: "A promessa",
    lead: "Um cortejo de anjos na hora da morte.",
    text:
      "É o que a tradição guarda para quem completa a devoção, junto de uma " +
      "proteção especial ao longo da vida. Mais do que a promessa, vale o " +
      "que esses dias fazem em quem os percorre."
  }

]
