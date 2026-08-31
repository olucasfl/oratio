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
      "A tradição o identifica como um soldado romano martirizado por sua fé, provavelmente no início do século IV, na região da Armênia. Poucos dados históricos certos sobrevivem sobre sua vida — seu culto se popularizou sobretudo a partir da chegada de relíquias suas a um convento de Paris, em 1781.",
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
      "Ainda jovem, dedicou-se a acolher doentes e abandonados, dando origem à Congregação das Irmãzinhas da Imaculada Conceição — adotando o nome de Madre Paulina do Coração Agonizante de Jesus.",
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
      "Foi indicada ao Prêmio Nobel da Paz em 1988, pelo então presidente José Sarney, com apoio da rainha Sílvia da Suécia.",
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

  "beato-inacio-azevedo": {
    titulo: "Beato Inácio de Azevedo e Companheiros, Mártires",
    resumo: "Jesuíta português e 39 companheiros, mortos no Atlântico a caminho do Brasil por sua fé.",
    texto: [
      "Nasceu no Porto, em Portugal, no ano de 1526. Aos 22 anos entrou para a Companhia de Jesus, então recém-fundada, tornando-se mais tarde reitor de colégios jesuítas em Lisboa e Braga.",
      "Foi enviado como Visitador das missões do Brasil por Santo Francisco de Borja, então Superior Geral da Ordem, e passou dois anos percorrendo o território, organizando o trabalho missionário entre os povos indígenas.",
      "Em 1570, ao retornar à Europa e reunir um novo grupo de 39 jesuítas para a missão brasileira, seu navio, o Santiago, foi atacado nas proximidades das Ilhas Canárias por corsários calvinistas franceses liderados por Jacques de Sores. Inácio e os companheiros foram mortos por se recusarem a renegar a fé católica.",
      "Ficaram conhecidos como os Quarenta Mártires do Brasil, beatificados pelo Papa Pio IX em 1854. Como é uma memória facultativa, sua celebração fica a critério de cada comunidade."
    ]
  },

  "sao-francisco-solano": {
    titulo: "São Francisco Solano",
    resumo: "Frade franciscano espanhol, apóstolo da evangelização na América do Sul.",
    texto: [
      "Nasceu em Montilla, na Espanha, em 1549. Aos 20 anos entrou para a Ordem Franciscana, dedicando-se aos estudos de filosofia e teologia.",
      "Em 1589, partiu em missão para a América do Sul, evangelizando por vinte anos as regiões de Tucumán (atual Argentina) e do Paraguai — ficou conhecido por sua notável facilidade para aprender línguas indígenas.",
      "É por isso chamado de \"apóstolo da América do Sul\", numa comparação direta com São Francisco Xavier, o grande missionário jesuíta do Oriente.",
      "Morreu em Lima, no Peru, em 1610. Foi canonizado pelo Papa Bento XIII em 1726."
    ]
  },

  "santas-justa-rufina": {
    titulo: "Santas Justa e Rufina",
    resumo: "Irmãs oleiras de Sevilha, martirizadas no século III por se recusarem a venerar ídolos pagãos.",
    texto: [
      "Justa e Rufina eram irmãs de Sevilha, na Espanha, que sustentavam a própria vida — e ajudavam os pobres da cidade — vendendo louças de cerâmica que fabricavam.",
      "Durante uma festa pagã, recusaram-se a vender suas peças para o culto de ídolos; em retaliação, tiveram sua mercadoria destruída. Revoltadas, quebraram uma imagem de Vênus, o que levou à sua prisão.",
      "Foram torturadas por ordem do prefeito da cidade por se recusarem a renegar a fé cristã. Segundo a tradição, Justa morreu na prisão em consequência dos maus-tratos, e Rufina foi decapitada, por volta do ano 287.",
      "São veneradas até hoje como padroeiras de Sevilha e dos oleiros."
    ]
  },

  "santa-margarida-antioquia": {
    titulo: "Santa Margarida de Antioquia",
    resumo: "Jovem virgem e mártir dos primeiros séculos, uma das Catorze Santos Auxiliadores.",
    texto: [
      "Segundo a tradição, nasceu por volta do ano 275 em Antioquia da Pisídia, na atual Turquia, filha de um sacerdote pagão. Foi criada por uma ama cristã e converteu-se ainda jovem, consagrando sua virgindade a Deus.",
      "Recusou-se a casar com um prefeito romano que se encantara por sua beleza, e por isso foi denunciada como cristã, presa e submetida a torturas para que renegasse a fé.",
      "A tradição narra seu martírio com detalhes que se tornaram lendários ao longo dos séculos — por isso a Igreja trata sua história com cautela histórica, embora a devoção popular permaneça viva.",
      "Tornou-se uma das Catorze Santos Auxiliadores, grupo de santos tradicionalmente invocados em situações de grande necessidade — Margarida é, em particular, invocada por gestantes."
    ]
  },

  "sao-lourenco-brindisi": {
    titulo: "São Lourenço de Brindisi",
    resumo: "Frade capuchinho poliglota, pregador da Contrarreforma e Doutor da Igreja.",
    texto: [
      "Nasceu em Brindisi, na Itália, em 1559, com o nome de batismo Giulio Cesare Russo. Tornou-se frade capuchinho aos 16 anos.",
      "Tinha um talento extraordinário para línguas: além do latim, falava fluentemente italiano, francês, alemão, espanhol, grego, hebraico e siríaco — o que lhe permitiu pregar e negociar em toda a Europa.",
      "Foi enviado à Alemanha para reforçar a fé católica em meio à Reforma Protestante, e chegou a acompanhar tropas imperiais como capelão numa vitória contra os turcos otomanos, em 1601. Foi também eleito vigário-geral, o posto mais alto da Ordem Capuchinha.",
      "Canonizado em 1881 pelo Papa Leão XIII e proclamado Doutor da Igreja em 1959 pelo Papa João XXIII, com o título de \"Doutor Apostólico\"."
    ]
  },

  "santa-maria-madalena": {
    titulo: "Santa Maria Madalena",
    resumo: "Discípula de Jesus e primeira testemunha de sua Ressurreição, chamada de \"Apóstola dos Apóstolos\".",
    texto: [
      "Os Evangelhos a apresentam como uma mulher de Magdala, na Galileia, curada por Jesus de sete demônios (Lc 8,2). Tornou-se, a partir daí, uma de suas discípulas mais fiéis.",
      "Esteve presente aos pés da cruz no Calvário, ao lado de Maria, mãe de Jesus, e do apóstolo João — quando a maior parte dos demais discípulos já havia fugido com medo.",
      "Segundo o Evangelho de João, foi a primeira pessoa a quem Jesus ressuscitado apareceu, e recebeu dele a missão de anunciar a notícia aos demais apóstolos — o que lhe rendeu, já em São Tomás de Aquino, o título de \"Apóstola dos Apóstolos\".",
      "Em 2016, o Papa Francisco elevou sua memória litúrgica ao grau de Festa, reforçando a importância de seu papel no anúncio da Ressurreição."
    ]
  },

  "santa-brigida-suecia": {
    titulo: "Santa Brígida da Suécia",
    resumo: "Mística, mãe de família e fundadora de ordem religiosa, copadroeira da Europa.",
    texto: [
      "Nasceu na Suécia em 1303. Ainda jovem, casou-se a pedido do pai, e viveu vinte e oito anos de casamento feliz, do qual nasceram oito filhos — entre eles Santa Catarina da Suécia, que mais tarde a seguiria a Roma e também seria canonizada.",
      "Depois da morte do marido, distribuiu seus bens e passou a viver junto ao mosteiro cisterciense de Alvastra, dedicando-se de forma mais intensa à vida espiritual.",
      "Ficou conhecida por suas experiências místicas, ditadas a seus confessores e reunidas nos oito livros das \"Revelações Celestiais\", cuja autenticidade espiritual foi reconhecida pelo Concílio de Constança, em 1415.",
      "Morreu em Roma em 1373 e foi canonizada em 1391. Em 1999, o Papa João Paulo II a declarou copadroeira da Europa."
    ]
  },

  "santa-cristina-bolsena": {
    titulo: "Santa Cristina de Bolsena",
    resumo: "Jovem mártir dos primeiros séculos do cristianismo, venerada há mais de mil anos junto ao Lago de Bolsena, na Itália.",
    texto: [
      "Segundo a tradição, nasceu por volta do ano 288, filha de um oficial do exército romano, perto do Lago de Bolsena, na Toscana. Converteu-se ao cristianismo ainda menina, contrariando a vontade do pai.",
      "Foi submetida a diversas torturas por se recusar a venerar os deuses romanos, e morreu mártir com apenas 12 anos, por volta do ano 300.",
      "Poucos dados históricos certos restam sobre sua vida além do nome e do local de sepultamento — por isso sua memória foi retirada do Calendário Romano Geral em 1969, permanecendo viva sobretudo na devoção local de Bolsena, onde é venerada há séculos."
    ]
  },

  "sao-tiago-maior": {
    titulo: "São Tiago Maior",
    resumo: "Apóstolo de Jesus, filho de Zebedeu, o primeiro dos Doze a ser martirizado.",
    texto: [
      "Pescador da Galileia, filho de Zebedeu e irmão do apóstolo João, foi chamado por Jesus junto com o irmão logo no início do seu ministério (Mc 1,19-20). É chamado de \"Maior\" para diferenciá-lo do outro apóstolo de mesmo nome, Tiago Menor.",
      "Esteve entre os três apóstolos mais próximos de Jesus, presente na Transfiguração e no Getsêmani.",
      "Foi o primeiro dos Doze Apóstolos a ser martirizado: decapitado por ordem do rei Herodes Agripa I, por volta do ano 44, em Jerusalém (At 12,1-2).",
      "A tradição afirma que seus restos foram levados para a Espanha, dando origem ao santuário de Santiago de Compostela — um dos maiores destinos de peregrinação do mundo cristão até hoje."
    ]
  },

  "sao-joaquim-santa-ana": {
    titulo: "São Joaquim e Santa Ana",
    resumo: "Pais de Nossa Senhora e avós de Jesus, segundo a tradição da Igreja.",
    texto: [
      "Seus nomes não aparecem na Bíblia: a tradição os conhece por meio de escritos antigos como o Protoevangelho de Tiago, que a Igreja acolhe como testemunho válido da memória cristã, mesmo sem fazer parte das Escrituras canônicas.",
      "Segundo essa tradição, eram um casal já idoso e sem filhos quando receberam de Deus a graça inesperada de uma filha: Maria, que criaram na fé e na oração.",
      "São venerados como avós de Jesus. Desde 2021, a Igreja celebra também, no domingo mais próximo desta memória, o Dia Mundial dos Avós e dos Idosos, instituído pelo Papa Francisco.",
      "Antigamente, cada um tinha sua própria data: em 1913, o Papa Pio X havia fixado a memória de São Joaquim em 16 de agosto, separada da de Santa Ana, celebrada em 26 de julho desde muito antes. Só na reforma litúrgica de 1969 é que os dois passaram a ser celebrados juntos, no mesmo dia, unindo pai e mãe da Virgem Maria numa só memória."
    ]
  },

  "sao-pantaleao": {
    titulo: "São Pantaleão",
    resumo: "Médico da corte imperial romana, martirizado por sua fé, padroeiro dos médicos.",
    texto: [
      "Nasceu em Nicomédia, na atual Turquia, no fim do século III. Filho de mãe cristã e pai pagão, estudou medicina e chegou a atuar como médico na corte imperial romana.",
      "Converteu-se ao cristianismo já adulto, após o convívio com um sacerdote idoso chamado Hermolau, e passou a atender os pobres gratuitamente.",
      "Denunciado como cristão por outros médicos, foi preso e, diante da recusa em renegar a fé, decapitado por ordem imperial, por volta do ano 305.",
      "É venerado como padroeiro dos médicos. Uma relíquia de seu sangue, guardada há séculos, é tradicionalmente relatada como tornando-se líquida todos os anos em sua festa — um fenômeno popular associado a seu culto, semelhante ao de São Januário."
    ]
  },

  "sao-celestino-i": {
    titulo: "São Celestino I, Papa",
    resumo: "Papa do século V que presidiu, por meio de legados, o Concílio de Éfeso.",
    texto: [
      "Nasceu na Campânia, na Itália, e foi eleito Papa em 422, governando a Igreja por quase dez anos.",
      "Enviou delegados para presidir o Concílio de Éfeso, em 431, convocado para julgar os ensinamentos de Nestório, que separava de forma indevida a natureza humana e divina de Cristo.",
      "O Concílio confirmou o dogma de que Maria é verdadeiramente Mãe de Deus (Theotokos) — decisão que a Igreja recorda especialmente na solenidade de 1º de janeiro.",
      "Também defendeu o direito de qualquer cristão recorrer ao Papa, e suas decisões (as \"Decretais\") ajudaram a lançar as bases do Direito Canônico. Morreu em Roma em 432."
    ]
  },

  "santos-marta-maria-lazaro": {
    titulo: "Santos Marta, Maria e Lázaro",
    resumo: "Os três irmãos de Betânia, amigos íntimos de Jesus, celebrados juntos desde 2021.",
    texto: [
      "Marta, Maria e Lázaro eram irmãos de Betânia, uma aldeia próxima a Jerusalém, e o Evangelho os descreve como amigos muito próximos de Jesus, que hospedavam em sua casa sempre que ele passava pela região.",
      "É na casa de Betânia que Marta se preocupa em servir enquanto Maria se senta aos pés de Jesus para ouvi-lo (Lc 10,38-42), e é ali também que Jesus chora diante do túmulo de Lázaro antes de ressuscitá-lo, quatro dias depois de sua morte (Jo 11).",
      "Diante desse milagre, é a própria Marta quem professa, com plena confiança, que Jesus é \"o Cristo, o Filho de Deus\" (Jo 11,27).",
      "Até 2021, apenas Santa Marta tinha memória própria neste dia; por decreto do Papa Francisco, os três irmãos passaram a ser celebrados juntos. Marta é hoje padroeira de cozinheiros, hospedeiros e de quem trabalha recebendo pessoas."
    ]
  },

  "sao-pedro-crisologo": {
    titulo: "São Pedro Crisólogo",
    resumo: "Bispo de Ravena no século V, conhecido como \"palavra de ouro\" por sua pregação, Doutor da Igreja.",
    texto: [
      "Nasceu em Ímola, na Itália, por volta do ano 380, e foi eleito bispo de Ravena em 424 — então capital do Império Romano do Ocidente, o que dava à sua palavra grande peso político e religioso.",
      "Recebeu o apelido de \"Crisólogo\" (palavra de ouro) por seus sermões, curtos, claros e ricos em doutrina — cerca de 176 homilias suas chegaram até hoje.",
      "Diante da disputa doutrinal sobre a natureza de Cristo que antecedeu o Concílio de Calcedônia, recomendou prudência a quem lhe escreveu pedindo apoio, insistindo que questões de fé deveriam sempre passar pelo bispo de Roma.",
      "Morreu por volta do ano 450. Foi proclamado Doutor da Igreja em 1729 pelo Papa Bento XIII."
    ]
  },

  "santo-inacio-loyola": {
    titulo: "Santo Inácio de Loyola",
    resumo: "Ex-soldado basco que, após uma conversão radical, fundou a Companhia de Jesus.",
    texto: [
      "Nasceu no País Basco, na Espanha, em 1491, e teve juventude dedicada à vida militar e à cavalaria. Em 1521, ao defender a cidade de Pamplona, foi gravemente ferido na perna por uma bala de canhão.",
      "Durante a longa convalescença, sem outra leitura disponível além de livros religiosos, passou a refletir sobre o contraste entre a alegria passageira das ambições mundanas e a alegria duradoura de servir a Deus — o início de sua conversão.",
      "Dessas reflexões nasceriam os \"Exercícios Espirituais\", método de oração e discernimento que se tornou uma das obras mais influentes da espiritualidade cristã.",
      "Em 1534, junto com seis companheiros — entre eles São Francisco Xavier —, fundou em Paris a Companhia de Jesus, aprovada pelo Papa Paulo III em 1540. Morreu em Roma em 1556 e foi canonizado em 1622 pelo Papa Gregório XV."
    ]
  },

  "santo-afonso-ligorio": {
    titulo: "Santo Afonso Maria de Ligório",
    resumo: "Bispo napolitano, fundador dos Redentoristas e Doutor da Igreja, autor de mais de cem obras de teologia moral e espiritualidade.",
    texto: [
      "Nasceu em Nápoles, na Itália, em 1696, numa família nobre. Formou-se em Direito ainda jovem e exerceu a advocacia com destaque, até que a perda de uma causa por interferência política o levou a abandonar a carreira e seguir a vida religiosa.",
      "Ordenado sacerdote aos 30 anos, dedicou-se sobretudo à evangelização dos mais pobres e abandonados, nas regiões rurais ao redor de Nápoles.",
      "Em 1732 fundou a Congregação do Santíssimo Redentor (os Redentoristas), voltada às missões populares. Em 1762, já idoso, foi nomeado bispo de Sant'Agata dei Goti, renunciando ao cargo por motivos de saúde treze anos depois, em 1775.",
      "Deixou mais de cem obras escritas, entre elas o influente tratado de Teologia Moral. Morreu em 1787, foi canonizado em 1839 e proclamado Doutor da Igreja em 1871."
    ]
  },

  "sao-pedro-juliao-eymard": {
    titulo: "São Pedro Julião Eymard",
    resumo: "Sacerdote francês conhecido como o \"apóstolo da Eucaristia\", fundador de duas congregações dedicadas à adoração eucarística.",
    texto: [
      "Nasceu em La Mure, na França, em 1811. Ordenado sacerdote em 1834, integrou-se anos depois à Congregação Marista, onde se destacou por sua profunda devoção à Eucaristia.",
      "Em 1856, fundou a Congregação do Santíssimo Sacramento, dedicada especialmente à adoração eucarística; pouco depois, fundou também as Servas do Santíssimo Sacramento, ramo feminino da mesma espiritualidade.",
      "Empenhou-se em tornar a adoração ao Santíssimo Sacramento acessível a leigos, sacerdotes e crianças, sendo um dos grandes responsáveis por reavivar essa devoção na Igreja do século XIX.",
      "Morreu em 1868 e foi canonizado em 1962 pelo Papa João XXIII. Em 1995, o Papa João Paulo II inscreveu sua festa no calendário universal da Igreja, reconhecendo nele um \"apóstolo da Eucaristia\"."
    ]
  },

  "santa-lidia": {
    titulo: "Santa Lídia",
    resumo: "Comerciante da Ásia Menor, considerada a primeira convertida ao cristianismo em solo europeu.",
    texto: [
      "Lídia era natural de Tiatira, na Ásia Menor, região famosa pela produção de tecidos tingidos de púrpura — comércio do qual ela vivia, o que lhe dava independência financeira incomum para uma mulher da época.",
      "O livro de Atos dos Apóstolos (16,11-15) narra seu encontro com São Paulo na cidade de Filipos, na Macedônia: ouvindo-o pregar à beira de um rio, \"o Senhor abriu-lhe o coração\" e ela pediu o batismo para si e para toda a sua casa.",
      "Esse episódio é considerado o início da comunidade cristã na Europa. Depois de batizada, Lídia acolheu Paulo e seus companheiros em sua própria casa, que se tornou o primeiro núcleo da Igreja em Filipos."
    ]
  },

  "sao-joao-maria-vianney": {
    titulo: "São João Maria Vianney",
    resumo: "O Cura d'Ars, padroeiro dos padres, conhecido por sua entrega ao confessionário.",
    texto: [
      "Nasceu em 1786, perto de Lyon, na França, filho de camponeses. Teve dificuldade nos estudos — chegou a ser considerado quase incapaz de aprender latim — mas foi ordenado sacerdote aos 29 anos, em 1815, graças à insistência e ao apoio de mestres que reconheceram sua profunda vida de oração.",
      "Em 1818 foi enviado como pároco a Ars, uma pequena e pobre aldeia francesa de pouco mais de 200 habitantes, onde permaneceria até a morte.",
      "Dedicou-se de forma extraordinária ao sacramento da Confissão, chegando a passar até 16 horas por dia no confessionário, recebendo peregrinos vindos de toda a França.",
      "Morreu em 1859. Foi canonizado em 1925 e, em 1929, proclamado padroeiro dos párocos de todo o mundo."
    ]
  },

  "dedicacao-santa-maria-maior": {
    titulo: "Dedicação da Basílica de Santa Maria Maior",
    resumo: "A basílica mariana mais antiga do Ocidente, erguida em Roma segundo a tradição de um milagre de neve em pleno verão.",
    texto: [
      "Segundo a tradição, no ano 358, Nossa Senhora teria pedido ao Papa Libério que lhe construísse uma igreja no local que amanhecesse coberto de neve — o que, surpreendentemente, aconteceu no dia 5 de agosto, em pleno verão romano, no monte Esquilino.",
      "A construção da basílica teve início ainda no papado de Libério, mas foi consagrada por São Sisto III logo depois do Concílio de Éfeso, de 431, que proclamou Maria como verdadeira Mãe de Deus.",
      "É a mais antiga igreja do Ocidente dedicada à Virgem Maria, e uma das quatro basílicas papais maiores de Roma, ao lado de São Pedro, São João de Latrão e São Paulo Fora dos Muros.",
      "Até hoje, no aniversário da dedicação, é celebrada com uma tradicional \"chuva\" de pétalas brancas, em memória do milagre da neve."
    ]
  },

  "sao-sisto-ii": {
    titulo: "São Sisto II, Papa e Companheiros, Mártires",
    resumo: "Papa do século III, martirizado junto com seus diáconos durante a perseguição do imperador Valeriano.",
    texto: [
      "Eleito Papa em 257, governou a Igreja por pouco mais de um ano, em meio a uma das perseguições mais violentas contra os cristãos, movida pelo imperador romano Valeriano.",
      "Um decreto imperial determinava a execução sumária de bispos, presbíteros e diáconos, sem julgamento — bastava confirmar a identidade da pessoa.",
      "Foi preso e executado em 258, no cemitério de Calisto, em Roma, enquanto celebrava a liturgia, junto com quatro de seus diáconos. Outro de seus diáconos, Lourenço, seria martirizado poucos dias depois, em 10 de agosto.",
      "É um dos papas mártires mais venerados pela Igreja antiga, sendo até hoje citado no cânon romano da Missa."
    ]
  },

  "sao-domingos-gusmao": {
    titulo: "São Domingos de Gusmão",
    resumo: "Fundador da Ordem dos Pregadores (dominicanos), dedicada ao estudo e à pregação.",
    texto: [
      "Nasceu em Caleruega, na Espanha, por volta de 1170, filho de família da pequena nobreza. Dedicou-se desde jovem aos estudos teológicos, tornando-se cônego da catedral de Osma.",
      "Em viagem pelo sul da França, entrou em contato com comunidades atingidas pela heresia cátara, e passou a se dedicar à pregação para combatê-la, insistindo especialmente na força do exemplo de vida simples e pobre.",
      "Em 1216, fundou a Ordem dos Frades Pregadores, mais tarde conhecida como Ordem Dominicana, aprovada pelo Papa Honório III — uma ordem voltada ao estudo aprofundado da teologia como base para a pregação.",
      "Morreu em Bolonha, na Itália, em 1221. Foi canonizado em 1234 pelo Papa Gregório IX."
    ]
  },

  "santa-teresa-benedita-cruz": {
    titulo: "Santa Teresa Benedita da Cruz (Edith Stein)",
    resumo: "Filósofa judia convertida ao catolicismo, freira carmelita e mártir em Auschwitz, copadroeira da Europa.",
    texto: [
      "Edith Stein nasceu em 1891, numa família judia praticante em Breslau, então Alemanha (hoje Wroclaw, na Polônia). Tornou-se uma respeitada filósofa, discípula do fenomenólogo Edmund Husserl.",
      "Converteu-se ao catolicismo em 1922, depois de ler, numa só noite, a autobiografia de Santa Teresa d'Ávila. Anos depois, entrou para o Carmelo de Colônia, recebendo o nome de Teresa Benedita da Cruz.",
      "Com a perseguição nazista aos judeus, foi transferida para um convento na Holanda por segurança — mas, em agosto de 1942, foi presa pela Gestapo junto com outros católicos de origem judaica, em represália a uma carta pastoral dos bispos holandeses contra o nazismo.",
      "Morreu na câmara de gás de Auschwitz-Birkenau em 9 de agosto de 1942. Foi canonizada em 1998 pelo Papa João Paulo II, que a proclamou, no ano seguinte, copadroeira da Europa."
    ]
  },

  "sao-lourenco-diacono": {
    titulo: "São Lourenço, Diácono e Mártir",
    resumo: "Diácono de Roma, martirizado sobre uma grelha por distribuir os bens da Igreja aos pobres.",
    texto: [
      "Nascido na Península Ibérica, foi acolhido em Roma pelo Papa Sisto II, que o ordenou diácono e o encarregou de administrar os bens da Igreja e cuidar da assistência aos pobres da cidade.",
      "Depois que Sisto II foi martirizado, em 6 de agosto de 258, as autoridades romanas exigiram que Lourenço entregasse os tesouros da Igreja. Ele reuniu então uma multidão de pobres, doentes e órfãos, e declarou: \"Estes são os tesouros da Igreja\".",
      "Por essa resposta, foi condenado à morte e, segundo a tradição, martirizado sobre uma grelha em brasa, em 10 de agosto de 258.",
      "Tornou-se um dos mártires mais venerados da Igreja antiga, citado até hoje no cânon romano da Missa."
    ]
  },

  "santa-clara-assis": {
    titulo: "Santa Clara de Assis",
    resumo: "Fundadora das Clarissas, seguiu o mesmo caminho de pobreza radical de São Francisco de Assis.",
    texto: [
      "Nasceu em Assis, na Itália, em 1194, numa família nobre. Aos 18 anos, tocada por uma pregação de São Francisco de Assis, decidiu abandonar tudo para seguir o mesmo ideal de pobreza evangélica.",
      "Em 1212, fugiu de casa à noite para se consagrar a Deus nas mãos do próprio Francisco, que a acolheu e, pouco depois, a instalou no mosteiro de São Damião, dando início à futura Ordem das Clarissas.",
      "Escreveu ela mesma a Regra de sua Ordem — a primeira regra religiosa feminina redigida por uma mulher na história da Igreja —, centrada na pobreza extrema e na vida de oração e clausura.",
      "Morreu em 1253. Foi canonizada já dois anos depois, em 1255, pelo Papa Alexandre IV."
    ]
  },

  "santa-joana-francisca-chantal": {
    titulo: "Santa Joana Francisca de Chantal",
    resumo: "Nobre francesa, viúva e mãe, fundadora da Ordem da Visitação junto com São Francisco de Sales.",
    texto: [
      "Nasceu em Dijon, na França, em 1572. Casou-se com o barão de Chantal e teve seis filhos, dos quais quatro sobreviveram à infância, mas ficou viúva ainda jovem, quando o marido morreu num acidente de caça.",
      "Em 1604, tornou-se dirigida espiritualmente por São Francisco de Sales, bispo de Genebra — encontro que deu origem a uma das amizades espirituais mais conhecidas da história da Igreja.",
      "Juntos, fundaram em 1610 a Congregação da Visitação de Santa Maria, ordem voltada à humildade e à mansidão, inspirada no encontro de Maria com sua prima Isabel.",
      "Morreu em 1641. Foi canonizada em 1767 pelo Papa Clemente XIII, e é hoje considerada padroeira das viúvas e das mães de família."
    ]
  },

  "sao-maximiliano-kolbe": {
    titulo: "São Maximiliano Maria Kolbe",
    resumo: "Frade franciscano polonês que se ofereceu para morrer no lugar de outro prisioneiro em Auschwitz.",
    texto: [
      "Nasceu na Polônia em 1894 e entrou para a Ordem Franciscana ainda jovem, tornando-se sacerdote em 1918. Teve grande devoção à Imaculada Conceição, fundando a Milícia da Imaculada e um jornal católico de grande circulação.",
      "Durante a Segunda Guerra Mundial, foi preso pelos nazistas e enviado ao campo de concentração de Auschwitz em 1941.",
      "Quando um grupo de prisioneiros foi condenado a morrer de fome como punição pela fuga de outro detento, Kolbe se ofereceu voluntariamente para tomar o lugar de um dos sorteados, Franciszek Gajowniczek, que tinha esposa e filhos.",
      "Depois de duas semanas sem água nem comida, foi executado com uma injeção letal em 14 de agosto de 1941, véspera da Assunção de Maria. Foi canonizado em 1982 pelo Papa João Paulo II, que o proclamou mártir da caridade — o próprio homem que ele salvou esteve presente na canonização."
    ]
  },

  "santo-estevao-hungria": {
    titulo: "Santo Estêvão, Rei da Hungria",
    resumo: "Primeiro rei cristão da Hungria, unificou o país e consagrou a nação a Nossa Senhora.",
    texto: [
      "Nasceu por volta de 969, filho do duque Gesa. Foi batizado ainda criança, junto com o pai, que também se converteu ao cristianismo.",
      "Tornou-se grão-príncipe dos húngaros em 997, sucedendo o pai, e dedicou-se a unificar as diversas tribos húngaras, até então rivais entre si — promovendo ativamente a evangelização do povo. Foi coroado o primeiro rei da Hungria no ano 1000 (ou 1001, conforme a fonte).",
      "Consagrou o reino da Hungria a Nossa Senhora, tornando-se, por isso, um símbolo da fé e da identidade nacional húngara até hoje.",
      "Morreu em 15 de agosto de 1038 — dia da Assunção de Maria —, por isso sua memória é celebrada no dia seguinte. Foi canonizado em 1083 pelo Papa Gregório VII."
    ]
  },

  "sao-jacinto-polonia": {
    titulo: "São Jacinto da Polônia",
    resumo: "Frade dominicano polonês, conhecido como o \"apóstolo do Norte\" por levar o Evangelho à Europa Oriental.",
    texto: [
      "Nasceu por volta de 1185, na Silésia, região da atual Polônia, numa família nobre. Formado em direito canônico e teologia, tornou-se cônego da catedral de Cracóvia.",
      "Em viagem a Roma, conheceu São Domingos de Gusmão e decidiu tornar-se frade dominicano, sendo um dos primeiros a receber o hábito da Ordem ainda em vida do fundador.",
      "Voltou à Polônia com outros frades e dedicou décadas a fundar mosteiros e pregar por toda a Europa Central e Oriental — Cracóvia, Gdańsk, Kiev e outras regiões —, o que lhe rendeu o título de \"apóstolo do Norte\".",
      "Morreu em Cracóvia em 15 de agosto de 1257, dia da Assunção; sua memória, por isso, também é celebrada no dia seguinte. Foi canonizado em 1594 pelo Papa Clemente VIII."
    ]
  },

  "santa-helena-imperatriz": {
    titulo: "Santa Helena, Imperatriz",
    resumo: "Mãe do imperador Constantino, tradicionalmente associada à descoberta das relíquias da Vera Cruz em Jerusalém.",
    texto: [
      "Nasceu por volta do ano 250, de origem humilde, na região da Bitínia (atual Turquia). Tornou-se esposa do general romano Constâncio Cloro e mãe de Constantino, o futuro imperador que tornaria o cristianismo religião tolerada no Império Romano.",
      "Já convertida ao cristianismo e com mais de 80 anos, viajou à Terra Santa, onde promoveu escavações em Jerusalém em busca dos lugares sagrados da vida de Jesus.",
      "Segundo a tradição, foi nessa viagem que se encontraram relíquias associadas à cruz de Jesus, hoje veneradas na Basílica de Santa Cruz de Jerusalém, em Roma.",
      "Mandou também construir basílicas nos lugares mais sagrados da fé cristã, como a Basílica da Natividade, em Belém. Morreu por volta de 330, e é hoje padroeira dos arqueólogos e dos conversos."
    ]
  },

  "sao-joao-eudes": {
    titulo: "São João Eudes",
    resumo: "Sacerdote francês, pioneiro da devoção aos Sagrados Corações de Jesus e Maria.",
    texto: [
      "Nasceu em 1601, na região da Normandia, França. Ordenado sacerdote em 1625, dedicou-se à pregação popular e ao cuidado dos mais pobres, chegando a arriscar a vida atendendo doentes durante surtos de peste.",
      "Fundou a Congregação de Jesus e Maria, voltada à formação de sacerdotes, e também uma ordem dedicada ao acolhimento de mulheres em situação de vulnerabilidade, que mais tarde daria origem às Irmãs do Bom Pastor.",
      "Foi o primeiro a instituir uma festa litúrgica própria em honra ao Imaculado Coração de Maria e ao Sagrado Coração de Jesus, celebrando a primeira Missa dedicada ao Coração de Jesus em 1670 — décadas antes de essas devoções se espalharem pela Igreja.",
      "Morreu em 1680. Foi canonizado em 1925 pelo Papa Pio XI, que o chamou de pai, doutor e apóstolo da devoção aos Sagrados Corações."
    ]
  },

  "sao-bernardo-claraval": {
    titulo: "São Bernardo de Claraval, abade e doutor da Igreja",
    resumo: "Abade cisterciense e místico medieval, uma das maiores influências espirituais e teológicas do século XII.",
    texto: [
      "Nasceu por volta de 1090, no castelo de Fontaine-lès-Dijon, na Borgonha (França), em família da pequena nobreza. Aos 22 anos, entrou para o mosteiro cisterciense de Cister, levando consigo cerca de trinta parentes e amigos que se converteram pelo seu exemplo.",
      "Em 1115, foi enviado para fundar um novo mosteiro, ao qual deu o nome de Claraval (Clairvaux), tornando-se seu primeiro abade. Sob sua direção, a nova casa se tornou centro irradiador da reforma cisterciense, chegando a gerar dezenas de outros mosteiros por toda a Europa.",
      "Foi um dos maiores teólogos e místicos de seu tempo, com grande devoção à Virgem Maria — seus sermões sobre o Cântico dos Cânticos lhe valeram o título de \"Doutor Melífluo\", de fala doce como o mel. Interveio também em disputas doutrinárias, aconselhou papas e bispos e, a pedido do Papa Eugênio III, seu antigo discípulo, pregou a Segunda Cruzada em 1146.",
      "Morreu em 20 de agosto de 1153. Foi canonizado em 1174 pelo Papa Alexandre III e, em 1830, proclamado Doutor da Igreja pelo Papa Pio VIII."
    ]
  },

  "sao-pio-x": {
    titulo: "São Pio X, Papa",
    resumo: "Papa que fez da Eucaristia o centro de seu pontificado, antecipando a Primeira Comunhão das crianças.",
    texto: [
      "Giuseppe Melchiorre Sarto nasceu em 2 de junho de 1835, em Riese, no norte da Itália, filho de um carteiro. Ordenado sacerdote em 1858, exerceu o ministério como pároco antes de se tornar bispo de Mântua e, depois, patriarca de Veneza.",
      "Eleito papa em 1903, adotou o nome de Pio X e colocou a Eucaristia no centro de seu pontificado: incentivou a comunhão frequente, mesmo diária, para todo fiel em estado de graça, e, com o decreto Quam singulari, de 1910, antecipou a Primeira Comunhão das crianças para por volta dos sete anos, a chamada \"idade da razão\".",
      "Reformou também o canto sagrado, recuperando o canto gregoriano, simplificou o breviário romano e deu início aos trabalhos que resultariam no Código de Direito Canônico. Combateu com firmeza o Modernismo, que via como ameaça à fé católica, sem nunca perder a simplicidade de vida herdada de sua origem humilde.",
      "Morreu em 20 de agosto de 1914. Foi beatificado em 1951 e canonizado em 3 de setembro de 1954 pelo Papa Pio XII — o primeiro papa canonizado desde São Pio V, no século XVI."
    ]
  },

  "santa-maria-rainha": {
    titulo: "Santa Maria Rainha",
    resumo: "Festa que celebra Maria como Rainha do Céu e da Terra, por sua união única com Cristo, Rei dos reis.",
    texto: [
      "Instituída pelo Papa Pio XII em 1954, na encíclica Ad Caeli Reginam, publicada durante o Ano Mariano que marcava o centenário do dogma da Imaculada Conceição. Na ocasião, o papa coroou solenemente a imagem de Nossa Senhora na Basílica de Santa Maria Maior, em Roma.",
      "A festa era celebrada originalmente em 31 de maio, encerrando o mês mariano; com a reforma litúrgica posterior ao Concílio Vaticano II, passou para 22 de agosto — exatamente oito dias depois da Assunção, sublinhando o vínculo entre os dois mistérios: a Virgem elevada ao Céu de corpo e alma é ali coroada Rainha, ao lado do Filho.",
      "O título de Rainha decorre da relação única de Maria com Cristo: o anjo Gabriel já anunciara que o filho de Maria \"reinará para sempre\" (Lc 1,32-33); sendo ela Mãe do Rei dos reis, a tradição cristã via nela, por extensão, uma participação singular nessa realeza.",
      "A Igreja entende essa realeza não como poder terreno, mas como serviço materno e intercessão: Maria reina junto do Filho para conduzir todos a Ele, sendo por isso invocada, na Ladainha de Nossa Senhora, como Rainha dos Anjos, dos Patriarcas, dos Apóstolos e de todos os Santos."
    ]
  },

  "santa-rosa-lima": {
    titulo: "Santa Rosa de Lima, virgem, padroeira da América Latina",
    resumo: "Primeira pessoa nascida na América a ser canonizada, terciária dominicana conhecida por sua vida de penitência e caridade.",
    texto: [
      "Nasceu em Lima, no Peru, em 20 de abril de 1586, com o nome de Isabel Flores de Oliva; passou a ser chamada Rosa por sua beleza, e mais tarde acrescentou \"de Santa Maria\" ao nome, ao receber o hábito.",
      "Ainda jovem, consagrou-se a Cristo e ingressou na Ordem Terceira de São Domingos, inspirando-se na vida de Santa Catarina de Sena. Viveu em rigorosa penitência — jejuns severos, cilício e disciplinas —, oferecendo seus sofrimentos pela conversão dos pecadores e pela evangelização das terras recém-descobertas da América.",
      "Dedicou-se também aos pobres e doentes, cuidando deles em sua própria casa, um gesto pioneiro de assistência social em Lima. Vivia recolhida em oração numa pequena cabana no quintal da família, onde relatava intensas experiências místicas.",
      "Morreu em 24 de agosto de 1617, aos 31 anos. Foi canonizada em 12 de abril de 1671 pelo Papa Clemente X, tornando-se a primeira pessoa nascida na América proclamada santa. É padroeira do Peru, da América Latina e das Filipinas; sua memória litúrgica é celebrada em 23 de agosto."
    ]
  },

  "sao-bartolomeu-apostolo": {
    titulo: "São Bartolomeu, Apóstolo",
    resumo: "Um dos Doze Apóstolos, tradicionalmente identificado com Natanael, martirizado na Armênia.",
    texto: [
      "Os Evangelhos sinóticos o citam apenas nas listas dos Doze Apóstolos, sempre ao lado de Filipe. A tradição, seguida por boa parte dos estudiosos, o identifica com Natanael, mencionado no Evangelho de João — um homem de Caná da Galileia que Filipe apresentou a Jesus.",
      "Ao vê-lo se aproximar, Jesus disse: \"Eis um verdadeiro israelita, em quem não há falsidade\" (Jo 1,47). Surpreso por ser conhecido sem nunca terem se encontrado, Natanael o reconhece de imediato como \"Filho de Deus\" e \"Rei de Israel\".",
      "Segundo a tradição, depois de Pentecostes levou o Evangelho a regiões como Mesopotâmia, Pérsia e Armênia, onde teria convertido o rei Polímio ao cristianismo. Por essa conversão, teria sido preso e martirizado por ordem de Astíages, irmão do rei, incitado pelos sacerdotes pagãos — segundo o relato mais difundido, esfolado vivo e depois decapitado (outras versões falam de crucificação de cabeça para baixo).",
      "É por causa desse martírio que se tornou padroeiro dos curtidores e dos trabalhadores do couro, sendo tradicionalmente representado segurando uma faca ou a própria pele — como fez Michelangelo, que o pintou segurando sua pele esfolada no afresco do Juízo Final, na Capela Sistina."
    ]
  },

  "sao-luis-rei-franca": {
    titulo: "São Luís, Rei da França",
    resumo: "Rei da França no século XIII, o único monarca francês canonizado, conhecido pela justiça e pela devoção às cruzadas.",
    texto: [
      "Nasceu em 1214 e tornou-se rei da França ainda criança, aos 12 anos, em 1226, sob a regência de sua mãe, Branca de Castela, que cuidou pessoalmente de sua formação religiosa. Casou-se com Margarida da Provença e governou por mais de quatro décadas.",
      "Ficou conhecido por reformar a justiça do reino — julgava pessoalmente as causas de seus súditos, muitas vezes sentado sob um carvalho em Vincennes — e por cuidar dos pobres e doentes. Mandou construir a Sainte-Chapelle, em Paris, para abrigar relíquias da Paixão de Cristo que adquiriu, entre elas a Coroa de Espinhos.",
      "Liderou a Sétima Cruzada, em 1248, sendo capturado no Egito e resgatado a alto custo. Em 1270, partiu para a Oitava Cruzada rumo à Tunísia, mas uma epidemia (provavelmente disenteria) se espalhou pelo acampamento assim que desembarcaram perto de Tunes, e Luís morreu poucas semanas depois, em 25 de agosto de 1270.",
      "Foi canonizado em 1297 pelo Papa Bonifácio VIII, tornando-se o único rei da França elevado à santidade. É padroeiro da Ordem Franciscana Secular, e seu nome batizou cidades como St. Louis, nos Estados Unidos."
    ]
  },

  "sao-zeferino-papa": {
    titulo: "São Zeferino, Papa e mártir",
    resumo: "Papa do início do século III, guiou a Igreja de Roma em meio a perseguições e às primeiras grandes controvérsias sobre a Trindade.",
    texto: [
      "De origem humilde, tornou-se bispo de Roma por volta do ano 199, sucedendo o Papa Vítor I, durante o reinado do imperador Septímio Severo — período em que um edito imperial proibiu novas conversões ao cristianismo.",
      "Seu pontificado foi marcado pelas primeiras grandes disputas trinitárias da Igreja, como o Monarquianismo, que negava a distinção entre as Pessoas divinas. O sacerdote Hipólito o acusava de falta de rigor teológico por não condenar abertamente os erros, preferindo afirmar com simplicidade a fé em um só Deus e no Filho encarnado.",
      "Confiou a administração de bens da Igreja, incluindo o cemitério cristão na Via Ápia, a seu diácono de confiança, Calisto, que viria a sucedê-lo como papa.",
      "Morreu em 20 de dezembro de 217. O Martirológio Romano o venera como mártir, embora não haja registro histórico detalhado de uma execução violenta durante seu pontificado — a tradição do martírio remonta aos primeiros séculos da Igreja, numa época em que ser bispo de Roma já significava viver sob constante ameaça."
    ]
  },

  "santa-monica": {
    titulo: "Santa Mônica",
    resumo: "Mãe de Santo Agostinho, lembrada por décadas de oração e lágrimas pela conversão do filho.",
    texto: [
      "Nasceu por volta do ano 331 em Tagaste, no norte da África (atual Argélia), de família cristã berbere. Casou-se ainda jovem com Patrício, pagão de temperamento difícil e infiel, que ela suportou com paciência e que, nos últimos anos de vida, veio a se converter ao cristianismo por sua influência.",
      "Sofreu profundamente ao ver seu filho mais velho, Agostinho, levar uma vida dissoluta e aderir à heresia maniqueísta. Durante quase duas décadas, rezou e chorou por sua conversão, chegando a segui-lo de Tagaste a Roma e depois a Milão.",
      "Em Milão, encontrou apoio no bispo Santo Ambrósio, que a consolou dizendo que \"um filho de tantas lágrimas não pode se perder\". Viveu para ver esse desejo realizado: esteve presente quando Agostinho foi batizado por Ambrósio, na Páscoa de 387.",
      "Morreu poucos meses depois, em Óstia, porto de Roma, enquanto aguardava embarcar de volta à África com o filho já convertido. É venerada como padroeira das mães, sobretudo das que rezam pela conversão de filhos afastados da fé."
    ]
  },

  "santo-agostinho-hipona": {
    titulo: "Santo Agostinho, Bispo de Hipona e Doutor da Igreja",
    resumo: "Um dos maiores teólogos da história do cristianismo, autor das Confissões e da Cidade de Deus.",
    texto: [
      "Nasceu em 354 em Tagaste, no norte da África, filho de Santa Mônica, cristã, e de Patrício, pagão. Brilhante estudante de retórica, viveu a juventude longe da fé da mãe: aderiu à seita maniqueísta e teve um filho, Adeodato, com uma mulher com quem viveu por anos sem se casar.",
      "Mudou-se para Milão para ensinar retórica, onde sofreu a influência do bispo Santo Ambrósio e das orações incansáveis de sua mãe. Em 386, viveu sua conversão num jardim, ao ouvir uma voz infantil repetir \"Tolle, lege\" (Toma e lê) — abriu as Escrituras ao acaso e leu uma passagem de Paulo que decidiu sua vida. Foi batizado por Ambrósio na Páscoa de 387.",
      "Voltou à África, foi ordenado padre em 391 e tornou-se bispo de Hipona poucos anos depois. Escreveu obras que moldaram todo o pensamento cristão ocidental, entre elas as \"Confissões\", relato de sua própria conversão, e \"A Cidade de Deus\", escrita após o saque de Roma em 410 — além de desenvolver reflexões decisivas sobre a graça, o pecado original e a guerra justa.",
      "Morreu em 28 de agosto de 430, enquanto Hipona era cercada pelos vândalos. É reconhecido como Doutor da Igreja, chamado de \"Doutor da Graça\" pela profundidade de sua teologia."
    ]
  },

  "martirio-joao-batista": {
    titulo: "Martírio de São João Batista",
    resumo: "A prisão e decapitação do precursor de Jesus, por ordem de Herodes Antipas.",
    texto: [
      "João Batista foi preso por ordem de Herodes Antipas, tetrarca da Galileia, depois de denunciar publicamente seu casamento com Herodíades, esposa de seu próprio irmão — união que a Lei judaica proibia.",
      "Durante um banquete, a filha de Herodíades dançou e agradou tanto Herodes que ele prometeu lhe dar o que pedisse. Instruída pela mãe, ela pediu a cabeça de João Batista numa bandeja (Mc 6,17-29; Mt 14,3-12).",
      "João estava preso na fortaleza de Maqueronte, a leste do Mar Morto, onde foi decapitado para cumprir o juramento do rei diante de seus convidados.",
      "É uma das poucas celebrações de martírio no calendário litúrgico com grau de festa. João Batista é, ao lado de Jesus e Maria, o único cuja Igreja celebra tanto o nascimento quanto a morte — reconhecimento único de seu papel como o último profeta do Antigo Testamento e precursor direto de Cristo, como destacou o Papa Bento XVI em 2012."
    ]
  },

  "santos-felix-adauto": {
    titulo: "Santos Félix e Adauto, mártires",
    resumo: "Sacerdote romano e um cristão anônimo que se somou a seu martírio, venerados desde a Antiguidade apesar de poucos dados históricos confirmados sobre suas vidas.",
    texto: [
      "Félix era um sacerdote de Roma martirizado, segundo a tradição, durante a perseguição do imperador Diocleciano, por volta do ano 303, junto com um companheiro cujo nome verdadeiro nunca se soube.",
      "Levado a sacrificar aos deuses pagãos, Félix teria se recusado e visto os ídolos se espatifarem diante de sua oração. Foi então conduzido à execução — e no caminho um desconhecido na multidão se declarou cristão em solidariedade, sendo preso e morto ao seu lado. Por não se saber seu nome, passou a ser chamado Adauto, do latim \"o que foi acrescentado\".",
      "Os relatos mais detalhados desse episódio são considerados pelos estudiosos uma elaboração lendária tardia, possivelmente originada da leitura equivocada de uma antiga inscrição no túmulo dos dois mártires — não há registro histórico independente que confirme os detalhes das Atas. O culto aos dois, contudo, é muito antigo, atestado já nos martirológios mais primitivos da Igreja.",
      "Foram sepultados na catacumba de Comodila, na Via Ostiense, perto da Basílica de São Paulo Fora dos Muros, onde uma basílica foi erguida sobre o túmulo e redescoberta apenas no início do século XX. A Igreja os celebra em 30 de agosto."
    ]
  },

  "sao-raimundo-nonato": {
    titulo: "São Raimundo Nonato",
    resumo: "Frade mercedário espanhol que se ofereceu como refém para libertar cativos cristãos e teve os lábios lacrados para não pregar o Evangelho.",
    texto: [
      "Nasceu por volta de 1204 em Portell, perto de Barcelona, na Catalunha. Segundo a tradição, sua mãe morreu em trabalho de parto e ele foi retirado do corpo dela ainda vivo — daí o sobrenome Nonato, do latim non natus, \"não nascido\".",
      "Ainda jovem, entrou para a Ordem de Nossa Senhora das Mercês, fundada por São Pedro Nolasco para o resgate de cristãos escravizados pelos mouros no norte da África. Dedicou-se pessoalmente a essa missão, e quando o dinheiro do resgate se esgotou, ofereceu-se como refém no lugar de outros cativos, permanecendo preso para garantir a liberdade deles.",
      "Mesmo cativo, continuou pregando e convertendo outros prisioneiros. Para calá-lo, seus captores lhe perfuraram os lábios e os fecharam com um cadeado — ficou meses acorrentado num cárcere imundo até ser resgatado pelos próprios irmãos mercedários.",
      "Em 1239 o Papa Gregório IX o nomeou cardeal e o chamou a Roma, mas Raimundo morreu no caminho, perto de Barcelona, em 31 de agosto de 1240. Foi canonizado em 1657 pelo Papa Alexandre VII. É padroeiro das gestantes e das parteiras e, por causa do cadeado nos lábios, também é invocado por quem não consegue se confessar em voz alta."
    ]
  },

  "santa-beatriz-silva": {
    titulo: "Santa Beatriz da Silva, virgem",
    resumo: "Nobre portuguesa que fundou a Ordem da Imaculada Conceição depois de escapar, segundo a tradição, de um aprisionamento cruel na corte de Castela.",
    texto: [
      "Nasceu por volta de 1424, em família nobre portuguesa. Em 1447 partiu para a corte de Castela como dama de companhia da rainha Isabel de Portugal, esposa do rei João II de Castela.",
      "A tradição conta que a beleza de Beatriz despertou o ciúme da rainha, que a mandou trancar dentro de um baú, sem comida nem água, por três dias. No cativeiro, Beatriz teria tido uma visão de Nossa Senhora, prometendo-lhe proteção e pedindo que fundasse uma ordem em honra da Imaculada Conceição.",
      "Livre do episódio, retirou-se para Toledo, onde viveu por décadas junto às religiosas dominicanas do mosteiro de Santo Domingo el Real, sem chegar a professar naquela ordem. Em 1484, já com o apoio da rainha Isabel, a Católica, recebeu o palácio de Galiana para reunir as primeiras companheiras da nova comunidade.",
      "O Papa Inocêncio VIII aprovou oficialmente a nova ordem em 1489. Beatriz morreu em Toledo por volta de 1492, antes de professar formalmente os votos. Foi beatificada em 1926 pelo Papa Pio XI e canonizada em 1976 pelo Papa Paulo VI."
    ]
  },

  "santa-doroteia-cesareia": {
    titulo: "Santa Doroteia, virgem e mártir de Cesareia",
    resumo: "Jovem mártir da Capadócia cuja lenda de flores e frutos enviados do paraíso converteu o advogado que zombou dela a caminho da execução.",
    texto: [
      "Viveu em Cesareia da Capadócia, no início do século IV, e foi martirizada, segundo a tradição, durante a perseguição do imperador Diocleciano — as fontes variam quanto ao ano exato, entre 300 e 311.",
      "Conta a lenda que, a caminho do tribunal ou da execução, um advogado pagão chamado Teófilo zombou dela, pedindo que lhe enviasse frutas e rosas do jardim de seu Esposo celeste depois de morta. Doroteia teria respondido com serenidade que atenderia ao pedido.",
      "Momentos depois de sua morte, uma criança — identificada pela tradição como um anjo — teria aparecido a Teófilo trazendo uma cesta com maçãs e rosas, num milagre notável por ocorrer em pleno inverno. Impressionado, Teófilo se converteu ao cristianismo e, segundo o relato, também viria a ser martirizado.",
      "A história sobrevive quase inteiramente por meio de relatos hagiográficos tardios — os registros mais antigos preservam pouco além do nome da santa, o local e a data de seu martírio. Por essa razão, seu culto foi retirado do Calendário Romano Geral em 1969, embora continue no Martirológio Romano e em calendários locais, como o brasileiro. É invocada, conforme a devoção regional, como padroeira de jardineiros, floristas e noivas."
    ]
  },

  "sao-gregorio-magno": {
    titulo: "São Gregório Magno, Papa e Doutor da Igreja",
    resumo: "Do cargo de prefeito de Roma à vida monástica e ao papado, reformou a administração da Igreja e enviou missionários que converteram a Inglaterra.",
    texto: [
      "Nasceu em Roma por volta de 540, em família senatorial rica e devota. Chegou a ser prefeito da cidade ainda jovem, mas renunciou à carreira pública, transformou a própria casa da família no monte Célio em mosteiro e tornou-se monge beneditino, sendo depois enviado como representante papal a Constantinopla.",
      "Foi eleito papa por aclamação popular em 590, e consagrado em 3 de setembro daquele ano, num momento de peste, fome e invasões dos lombardos que assolavam a Itália. Reorganizou a administração da Igreja e usou o patrimônio de São Pedro para sustentar os pobres de Roma.",
      "Reformou a liturgia romana, e o canto litúrgico que hoje leva seu nome — o canto gregoriano — é tradicionalmente atribuído a ele, embora estudiosos discutam o quanto ele de fato compôs ou organizou pessoalmente essas melodias. Em 596 enviou o monge Agostinho, à frente de cerca de quarenta religiosos, para evangelizar os anglo-saxões na Inglaterra.",
      "Escreveu obras de grande influência, como a Regra Pastoral, manual para bispos, e os Morais sobre Jó. Cunhou a expressão \"servo dos servos de Deus\" como título papal, ainda usado hoje. Morreu em 12 de março de 604. Ao lado de São Leão Magno, é um dos dois únicos papas tradicionalmente chamados de \"Magno\", e foi proclamado Doutor da Igreja."
    ]
  },

  "santa-rosalia": {
    titulo: "Santa Rosália",
    resumo: "Eremita siciliana do século XII cujas relíquias, redescobertas durante uma peste em 1624, a tornaram padroeira de Palermo.",
    texto: [
      "Nasceu por volta de 1130 em Palermo, na Sicília, filha de Sinibaldo, senhor de Quisquina, família que a tradição liga à nobreza normanda. Ainda jovem, deixou a vida da nobreza para se dedicar à oração em solidão.",
      "Viveu primeiro numa gruta perto de Bivona e depois se retirou definitivamente para uma caverna no Monte Pellegrino, nos arredores de Palermo, onde passou o restante da vida em penitência e oração, morrendo ali sozinha, por volta de 1166.",
      "Sua biografia é conhecida quase só por tradição tardia: a mais antiga referência escrita à sua história só aparece por volta de 1590, quase quatro séculos e meio depois de sua morte, o que torna a maior parte dos detalhes de sua vida lenda devota, não registro histórico contemporâneo.",
      "Em 1624, em meio a uma peste que devastava Palermo, seus ossos foram encontrados na caverna do Monte Pellegrino. Levados em procissão pela cidade, a epidemia cessou pouco depois, e o Papa Urbano VIII a inscreveu no Martirológio Romano. Desde então é venerada como padroeira de Palermo, celebrada anualmente com o Festino, uma das maiores festas populares da Sicília."
    ]
  },

  "santa-teresa-calcuta": {
    titulo: "Santa Teresa de Calcutá",
    resumo: "Freira albanesa que dedicou a vida aos mais pobres entre os pobres na Índia, fundando as Missionárias da Caridade.",
    texto: [
      "Nasceu em 26 de agosto de 1910 em Skopje, então parte do Império Otomano (hoje Macedônia do Norte), filha de uma família católica albanesa, recebendo o nome de Anjezë Gonxhe Bojaxhiu. Aos 18 anos entrou para as Irmãs de Loreto, na Irlanda, e logo foi enviada à Índia, onde lecionou geografia num colégio de Calcutá por quase duas décadas.",
      "Em 10 de setembro de 1946, numa viagem de trem a Darjeeling, viveu o que descreveu como um \"chamado dentro do chamado\": o pedido de Jesus para deixar o convento e servir os mais pobres entre os pobres, morando e trabalhando em meio a eles. Obteve permissão da Igreja para deixar as Irmãs de Loreto em 1948 e passou a vestir o sári branco de bordas azuis que se tornaria sua marca.",
      "Em 1950 fundou as Missionárias da Caridade, dedicadas a doentes terminais, leprosos, órfãos e moradores de rua, começando nas ruas de Calcutá e expandindo-se depois para dezenas de países. Recebeu o Prêmio Nobel da Paz em 1979 pelo trabalho junto aos que sofrem.",
      "Morreu em Calcutá em 5 de setembro de 1997. Cartas pessoais publicadas após sua morte revelaram que viveu, por quase cinco décadas, uma intensa \"noite escura\" espiritual — um longo período de aridez interior e sensação de ausência de Deus — sem que isso a afastasse do serviço aos pobres. Foi beatificada em 2003 e canonizada em 4 de setembro de 2016 pelo Papa Francisco."
    ]
  },

  "sao-liberato-loro": {
    titulo: "São Liberato de Loro",
    resumo: "Nobre italiano do século XIII que renunciou ao título e às terras da família para se tornar frade franciscano; figura pouco documentada historicamente.",
    texto: [
      "Nasceu por volta de 1213 em Loro Piceno, na região das Marcas, na Itália, na nobre família Brunforte. Ao herdar de um tio terras e o título de senhor de Loro, cedeu tudo ao irmão Gualtério para entrar na Ordem dos Frades Menores, em 1234.",
      "Ordenado sacerdote, retirou-se para o pequeno convento-eremitério de Sofiano, perto do castelo de Brunforte, onde viveu dedicado à penitência e à contemplação. A tradição franciscana, registrada nos Fioretti, atribui-lhe êxtase místico frequente e fama de santidade.",
      "Morreu em 6 de setembro de 1258. Sua causa nunca passou por um processo formal de canonização: em 1868 o Papa Pio IX apenas autorizou culto litúrgico em sua honra, uma beatificação equipolente — por isso a Igreja o venera oficialmente como beato, ainda que a devoção brasileira o chame popularmente de \"São Liberato\".",
      "Pouco mais se sabe historicamente sobre ele além do que preservam os Fioretti e a tradição local de Loro Piceno, onde um santuário guarda suas relíquias até hoje."
    ]
  },

  "santa-regina": {
    titulo: "Santa Regina, virgem e mártir",
    resumo: "Jovem da Gália romana venerada como mártir do século III por recusar um casamento em nome da fé cristã; sua história é preservada sobretudo pela tradição hagiográfica.",
    texto: [
      "Segundo a tradição, nasceu na região de Autun, na Borgonha (atual França), filha de um pai pagão. Órfã de mãe ainda recém-nascida, foi criada por uma ama cristã que a batizou e a instruiu na fé.",
      "Já moça, foi pretendida em casamento pelo prefeito romano Olíbrio, atraído por sua beleza e origem nobre. Regina recusou por ter consagrado a vida a Cristo; diante da recusa, foi presa, torturada e, por fim, decapitada em Alésia, na Borgonha — cidade também identificada por historiadores com o sítio onde Vercingétorix resistiu a Júlio César.",
      "As fontes antigas divergem sobre a data do martírio: algumas o situam na perseguição do imperador Décio, por volta de 251, outras no governo de Maximiano, já no fim do século III. O relato mais detalhado de sua paixão só foi escrito séculos depois, entre os séculos VIII e IX, o que faz historiadores tratá-lo como tradição hagiográfica — mistura de elementos históricos e embelezamento legendário — e não como registro contemporâneo dos fatos.",
      "Suas relíquias foram trasladadas em 864 para a abadia de Flavigny, tornando-se destino de peregrinação, e a cidade de Alésia passou a chamar-se Alise-Sainte-Reine em sua honra. É invocada como padroeira de pastoras, dos pobres e das vítimas de tortura."
    ]
  },

  "natividade-virgem-maria": {
    titulo: "Natividade da Virgem Maria",
    resumo: "Festa mariana que celebra o nascimento de Maria, chamada pela tradição litúrgica de \"aurora da salvação\".",
    texto: [
      "Assim como o nascimento de Jesus, o de Maria não é narrado na Bíblia. A tradição da Igreja conhece o episódio por escritos antigos como o Protoevangelho de Tiago (século II), que também dá nome a seus pais, Joaquim e Ana, celebrados juntos em 26 de julho.",
      "É uma das festas marianas mais antigas: já era celebrada no Oriente por volta dos séculos V-VI, ligada à dedicação de uma igreja erguida em Jerusalém no local tradicionalmente apontado como a casa de Ana e Joaquim.",
      "A data de 8 de setembro não foi escolhida ao acaso: cai exatamente nove meses depois da festa da Imaculada Conceição, em 8 de dezembro, preservando a coerência entre concepção e nascimento no calendário litúrgico.",
      "A liturgia chama Maria de \"aurora da salvação\", por anunciar, com seu nascimento, a proximidade do Sol da Justiça — Jesus Cristo. É por isso um dia de alegria especial no calendário da Igreja, celebrado com festa também em muitos santuários marianos pelo mundo."
    ]
  },

  "sao-pedro-claver": {
    titulo: "São Pedro Claver, presbítero",
    resumo: "Jesuíta espanhol que passou quatro décadas acolhendo e evangelizando os africanos escravizados que chegavam ao porto de Cartagena das Índias.",
    texto: [
      "Nasceu em Verdú, na Catalunha (Espanha), por volta de 1580. Entrou para a Companhia de Jesus em 1602 e, ainda em formação, ouviu do irmão Alonso Rodríguez o chamado para ser missionário no Novo Mundo. Embarcou para as Índias em 1610 e foi ordenado sacerdote em Cartagena das Índias, na atual Colômbia, em 1616.",
      "Cartagena era um dos principais portos do tráfico negreiro na América espanhola. Ao professar os votos definitivos, Claver assinou junto ao próprio nome a fórmula \"Petrus Claver, aethiopum semper servus\" — \"Pedro Claver, escravo dos escravos para sempre\" —, selando o compromisso que marcaria o resto de sua vida.",
      "Durante cerca de quarenta anos, subia a bordo dos navios negreiros assim que atracavam, levando água, comida, remédios e panos aos escravizados amontoados nos porões, muitos deles doentes após a travessia. Com a ajuda de intérpretes, instruía-os na fé e batizava os que desejavam — a tradição fala em cerca de 300 mil batismos ao longo do ministério, número aproximado repetido por diversas fontes, sem uma contagem histórica precisa.",
      "Morreu em Cartagena em 8 de setembro de 1654. Foi canonizado em 1888 pelo Papa Leão XIII, que em 1896 o proclamou padroeiro de todas as missões católicas entre os povos negros e afrodescendentes."
    ]
  },

  "sao-nicolau-tolentino": {
    titulo: "São Nicolau de Tolentino",
    resumo: "Frade agostiniano italiano conhecido pela vida austera, pela dedicação aos doentes e moribundos, e por milagres a ele atribuídos ainda em vida.",
    texto: [
      "Nasceu por volta de 1245 em Sant'Angelo in Pontano, na região das Marcas, na Itália. Ainda jovem, ingressou na Ordem de Santo Agostinho, atraído pela pregação de um frade agostiniano de sua cidade natal, e foi ordenado sacerdote em 1269, em Cíngoli.",
      "Por volta de 1275, foi enviado ao convento de Tolentino, onde permaneceria pelos trinta anos seguintes, dedicado à missa diária, às confissões, à pregação e à visita aos pobres, doentes e moribundos. Levava vida austera, mas era conhecido pela doçura no trato com todos.",
      "A tradição conta que, gravemente doente, teve uma visão de Nossa Senhora acompanhada de Santo Agostinho e Santa Mônica, que o orientou a comer um pedaço de pão molhado em água e marcado com o sinal da cruz — ao fazê-lo, recuperou a saúde. O episódio deu origem à devoção dos \"pãezinhos de São Nicolau\", ainda hoje abençoados e distribuídos em seu santuário.",
      "Morreu em Tolentino em 10 de setembro de 1305. Foi canonizado em 1446 pelo Papa Eugênio IV — uma das primeiras canonizações depois de um longo hiato na prática. É invocado como padroeiro das almas do Purgatório."
    ]
  },

  "sao-joao-gabriel-perboyre": {
    titulo: "São João Gabriel Perboyre, presbítero e mártir",
    resumo: "Padre lazarista francês martirizado na China em 1840, cuja execução testemunhas associaram à Paixão de Cristo.",
    texto: [
      "Nasceu em Puech, no sul da França, em 6 de janeiro de 1802. Entrou para a Congregação da Missão (padres lazaristas, também chamados vicentinos) ainda jovem e, depois de completar os estudos, dedicou-se ao ensino em seminários franceses antes de conseguir, finalmente, autorização para partir como missionário.",
      "Chegou à China em 1835 e, após aprender o idioma, passou a atuar clandestinamente nas províncias de Henan e Hubei, período em que a pregação cristã era proibida e punida com a morte sob a dinastia Qing. Vivia escondido, catequizando, administrando os sacramentos e cuidando dos doentes.",
      "Em 1839, foi traído por um catecúmeno e preso pelas autoridades chinesas. Passou meses sendo interrogado e torturado sem renunciar à fé. Foi executado por estrangulamento em Wuchang, em 11 de setembro de 1840, amarrado a uma estrutura em forma de cruz — testemunhas da época relataram semelhanças entre seu suplício e a Paixão de Cristo, paralelos que pertencem, em parte, à tradição devocional e não a um registro histórico isento.",
      "Foi beatificado em 1889 pelo Papa Leão XIII e canonizado em 1996 pelo Papa João Paulo II, entre os Mártires da China."
    ]
  },

  "santissimo-nome-maria": {
    titulo: "Santíssimo Nome de Maria",
    resumo: "Festa mariana que celebra o nome de Maria, ligada historicamente à ação de graças pela vitória cristã na Batalha de Viena, em 1683.",
    texto: [
      "A devoção ao nome de Maria é anterior ao seu reconhecimento como festa universal: já existiam celebrações locais em sua honra, como a autorizada em Cuenca, na Espanha, em 1513, depois estendida a outras dioceses do país.",
      "A festa ganhou alcance universal após a Batalha de Viena, em 1683, quando um exército cristão liderado pelo rei polonês Jan III Sobieski rompeu o cerco otomano à cidade. Em ação de graças por uma vitória atribuída, em parte, à intercessão de Maria, o Papa Inocêncio XI estendeu a celebração do Santíssimo Nome de Maria a toda a Igreja, fixando-a em 12 de setembro.",
      "A festa foi retirada do calendário universal após a reforma litúrgica do Concílio Vaticano II e reintroduzida pelo Papa João Paulo II em 2002, como memória facultativa.",
      "O significado exato do nome \"Maria\" não é consenso entre estudiosos: entre as interpretações mais citadas estão \"senhora\" e \"amada\", além da associação, mais tardia, com \"estrela do mar\". Mais do que uma etimologia precisa, a devoção celebra Maria como intercessora e sinal de esperança para os fiéis."
    ]
  },

  "sao-joao-crisostomo": {
    titulo: "São João Crisóstomo, bispo e doutor da Igreja",
    resumo: "Bispo de Constantinopla e um dos maiores pregadores da Igreja antiga, exilado por denunciar os excessos da corte imperial.",
    texto: [
      "Nasceu em Antioquia, na Síria, por volta de 347. Formou-se em retórica, adotou vida ascética e foi ordenado sacerdote em 386. Destacou-se rapidamente como pregador — o apelido \"Crisóstomo\", do grego \"boca de ouro\", viria da eloquência de suas homilias e dos extensos comentários bíblicos que deixou, muitos dos quais chegaram até hoje.",
      "Em 398, foi nomeado, contra sua vontade, arcebispo de Constantinopla. Como bispo, combateu a corrupção do clero e denunciou o luxo da corte imperial, o que o colocou em rota de colisão com a imperatriz Eudóxia e com o patriarca Teófilo de Alexandria.",
      "Em 403, um sínodo convocado por seus opositores — o chamado Sínodo do Carvalho — decretou seu exílio; a pressão popular forçou seu retorno quase imediato, mas em 404 foi banido definitivamente, sendo enviado para regiões cada vez mais remotas do império.",
      "Morreu em 407, em Comana, no Ponto, exausto pelas marchas forçadas impostas durante o exílio. Foi declarado Doutor da Igreja e é considerado, junto com Basílio Magno e Gregório Nazianzeno, um dos Três Santos Hierarcas da tradição oriental. É padroeiro dos pregadores e oradores."
    ]
  },

  "exaltacao-santa-cruz": {
    titulo: "Exaltação da Santa Cruz",
    resumo: "Festa que celebra a Cruz de Cristo como sinal de vitória e salvação, lembrando o achado do madeiro em Jerusalém e a dedicação da basílica erguida sobre o Calvário.",
    texto: [
      "No início do século IV, Santa Helena, mãe do imperador Constantino, viajou à Terra Santa em peregrinação e, segundo a tradição, encontrou em Jerusalém, por volta de 326, o madeiro da cruz em que Jesus foi crucificado. No local, hoje ocupado pela Basílica do Santo Sepulcro, escavações teriam revelado três cruzes, e um sinal milagroso indicou qual era a verdadeira.",
      "Constantino mandou construir sobre o Calvário e o túmulo de Cristo a Basílica do Santo Sepulcro, dedicada em 335. No dia seguinte à dedicação, 14 de setembro, a relíquia da cruz foi exposta à veneração dos fiéis pela primeira vez — origem da data em que a Igreja celebra a festa até hoje.",
      "A celebração ganhou outro capítulo histórico no século VII: em 614, o exército persa invadira Jerusalém e levara a relíquia como despojo de guerra; em 629, o imperador Heráclio a recuperou e, segundo o relato tradicional, insistiu em carregá-la de volta à cidade descalço e sem trajes imperiais, como simples peregrino.",
      "Mais do que a veneração de uma relíquia, a festa exalta a cruz como instrumento de salvação: o mesmo madeiro que era símbolo de suplício romano tornou-se, na fé cristã, sinal da vitória de Cristo sobre a morte e centro da pregação da Igreja."
    ]
  },

  "nossa-senhora-das-dores": {
    titulo: "Nossa Senhora das Dores",
    resumo: "Memória que celebra o sofrimento de Maria unida à Paixão do Filho, contemplado tradicionalmente nas chamadas Sete Dores de Nossa Senhora.",
    texto: [
      "A devoção à Virgem como \"Mãe das Dores\" remonta à Idade Média, difundida sobretudo a partir dos séculos XII e XIII pelos cistercienses e, mais tarde, pela Ordem dos Servitas — fundada em Florença em 1233 e dedicada, desde suas origens, a contemplar o sofrimento de Maria unido ao de Cristo.",
      "A tradição reúne sete momentos de dor na vida de Maria: a profecia de Simeão no Templo, a fuga para o Egito, a perda do Menino Jesus em Jerusalém, o encontro com Jesus a caminho do Calvário, a permanência aos pés da cruz, o recebimento do corpo do Filho morto e seu sepultamento.",
      "Os Servitas obtiveram aprovação para celebrar liturgicamente as Sete Dores em 1668. O Papa Pio VII, em 1814, estendeu a festa a toda a Igreja em ação de graças por sua própria libertação do exílio imposto por Napoleão, e em 1913 o Papa Pio X fixou-a definitivamente em 15 de setembro — um dia depois da Exaltação da Santa Cruz, unindo no calendário a cruz de Cristo e a dor de sua Mãe.",
      "A memória convida a olhar Maria não apenas como testemunha silenciosa do Calvário, mas como aquela que participou intimamente da Paixão, associada de modo único à obra da redenção."
    ]
  },

  "sao-cornelio-cipriano": {
    titulo: "São Cornélio, Papa, e São Cipriano, bispo, mártires",
    resumo: "Papa e bispo do século III, amigos que se corresponderam por carta na defesa da unidade da Igreja durante a perseguição romana.",
    texto: [
      "Cornélio foi eleito papa em 251, depois de mais de um ano de sé vacante causado pela perseguição do imperador Décio. Cipriano, nascido em Cartago por volta do ano 210, era advogado e retórico pagão antes de se converter ao cristianismo por volta de 246; três anos depois foi escolhido bispo de sua cidade.",
      "Os dois enfrentaram juntos a mesma crise: o que fazer com os cristãos que haviam renegado a fé (os chamados lapsi) diante da ameaça de perseguição. Cornélio e Cipriano defendiam que eles poderiam ser readmitidos à comunhão da Igreja após penitência, posição que os colocou em oposição ao rigorismo de Novaciano, que negava qualquer perdão a esses cristãos e chegou a se proclamar papa contra Cornélio. Separados pelo Mediterrâneo, os dois nunca chegaram a se encontrar pessoalmente, mas sustentaram-se mutuamente por meio de cartas que se tornaram testemunho importante da vida da Igreja no século III.",
      "Cornélio foi exilado para Centumcellae (a atual Civitavecchia) em 252 e morreu no ano seguinte. É venerado como mártir desde a Antiguidade, embora as fontes antigas divirjam sobre as circunstâncias exatas de sua morte: algumas indicam que sucumbiu aos rigores do exílio, outras que foi decapitado.",
      "Cipriano foi decapitado em Cartago em 258, durante a perseguição do imperador Valeriano, depois de se recusar a oferecer sacrifícios aos deuses romanos — sua execução é bem documentada pelos relatos da época. Embora nunca tenham se encontrado, os dois são celebrados juntos desde a Antiguidade, lembrados lado a lado no Cânon Romano, como sinal da unidade entre as Igrejas de Roma e de Cartago."
    ]
  },

  "sao-roberto-belarmino": {
    titulo: "São Roberto Belarmino, bispo e doutor da Igreja",
    resumo: "Jesuíta italiano, um dos maiores teólogos da Contrarreforma, cardeal e doutor da Igreja, lembrado também por seu papel no episódio inicial do caso Galileu.",
    texto: [
      "Nasceu em Montepulciano, na Itália, em 1542, e entrou para a Companhia de Jesus em 1560, sendo ordenado sacerdote em 1570. Como professor no Colégio Romano, tornou-se um dos principais teólogos da Contrarreforma, defendendo a doutrina católica diante das objeções protestantes em sua obra mais influente, as Disputationes de controversiis christianae fidei.",
      "Em 1599 foi nomeado cardeal pelo Papa Clemente VIII, e passou a atuar como um dos principais conselheiros teológicos da Santa Sé. Apesar do cargo, manteve vida de grande simplicidade e caridade, e dedicou-se também a escrever catecismos usados na formação cristã por gerações.",
      "Em 1616, a pedido do Santo Ofício, Belarmino comunicou pessoalmente a Galileu Galilei — de quem era próximo e por quem tinha estima — a advertência da Igreja para que não defendesse a teoria heliocêntrica como fato comprovado, podendo apresentá-la apenas como hipótese. Ele próprio chegou a redigir um atestado afirmando que Galileu não havia sido condenado nem declarado herege. Belarmino morreu em 1621, mais de uma década antes do processo que levaria à condenação de Galileu pela Inquisição, em 1633, e não teve qualquer participação nesse julgamento posterior.",
      "Morreu em Roma em 17 de setembro de 1621. Foi canonizado em 1930 pelo Papa Pio XI, que no ano seguinte, em 1931, o proclamou Doutor da Igreja."
    ]
  },

  "sao-jose-cupertino": {
    titulo: "São José de Cupertino",
    resumo: "Frade franciscano italiano famoso por êxtases e levitações durante a oração, hoje padroeiro dos estudantes e dos que viajam de avião.",
    texto: [
      "Nasceu em 1603 na cidade de Cupertino, na região italiana da Apúlia, em família pobre. Quando menino, era considerado lento e desatento pelos estudos e foi rejeitado pelos franciscanos conventuais por falta de instrução. Depois de uma breve passagem pelos capuchinhos, que o dispensaram, foi finalmente aceito pelos conventuais como irmão leigo em 1625, e ordenado sacerdote em 1628.",
      "Desde jovem, José começou a ter êxtases acompanhados de levitações durante a oração e a celebração da missa, fenômenos relatados por dezenas de testemunhas ao longo de sua vida — mais de setenta episódios documentados apenas durante seu tempo no santuário de Grotella. Diz a tradição que, levado à presença do Papa Urbano VIII, entrou em êxtase e levitou diante dele.",
      "A fama atraiu multidões aos conventos onde vivia, o que o obrigou a ser transferido repetidas vezes e, por um período, a viver recluso, longe do público, enquanto a Inquisição investigava os fenômenos — investigação da qual saiu inocentado. Apesar da notoriedade, José manteve-se conhecido por sua humildade.",
      "Morreu em Osimo, na Itália, em 18 de setembro de 1663, e foi canonizado em 1767 pelo Papa Clemente XIII. É venerado como padroeiro dos estudantes e também dos pilotos, aviadores e passageiros de avião, em razão de suas levitações."
    ]
  },

  "sao-januario": {
    titulo: "São Januário, bispo e mártir",
    resumo: "Bispo de Benevento martirizado no início do século IV, venerado em Nápoles pelo fenômeno da liquefação de seu sangue.",
    texto: [
      "Januário (Gennaro, em italiano) foi bispo de Benevento, no sul da Itália, no fim do século III. Sabe-se pouco com certeza sobre sua vida: os relatos mais detalhados de seu martírio só foram registrados séculos depois dos fatos, e a própria Igreja reconhece que têm valor mais devocional do que histórico.",
      "Segundo a tradição, foi preso durante a perseguição movida pelo imperador Diocleciano, ao visitar cristãos encarcerados perto de Pozzuoli. Condenado a ser devorado por feras num anfiteatro, teria sido poupado quando os animais não o atacaram; acusado então de feitiçaria, foi decapitado com companheiros por volta do ano 305.",
      "Seu culto em Nápoles, da qual é padroeiro, está ligado sobretudo ao chamado milagre de São Januário: sangue seco guardado em ampolas na catedral da cidade que, em datas determinadas do ano — entre elas 19 de setembro, dia de sua festa —, costuma se liquefazer diante dos fiéis. O primeiro registro documentado do fenômeno data de 1389. A Igreja nunca declarou oficialmente o fato como milagre no sentido canônico, tratando-o com prudência como um sinal ligado à piedade popular, sem se pronunciar sobre sua causa.",
      "São Januário é um dos santos mais populares da Itália, e sua festa continua reunindo multidões em Nápoles na expectativa da liquefação do sangue."
    ]
  },

  "santo-andre-kim-taegon": {
    titulo: "Santo André Kim Taegon e companheiros, mártires",
    resumo: "Primeiro sacerdote nascido na Coreia, martirizado em 1846 e canonizado ao lado de mais de cem cristãos mortos na perseguição religiosa coreana.",
    texto: [
      "André Kim Taegon nasceu em 1821 numa família coreana convertida ao catolicismo, numa época em que a fé cristã era proibida e duramente perseguida pela dinastia Joseon. Ainda jovem, deixou o país para estudar num seminário em Macau, preparando-se para o sacerdócio.",
      "Foi ordenado padre em Xangai em 1845, tornando-se o primeiro sacerdote nascido na Coreia. Voltou clandestinamente à terra natal para atender os católicos que viviam escondidos e para organizar novas rotas de entrada de missionários estrangeiros no país.",
      "Preso em 1846 quando tentava articular a chegada de missionários franceses pelo mar, foi torturado e, após três meses na prisão, decapitado às margens do rio Han, perto de Seul, aos 25 anos.",
      "A data de 20 de setembro recorda também Paulo Chong Hasang, catequista leigo que pedira ao papa o envio de missionários à Coreia, e outros cristãos coreanos e franceses mortos entre 1839 e 1867, em sucessivas ondas de perseguição. Em 6 de maio de 1984, durante viagem a Seul, o Papa João Paulo II canonizou de uma só vez André Kim Taegon, Paulo Chong Hasang e mais 101 companheiros — uma das maiores canonizações coletivas da história da Igreja, e a primeira realizada fora de Roma."
    ]
  },

  "sao-mateus-apostolo": {
    titulo: "São Mateus, Apóstolo e Evangelista",
    resumo: "Cobrador de impostos que abandonou tudo ao ouvir o chamado de Jesus e é tradicionalmente associado à autoria do primeiro Evangelho.",
    texto: [
      "Mateus, também chamado Levi, trabalhava como publicano — cobrador de impostos a serviço de Roma — em Cafarnaum, na Galileia. A profissão era vista com desprezo pelos judeus da época, por lidar com dinheiro romano e por associar quem a exercia à opressão estrangeira.",
      "Jesus o chamou enquanto ele estava sentado na coletoria, com apenas duas palavras: \"Segue-me\" (Mt 9,9). Mateus se levantou imediatamente, deixou para trás sua profissão e passou a integrar o grupo dos doze apóstolos.",
      "A tradição da Igreja atribui a ele a autoria do Evangelho que leva seu nome, escrito para leitores judeus e voltado a mostrar Jesus como cumprimento das profecias do Antigo Testamento. A exegese moderna, no entanto, discute em que medida o texto tal como chegou até nós saiu diretamente de sua mão ou de uma tradição a ele ligada.",
      "Segundo relatos antigos, depois da Ressurreição Mateus pregou primeiro entre os judeus e depois partiu para outras terras — as fontes variam entre a Etiópia e a região da Pérsia/Pártia —, onde teria sido martirizado. É padroeiro de contadores, bancários e cobradores de impostos."
    ]
  },

  "sao-mauricio-companheiros": {
    titulo: "São Maurício e companheiros, mártires",
    resumo: "Comandante de uma legião romana de soldados cristãos que, segundo a tradição, preferiu a morte a obedecer ordens contrárias à fé.",
    texto: [
      "Segundo a tradição cristã, Maurício era um oficial de origem egípcia que comandava a chamada Legião Tebana, formada por soldados cristãos a serviço do Império Romano. Por volta do ano 286, a legião foi enviada pelo imperador Maximiano à Gália para ajudar a reprimir um levante.",
      "Ali, os soldados se recusaram a participar de sacrifícios aos deuses pagãos e a perseguir outros cristãos, retirando-se do restante do exército. Maximiano ordenou então que a unidade fosse dizimada repetidas vezes e, diante da recusa persistente dos sobreviventes, mandou matar todos os que restavam, perto de Agaunum, atual Saint-Maurice, na Suíça.",
      "O relato mais antigo do episódio foi escrito cerca de 150 anos depois pelo bispo Eucério de Lyon, que dizia basear-se numa tradição oral transmitida havia gerações. Historiadores modernos questionam alguns detalhes da narrativa tradicional — como o número exato de soldados e se de fato se tratava de uma legião inteira de origem tebana —, embora reconheçam como plausível que um grupo de soldados cristãos tenha sido executado naquela região e época por se recusar a cumprir ordens contrárias à sua fé.",
      "O culto a Maurício e seus companheiros deu origem, ainda no século VI, à Abadia de Saint-Maurice, um dos mosteiros de funcionamento contínuo mais antigos do mundo, erguida junto ao local tradicional do massacre."
    ]
  },

  "sao-pio-pietrelcina": {
    titulo: "São Pio de Pietrelcina (Padre Pio)",
    resumo: "Frade capuchinho italiano que carregou as chagas de Cristo por cerca de cinquenta anos e se dedicou incansavelmente ao confessionário.",
    texto: [
      "Nasceu Francesco Forgione em 1887, em Pietrelcina, no sul da Itália. Entrou para a Ordem dos Frades Menores Capuchinhos ainda adolescente, adotando o nome de Pio, e foi ordenado sacerdote em 1910. Em 1916 passou a viver no convento de San Giovanni Rotondo, onde permaneceria até o fim da vida.",
      "Já em 1910 teria recebido marcas invisíveis das chagas de Cristo; em 20 de setembro de 1918, durante uma oração de ação de graças após a missa, os ferimentos se tornaram visíveis nas mãos, nos pés e no lado do corpo, causando-lhe dor constante. As chagas permaneceram visíveis por cerca de cinquenta anos, até pouco antes de sua morte, examinadas por diversos médicos ao longo de sua vida sem explicação médica conclusiva.",
      "Padre Pio dedicava longas horas diárias ao confessionário, atraindo multidões de fiéis; muitos relataram que ele parecia conhecer detalhes de suas vidas antes mesmo de confessá-los. A devoção popular também lhe atribui outros dons extraordinários, como bilocação e profecia, relatados por testemunhas ao longo dos anos. Por iniciativa sua, foi erguido em San Giovanni Rotondo o hospital Casa Sollievo della Sofferenza, inaugurado em 1956.",
      "Morreu em 23 de setembro de 1968. Foi beatificado em 1999 e canonizado em 16 de junho de 2002, ambos pelo Papa João Paulo II."
    ]
  },

  "nossa-senhora-das-merces": {
    titulo: "Nossa Senhora das Mercês",
    resumo: "Advocação mariana ligada à fundação, em 1218, da Ordem dedicada a resgatar cristãos mantidos cativos pelos mouros.",
    texto: [
      "A devoção remonta ao século XIII, na Espanha da Reconquista, quando cristãos capturados pelos mouros eram levados cativos ao norte da África, correndo o risco de perder a fé. São Pedro Nolasco, mercador de Barcelona, dedicava sua fortuna a comprar a liberdade desses prisioneiros.",
      "Segundo a tradição, quando os recursos de Nolasco já não bastavam, a Virgem Maria lhe apareceu pedindo que fundasse uma ordem religiosa voltada inteiramente à redenção dos cativos — aparição que, em alguns relatos, teria ocorrido na mesma noite também a São Raimundo de Penhafort e ao rei Jaime I de Aragão.",
      "Em 10 de agosto de 1218, na Catedral de Barcelona, com o rei presente, Nolasco e seus companheiros se consagraram à Ordem de Nossa Senhora das Mercês. Além dos votos de pobreza, castidade e obediência, faziam um quarto voto: entregar-se como reféns no lugar dos cativos quando não houvesse dinheiro para resgatá-los. Foi a mesma ordem à qual pertenceu, mais tarde, São Raimundo Nonato.",
      "A festa foi estendida a toda a Igreja e fixada em 24 de setembro pelo Papa Inocêncio XII, em 1696. Também chamada de Nossa Senhora do Resgate, é invocada até hoje em favor de presos e de todos os que vivem algum tipo de cativeiro."
    ]
  },

  "sao-cleofas": {
    titulo: "São Cléofas",
    resumo: "Um dos dois discípulos que encontraram Jesus ressuscitado no caminho de Emaús, sem o reconhecer até a fração do pão.",
    texto: [
      "Quase tudo o que se sabe sobre ele vem de um único episódio do Evangelho de Lucas (24, 13-35): no dia da ressurreição, dois discípulos caminhavam de Jerusalém a Emaús, a cerca de onze quilômetros, conversando sobre os acontecimentos daqueles dias, quando um estranho se juntou a eles pelo caminho e explicou as Escrituras a respeito do Messias — sem que o reconhecessem.",
      "Apenas um dos dois é chamado pelo nome, Cléofas; o do companheiro o evangelista não registra. Só à mesa, quando o forasteiro partiu o pão, os dois o reconheceram como o Senhor ressuscitado — e ele desapareceu de sua vista. Voltaram na mesma hora a Jerusalém para contar aos demais discípulos o que haviam visto.",
      "Uma tradição antiga, mas debatida, o identifica com o \"Clopas\" citado em João 19, 25 como marido de uma das mulheres presentes ao pé da cruz. Os nomes, porém, têm origens diferentes, de modo que a ligação entre as duas figuras segue sendo tradição, não certeza histórica.",
      "É por esse único episódio de Emaús — um dos relatos mais lidos da ressurreição — que a Igreja guarda sua memória, celebrada em 25 de setembro."
    ]
  },

  "santos-cosme-damiao": {
    titulo: "Santos Cosme e Damião, mártires",
    resumo: "Irmãos gêmeos, médicos que curavam sem cobrar nada, martirizados durante as perseguições do imperador Diocleciano.",
    texto: [
      "Segundo a tradição, nasceram na Arábia e exerceram a medicina na cidade portuária de Egeia, na província romana da Cilícia, na Ásia Menor. Atendiam a todos gratuitamente, por caridade cristã, e por isso ficaram conhecidos como anargyroi — do grego, \"os sem prata\" —, atraindo muita gente à fé pelo exemplo.",
      "Durante a Grande Perseguição movida por Diocleciano, no início do século IV, foram presos em Egeia pelo governador Lísias. A tradição narra que resistiram a várias tentativas de execução antes de serem finalmente decapitados, por volta do ano 287 (algumas fontes indicam 303). Relatos hagiográficos acrescentam que outros três irmãos foram martirizados junto com eles.",
      "São padroeiros de médicos, cirurgiões, farmacêuticos e gêmeos. No Brasil, sua devoção é particularmente forte: em muitas cidades o dia é marcado por missas e pela tradicional distribuição de doces às crianças, um costume popular associado à data desde há gerações."
    ]
  },

  "sao-vicente-paulo": {
    titulo: "São Vicente de Paulo, presbítero",
    resumo: "Sacerdote francês que dedicou a vida aos pobres, fundou duas congregações e é considerado padroeiro de todas as obras de caridade.",
    texto: [
      "Nasceu em 24 de abril de 1581, em Pouy, na Gasconha francesa, filho de camponeses. Foi ordenado sacerdote em 1600, ainda com dezenove anos.",
      "Segundo o próprio relato de Vicente, em 1605 o navio em que viajava foi atacado por piratas berberes, e ele foi levado como escravo a Túnis, passando por diferentes senhores até conseguir fugir de volta à França em 1607. Historiadores vicentinos modernos têm questionado alguns detalhes desse episódio, com base em análises de suas cartas da época, mas o relato é parte consolidada de sua biografia tradicional.",
      "Dedicou-se depois a organizar obras de caridade para os pobres, os condenados às galés e as crianças abandonadas. Fundou a Congregação da Missão (padres vicentinos, também chamados lazaristas) em 1625 e, com Santa Luísa de Marillac, a Companhia das Filhas da Caridade em 1633 — a primeira congregação a levar mulheres consagradas para fora da clausura, a serviço direto dos pobres.",
      "Morreu em Paris em 27 de setembro de 1660. Foi beatificado em 1729 por Bento XIII e canonizado em 1737 por Clemente XII, que o proclamou padroeiro de todas as obras de caridade. Séculos depois, a Sociedade São Vicente de Paulo, fundada em 1833 por Frederico Ozanam, adotou seu nome em homenagem ao santo."
    ]
  },

  "sao-venceslau": {
    titulo: "São Venceslau, mártir",
    resumo: "Duque da Boêmia, conhecido pela piedade e pelo bom governo, assassinado pelo próprio irmão em disputa pelo poder.",
    texto: [
      "Nasceu por volta de 907, perto de Praga, e foi criado na fé cristã pela avó, Santa Ludmila. Assumiu o governo do ducado da Boêmia ainda jovem, destacando-se pelo apoio à Igreja, pela vida piedosa e por uma política de paz com os reinos vizinhos, num tempo de forte tensão entre facções cristãs e pagãs.",
      "Essa política, e a popularidade que Venceslau conquistava, alimentaram a rivalidade com seu irmão mais novo, Boleslau. Em 28 de setembro, por volta de 935 (algumas fontes indicam 929), Boleslau e um grupo de cúmplices o atacaram e mataram à entrada de uma igreja em Stará Boleslav.",
      "Venceslau foi logo venerado como mártir; seus restos foram levados à Catedral de São Vito, em Praga, que se tornou importante centro de peregrinação. Tornou-se padroeiro e símbolo nacional do povo boêmio e, mais tarde, tcheco.",
      "Sua fama de generosidade com os pobres atravessou os séculos e inspirou o famoso canto natalino \"Good King Wenceslas\", escrito no século XIX — embora, na história, tenha sido duque, e não rei."
    ]
  },

  "santos-arcanjos": {
    titulo: "Santos Arcanjos Miguel, Gabriel e Rafael",
    resumo: "Festa que reúne num só dia os três arcanjos nomeados nas Escrituras, mensageiros de Deus junto aos homens.",
    texto: [
      "A Igreja celebra em 29 de setembro os três arcanjos cujos nomes aparecem na Sagrada Escritura. Cada nome, em hebraico, exprime uma missão diante de Deus: Miguel significa \"Quem como Deus?\", Gabriel, \"Força de Deus\" (ou \"Deus é a minha força\"), e Rafael, \"Deus cura\".",
      "São Miguel aparece no livro de Daniel como o grande protetor do povo de Deus, na carta de São Judas e no Apocalipse, onde combate o dragão — por isso é venerado como defensor contra o mal e príncipe das milícias celestes. São Gabriel é o mensageiro que anuncia: no livro de Daniel interpreta as visões do profeta e, no Evangelho de Lucas, anuncia a Zacarias o nascimento de João Batista e a Maria o nascimento de Jesus, na Anunciação. São Rafael é o protagonista do livro de Tobias, onde acompanha o jovem Tobias em sua viagem, sob forma humana, e cura a cegueira de seu pai — revelando por fim ser \"um dos sete anjos que estão diante do Senhor\" (Tb 12,15).",
      "A data tem origem na dedicação, por volta do século V, de uma basílica em honra a São Miguel na via Salária, perto de Roma. Durante séculos, o dia 29 de setembro celebrou sobretudo São Miguel, enquanto Gabriel e Rafael tinham festas próprias em outras datas. Com a reforma do calendário litúrgico, em 1969, as três celebrações foram reunidas numa única festa.",
      "A palavra \"arcanjo\" indica uma função, não uma natureza superior: aponta para o anjo enviado como mensageiro nas horas decisivas da história da salvação. A Igreja os apresenta como servidores de Deus a serviço dos homens, e não como seres a serem cultuados em si mesmos."
    ]
  },

  "sao-jeronimo": {
    titulo: "São Jerônimo, presbítero e doutor da Igreja",
    resumo: "Tradutor da Bíblia para o latim (a Vulgata) e um dos maiores estudiosos das Escrituras da Igreja antiga.",
    texto: [
      "Nasceu por volta de 347 em Estridão, na Dalmácia (região dos Bálcãs), e estudou em Roma, onde foi batizado. Dominava o latim e o grego e, mais tarde, dedicou-se ao estudo do hebraico — algo raro entre os cristãos de seu tempo —, o que o tornaria capaz de traduzir o Antigo Testamento diretamente da língua original.",
      "Por volta de 382 tornou-se secretário do Papa Dâmaso I, em Roma, que lhe confiou a tarefa de revisar as traduções latinas da Bíblia então em uso. Desse trabalho nasceria a Vulgata — a versão latina das Escrituras que se tornaria o texto oficial da Igreja no Ocidente por muitos séculos.",
      "Após a morte de Dâmaso, retirou-se para a Terra Santa e, a partir de 386, fixou-se em Belém, junto à gruta da Natividade, onde viveu como monge e realizou a maior parte de sua obra. Ali traduziu do hebraico grande parte do Antigo Testamento e escreveu numerosos comentários bíblicos. Era conhecido também pelo temperamento forte e polêmico, que transparece em suas cartas.",
      "Morreu em Belém em 30 de setembro de 420. É venerado como Doutor da Igreja e padroeiro dos tradutores, biblistas e bibliotecários. Dele é a célebre frase: \"Ignorar as Escrituras é ignorar a Cristo.\""
    ]
  },

  "santa-teresinha": {
    titulo: "Santa Teresinha do Menino Jesus, virgem e doutora da Igreja",
    resumo: "Jovem carmelita francesa que ensinou a \"pequena via\" da confiança e do amor, hoje uma das mais amadas santas da Igreja.",
    texto: [
      "Marie-Françoise-Thérèse Martin nasceu em Alençon, na França, em 1873. Perdeu a mãe ainda criança e cresceu numa família profundamente cristã — seus pais, Luís e Zélia Martin, seriam mais tarde canonizados juntos. Desde cedo desejou a vida religiosa e, aos quinze anos, obteve autorização excepcional para entrar no Carmelo de Lisieux, em 1888.",
      "No convento, viveu de modo escondido e comum, sem feitos extraordinários. Dessa experiência formulou o que chamou de \"pequena via\": o caminho da infância espiritual, feito de confiança total em Deus como Pai e de amor nas pequenas coisas do dia a dia, ao alcance de qualquer pessoa. Por obediência, escreveu suas memórias, reunidas depois no livro \"História de uma Alma\", que se tornaria uma das obras espirituais mais lidas do século XX.",
      "Adoeceu de tuberculose e morreu em 30 de setembro de 1897, com apenas 24 anos. Embora jamais tenha saído do convento nem partido em missão, foi proclamada padroeira das missões, ao lado de São Francisco Xavier, por ter oferecido toda a sua vida de oração pela conversão do mundo.",
      "Foi canonizada em 1925 pelo Papa Pio XI e, em 1997, o Papa João Paulo II a declarou Doutora da Igreja — uma das poucas mulheres a receber esse título e a mais jovem de todos. Sua memória litúrgica é celebrada em 1º de outubro, no dia seguinte ao de sua morte, reservado a São Jerônimo."
    ]
  },

  "santos-anjos-guarda": {
    titulo: "Santos Anjos da Guarda",
    resumo: "Memória que celebra os anjos que Deus confia à guarda de cada pessoa ao longo da vida.",
    texto: [
      "A Igreja ensina que Deus confia a cada ser humano um anjo para acompanhá-lo, protegê-lo e conduzi-lo ao bem — o anjo da guarda. Essa convicção se apoia em passagens da Escritura, como o Salmo 91 (\"Ele dará ordens a seus anjos para que te guardem em todos os teus caminhos\") e as palavras de Jesus sobre os pequeninos: \"os seus anjos, nos céus, veem continuamente a face de meu Pai\" (Mt 18,10).",
      "A devoção aos anjos é muito antiga na tradição cristã, cultivada de modo especial por monges e eremitas. Como celebração litúrgica própria, difundiu-se a partir do fim da Idade Média, primeiro na Espanha, e foi estendida a toda a Igreja no século XVII.",
      "A data de 2 de outubro foi fixada pelo Papa Clemente X, em 1670, logo depois da festa dos Arcanjos (29 de setembro), com a qual a celebração esteve por muito tempo associada.",
      "Mais do que uma figura de proteção, o anjo da guarda é apresentado pela Igreja como sinal do cuidado pessoal de Deus por cada um: uma presença silenciosa que acompanha a caminhada de fé, sem substituir a liberdade nem o esforço de quem é acompanhado."
    ]
  },

  "protomartires-brasil": {
    titulo: "Protomártires do Brasil (Mártires de Cunhaú e Uruaçu)",
    resumo: "Grupo de católicos mortos por ódio à fé no Rio Grande do Norte em 1645, reconhecidos como os primeiros mártires do Brasil.",
    texto: [
      "Em 1645, durante a ocupação holandesa do Nordeste, católicos da então Capitania do Rio Grande foram mortos por ódio à fé em dois episódios, por tropas calvinistas e seus aliados. São reconhecidos como os primeiros mártires do Brasil — daí o nome \"protomártires\".",
      "O primeiro massacre ocorreu em 16 de julho de 1645, na capela de Nossa Senhora das Candeias, no engenho de Cunhaú (atual Canguaretama). Durante a missa celebrada pelo padre André de Soveral, as portas foram fechadas e os fiéis reunidos ali foram mortos. Entre as vítimas, a tradição destaca Mateus Moreira, que, ao ter o coração arrancado, teria exclamado: \"Louvado seja o Santíssimo Sacramento.\"",
      "O segundo massacre aconteceu em 3 de outubro de 1645, na região de Uruaçu (atual São Gonçalo do Amarante), onde outro grupo de católicos, guiado pelo padre Ambrósio Francisco Ferro, foi torturado e morto. É dessa segunda data que vem a memória litúrgica, celebrada em 3 de outubro.",
      "Ao todo, trinta mártires dos dois episódios foram beatificados por João Paulo II em 5 de março de 2000 e canonizados pelo Papa Francisco em 15 de outubro de 2017, na Praça de São Pedro, no Vaticano — reconhecidos pela Igreja como os primeiros mártires do Brasil."
    ]
  },

  "sao-francisco-assis": {
    titulo: "São Francisco de Assis",
    resumo: "Filho de rico mercador que abraçou a pobreza radical do Evangelho, fundou a Ordem Franciscana e foi o primeiro santo de quem se tem registro a receber os estigmas.",
    texto: [
      "Nasceu em Assis, na Itália, por volta de 1181, filho de Pietro di Bernardone, próspero comerciante de tecidos. Levou uma juventude despreocupada e sonhava com glórias militares, até que uma série de experiências — uma doença, a prisão numa guerra entre cidades e a voz de Deus que ouviu na igrejinha de São Damião — o conduziram a uma profunda conversão.",
      "Rompeu publicamente com a riqueza da família: diante do bispo de Assis, devolveu ao pai até as roupas que vestia, declarando querer ter por pai apenas \"o Pai que está nos céus\". Passou a viver de esmolas e a servir os pobres e os leprosos, abraçando o que chamava de \"Senhora Pobreza\". Logo atraiu companheiros e, em 1209, obteve do Papa Inocêncio III a aprovação de sua forma de vida, dando início à Ordem dos Frades Menores (franciscanos). Com Santa Clara nasceria também o ramo feminino, as Clarissas.",
      "De sua sensibilidade brotaram gestos que marcaram a fé cristã: em 1223, em Greccio, montou o primeiro presépio para celebrar o Natal; e por volta de 1225 compôs o \"Cântico das Criaturas\", em que louva a Deus chamando de irmãos o sol, a lua, a água e até a morte — um dos primeiros textos poéticos em língua italiana. Em 1224, durante uma oração no monte La Verna, recebeu os estigmas, as chagas da paixão de Cristo em seu próprio corpo, tornando-se o primeiro santo de quem se tem registro a recebê-los.",
      "Morreu em Assis na noite de 3 de outubro de 1226 e foi canonizado menos de dois anos depois, em 1228, pelo Papa Gregório IX. Sua memória litúrgica é celebrada em 4 de outubro. É padroeiro da Itália e, em tempos recentes, foi proclamado também patrono da ecologia, pelo amor com que reconhecia toda a criação como obra e dom de Deus."
    ]
  },

  "santa-faustina": {
    titulo: "Santa Faustina Kowalska, virgem",
    resumo: "Religiosa polonesa a quem foi confiada a mensagem da Divina Misericórdia, difundida pelo mundo a partir de seu diário.",
    texto: [
      "Helena Kowalska nasceu em 1905, numa família pobre de camponeses da Polônia. Com pouca instrução formal, entrou aos vinte anos para a Congregação das Irmãs de Nossa Senhora da Misericórdia, adotando o nome de Maria Faustina, e serviu em conventos como cozinheira, jardineira e porteira.",
      "A partir de 1931 relatou uma série de aparições e locuções de Jesus, que lhe pedia para difundir a confiança na misericórdia divina. De uma dessas visões nasceu a célebre imagem do Cristo com dois raios saindo do peito — um pálido e um vermelho — e a inscrição \"Jesus, eu confio em Vós\". Por ordem de seus confessores, registrou essas experiências num diário, publicado com o título \"A Divina Misericórdia na minha alma\".",
      "Ligadas a ela difundiram-se práticas como a coroa (terço) da Divina Misericórdia e o pedido de uma festa própria dedicada à Misericórdia. Faustina morreu de tuberculose em 5 de outubro de 1938, em Cracóvia, com apenas 33 anos.",
      "Foi canonizada em 30 de abril de 2000 pelo Papa João Paulo II — a primeira canonização do novo milênio —, que, no mesmo dia, instituiu para toda a Igreja o Domingo da Divina Misericórdia, celebrado no segundo domingo da Páscoa."
    ]
  },

  "sao-bruno": {
    titulo: "São Bruno, presbítero",
    resumo: "Mestre célebre que trocou a fama pela solidão e fundou a Ordem dos Cartuxos, a mais rigorosamente contemplativa da Igreja.",
    texto: [
      "Nasceu em Colônia, na atual Alemanha, por volta de 1030. Tornou-se um dos mais renomados mestres de sua época, dirigindo por muitos anos a escola da catedral de Reims, na França, onde formou futuros bispos e até um papa. No auge do prestígio, porém, sentiu o chamado a deixar tudo em busca de uma vida de silêncio e oração.",
      "Em 1084, com alguns companheiros, retirou-se para um vale isolado nas montanhas perto de Grenoble, com a ajuda do bispo local, Santo Hugo. Ali fundou a comunidade que daria origem à Grande Cartuxa e à Ordem dos Cartuxos, marcada por um estilo de vida que une a solidão do eremita à vida em comunidade, num silêncio quase total dedicado à contemplação.",
      "Chamado a Roma pelo Papa Urbano II, seu antigo discípulo, para auxiliá-lo como conselheiro, Bruno aceitou por obediência, mas logo pediu para voltar à vida solitária. Recusou a dignidade de bispo e fundou um segundo eremitério na Calábria, no sul da Itália, onde passou seus últimos anos.",
      "Morreu em 6 de outubro de 1101, em Serra San Bruno, na Calábria. Fiéis ao espírito de discrição da ordem, os cartuxos nunca promoveram um processo solene de canonização; seu culto foi confirmado pela Igreja e, em 1623, estendido a todos os fiéis."
    ]
  },

  "nossa-senhora-rosario": {
    titulo: "Nossa Senhora do Rosário",
    resumo: "Festa mariana ligada à oração do terço e, historicamente, à vitória cristã na batalha de Lepanto, em 1571.",
    texto: [
      "A festa celebra Maria sob o título ligado ao Rosário, a oração que percorre, ave-maria após ave-maria, os principais mistérios da vida de Cristo e de sua Mãe. A tradição associa a difusão dessa devoção à pregação de São Domingos e da Ordem dos Dominicanos ao longo dos séculos.",
      "A data de 7 de outubro tem origem histórica precisa: nesse dia, em 1571, a frota da chamada Liga Santa enfrentou a poderosa armada otomana no golfo de Lepanto, em combate naval decisivo para a Europa da época. O Papa São Pio V havia convocado os fiéis a rezar o Rosário, pedindo a proteção de Maria.",
      "Atribuindo a vitória à intercessão de Nossa Senhora, Pio V instituiu uma festa em ação de graças, inicialmente sob o título de \"Nossa Senhora da Vitória\". Pouco depois, o Papa Gregório XIII fixou-a como festa de \"Nossa Senhora do Rosário\", no dia 7 de outubro.",
      "Mais do que a memória de uma batalha, a celebração é hoje um convite a redescobrir o Rosário como oração simples e contemplativa, ao alcance de todos, que conduz, pela mão de Maria, ao coração do Evangelho."
    ]
  },

  "santa-pelagia": {
    titulo: "Santa Pelágia de Antioquia, virgem e mártir",
    resumo: "Jovem cristã de Antioquia que, segundo a tradição antiga, preferiu a morte a ter sua fé e sua pureza violadas.",
    texto: [
      "O que se conta de Pelágia vem sobretudo de uma homilia de São João Crisóstomo e de menções de Santo Ambrósio, nos séculos IV e V. Segundo esses relatos, era uma jovem cristã de Antioquia, na Síria, de cerca de quinze anos, no tempo da perseguição do imperador Diocleciano, no início do século IV.",
      "Quando soldados foram buscá-la em casa para forçá-la a renegar a fé, Pelágia pediu licença para se preparar. Sabendo o que a esperava e não querendo ser desonrada, lançou-se do alto da casa, entregando a vida em vez de trair sua fé e sua pureza. A Igreja de Antioquia a venerou desde cedo como virgem e mártir.",
      "Santo Ambrósio e São João Crisóstomo louvaram sua coragem como exemplo de fidelidade a Deus, o que fez sua memória atravessar os séculos, ainda que sejam escassos os dados históricos seguros sobre sua vida.",
      "Vale uma observação: a tradição distingue essa Pelágia, virgem e mártir, de outra figura lembrada no mesmo dia em algumas tradições — Pelágia, a Penitente, antiga atriz de Antioquia convertida à fé. Estudiosos discutem há muito se se trata de duas santas distintas ou de desdobramentos de uma mesma história."
    ]
  },

  "sao-joao-leonardo": {
    titulo: "São João Leonardo, presbítero",
    resumo: "Farmacêutico que se tornou sacerdote e fundou uma congregação dedicada à reforma do clero e à formação cristã, além de ajudar a lançar as bases das missões da Igreja.",
    texto: [
      "Nasceu por volta de 1541 em Diecimo, perto de Lucca, na Itália. Trabalhou por anos como auxiliar de farmácia antes de decidir estudar teologia; foi ordenado sacerdote em 1572. Marcado pelo clima de renovação da Igreja após o Concílio de Trento, dedicou-se especialmente à catequese das crianças e à formação de um clero mais santo e preparado.",
      "Em 1574, reuniu em Lucca um grupo de sacerdotes num novo instituto, que viria a chamar-se Ordem dos Clérigos Regulares da Mãe de Deus. A proposta enfrentou resistências e lhe custou até períodos afastado da própria cidade natal, mas firmou-se como obra voltada à reforma da vida sacerdotal e ao ensino da fé.",
      "João Leonardo colaborou ainda com iniciativas que ajudariam a estruturar a atividade missionária da Igreja — esforços ligados às origens do que se tornaria a Congregação para a propagação da fé (Propaganda Fide).",
      "Morreu em Roma em 9 de outubro de 1609, durante uma epidemia que atingia a cidade. Foi canonizado em 1938 pelo Papa Pio XI e é lembrado como padroeiro dos farmacêuticos, em memória de seu antigo ofício."
    ]
  },

  "sao-daniel-comboni": {
    titulo: "São Daniel Comboni, bispo",
    resumo: "Missionário italiano que dedicou a vida à evangelização da África e ao combate à escravidão, com o lema \"Salvar a África com a África\".",
    texto: [
      "Nasceu em 1831 em Limone sul Garda, no norte da Itália, filho de camponeses. Ainda jovem sentiu o chamado às missões e, em 1857, partiu pela primeira vez para a África Central, região então marcada pela escravidão e por condições extremamente duras para os missionários, muitos dos quais morriam pouco depois de chegar.",
      "Convencido de que a evangelização da África deveria ter os próprios africanos como protagonistas, elaborou um projeto que ficou conhecido como \"Plano para a regeneração da África\", resumido no lema \"Salvar a África com a África\". Fundou dois institutos religiosos — os Missionários e as Missionárias Combonianas — para dar continuidade a essa obra.",
      "Foi nomeado bispo e vigário apostólico da África Central, com sede em Cartum, no atual Sudão. Denunciou com firmeza o tráfico de escravos e trabalhou para formar comunidades cristãs locais, em meio a enormes dificuldades de clima, doenças e falta de recursos.",
      "Morreu em Cartum em 10 de outubro de 1881, aos 50 anos, esgotado pelo trabalho. Foi canonizado em 5 de outubro de 2003 pelo Papa João Paulo II."
    ]
  },

  "sao-joao-xxiii": {
    titulo: "São João XXIII, Papa",
    resumo: "O \"Papa Bom\", que convocou o Concílio Vaticano II e imprimiu à Igreja um espírito de renovação e de diálogo com o mundo moderno.",
    texto: [
      "Angelo Giuseppe Roncalli nasceu em 1881 em Sotto il Monte, perto de Bérgamo, na Itália, em família numerosa e humilde de camponeses. Foi ordenado sacerdote e serviu como capelão militar na Primeira Guerra Mundial, depois como diplomata da Santa Sé em vários países e, mais tarde, como patriarca de Veneza.",
      "Eleito Papa em 1958, já com 76 anos, muitos esperavam um pontificado breve e de transição. Surpreendeu ao convocar, em 1959, o Concílio Vaticano II — a grande assembleia que buscaria renovar a vida da Igreja e seu modo de anunciar o Evangelho ao mundo contemporâneo. O Concílio foi aberto em 11 de outubro de 1962, data escolhida para sua memória litúrgica.",
      "Ficou conhecido como o \"Papa Bom\" pela simplicidade e proximidade humana. Deixou encíclicas marcantes, como a Mater et Magistra, sobre as questões sociais, e a Pacem in Terris, apelo à paz dirigido a todos os homens de boa vontade em plena Guerra Fria.",
      "Morreu em 3 de junho de 1963, sem ver o fim do Concílio que iniciara. Foi canonizado em 27 de abril de 2014 pelo Papa Francisco, no mesmo dia em que foi canonizado São João Paulo II."
    ]
  },

  "beata-alexandrina-costa": {
    titulo: "Beata Alexandrina Maria da Costa, virgem",
    resumo: "Jovem portuguesa que, imobilizada por quase trinta anos, transformou o sofrimento em oferenda e é lembrada por sua intensa vida mística e eucarística.",
    texto: [
      "Nasceu em 1904 em Balasar, no norte de Portugal, em família camponesa. Aos catorze anos, para escapar de homens que ameaçavam sua pureza, saltou de uma janela; as lesões daí resultantes agravaram-se com o tempo e a deixaram completamente paralisada, presa a uma cama pelos cerca de trinta anos seguintes de sua vida.",
      "Vivendo esse longo sofrimento em união com a paixão de Cristo, Alexandrina ofereceu-se como \"vítima\" pela conversão dos pecadores e destacou-se pela devoção à Eucaristia e ao Imaculado Coração de Maria, em sintonia com a mensagem de Fátima.",
      "A tradição relata que, por cerca de treze anos, alimentou-se unicamente da Eucaristia. O fenômeno chegou a ser submetido a um período de rigorosa observação médica num hospital do Porto, que registrou a ausência de alimentação comum durante o tempo examinado — algo que a Igreja não apresenta como prova científica definitiva, mas como sinal ligado à sua vida de fé.",
      "Morreu em 13 de outubro de 1955. Foi beatificada em 25 de abril de 2004 pelo Papa João Paulo II, e o santuário de Balasar tornou-se um dos lugares de peregrinação mais visitados de Portugal."
    ]
  },

  "sao-calisto-i": {
    titulo: "São Calisto I, Papa e mártir",
    resumo: "De escravo a Papa, ficou conhecido pela misericórdia com os pecadores e pelo cuidado com o cemitério cristão que leva seu nome.",
    texto: [
      "Segundo os relatos antigos, Calisto nasceu em Roma, de origem humilde, e foi escravo. Encarregado de um negócio que fracassou, acabou condenado a trabalhos forçados nas minas da Sardenha, onde conviveu com cristãos presos por causa da fé — experiência ligada à sua conversão. Recuperada a liberdade, tornou-se diácono.",
      "O Papa Zeferino confiou-lhe a administração do cemitério cristão da via Ápia, em Roma — as célebres catacumbas que até hoje levam seu nome, um dos mais importantes conjuntos funerários da Igreja antiga.",
      "Por volta de 217 foi eleito Papa. Seu governo foi marcado por controvérsias sobre a disciplina penitencial: Calisto defendia a possibilidade de readmitir à comunhão os cristãos que haviam caído em pecados graves, depois de sincera penitência — posição de misericórdia que lhe rendeu forte oposição de setores mais rigoristas.",
      "Morreu por volta de 222, venerado como mártir desde a Antiguidade; a tradição liga sua morte a um tumulto popular contra os cristãos em Roma. É lembrado sobretudo pela clemência pastoral e pelo cuidado com a memória dos fiéis sepultados."
    ]
  },

  "santa-teresa-avila": {
    titulo: "Santa Teresa de Jesus (Teresa d'Ávila), virgem e doutora da Igreja",
    resumo: "Grande mística e reformadora do Carmelo, foi a primeira mulher proclamada Doutora da Igreja.",
    texto: [
      "Teresa de Cepeda y Ahumada nasceu em Ávila, na Espanha, em 1515. Entrou jovem para o Carmelo e, após anos de vida religiosa comum e de saúde frágil, viveu uma profunda experiência de renovação interior, que a lançou num caminho de intensa oração e união com Deus.",
      "A partir de 1562, empreendeu uma corajosa reforma da Ordem do Carmo, fundando conventos de vida mais austera e recolhida — os Carmelitas Descalços —, obra que realizou ao lado de São João da Cruz, apesar de muitas resistências. Percorreu a Espanha fundando comunidades, unindo à contemplação um espírito prático e cheio de bom humor.",
      "Deixou obras espirituais que se tornaram clássicos da mística cristã, como o \"Livro da Vida\", o \"Caminho de Perfeição\" e o \"Castelo Interior\", em que descreve a alma como um castelo de muitas moradas em direção a Deus.",
      "Morreu na noite de 4 de outubro de 1582. Como naqueles dias entrava em vigor a reforma do calendário gregoriano, o dia seguinte foi contado como 15 de outubro — data em que sua memória é celebrada. Foi canonizada em 1622 e, em 1970, o Papa Paulo VI a declarou Doutora da Igreja, a primeira mulher a receber esse título."
    ]
  },

  "santa-margarida-alacoque": {
    titulo: "Santa Margarida Maria Alacoque, virgem",
    resumo: "Religiosa da Ordem da Visitação a quem se atribui a difusão da devoção ao Sagrado Coração de Jesus.",
    texto: [
      "Nasceu em 1647, na região da Borgonha, na França. Desde cedo atraída pela vida religiosa, entrou para o mosteiro das monjas da Visitação em Paray-le-Monial, onde viveu de modo humilde e escondido.",
      "Entre 1673 e 1675, relatou uma série de aparições de Jesus, que lhe mostrava seu Coração como sinal de um amor imenso e muitas vezes esquecido pelos homens, pedindo-lhe que trabalhasse pela difusão dessa devoção. Dessas revelações nasceram práticas que se espalhariam por toda a Igreja, como a comunhão nas primeiras sextas-feiras do mês e a festa do Sagrado Coração.",
      "No começo, encontrou desconfiança e resistência, inclusive dentro do próprio convento. Teve, porém, o apoio decisivo de seu diretor espiritual, o jesuíta São Cláudio de la Colombière, que reconheceu a autenticidade de sua experiência e ajudou a difundir a mensagem.",
      "Morreu em 17 de outubro de 1690, aos 43 anos. Foi canonizada em 1920 pelo Papa Bento XV. A devoção ao Sagrado Coração de Jesus, ligada a seu nome, tornou-se uma das mais populares e difundidas do catolicismo."
    ]
  },

  "santo-inacio-antioquia": {
    titulo: "Santo Inácio de Antioquia, bispo e mártir",
    resumo: "Bispo dos primeiros tempos do cristianismo, escreveu sete cartas a caminho do martírio e foi o primeiro a chamar a Igreja de \"católica\".",
    texto: [
      "Inácio foi bispo de Antioquia, na Síria, uma das principais comunidades cristãs dos primeiros tempos, no fim do século I e início do século II. Recebeu o sobrenome grego Teóforo, que significa \"portador de Deus\". A tradição o liga à geração imediatamente posterior à dos apóstolos.",
      "Durante a perseguição no tempo do imperador Trajano, foi condenado e levado sob escolta de Antioquia até Roma para ser executado. Ao longo dessa viagem, escreveu sete cartas — dirigidas a diversas comunidades cristãs e a São Policarpo, bispo de Esmirna — que estão entre os mais preciosos testemunhos da fé e da organização da Igreja naquela época.",
      "Nessas cartas, Inácio exorta os cristãos à unidade em torno dos bispos e manifesta um ardente desejo de dar a vida por Cristo. É nelas, também, que aparece pela primeira vez a expressão \"Igreja católica\", isto é, universal.",
      "Chegando a Roma, foi morto por volta do ano 107, lançado às feras no anfiteatro. É venerado como um dos Padres Apostólicos — os primeiros escritores cristãos ligados diretamente ao tempo dos apóstolos."
    ]
  },

  "sao-lucas": {
    titulo: "São Lucas, Evangelista",
    resumo: "Médico e companheiro de São Paulo, autor do terceiro Evangelho e dos Atos dos Apóstolos.",
    texto: [
      "Segundo a tradição antiga, Lucas era de Antioquia, na Síria, e de origem grega, não judaica. Exercia a medicina — São Paulo o chama de \"o médico amado\" (Cl 4,14) — e foi companheiro de viagem e colaborador do apóstolo em parte de suas missões.",
      "É reconhecido como autor de duas obras que, juntas, formam quase um terço do Novo Testamento: o terceiro Evangelho e os Atos dos Apóstolos, que narram, respectivamente, a vida de Jesus e os primeiros passos da Igreja depois de Pentecostes.",
      "Seu Evangelho é marcado pela ternura: destaca a misericórdia de Deus, a atenção aos pobres e aos pecadores e o lugar das mulheres. É a ele que devemos algumas das páginas mais amadas do Novo Testamento, como as narrativas da infância de Jesus e parábolas como a do filho pródigo e a do bom samaritano. Uma tradição posterior o apresenta também como pintor, o primeiro a retratar a Virgem Maria.",
      "Entre os símbolos dos quatro evangelistas, o seu é o touro (ou novilho), ligado à ideia de sacrifício. É venerado como padroeiro dos médicos e também dos pintores e artistas. Sua festa é celebrada em 18 de outubro."
    ]
  },

  "sao-paulo-cruz": {
    titulo: "São Paulo da Cruz, presbítero",
    resumo: "Fundador dos Passionistas, dedicou a vida a manter viva a memória da paixão de Cristo.",
    texto: [
      "Nasceu Paolo Francesco Danei em 1694, em Ovada, no norte da Itália, em família cristã e de comerciantes. Desde jovem sentiu-se chamado a uma vida de penitência e oração, centrada na contemplação dos sofrimentos de Cristo, que considerava a maior expressão do amor de Deus pelos homens.",
      "Reuniu companheiros e fundou a Congregação da Paixão de Jesus Cristo, cujos membros — os passionistas — assumem um voto especial de promover a memória da paixão do Senhor. Dedicou-se intensamente à pregação de missões populares, buscando reavivar a fé do povo simples.",
      "Homem de intensa vida interior, é lembrado por sua austeridade e, ao mesmo tempo, pela doçura no trato com os pecadores e os aflitos. Já no fim da vida, viu nascer também o ramo contemplativo feminino da congregação, as monjas passionistas.",
      "Morreu em Roma em 18 de outubro de 1775. Foi canonizado em 1867 pelo Papa Pio IX. Sua memória litúrgica é celebrada em 19 de outubro."
    ]
  },

  "santa-maria-bertila": {
    titulo: "Santa Maria Bertila Boscardin, virgem",
    resumo: "Religiosa e enfermeira italiana que serviu os doentes e os feridos da Primeira Guerra Mundial com humildade absoluta, aceitando até as tarefas mais escondidas como vontade de Deus.",
    texto: [
      "Nasceu Ana Francisca Boscardin em 6 de outubro de 1888, em Brendola, na província de Vicência (Itália), a mais velha de três filhos de uma família pobre de camponeses. De saúde frágil e tida por lenta pelos que a cercavam, ajudava os pais no trabalho da terra e crescia numa fé simples e perseverante.",
      "Aos dezessete anos entrou na Congregação das Mestras de Santa Doroteia, em Vicência, recebendo o nome de Maria Bertila. Enviada ao hospital de Treviso, começou pelos serviços da cozinha e, depois de formar-se enfermeira, passou a cuidar diretamente dos doentes — em especial das crianças atingidas pela difteria, a quem se dedicava dia e noite.",
      "Durante a Primeira Guerra Mundial permaneceu junto aos feridos mesmo quando os bombardeios atingiram Treviso. Numa ocasião, uma superiora, por um mal-entendido, afastou-a da enfermaria e a mandou para a lavanderia; ela aceitou a mudança sem uma queixa, dizendo cumprir ali a mesma vontade de Deus.",
      "Havia anos carregava um tumor. Depois de uma segunda cirurgia, morreu em Treviso em 20 de outubro de 1922, aos trinta e quatro anos. Foi beatificada em 1952 pelo Papa Pio XII e canonizada em 1961 pelo Papa João XXIII. É invocada pelos doentes, sobretudo pelas vítimas do câncer, e sua memória litúrgica é celebrada em 20 de outubro."
    ]
  },

  "santa-ursula": {
    titulo: "Santa Úrsula e companheiras, mártires",
    resumo: "Um grupo de virgens martirizadas em Colônia nos primeiros séculos da Igreja, cuja memória antiquíssima foi, com o passar dos séculos, envolvida em lenda.",
    texto: [
      "A devoção a Santa Úrsula nasce de um fato histórico modesto e muito antigo: em Colônia, na atual Alemanha, um grupo de moças cristãs foi morto por causa da fé, provavelmente entre os séculos III e IV. Uma inscrição em pedra, conservada na igreja que leva o nome da santa, guarda a memória dessas virgens mártires.",
      "Ao longo da Idade Média, a história foi crescendo. Surgiu o relato de Úrsula, filha de um rei bretão, que teria atravessado a Europa numa peregrinação e sido martirizada com suas companheiras ao chegar a Colônia. O número das companheiras, a princípio pequeno, acabou fixado pela tradição popular em onze mil — amplificação provavelmente ligada à leitura equivocada de uma abreviação antiga.",
      "A festa foi muito celebrada durante séculos e inspirou, no século XVI, a Companhia de Santa Úrsula, fundada por Santa Ângela Merici — as ursulinas, dedicadas à educação das jovens.",
      "Em 1969, ao rever o calendário, a Igreja retirou Santa Úrsula do Calendário Romano Geral, justamente porque o núcleo histórico não pode ser reconstruído com segurança, mas a manteve no Martirológio Romano. Sua memória é lembrada em 21 de outubro."
    ]
  },

  "sao-joao-paulo-ii": {
    titulo: "São João Paulo II, Papa",
    resumo: "Karol Wojtyła, o primeiro Papa eslavo da história, que por mais de 26 anos levou o Evangelho a todos os continentes e teve papel decisivo na queda pacífica dos regimes comunistas do Leste europeu.",
    texto: [
      "Karol Józef Wojtyła nasceu em 18 de maio de 1920, em Wadowice, na Polônia. Perdeu cedo a mãe, o irmão e o pai. Durante a ocupação nazista, trabalhou numa pedreira e numa fábrica de produtos químicos e estudou num seminário clandestino, sendo ordenado padre em 1946.",
      "Bispo aos 38 anos, tornou-se arcebispo de Cracóvia e cardeal, e participou do Concílio Vaticano II. Em 16 de outubro de 1978 foi eleito Papa — o primeiro não italiano em mais de quatro séculos e o primeiro eslavo da história.",
      "Seu pontificado, o terceiro mais longo, foi marcado por mais de uma centena de viagens internacionais, pela criação das Jornadas Mundiais da Juventude, por um vasto magistério e por pedidos públicos de perdão pelas faltas históricas de cristãos. Em 13 de maio de 1981 sofreu um atentado a tiros na Praça de São Pedro; recuperado, foi visitar na prisão e perdoar quem havia atirado nele.",
      "Morreu no Vaticano em 2 de abril de 2005. Foi beatificado em 2011 pelo Papa Bento XVI e canonizado em 27 de abril de 2014 pelo Papa Francisco, junto com o Papa João XXIII. Sua memória litúrgica é celebrada em 22 de outubro, dia em que iniciou solenemente o pontificado, em 1978."
    ]
  },

  "sao-joao-capistrano": {
    titulo: "São João de Capistrano, presbítero",
    resumo: "Jurista convertido na prisão, tornou-se um dos maiores pregadores franciscanos do século XV e, já idoso, animou a defesa cristã de Belgrado contra os turcos.",
    texto: [
      "Nasceu em 24 de junho de 1386, em Capestrano, nos Abruzos (então reino de Nápoles). Estudou Direito em Perúgia, tornou-se jurista e chegou a governador da cidade. Preso durante um conflito entre famílias rivais, viveu ali uma profunda conversão.",
      "Em 1416 entrou entre os Franciscanos, ligando-se a São Bernardino de Sena, de quem foi discípulo e defensor. Tornou-se um pregador incansável: percorreu a Itália e boa parte da Europa central como legado papal, chamando o povo à penitência e à reforma dos costumes.",
      "Aos setenta anos, enviado pelo Papa Calisto III, pregou a mobilização cristã diante do avanço otomano. Ao lado do comandante húngaro João Hunyadi, esteve no cerco de Belgrado, em 1456, encorajando os combatentes — vitória que afastou por décadas a ameaça turca sobre a Europa central.",
      "Morreu poucos meses depois, em 23 de outubro de 1456, em Ilok, na atual Croácia. Foi beatificado em 1650 e canonizado em 1690 pelo Papa Alexandre VIII. Sua memória litúrgica é celebrada em 23 de outubro."
    ]
  },

  "santo-antonio-claret": {
    titulo: "Santo Antônio Maria Claret, bispo",
    resumo: "Tecelão catalão que se tornou padre missionário, fundou os Claretianos e, como arcebispo de Santiago de Cuba, reorganizou uma Igreja em ruínas em meio a atentados contra a própria vida.",
    texto: [
      "Nasceu em 23 de dezembro de 1807, em Sallent, na Catalunha (Espanha), filho de um pequeno fabricante de lã. Trabalhou como tecelão desde os doze anos e aperfeiçoou o ofício em Barcelona, até decidir entrar no seminário de Vique, sendo ordenado padre em 1835.",
      "Dedicou-se à pregação de missões populares pela Catalunha e pelas Ilhas Canárias. Em 16 de julho de 1849 fundou em Vique a Congregação dos Missionários Filhos do Imaculado Coração de Maria — os claretianos — e criou uma editora, a Livraria Religiosa, que espalhou milhões de livros católicos baratos.",
      "Nomeado arcebispo de Santiago de Cuba em 1850, encontrou seminário arruinado, clero despreparado e igrejas abandonadas. Reorganizou a diocese, validou milhares de casamentos e abriu escolas e hospitais. Sobreviveu a um atentado a faca em Holguín, que lhe deixou uma cicatriz no rosto.",
      "De volta à Espanha em 1857, foi confessor da rainha Isabel II; com a revolução de 1868, seguiu para o exílio e participou do Concílio Vaticano I. Morreu em 24 de outubro de 1870, na abadia de Fontfroide, na França. Foi beatificado em 1934 pelo Papa Pio XI e canonizado em 1950 pelo Papa Pio XII. Sua memória litúrgica é celebrada em 24 de outubro."
    ]
  },

  "santo-antonio-galvao": {
    titulo: "Santo Antônio de Sant'Ana Galvão, presbítero",
    resumo: "Franciscano de Guaratinguetá, fundador do Mosteiro da Luz e conhecido pelas \"pílulas\" que distribuía aos doentes — o primeiro santo nascido no Brasil.",
    texto: [
      "Nasceu em 10 de maio de 1739, em Guaratinguetá, no Vale do Paraíba (São Paulo), quarto de dez filhos de uma família portuguesa, próspera e devota; o pai, Antônio Galvão de França, era comerciante e membro da Ordem Terceira Franciscana. Estudou com os jesuítas em Salvador, na Bahia, e, diante da perseguição do Marquês de Pombal à Companhia de Jesus, entrou para os franciscanos no convento de Taubaté, sendo ordenado padre em 1762.",
      "Viveu em São Paulo como pregador, confessor e mestre de noviços. Em 1774 fundou, com a Irmã Helena Maria do Espírito Santo, o Recolhimento de Nossa Senhora da Conceição da Divina Providência — hoje Mosteiro da Luz —, casa de vida religiosa para mulheres que acompanhou até o fim da vida e cuja igreja e convento levou décadas para concluir.",
      "Espalhou-se a devoção às suas \"pílulas\": pequenos papéis com uma jaculatória latina a Nossa Senhora, entregues a doentes e a mulheres em trabalho de parto e associados pelo povo a muitas graças alcançadas. Homem de vida pobre e simples, era procurado por gente de toda condição em busca de conselho e reconciliação, e ficou lembrado como \"o homem da paz e da caridade\".",
      "Morreu em São Paulo em 23 de dezembro de 1822 e está sepultado no Mosteiro da Luz. Foi beatificado em 1998 pelo Papa João Paulo II e canonizado em 11 de maio de 2007, em São Paulo, pelo Papa Bento XVI — o primeiro santo nascido no Brasil. Sua memória litúrgica é celebrada em 25 de outubro."
    ]
  },

  "santo-evaristo": {
    titulo: "Santo Evaristo, Papa",
    resumo: "Quinto Papa da história, sucessor de São Clemente, governou a Igreja de Roma no início do século II, em tempo de perseguição.",
    texto: [
      "As poucas informações sobre Evaristo vêm sobretudo de Santo Ireneu e de Eusébio de Cesareia. Teria origem grega, de uma família judia de Belém estabelecida em Antioquia. Sucedeu ao Papa São Clemente por volta do ano 100 e governou a Igreja de Roma até cerca de 108.",
      "A tradição lhe atribui a organização das primeiras circunscrições eclesiásticas de Roma — os \"títulos\", igrejas confiadas a presbíteros que estão na origem das paróquias — e o costume de a bênção dos casamentos ser dada publicamente. Esses dados, porém, são de atribuição tardia e não podem ser confirmados.",
      "Exerceu o ministério num tempo em que professar a fé cristã em Roma já podia custar a vida. O Martirológio Romano o venera como mártir e afirma que foi sepultado perto do túmulo de São Pedro, no Vaticano; não há, contudo, registro histórico seguro das circunstâncias de sua morte.",
      "Sua memória é lembrada em 26 de outubro. Não consta do Calendário Romano Geral nem do próprio do Brasil, sendo conservada no Martirológio Romano."
    ]
  },

  "beato-goncalo-lagos": {
    titulo: "Beato Gonçalo de Lagos, presbítero",
    resumo: "Frade agostiniano português, pregador incansável e prior de vários conventos, venerado no Algarve e padroeiro de Torres Vedras.",
    texto: [
      "Nasceu por volta de 1360 em Lagos, no Algarve (Portugal), em família humilde. Ainda jovem entrou na Ordem dos Eremitas de Santo Agostinho, no convento de Nossa Senhora da Graça de Lisboa, onde se formou e foi ordenado presbítero.",
      "Foi prior de vários conventos agostinianos — São Lourenço da Lourinhã, Nossa Senhora da Graça de Lisboa, Santarém e, a partir de 1412, Nossa Senhora da Graça de Torres Vedras, onde permaneceu até a morte. Ficou conhecido como pregador infatigável e homem de estudo, dedicado também à iluminura e à cópia de livros litúrgicos.",
      "Cuidava pessoalmente dos doentes e dos pobres e era procurado como conselheiro. A devoção popular lhe atribuiu numerosos milagres, sobretudo em favor dos pescadores do Algarve em perigo no mar.",
      "Morreu em Torres Vedras em 15 de outubro de 1422. Foi beatificado em 27 de maio de 1778 pelo Papa Pio VI; nunca foi formalmente canonizado, embora o povo o chame de \"São Gonçalo\". É padroeiro de Torres Vedras e de Lagos, e sua memória é celebrada em 27 de outubro no Patriarcado de Lisboa e na Diocese do Algarve."
    ]
  },

  "sao-narciso-jerusalem": {
    titulo: "São Narciso de Jerusalém, bispo",
    resumo: "Bispo de Jerusalém no fim do século II, lembrado por Eusébio pela santidade, pela idade avançadíssima e pelos anos de retiro no deserto depois de ser caluniado.",
    texto: [
      "O que se sabe de Narciso vem sobretudo da História Eclesiástica de Eusébio de Cesareia. Foi bispo de Jerusalém no fim do século II, já em idade avançada, e governou aquela Igreja por muitos anos, alcançando, segundo a tradição, idade extraordinariamente longeva.",
      "Eusébio lhe reconhece grande autoridade moral: presidiu um sínodo reunido na Palestina que firmou a celebração da Páscoa no domingo. A tradição também lhe atribui o milagre de, numa vigília pascal, transformar água em azeite para as lâmpadas da igreja.",
      "Caluniado por três homens que juraram falso contra ele, preferiu retirar-se para a solidão do deserto a defender-se, permanecendo oculto por vários anos. Reconhecida sua inocência, foi reconduzido ao episcopado e, já muito idoso, teve como auxiliar o bispo Alexandre.",
      "Morreu em Jerusalém no início do século III. Sua memória é conservada no Martirológio Romano e celebrada em 29 de outubro."
    ]
  },

  "sao-germano-capua": {
    titulo: "São Germano de Cápua, bispo",
    resumo: "Bispo de Cápua no século VI e legado do Papa que ajudou a encerrar o cisma acaciano; sua morte foi vista em visão por São Bento.",
    texto: [
      "Nasceu em Cápua, no sul da Itália, no fim do século V, em família abastada. Órfão de pai, distribuiu seus bens aos pobres e abraçou a vida eclesiástica; por volta de 516 foi eleito bispo de sua cidade.",
      "Em 519 o Papa Hormisdas o pôs à frente de uma delegação enviada a Constantinopla para restabelecer a comunhão entre Roma e o Oriente, rompida havia mais de trinta anos pelo chamado cisma acaciano. A missão teve êxito e a unidade foi restaurada.",
      "Era amigo de São Bento de Núrsia. São Gregório Magno conta, nos Diálogos, que Bento, em oração numa noite em Monte Cassino, viu a alma de Germano ser levada ao céu pelos anjos numa esfera de fogo — e depois se soube que o bispo morrera naquele instante.",
      "Sua morte se deu em 30 de outubro, por volta do ano 540. Sua memória é conservada no Martirológio Romano e celebrada em 30 de outubro."
    ]
  },

  "santo-afonso-rodrigues": {
    titulo: "Santo Afonso Rodrigues, religioso",
    resumo: "Comerciante castelhano que, viúvo e sem os filhos, entrou já maduro na Companhia de Jesus como irmão e passou quase meio século como porteiro de um colégio em Maiorca.",
    texto: [
      "Nasceu em 25 de julho de 1532, em Segóvia (Espanha), filho de um comerciante de lãs. Assumiu os negócios da família, casou-se e teve filhos. Em poucos anos perdeu a esposa e as crianças, e essa provação o voltou inteiramente para Deus.",
      "Quis entrar na Companhia de Jesus, mas foi recusado pela idade e pela falta de estudos. Persistiu e foi admitido em 1571 como irmão coadjutor. Enviado ao colégio de Montesión, em Palma de Maiorca, recebeu o encargo de porteiro, que exerceu por cerca de quarenta e seis anos, até o fim da vida.",
      "Atendia a cada pessoa que batia à porta como se fosse o próprio Cristo. Homem simples e de intensa vida de oração, tornou-se conselheiro procurado por religiosos e leigos; entre os que orientou esteve o jovem estudante Pedro Claver, futuro apóstolo dos escravos em Cartagena.",
      "Morreu em Palma de Maiorca em 31 de outubro de 1617. Foi canonizado em 15 de janeiro de 1888 pelo Papa Leão XIII, no mesmo dia que São Pedro Claver. Sua memória litúrgica é celebrada em 31 de outubro."
    ]
  },

  "fieis-defuntos": {
    titulo: "Comemoração de Todos os Fiéis Defuntos",
    resumo: "O dia em que a Igreja reza por todos os que morreram e ainda se purificam antes de entrar plenamente na glória de Deus.",
    texto: [
      "No dia seguinte à Solenidade de Todos os Santos, a Igreja lembra todos os fiéis já falecidos e oferece por eles, de modo especial, a Missa e a oração — sobretudo pelos que passam pela purificação final antes de contemplar a Deus face a face.",
      "A celebração foi difundida a partir do ano 998 por Santo Odilão, abade de Cluny, que fixou o dia 2 de novembro para todos os mosteiros da ordem; o costume espalhou-se depois por toda a Igreja latina.",
      "Repousa sobre a fé na comunhão dos santos: os vivos podem interceder pelos mortos, como já se lê no Segundo Livro dos Macabeus. Por isso é tradição, nesses dias, visitar os cemitérios e rezar pelos que partiram.",
      "Nesta data cada sacerdote pode celebrar três Missas. No Brasil, o dia é popularmente conhecido como Finados."
    ]
  },

  "sao-martinho-porres": {
    titulo: "São Martinho de Porres, religioso",
    resumo: "Filho de um fidalgo espanhol e de uma negra liberta, foi irmão dominicano em Lima, enfermeiro dos pobres e o primeiro santo mestiço das Américas.",
    texto: [
      "Nasceu em Lima, no Peru, em 9 de dezembro de 1579, filho ilegítimo de João de Porres, fidalgo espanhol, e de Ana Velázquez, mulher negra liberta natural do Panamá. Cresceu na pobreza e aprendeu o ofício de barbeiro-cirurgião, que na época incluía tratar feridas e cuidar de doentes.",
      "Aos pouco mais de quinze anos entrou no convento dominicano de Nossa Senhora do Rosário, em Lima, como \"doado\" — o grau mais humilde da casa. Anos depois foi admitido como irmão religioso. Cuidou da enfermaria do convento e, mais ainda, dos doentes pobres, dos escravos e dos abandonados da cidade, a quem acolhia sem distinção de cor ou condição.",
      "Sua caridade e sua penitência tornaram-se conhecidas ainda em vida, e a ele se atribuíram curas e um trato singular com os animais. Foi amigo de Santa Rosa de Lima e de São João Macías, seu companheiro de vida religiosa na mesma cidade.",
      "Morreu em Lima em 3 de novembro de 1639. Foi beatificado em 1837 pelo Papa Gregório XVI e canonizado em 1962 pelo Papa João XXIII. É invocado como padroeiro da justiça social e da fraternidade entre os povos, e sua memória litúrgica é celebrada em 3 de novembro."
    ]
  },

  "sao-carlos-borromeu": {
    titulo: "São Carlos Borromeu, bispo",
    resumo: "Cardeal aos 21 anos e arcebispo de Milão, tornou-se o modelo do bispo reformador saído do Concílio de Trento.",
    texto: [
      "Nasceu em 2 de outubro de 1538, no castelo de Arona, junto ao Lago Maior, em nobre família milanesa. Estudou Direito Civil e Canônico em Pávia. Em 1559 seu tio materno foi eleito Papa como Pio IV e o chamou a Roma; aos vinte e um anos foi feito cardeal e encarregado da administração da arquidiocese de Milão.",
      "Teve papel decisivo na reabertura e conclusão do Concílio de Trento (1562–1563) e na redação do Catecismo Romano. A morte do irmão mais velho o levou a uma vida mais austera: recusou-se a deixar o estado clerical para chefiar a família, foi ordenado padre e bispo em 1563 e, em 1565, tomou posse pessoalmente da sé de Milão.",
      "Como arcebispo, governou com rigor e caridade: percorreu toda a diocese em visitas pastorais, fundou seminários, promoveu a catequese das crianças e reuniu concílios provinciais. Durante a peste de 1576 permaneceu em Milão, organizando o socorro e visitando os doentes. Certa vez escapou de um atentado a tiros dentro da própria capela.",
      "Esgotado pelo trabalho, morreu em Milão em 3 de novembro de 1584, aos quarenta e seis anos. Foi canonizado em 1610 pelo Papa Paulo V. Sua memória litúrgica é celebrada em 4 de novembro."
    ]
  },

  "zacarias-isabel": {
    titulo: "São Zacarias e Santa Isabel, pais de São João Batista",
    resumo: "O casal idoso e justo do Evangelho de Lucas a quem, contra toda esperança, foi dado o filho que prepararia o caminho do Messias.",
    texto: [
      "Zacarias e Isabel aparecem no primeiro capítulo do Evangelho de São Lucas. Ele era sacerdote do templo de Jerusalém; ela, descendente de Aarão e parente de Maria de Nazaré. O evangelista os descreve como \"justos diante de Deus\", fiéis a todos os mandamentos, mas já idosos e sem filhos.",
      "Enquanto oferecia o incenso no santuário, Zacarias recebeu do anjo Gabriel o anúncio de que Isabel teria um filho, João. Por duvidar, ficou mudo até o nascimento da criança, quando recuperou a voz para entoar o cântico Benedictus.",
      "Grávida de João, Isabel recebeu a visita de Maria, também grávida, e, cheia do Espírito Santo, saudou-a como \"bendita entre as mulheres\" e \"mãe do meu Senhor\" — palavras que a Igreja repete todos os dias na Ave-Maria.",
      "Seus nomes não constam do calendário litúrgico da Missa, mas a tradição cristã dedica a eles o dia 5 de novembro, e o Martirológio Romano guarda a sua memória."
    ]
  },

  "sao-leonardo-noblac": {
    titulo: "São Leonardo de Noblac, eremita",
    resumo: "Eremita franco do século VI, fundador do mosteiro que deu origem a Saint-Léonard-de-Noblat, invocado desde a Idade Média como libertador dos prisioneiros.",
    texto: [
      "As notícias sobre Leonardo vêm de uma \"vida\" escrita séculos depois de sua morte, de valor histórico incerto. Segundo ela, nasceu na Gália por volta do ano 500, em família ligada à corte franca, e teria tido como padrinho o rei Clodoveu. Formou-se junto de São Remígio, bispo de Reims.",
      "Recusou a dignidade episcopal que lhe ofereceram e retirou-se como eremita para a floresta de Pauvain, perto de Limoges. Ali reuniu discípulos e fundou o mosteiro que deu origem à cidade de Saint-Léonard-de-Noblat.",
      "A tradição lhe atribui o poder de obter a libertação de prisioneiros: dizia-se que bastava invocá-lo para que as correntes se rompessem, e muitos libertados iam depositar seus grilhões junto ao seu túmulo. É também invocado pelas mulheres em trabalho de parto.",
      "Morreu por volta de 559, num 6 de novembro. Sua devoção espalhou-se por toda a Europa na Idade Média, e sua memória é conservada no Martirológio Romano."
    ]
  },

  "sao-wilibrordo": {
    titulo: "São Wilibrordo, bispo",
    resumo: "Monge inglês que evangelizou a Frísia, primeiro bispo de Utreque e fundador da abadia de Echternach — o \"apóstolo dos frísios\".",
    texto: [
      "Nasceu por volta de 658 na Nortúmbria (Inglaterra). Educou-se no mosteiro de Ripon, sob São Wilfrido, e depois passou doze anos na Irlanda, aprofundando os estudos e a vida monástica. Ordenado padre, sentiu o chamado de evangelizar os povos ainda pagãos do continente.",
      "Por volta de 690 partiu para a Frísia (atuais Países Baixos) com onze companheiros, com o apoio de Pepino de Herstal. Em 695 o Papa Sérgio I o consagrou em Roma bispo dos frísios, com o nome de Clemente, e ele fixou sua sede em Utreque.",
      "Fundou igrejas, mosteiros e escolas, entre eles a célebre abadia de Echternach, em Luxemburgo, que se tornou centro de missão e de cultura. Enfrentou reveses quando guerras e a reação pagã destruíram parte de sua obra, mas sempre recomeçava.",
      "Morreu em Echternach em 7 de novembro de 739, com cerca de oitenta anos. Venerado como \"apóstolo dos frísios\", é padroeiro dos Países Baixos e de Luxemburgo, e sua memória é celebrada em 7 de novembro."
    ]
  },

  "sao-deodato": {
    titulo: "São Deodato I, Papa",
    resumo: "Papa romano do início do século VII, sacerdote idoso e caridoso, que governou a Igreja em três anos marcados por terremoto e epidemia em Roma.",
    texto: [
      "Deodato — nome que em latim significa \"dado por Deus\" — era romano, filho de um subdiácono chamado Estêvão. Já em idade madura e depois de longos anos de sacerdócio, foi eleito Bispo de Roma em outubro de 615, sucedendo a Bonifácio IV.",
      "Seu pontificado, de pouco mais de três anos, coincidiu com tempos duros para a cidade: um forte terremoto e uma epidemia. A tradição diz que permaneceu em Roma socorrendo os doentes, e o Martirológio Romano recorda o relato de que curou um leproso com um beijo.",
      "Cuidou de restituir dignidade ao clero das paróquias de Roma e foi lembrado por sua caridade: em testamento, deixou aos clérigos da cidade o equivalente a um ano de sustento.",
      "Morreu em 8 de novembro de 618 e foi sepultado na Basílica de São Pedro. Sua memória é celebrada em 8 de novembro."
    ]
  },

  "dedicacao-latrao": {
    titulo: "Dedicação da Basílica de Latrão",
    resumo: "A festa da consagração da catedral do Papa como Bispo de Roma — \"mãe e cabeça de todas as igrejas da cidade e do mundo\".",
    texto: [
      "A catedral da diocese de Roma não é a Basílica de São Pedro, no Vaticano, mas a Basílica de São João de Latrão. Por ser a igreja do Papa enquanto Bispo de Roma, ela recebe o título de \"mãe e cabeça de todas as igrejas da cidade e do mundo\".",
      "Foi erguida em terreno da antiga família Laterano, doado pelo imperador Constantino, e dedicada pelo Papa São Silvestre I por volta do ano 324 — primeiro ao Santíssimo Salvador e, mais tarde, também a São João Batista e São João Evangelista, de onde vem o nome popular.",
      "Ao longo dos séculos foi incendiada, abalada por terremoto e reconstruída várias vezes; ali se realizaram cinco concílios ecumênicos. Mesmo depois de a residência papal passar para o Vaticano, no século XV, permaneceu a catedral do Papa.",
      "Celebrar a dedicação de um edifício de pedra é, no fundo, celebrar a Igreja viva: o povo de Deus reunido em torno do sucessor de Pedro. A festa é observada em toda a Igreja latina em 9 de novembro."
    ]
  },

  "sao-leao-magno": {
    titulo: "São Leão Magno, Papa e doutor da Igreja",
    resumo: "Papa do século V, defensor da fé de Calcedônia com o \"Tomo de Leão\" e o pontífice que, segundo a tradição, deteve Átila às portas de Roma.",
    texto: [
      "Nascido provavelmente na Toscana no fim do século IV, Leão serviu como diácono da Igreja de Roma antes de ser eleito Papa em 440 — cargo que exerceu por vinte e um anos. Governou num tempo de invasões e de crises doutrinais, e sua firmeza lhe valeu o título de \"Magno\", o primeiro Papa assim chamado.",
      "Em 451 enviou ao Concílio de Calcedônia uma carta doutrinal, o chamado Tomo de Leão, que expôs com clareza a fé em Cristo verdadeiro Deus e verdadeiro homem numa só pessoa. Lida diante dos bispos reunidos, foi acolhida com a aclamação \"Pedro falou pela boca de Leão\".",
      "Em 452 saiu ao encontro de Átila, rei dos hunos, que ameaçava marchar sobre Roma, e o convenceu a recuar; três anos depois, diante da chegada dos vândalos, obteve ao menos que a cidade não fosse incendiada nem sua população massacrada.",
      "Deixou numerosos sermões e cartas, base de seu magistério. Morreu em Roma em 461 e foi o primeiro Papa sepultado em São Pedro. Foi declarado doutor da Igreja em 1754. Sua memória litúrgica é celebrada em 10 de novembro."
    ]
  },

  "sao-martinho-tours": {
    titulo: "São Martinho de Tours, bispo",
    resumo: "Soldado romano que dividiu a capa com um pobre, tornou-se monge e bispo de Tours e foi um dos primeiros santos não mártires venerados pela Igreja.",
    texto: [
      "Nasceu por volta de 316 em Sabária, na Panônia (atual Hungria), filho de um oficial romano pagão, e cresceu em Pavia, na Itália. Ainda menino sentiu-se atraído pela fé cristã. Obrigado a seguir a carreira militar do pai, serviu na cavalaria romana na Gália.",
      "Ainda catecúmeno, num inverno rigoroso à porta de Amiens, cortou o próprio manto ao meio para vestir um mendigo seminu; na noite seguinte viu em sonho Cristo coberto com aquela metade da capa. Batizado pouco depois, deixou o exército assim que pôde fazê-lo sem desertar.",
      "Em Poitiers ligou-se ao bispo Santo Hilário e abraçou a vida monástica, fundando em Ligugé um dos mais antigos mosteiros do Ocidente. Aclamado bispo de Tours pelo povo em 371, continuou vivendo como monge, evangelizou o campo e defendeu os pobres e os condenados.",
      "Morreu em Candes em 8 de novembro de 397 e foi sepultado em Tours no dia 11. Seu túmulo tornou-se um dos maiores centros de peregrinação da Europa medieval. Sua memória litúrgica é celebrada em 11 de novembro."
    ]
  },

  "sao-josafa-kuncewicz": {
    titulo: "São Josafá Kuncewicz, bispo e mártir",
    resumo: "Monge e arcebispo do rito bizantino que deu a vida pela união dos cristãos rutenos com Roma, morto por uma multidão em Vitebsk.",
    texto: [
      "Nasceu por volta de 1580 em Volodímir, na Volínia (atual Ucrânia), numa família ortodoxa, e recebeu o nome de João. Ainda jovem foi trabalhar no comércio em Vilna. Ali, em 1604, entrou no mosteiro basiliano da Santíssima Trindade, tomando o nome de Josafá.",
      "Foi ordenado padre em 1609 e destacou-se como pregador e reformador da vida monástica. Vivia-se então o tempo da União de Brest (1596), pela qual parte da Igreja rutena entrara em comunhão com Roma conservando o rito bizantino. Em 1618 tornou-se arcebispo de Polotsk.",
      "Trabalhou com energia pela unidade, o que lhe atraiu forte oposição de quem via na União uma traição à Ortodoxia. Numa visita pastoral a Vitebsk, em 12 de novembro de 1623, uma multidão invadiu a casa episcopal, matou-o a golpes e atirou seu corpo ao rio Dzwina.",
      "Foi beatificado em 1643 e canonizado em 1867 pelo Papa Pio IX — o primeiro santo das Igrejas orientais católicas inscrito no calendário romano. É lembrado como padroeiro da causa da unidade dos cristãos, e sua memória litúrgica é celebrada em 12 de novembro."
    ]
  },

  "santo-estanislau-kostka": {
    titulo: "Santo Estanislau Kostka, religioso",
    resumo: "Jovem nobre polonês que atravessou a Europa a pé para entrar na Companhia de Jesus e morreu noviço, aos dezoito anos, em fama de santidade.",
    texto: [
      "Nasceu em 28 de outubro de 1550, no castelo de Rostków, na Polônia, filho de um senador do reino. Aos catorze anos foi enviado com o irmão mais velho ao colégio dos jesuítas em Viena. Piedoso e reservado, sofria com o ambiente dissipado da casa em que se hospedavam fora do colégio.",
      "Decidido a entrar na Companhia de Jesus e impedido pelo pai, fugiu de Viena disfarçado e a pé, percorrendo centenas de quilômetros até Dilinga e depois Roma, onde São Francisco de Bórgia o admitiu como noviço em 1567.",
      "No noviciado do Colégio Romano chamou a atenção pela alegria, pela obediência pronta e por uma intensa vida de oração. Poucos meses depois adoeceu gravemente.",
      "Morreu em Roma na madrugada de 15 de agosto de 1568, aos dezoito anos. Foi canonizado em 1726 pelo Papa Bento XIII e é venerado como padroeiro dos jovens e dos noviços. Sua memória é celebrada em 13 de novembro."
    ]
  },

  "sao-jose-pignatelli": {
    titulo: "São José Pignatelli, presbítero",
    resumo: "Jesuíta espanhol que manteve viva a Companhia de Jesus durante os anos em que a Ordem foi suprimida, sendo chamado o elo entre a antiga e a nova Companhia.",
    texto: [
      "Nasceu em 27 de dezembro de 1737, em Saragoça (Espanha), em família nobre de origem napolitana. Entrou na Companhia de Jesus aos quinze anos e, ordenado padre, dedicou-se à catequese de crianças e ao cuidado de presos.",
      "Em 1767 o rei Carlos III expulsou os jesuítas da Espanha; ofereceram a Pignatelli a permissão de ficar, desde que deixasse a Ordem, e ele preferiu o exílio na Itália com os confrades. Em 1773 o Papa Clemente XIV, pressionado pelas cortes europeias, suprimiu a própria Companhia de Jesus.",
      "Nos anos seguintes, Pignatelli manteve o espírito e a regra da Ordem entre os jesuítas dispersos e reagrupou-os onde ainda era possível — no ducado de Parma e na Rússia, onde a supressão não fora promulgada. Foi mestre de noviços e provincial, e em 1804 conseguiu restabelecer a Companhia no reino de Nápoles.",
      "Morreu em Roma em 15 de novembro de 1811, três anos antes da restauração universal da Ordem. Foi beatificado em 1933 pelo Papa Pio XI e canonizado em 1954 pelo Papa Pio XII. Sua memória litúrgica é celebrada em 14 de novembro."
    ]
  },

  "santo-alberto-magno": {
    titulo: "Santo Alberto Magno, bispo e doutor da Igreja",
    resumo: "Frade dominicano do século XIII, mestre de Santo Tomás de Aquino e sábio de saber tão vasto que os contemporâneos o chamaram de \"Doutor Universal\".",
    texto: [
      "Nasceu por volta de 1206 em Lauingen, na Baviera, em família nobre. Estudou em Pádua, onde, sob a influência do beato Jordão da Saxônia, entrou para a Ordem dos Pregadores, os dominicanos, por volta de 1223.",
      "Ensinou nas principais escolas da Alemanha e da França. Em Paris teve entre seus alunos o jovem Tomás de Aquino, que levou consigo ao fundar o estudo geral dos dominicanos em Colônia. Foi um dos primeiros a estudar a fundo as obras de Aristóteles e a pô-las a serviço da teologia cristã, e escreveu também sobre ciências naturais, observando plantas, animais e minerais.",
      "Por dois anos (1260–1262) foi bispo de Ratisbona, cargo que aceitou por obediência e deixou para voltar ao ensino. Trabalhou pela paz entre cidades e príncipes e participou do II Concílio de Lyon.",
      "Morreu em Colônia em 1280. Foi canonizado e declarado doutor da Igreja em 1931 pelo Papa Pio XI. É padroeiro dos que se dedicam às ciências naturais, e sua memória litúrgica é celebrada em 15 de novembro."
    ]
  },

  "santa-margarida-escocia": {
    titulo: "Santa Margarida da Escócia",
    resumo: "Princesa de origem inglesa que, tornada rainha da Escócia, uniu a vida de esposa e mãe de oito filhos a uma intensa dedicação aos pobres e à reforma da Igreja.",
    texto: [
      "Nasceu por volta de 1045, no exílio na Hungria, bisneta do rei inglês Edmundo Braço de Ferro. Depois da conquista normanda da Inglaterra, sua família buscou refúgio na Escócia, onde Margarida se casou com o rei Malcolm III.",
      "Como rainha, moderou os costumes rudes da corte e influiu na vida do marido e do reino. Promoveu sínodos que puseram ordem na disciplina eclesiástica escocesa, fundou a abadia de Dunfermline e construiu igrejas e albergues para peregrinos.",
      "Sua caridade era diária e concreta: servia à mesa os pobres, lavava os pés dos doentes e, na Quaresma, alimentava centenas de necessitados no próprio castelo. Rezava longas horas e jejuava com rigor. Teve oito filhos, três dos quais se tornaram reis, e uma filha, Matilde, rainha da Inglaterra.",
      "Morreu no castelo de Edimburgo em 16 de novembro de 1093, poucos dias depois de perder o marido e um filho em batalha. Foi canonizada em 1250 pelo Papa Inocêncio IV e é padroeira da Escócia. Sua memória é celebrada em 16 de novembro."
    ]
  },

  "santa-isabel-hungria": {
    titulo: "Santa Isabel da Hungria, religiosa",
    resumo: "Filha de rei e princesa da Turíngia que, viúva aos vinte anos, despojou-se de tudo, vestiu o hábito franciscano e passou a servir os doentes num hospital que ela mesma fundou.",
    texto: [
      "Nasceu em 1207, filha do rei André II da Hungria. Ainda criança foi prometida a Luís, herdeiro do landgraviato da Turíngia, e criada no castelo de Wartburg, em Eisenach. Casaram-se em 1221 e tiveram três filhos; foi um casamento feliz, marcado já então pela intensa vida de oração e de esmola de Isabel.",
      "Em 1227 Luís morreu de febre a caminho da cruzada. Isabel, viúva aos vinte anos, deixou a corte — expulsa, segundo várias fontes, por parentes do marido — e foi viver na pobreza com os filhos.",
      "Na Sexta-feira Santa de 1228 foi recebida na Ordem Terceira de São Francisco, entre as primeiras terciárias da Alemanha. Com o que restava de seu dote, construiu em Marburgo um hospital dedicado a São Francisco, onde ela própria cuidava dos enfermos mais repugnantes.",
      "Esgotada pelo trabalho e pela penitência, morreu em Marburgo em 17 de novembro de 1231, aos vinte e quatro anos. Foi canonizada em 1235 pelo Papa Gregório IX. É padroeira da Ordem Franciscana Secular, e sua memória litúrgica é celebrada em 17 de novembro."
    ]
  },

  "dedicacao-pedro-paulo": {
    titulo: "Dedicação das Basílicas de São Pedro e São Paulo",
    resumo: "A festa da consagração das duas maiores basílicas de Roma, erguidas sobre os túmulos dos apóstolos Pedro e Paulo.",
    texto: [
      "A celebração recorda a dedicação de dois templos romanos ligados aos apóstolos: a Basílica de São Pedro, no Vaticano, sobre o lugar onde o apóstolo foi crucificado e sepultado, e a Basílica de São Paulo Fora dos Muros, na via Ostiense, sobre o seu túmulo.",
      "As primeiras basílicas foram construídas no século IV, no tempo do imperador Constantino. A atual Basílica de São Pedro, refeita ao longo dos séculos XVI e XVII, foi consagrada pelo Papa Urbano VIII em 18 de novembro de 1626.",
      "A Basílica de São Paulo, destruída por um incêndio em 1823 e reconstruída, teve sua nova dedicação fixada pelo Papa Pio IX no mesmo dia 18 de novembro, unindo as duas memórias numa só.",
      "Ao recordar esses templos, a Igreja celebra a fé dos apóstolos Pedro e Paulo, colunas sobre as quais foi edificada. É memória facultativa, observada em 18 de novembro."
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
