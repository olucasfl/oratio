/*
==========================================================
BIOGRAFIAS — SANTO / CELEBRAÇÃO DO DIA
==========================================================

Conteúdo escrito com cuidado, cobrindo primeiro as
Solenidades (o grau litúrgico mais alto, e por isso as
datas de conteúdo mais bem estabelecido). Vamos completando
o restante dos 365 dias aos poucos.

Duas fontes:
  - SAINT_BIOS: biografias de datas FIXAS, referenciadas
    por "bioId" a partir de saintsOfTheDay.ts.
  - MOVABLE_FEASTS: festas móveis (dependem da Páscoa —
    Pentecostes, Corpo de Deus, Cristo Rei etc.), sem data
    fixa no calendário civil. São resolvidas só pelo texto
    ao vivo da API, nunca por data.
==========================================================
*/

export type SaintBio = {
  titulo: string
  resumo: string
  texto: string[]
}

export const SAINT_BIOS: Record<string, SaintBio> = {

  "maria-mae-de-deus": {
    titulo: "Santa Maria, Mãe de Deus",
    resumo: "A mais antiga solenidade mariana da Igreja, celebrando a maternidade divina de Maria.",
    texto: [
      "O título \"Mãe de Deus\" (Theotokos, em grego) foi definido pelo Concílio de Éfeso, no ano 431, contra quem negava que Maria pudesse ser chamada assim. A Igreja ensina que, sendo Jesus verdadeiro Deus e verdadeiro homem numa só Pessoa, Maria é verdadeiramente Mãe de Deus, e não apenas da natureza humana de Jesus.",
      "É a solenidade mariana mais antiga do calendário romano, celebrada desde os primeiros séculos do cristianismo.",
      "Coincide com o oitavo dia do Natal (a Oitava) e, desde 1968, também com o Dia Mundial da Paz, instituído pelo Papa Paulo VI — abrir o ano civil colocando-o sob o olhar de Maria."
    ]
  },

  "sao-jose": {
    titulo: "São José",
    resumo: "Esposo da Virgem Maria e pai adotivo de Jesus, padroeiro da Igreja Universal.",
    texto: [
      "O Evangelho o descreve apenas como \"homem justo\" (Mt 1,19), carpinteiro de Nazaré. Nenhuma palavra sua é registrada nas Escrituras — sua fé se manifesta inteiramente em obediência e ação.",
      "Ao saber que Maria esperava um filho que não era seu, pensava em separar-se dela em silêncio, para não a expor. Um anjo o instrui em sonho a não temer, e José aceita ser o pai adotivo de Jesus, protegendo-o inclusive na fuga para o Egito diante da ameaça de Herodes.",
      "Foi declarado Padroeiro da Igreja Universal pelo Papa Pio IX em 1870, e é também padroeiro dos trabalhadores, das famílias e da boa morte — por, segundo a tradição, ter morrido acompanhado por Jesus e Maria."
    ]
  },

  "anunciacao": {
    titulo: "Anunciação do Senhor",
    resumo: "O momento em que o anjo Gabriel anuncia a Maria que ela seria a mãe do Salvador.",
    texto: [
      "Narrada em Lucas 1,26-38: o anjo Gabriel é enviado a Nazaré, a uma virgem chamada Maria, para anunciar que ela conceberia, pelo poder do Espírito Santo, o Filho de Deus.",
      "Maria responde com a frase que se tornou modelo de entrega: \"Faça-se em mim segundo a tua palavra.\"",
      "É celebrada exatamente nove meses antes do Natal, marcando teologicamente o instante da Encarnação — o momento em que o Verbo de Deus se faz carne no seio de Maria."
    ]
  },

  "santo-expedito": {
    titulo: "Santo Expedito",
    resumo: "Mártir dos primeiros séculos, hoje um dos santos mais invocados no Brasil para causas urgentes.",
    texto: [
      "A tradição o identifica como um soldado romano martirizado por sua fé, provavelmente no início do século IV, na região da Armênia. Poucos dados históricos certos sobrevivem sobre sua vida — seu culto se popularizou sobretudo a partir da veneração de relíquias em Paris, no século XIX.",
      "É representado como um soldado pisando um corvo, com a palavra latina \"Hodie\" (hoje) — lembrando que o bem não deve ser adiado.",
      "Tornou-se, com o tempo, o padroeiro popular das causas urgentes, sendo uma das devoções mais queridas do povo católico brasileiro."
    ]
  },

  "nossa-senhora-de-fatima": {
    titulo: "Nossa Senhora de Fátima",
    resumo: "As aparições marianas na Cova da Iria, Portugal, em 1917.",
    texto: [
      "Entre maio e outubro de 1917, Nossa Senhora apareceu seis vezes a três pastorinhos — Lúcia, Francisco e Jacinta — na Cova da Iria, perto da cidade de Fátima, em Portugal.",
      "A mensagem central foi um chamado insistente à oração do terço, à penitência e à conversão, pedindo a paz para o mundo, então em meio à Primeira Guerra Mundial.",
      "Francisco e Jacinta Marto foram canonizados pelo Papa Francisco em 2017, no centenário das aparições.",
      "O Papa João Paulo II atribuiu à intercessão de Nossa Senhora de Fátima ter sobrevivido ao atentado sofrido em 13 de maio de 1981 — data que coincide com a memória litúrgica."
    ]
  },

  "nascimento-joao-batista": {
    titulo: "Natividade de São João Batista",
    resumo: "O precursor de Jesus, cujo nascimento é celebrado seis meses antes do Natal.",
    texto: [
      "Filho de Isabel (prima de Maria) e do sacerdote Zacarias, seu nascimento é narrado em Lucas 1, marcado por sinais extraordinários: Zacarias fica mudo por duvidar do anúncio do anjo, e só recupera a fala ao confirmar por escrito o nome do filho.",
      "É um dos raros santos cujo nascimento — e não a morte — é celebrado com solenidade, sinal de que sua vida já estava marcada pela graça desde o ventre materno.",
      "Tornou-se o \"precursor\": preparou o caminho para Jesus pregando a conversão às margens do Jordão, batizando-o e sendo o primeiro a reconhecê-lo publicamente como o \"Cordeiro de Deus\".",
      "Foi martirizado por ordem de Herodes Antipas, decapitado a pedido de Salomé."
    ]
  },

  "pedro-e-paulo": {
    titulo: "São Pedro e São Paulo",
    resumo: "Os dois maiores apóstolos, pilares da Igreja primitiva, celebrados juntos no mesmo dia.",
    texto: [
      "Pedro, pescador da Galileia, foi escolhido por Jesus como cabeça dos apóstolos: \"Tu és Pedro, e sobre esta pedra edificarei a minha Igreja\" (Mt 16,18). Tornou-se o primeiro Papa da história da Igreja.",
      "Paulo, fariseu que perseguia os primeiros cristãos, converteu-se depois de um encontro extraordinário com Cristo ressuscitado a caminho de Damasco, tornando-se o grande apóstolo dos gentios e autor de boa parte do Novo Testamento.",
      "Ambos foram martirizados em Roma, tradicionalmente durante a perseguição do imperador Nero, entre os anos 64 e 67.",
      "São celebrados no mesmo dia porque, apesar de trajetórias tão diferentes, entregaram a vida pela mesma fé — e são considerados, juntos, os fundadores da Igreja de Roma."
    ]
  },

  "sao-bento": {
    titulo: "São Bento",
    resumo: "Pai do monaquismo ocidental e padroeiro da Europa.",
    texto: [
      "Nasceu em Núrsia, na Itália, por volta do ano 480, e é considerado o fundador do monaquismo ocidental.",
      "Escreveu a \"Regra de São Bento\", que organiza a vida monástica em torno do lema \"Ora et labora\" (Reza e trabalha) — seguida até hoje por beneditinos no mundo inteiro.",
      "Fundou o mosteiro de Monte Cassino, um dos berços da vida religiosa e da preservação do conhecimento antigo durante a Idade Média.",
      "Sua medalha — com a Cruz e as iniciais de uma oração tradicional de proteção — é uma das devoções católicas mais difundidas. Foi proclamado padroeiro da Europa pelo Papa Paulo VI em 1964."
    ]
  },

  "transfiguracao": {
    titulo: "Transfiguração do Senhor",
    resumo: "O momento em que Jesus revela sua glória divina a três apóstolos no Monte Tabor.",
    texto: [
      "Narrada nos três evangelhos sinóticos (Mt 17, Mc 9, Lc 9): Jesus leva Pedro, Tiago e João a um monte alto, e ali seu rosto brilha como o sol e suas vestes ficam brancas como a luz.",
      "Moisés e Elias aparecem conversando com ele, e uma voz do Céu declara: \"Este é o meu Filho amado; escutai-o.\"",
      "A tradição identifica o Monte Tabor, na Galileia, como o local do evento.",
      "É entendida como uma antecipação da glória da Ressurreição, dada aos apóstolos para fortalecer sua fé diante da Paixão que ainda estava por vir."
    ]
  },

  "santa-paulina": {
    titulo: "Santa Paulina do Coração Agonizante de Jesus",
    resumo: "Fundadora das Pequenas Irmãs da Imaculada Conceição, a primeira santa canonizada com vida e obra dedicadas ao Brasil.",
    texto: [
      "Amabile Lucia Visintainer nasceu em 1865 em Vigolo Vattaro, na Itália, e emigrou ainda criança com a família para Nova Trento, em Santa Catarina.",
      "Ainda jovem, dedicou-se a acolher doentes e abandonados, dando origem à Congregação das Pequenas Irmãs da Imaculada Conceição — adotando o nome de Madre Paulina do Coração Agonizante de Jesus.",
      "Viveu a maior parte da vida no Brasil, onde também morreu, em 1942.",
      "Canonizada pelo Papa João Paulo II em 2002, tornou-se a primeira santa canonizada com vida e obra dedicadas inteiramente ao Brasil."
    ]
  },

  "santa-dulce": {
    titulo: "Santa Dulce dos Pobres",
    resumo: "A primeira santa nascida no Brasil, dedicada inteiramente aos pobres e doentes da Bahia.",
    texto: [
      "Maria Rita de Souza Brito Lopes Pontes nasceu em Salvador, Bahia, em 1914. Tornou-se religiosa das Irmãs Missionárias da Imaculada Conceição, adotando o nome de Irmã Dulce.",
      "Dedicou a vida a acolher os pobres e os doentes, fundando o que se tornaria as Obras Sociais Irmã Dulce (OSID) — hoje um dos maiores complexos hospitalares filantrópicos do Brasil.",
      "Foi indicada duas vezes ao Prêmio Nobel da Paz, ainda em vida.",
      "Canonizada pelo Papa Francisco em 2019, tornou-se a primeira santa nascida em solo brasileiro."
    ]
  },

  "assuncao": {
    titulo: "Assunção da Virgem Maria",
    resumo: "O dogma de que Maria foi elevada, de corpo e alma, à glória celeste ao fim de sua vida terrena.",
    texto: [
      "Definido como dogma de fé pelo Papa Pio XII em 1950, na constituição apostólica Munificentissimus Deus.",
      "Ensina que Maria, ao concluir o curso de sua vida terrena, foi assunta ao Céu em corpo e alma — antecipando o que a Igreja espera, para todos os fiéis, na ressurreição final.",
      "É a mais antiga e mais solene das festas marianas depois de 1º de janeiro, celebrada desde os primeiros séculos sob o nome de \"Dormição\" nas Igrejas do Oriente.",
      "A tradição vê nela uma prefiguração no capítulo 12 do Apocalipse, com a imagem da \"mulher vestida de sol\"."
    ]
  },

  "nossa-senhora-aparecida": {
    titulo: "Nossa Senhora Aparecida",
    resumo: "Padroeira do Brasil, cuja imagem foi encontrada por pescadores no Rio Paraíba do Sul em 1717.",
    texto: [
      "Em 1717, três pescadores — Domingos Garcia, João Alves e Filipe Pedroso — encontraram no Rio Paraíba do Sul uma pequena imagem de terracota de Nossa Senhora da Conceição: primeiro o corpo, depois, um pouco mais adiante, a cabeça.",
      "Ao redor desse achado cresceu uma devoção que deu origem ao Santuário Nacional de Aparecida, em São Paulo — hoje um dos maiores santuários marianos do mundo.",
      "Foi proclamada Rainha e Padroeira do Brasil pelo Papa Pio XI em 1930.",
      "12 de outubro é feriado nacional no Brasil e uma das datas de maior expressão popular da fé católica no país."
    ]
  },

  "sao-judas-tadeu": {
    titulo: "São Judas Tadeu",
    resumo: "Apóstolo de Jesus, hoje um dos santos mais invocados como padroeiro das causas difíceis e impossíveis.",
    texto: [
      "Um dos Doze Apóstolos, mencionado nos Evangelhos como \"Judas, filho de Tiago\" (Lc 6,16) — distinto de Judas Iscariotes, o traidor.",
      "A tradição associa sua pregação à Mesopotâmia, à Síria e à Pérsia, junto com o apóstolo São Simão (o Zelote), com quem divide a festa de 28 de outubro.",
      "Tornou-se conhecido como padroeiro das causas difíceis e desesperadas: por seu nome lembrar o do traidor, muitos fiéis deixavam de recorrer a ele — o que, com o tempo, fez a devoção popular associá-lo justamente às intercessões mais improváveis, as que quase ninguém mais ousa pedir.",
      "É hoje uma das devoções mais populares do Brasil e de todo o mundo católico."
    ]
  },

  "todos-os-santos": {
    titulo: "Solenidade de Todos os Santos",
    resumo: "A festa de todos aqueles que já alcançaram a glória do Céu, conhecidos ou não pela Igreja na terra.",
    texto: [
      "Celebra todos os santos que já estão na presença de Deus — não apenas os canonizados e conhecidos por nome, mas a multidão inumerável de fiéis anônimos que viveram e morreram na graça de Deus.",
      "A data de 1º de novembro foi fixada pelo Papa Gregório IV no século IX, embora a celebração já existisse antes, em outras datas do ano.",
      "É seguida, no dia seguinte, pela Comemoração de Todos os Fiéis Defuntos (Finados) — juntas, as duas datas formam um momento de reflexão sobre a vida eterna.",
      "Lembra que a santidade não é privilégio de poucos, mas vocação de todo batizado."
    ]
  },

  "imaculada-conceicao": {
    titulo: "Imaculada Conceição da Virgem Maria",
    resumo: "O dogma de que Maria foi concebida sem a mancha do pecado original, desde o primeiro instante de sua existência.",
    texto: [
      "Definido como dogma de fé pelo Papa Pio IX em 1854, na bula Ineffabilis Deus.",
      "Ensina que Maria, em vista dos méritos futuros de Cristo, foi preservada isenta de todo pecado original desde o primeiro instante de sua concepção.",
      "Quatro anos depois da definição do dogma, em 1858, Nossa Senhora se identificou a Santa Bernadete, em Lourdes, com as palavras \"Eu sou a Imaculada Conceição\" — confirmando aos fiéis o que a Igreja já havia proclamado.",
      "É celebrada nove meses antes da Natividade de Maria, comemorada em 8 de setembro."
    ]
  },

  "natal": {
    titulo: "Natal do Senhor",
    resumo: "O nascimento de Jesus Cristo em Belém, celebrado como o centro do ano litúrgico junto com a Páscoa.",
    texto: [
      "Narrado nos evangelhos de Mateus e Lucas: Jesus nasce em Belém, filho de Maria, durante o reinado do imperador romano César Augusto.",
      "Celebra o mistério da Encarnação — o Filho de Deus se faz homem e \"habitou entre nós\" (Jo 1,14).",
      "A data de 25 de dezembro foi fixada em Roma já no século IV.",
      "É uma das duas maiores solenidades do calendário cristão, ao lado da Páscoa, celebrada tradicionalmente com três Missas próprias: da vigília, da noite (\"Missa do Galo\") e do dia."
    ]
  },

}

export type MovableFeast = {
  id: string
  titulo: string
  match: string[]
  resumo: string
  texto: string[]
}

/*
Festas móveis — sem data fixa no calendário civil,
porque dependem da data da Páscoa (que muda todo ano
conforme a lua cheia depois do equinócio). Só são
resolvidas comparando com o texto ao vivo da API.
*/

export const MOVABLE_FEASTS: MovableFeast[] = [

  {
    id: "pascoa",
    titulo: "Páscoa da Ressurreição do Senhor",
    match: ["ressurreicao do senhor", "pascoa da ressurreicao", "domingo de pascoa"],
    resumo: "O centro de toda a fé cristã: Jesus Cristo ressuscita dos mortos ao terceiro dia.",
    texto: [
      "É a maior solenidade do ano litúrgico — toda a fé cristã se apoia neste acontecimento: \"se Cristo não ressuscitou, é vã a nossa fé\" (1Cor 15,14).",
      "Ocorre sempre no domingo seguinte à primeira lua cheia depois do equinócio de primavera do hemisfério norte — por isso sua data muda a cada ano.",
      "É precedida pelos 40 dias da Quaresma e pelo Tríduo Pascal (Quinta-feira Santa, Sexta-feira da Paixão e Vigília Pascal).",
      "Dá início ao Tempo Pascal, que dura 50 dias, até Pentecostes."
    ]
  },

  {
    id: "ascensao",
    titulo: "Ascensão do Senhor",
    match: ["ascensao do senhor"],
    resumo: "Jesus ressuscitado sobe ao Céu, quarenta dias depois da Páscoa.",
    texto: [
      "Celebrada 40 dias depois da Páscoa — por isso, originalmente numa quinta-feira, embora em muitos lugares, incluindo o Brasil, seja transferida para o domingo seguinte.",
      "Narrada em Atos dos Apóstolos 1,9-11: Jesus é \"elevado aos céus\" diante dos apóstolos, envolto numa nuvem.",
      "Marca o fim da presença visível de Jesus ressuscitado na terra, e o envio dos apóstolos para pregar o Evangelho a todas as nações.",
      "Antecede diretamente a novena de preparação para Pentecostes."
    ]
  },

  {
    id: "pentecostes",
    titulo: "Pentecostes",
    match: ["pentecostes"],
    resumo: "A descida do Espírito Santo sobre os apóstolos, considerada o nascimento da Igreja.",
    texto: [
      "Celebrada 50 dias depois da Páscoa, encerrando o Tempo Pascal.",
      "Narrada em Atos dos Apóstolos 2: reunidos no Cenáculo com Maria, os apóstolos recebem o Espírito Santo em forma de línguas de fogo, e passam a falar em outras línguas.",
      "É tradicionalmente considerada o dia do nascimento da Igreja — os apóstolos, antes temerosos e trancados, saem a pregar publicamente, e cerca de três mil pessoas se convertem naquele mesmo dia.",
      "A palavra \"Pentecostes\" vem do grego e significa \"quinquagésimo (dia)\"."
    ]
  },

  {
    id: "santissima-trindade",
    titulo: "Santíssima Trindade",
    match: ["santissima trindade"],
    resumo: "Um só Deus em três Pessoas — Pai, Filho e Espírito Santo — celebrado no domingo seguinte a Pentecostes.",
    texto: [
      "Celebra o mistério central da fé cristã: Deus é um só em essência, mas existe em três Pessoas distintas — Pai, Filho e Espírito Santo — iguais em majestade e eternidade.",
      "É celebrada no domingo seguinte a Pentecostes, logo depois que a ação do Espírito Santo se manifesta plenamente na Igreja.",
      "Não é um mistério totalmente explicável pela razão humana, mas professado por todo cristão desde o Batismo, \"em nome do Pai e do Filho e do Espírito Santo\" (Mt 28,19)."
    ]
  },

  {
    id: "corpus-christi",
    titulo: "Santíssimo Corpo e Sangue de Cristo",
    match: ["corpo e sangue de cristo", "corpus christi"],
    resumo: "A solenidade que celebra a presença real de Jesus na Eucaristia.",
    texto: [
      "Instituída pelo Papa Urbano IV em 1264, depois de um milagre eucarístico ocorrido em Bolsena, na Itália.",
      "Celebra a presença real de Jesus Cristo — Corpo, Sangue, Alma e Divindade — sob as espécies de pão e vinho na Eucaristia, instituída por Ele mesmo na Última Ceia.",
      "É tradicionalmente celebrada com procissões pelas ruas, levando o Santíssimo Sacramento exposto no ostensório, muitas vezes sobre tapetes de flores e serragem colorida — tradição bem viva no Brasil.",
      "Celebrada no domingo (ou quinta-feira, conforme a região) seguinte à Santíssima Trindade."
    ]
  },

  {
    id: "sagrado-coracao-de-jesus",
    titulo: "Sagrado Coração de Jesus",
    match: ["sagrado coracao de jesus"],
    resumo: "Devoção ao amor infinito de Jesus pela humanidade, simbolizado em seu Coração.",
    texto: [
      "A devoção se consolidou a partir das revelações de Jesus a Santa Margarida Maria Alacoque, na França, no século XVII — embora suas raízes na tradição cristã sejam bem mais antigas.",
      "O Coração de Jesus é venerado como símbolo do seu amor infinito — humano e divino — pela humanidade, especialmente manifestado em sua Paixão.",
      "É celebrada na sexta-feira depois da oitava de Corpus Christi, dezenove dias depois de Pentecostes.",
      "Deu origem à prática dos \"primeiros sextas-feiras\" e à consagração de famílias e pessoas ao Sagrado Coração."
    ]
  },

  {
    id: "cristo-rei",
    titulo: "Nosso Senhor Jesus Cristo, Rei do Universo",
    match: ["rei do universo", "cristo rei"],
    resumo: "A realeza de Cristo sobre toda a criação, celebrada no último domingo do ano litúrgico.",
    texto: [
      "Instituída pelo Papa Pio XI em 1925, na encíclica Quas Primas, para afirmar que Cristo é Rei sobre todas as nações e toda a criação — não com um reino terreno, mas um reino \"de verdade e de vida, de santidade e graça, de justiça, amor e paz\".",
      "É celebrada no último domingo do ano litúrgico, imediatamente antes do início do Advento — um ponto culminante que aponta para o fim dos tempos e o Reino definitivo de Deus.",
      "O Evangelho da solenidade costuma trazer a parábola do juízo final (Mt 25), sobre servir a Cristo nos mais pequenos."
    ]
  },

]

export function findMovableFeast(normalizedText:string){

  return MOVABLE_FEASTS.find((f)=>
    f.match.some((m)=> normalizedText.includes(m))
  ) || null

}
