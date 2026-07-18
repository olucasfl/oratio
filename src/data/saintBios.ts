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
