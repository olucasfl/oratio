/*
==========================================================
SANTO / CELEBRAÇÃO DO DIA — ÍNDICE DOS 365 DIAS
==========================================================

Este arquivo é só um ÍNDICE de nomes por data fixa do
calendário (dia/mês), usado como atalho para exibir um
título bonito e uma eventual biografia (campo "bio").

IMPORTANTE — isso NUNCA é a fonte de verdade sobre o que
está sendo celebrado hoje. A fonte de verdade é sempre o
texto que a própria API de liturgia retorna no campo
"liturgia" (o mesmo texto que já sustenta as leituras da
Missa do dia). Esse texto muda de ano para ano: uma
memória cai num domingo e é suprimida, uma solenidade é
transferida, etc. — coisas que uma lista fixa como esta
NUNCA consegue prever sozinha.

Por isso o app sempre:
  1. Olha a data de hoje aqui, pra pegar um título "bonito"
     candidato.
  2. Confere se esse título realmente aparece no texto ao
     vivo da API.
  3. Só usa o título daqui se bater. Se não bater (porque
     foi suprimido/transferido naquele ano específico),
     usa o texto cru da API — nunca inventa, nunca mostra
     algo que não está de fato sendo celebrado.

Festas móveis (Páscoa, Pentecostes, Corpo de Deus,
Trindade, Cristo Rei, Sagrado Coração...) não têm entrada
fixa aqui — são resolvidas só pelo texto ao vivo da API,
já que a data muda todo ano.

O campo "bio" só existe pras Solenidades já escritas por
completo. Nos demais dias, fica undefined de propósito —
o app mostra nome, grau e cor (sempre certos, vindos da
API) sem travar por falta de biografia. Vamos completando
aos poucos.
==========================================================
*/

export type SaintOfDayEntry = {
  dia: number
  mes: number
  nome: string
  match: string[]
  bioId?: string
  /*
  true = Memória Facultativa confirmada (a Igreja permite
  não celebrá-la). Nesses dias, a cor exibida é a da
  estação litúrgica (normalmente verde), não a do santo —
  o nome aparece só como informação extra.

  A API nunca diferencia Obrigatória de Facultativa no
  texto (as duas viram só "Memória"), então isso precisa
  ser conferido e marcado manualmente, uma celebração de
  cada vez. Por enquanto só as confirmadas por pesquisa
  estão marcadas — as demais continuam mostrando a cor do
  santo até serem conferidas.
  */
  opcional?: boolean
}

export const SAINTS_OF_THE_DAY: SaintOfDayEntry[] = [

  // ---------- JANEIRO ----------
  { dia:1, mes:1, nome:"Santa Maria, Mãe de Deus", match:["maria mae de deus"], bioId:"maria-mae-de-deus" },
  { dia:2, mes:1, nome:"Santos Basílio Magno e Gregório Nazianzeno", match:["basilio magno","gregorio nazianzeno"] },
  { dia:3, mes:1, nome:"Santíssimo Nome de Jesus", match:["santissimo nome de jesus"] },
  { dia:4, mes:1, nome:"Santa Ângela de Foligno", match:["angela de foligno"] },
  { dia:5, mes:1, nome:"São João Neumann", match:["joao neumann"] },
  { dia:6, mes:1, nome:"Santa Rafaela Maria do Sagrado Coração de Jesus", match:["rafaela maria"] },
  { dia:7, mes:1, nome:"Beata Lindalva Justo de Oliveira", match:["lindalva"] },
  { dia:8, mes:1, nome:"São Severino", match:["severino"] },
  { dia:9, mes:1, nome:"Santo André Corsini", match:["andre corsini"] },
  { dia:10, mes:1, nome:"Frei Gonçalo de Amarante", match:["goncalo de amarante"] },
  { dia:11, mes:1, nome:"Santo Hígino, Papa", match:["higino"] },
  { dia:12, mes:1, nome:"São Bernardo de Corleone", match:["bernardo de corleone"] },
  { dia:13, mes:1, nome:"Santo Hilário de Poitiers", match:["hilario de poitiers"] },
  { dia:14, mes:1, nome:"Santa Isabel Ana Bayley Seton", match:["isabel ana","elisabete ana"] },
  { dia:15, mes:1, nome:"Santo Amaro, Abade", match:["amaro"] },
  { dia:16, mes:1, nome:"Santo Honorato", match:["honorato"] },
  { dia:17, mes:1, nome:"Santo Antão, Abade", match:["antao"] },
  { dia:18, mes:1, nome:"Santa Margarida da Hungria", match:["margarida da hungria"] },
  { dia:19, mes:1, nome:"São Canuto", match:["canuto"] },
  { dia:20, mes:1, nome:"São Sebastião, mártir", match:["sebastiao"] },
  { dia:21, mes:1, nome:"Santa Inês, virgem e mártir", match:["ines, virgem","santa ines"] },
  { dia:22, mes:1, nome:"São Vicente Pallotti", match:["vicente pallotti"] },
  { dia:23, mes:1, nome:"Santo Ildefonso de Toledo", match:["ildefonso"] },
  { dia:24, mes:1, nome:"São Francisco de Sales", match:["francisco de sales"] },
  { dia:25, mes:1, nome:"Conversão de São Paulo, Apóstolo", match:["conversao de sao paulo"] },
  { dia:26, mes:1, nome:"Santos Timóteo e Tito, bispos", match:["timoteo e tito"] },
  { dia:27, mes:1, nome:"Santa Ângela Merici", match:["angela merici"] },
  { dia:28, mes:1, nome:"São Tomás de Aquino, presbítero e doutor da Igreja", match:["tomas de aquino"] },
  { dia:29, mes:1, nome:"São Sulpício Severo", match:["sulpicio severo"] },
  { dia:30, mes:1, nome:"Santa Jacinta Mariscotti", match:["jacinta mariscotti"] },
  { dia:31, mes:1, nome:"São João Bosco, presbítero", match:["joao bosco"] },

  // ---------- FEVEREIRO ----------
  { dia:1, mes:2, nome:"Beata Ludovica Albertoni", match:["ludovica albertoni"] },
  { dia:2, mes:2, nome:"Apresentação do Senhor", match:["apresentacao do senhor"] },
  { dia:3, mes:2, nome:"São Brás de Sebaste, bispo e mártir", match:["bras de sebaste","sao bras"] },
  { dia:4, mes:2, nome:"São João de Brito, presbítero e mártir", match:["joao de brito"] },
  { dia:5, mes:2, nome:"Santa Águeda, virgem e mártir", match:["agueda"] },
  { dia:6, mes:2, nome:"São Paulo Miki e companheiros, mártires", match:["paulo miki"] },
  { dia:7, mes:2, nome:"Beato Pio IX, Papa", match:["pio ix"] },
  { dia:8, mes:2, nome:"Santa Josefina Bakhita, virgem", match:["josefina bakhita"] },
  { dia:9, mes:2, nome:"Santa Apolônia, virgem e mártir", match:["apolonia"] },
  { dia:10, mes:2, nome:"Santa Escolástica, virgem", match:["escolastica"] },
  { dia:11, mes:2, nome:"Nossa Senhora de Lourdes", match:["nossa senhora de lourdes"] },
  { dia:12, mes:2, nome:"Santa Eulália de Barcelona, virgem e mártir", match:["eulalia de barcelona"] },
  { dia:13, mes:2, nome:"São Martiniano", match:["martiniano"] },
  { dia:14, mes:2, nome:"Santos Cirilo, monge, e Metódio, bispo", match:["cirilo e metodio","cirilo, monge"] },
  { dia:15, mes:2, nome:"Santo Onésimo, discípulo de São Paulo", match:["onesimo"] },
  { dia:16, mes:2, nome:"Santa Juliana, virgem e mártir", match:["juliana, virgem"] },
  { dia:17, mes:2, nome:"Sete Santos Fundadores da Ordem dos Servos de Maria", match:["sete santos fundadores","servitas"] },
  { dia:18, mes:2, nome:"Beato João de Fiesole (Fra Angélico)", match:["fra angelico","joao de fiesole"] },
  { dia:19, mes:2, nome:"São Conrado Confalonieri", match:["conrado confalonieri"] },
  { dia:20, mes:2, nome:"São Francisco e Santa Jacinta Marto, pastorinhos de Fátima", match:["francisco e jacinta marto","pastorinhos de fatima"] },
  { dia:21, mes:2, nome:"São Pedro Damião, bispo e doutor da Igreja", match:["pedro damiao"] },
  { dia:22, mes:2, nome:"Cátedra de São Pedro, Apóstolo", match:["catedra de sao pedro"] },
  { dia:23, mes:2, nome:"São Policarpo, bispo e mártir", match:["policarpo"] },
  { dia:24, mes:2, nome:"São Sérgio, monge eremita", match:["sergio, monge"] },
  { dia:25, mes:2, nome:"Santos Luís Versiglia e Calisto Caravario, mártires", match:["luis versiglia","calisto caravario"] },
  { dia:26, mes:2, nome:"Santo Alexandre do Egito", match:["alexandre do egito"] },
  { dia:27, mes:2, nome:"São Gabriel da Virgem Dolorosa", match:["gabriel de nossa senhora das dores","gabriel da virgem dolorosa"] },
  { dia:28, mes:2, nome:"São Romão, Abade", match:["romao, abade"] },

  // ---------- MARÇO ----------
  { dia:1, mes:3, nome:"São Rosendo", match:["rosendo"] },
  { dia:2, mes:3, nome:"Santa Inês da Boêmia", match:["ines da boemia","ines de praga"] },
  { dia:3, mes:3, nome:"Santos Marino e Astério, mártires", match:["marino e asterio"] },
  { dia:4, mes:3, nome:"São Casimiro", match:["casimiro"] },
  { dia:5, mes:3, nome:"São João José da Cruz", match:["joao jose da cruz"] },
  { dia:6, mes:3, nome:"Santa Rosa de Viterbo", match:["rosa de viterbo"] },
  { dia:7, mes:3, nome:"Santas Perpétua e Felicidade, mártires", match:["perpetua e felicidade"] },
  { dia:8, mes:3, nome:"São João de Deus, religioso", match:["joao de deus"] },
  { dia:9, mes:3, nome:"Santa Francisca Romana, religiosa", match:["francisca romana"] },
  { dia:10, mes:3, nome:"Santos Mártires de Sebaste", match:["martires de sebaste"] },
  { dia:11, mes:3, nome:"São Eulógio, sacerdote e mártir", match:["eulogio"] },
  { dia:12, mes:3, nome:"Santo Inocêncio, promotor da paz", match:["inocencio, promotor"] },
  { dia:13, mes:3, nome:"Santos Rodrigo e Salomão, mártires", match:["rodrigo e salomao"] },
  { dia:14, mes:3, nome:"Santa Matilde", match:["matilde"] },
  { dia:15, mes:3, nome:"São Clemente Maria Hofbauer", match:["clemente maria hofbauer"] },
  { dia:16, mes:3, nome:"Santa Eusébia", match:["eusebia"] },
  { dia:17, mes:3, nome:"São Patrício, bispo", match:["patricio, bispo"] },
  { dia:18, mes:3, nome:"São Cirilo de Jerusalém, bispo e doutor da Igreja", match:["cirilo de jerusalem"] },
  { dia:19, mes:3, nome:"São José, esposo da Virgem Maria", match:["jose, esposo da"], bioId:"sao-jose" },
  { dia:20, mes:3, nome:"Santa Maria Josefina do Coração de Jesus Sancho de Guerra", match:["maria josefina do coracao de jesus"] },
  { dia:21, mes:3, nome:"São Nicolau de Flue", match:["nicolau de flue"] },
  { dia:22, mes:3, nome:"São Zacarias, Papa", match:["zacarias, papa"] },
  { dia:23, mes:3, nome:"São Toríbio de Mogrovejo, bispo", match:["toribio de mogrovejo"] },
  { dia:24, mes:3, nome:"Santo Oscar Romero", match:["oscar romero"] },
  { dia:25, mes:3, nome:"Anunciação do Senhor", match:["anunciacao do senhor"], bioId:"anunciacao" },
  { dia:26, mes:3, nome:"São Bráulio", match:["braulio"] },
  { dia:27, mes:3, nome:"São Ruperto", match:["ruperto"] },
  { dia:28, mes:3, nome:"Santa Gisela da Baviera", match:["gisela da baviera"] },
  { dia:29, mes:3, nome:"São Constantino", match:["constantino"] },
  { dia:30, mes:3, nome:"São João Clímaco", match:["joao climaco"] },
  { dia:31, mes:3, nome:"Santa Balbina de Roma, virgem e mártir", match:["balbina"] },

  // ---------- ABRIL ----------
  { dia:1, mes:4, nome:"São Hugo de Grenoble", match:["hugo de grenoble"] },
  { dia:2, mes:4, nome:"São Francisco de Paula, eremita", match:["francisco de paula"] },
  { dia:3, mes:4, nome:"São Ricardo de Chichester", match:["ricardo de chichester","ricardo"] },
  { dia:4, mes:4, nome:"Santo Isidoro de Sevilha, bispo e doutor da Igreja", match:["isidoro de sevilha","isidoro, bispo"] },
  { dia:5, mes:4, nome:"São Vicente Ferrer, presbítero", match:["vicente ferrer"] },
  { dia:6, mes:4, nome:"São Marcelino", match:["marcelino"] },
  { dia:7, mes:4, nome:"São João Batista de La Salle, presbítero", match:["joao batista de la salle"] },
  { dia:8, mes:4, nome:"Santo Alberto", match:["santo alberto"] },
  { dia:9, mes:4, nome:"São Leopoldo Mandić", match:["leopoldo mandic"] },
  { dia:10, mes:4, nome:"Santa Madalena de Canossa", match:["madalena de canossa"] },
  { dia:11, mes:4, nome:"Santo Estanislau, bispo e mártir", match:["estanislau, bispo"] },
  { dia:12, mes:4, nome:"São José Moscati", match:["jose moscati"] },
  { dia:13, mes:4, nome:"São Martinho I, Papa e mártir", match:["martinho i"] },
  { dia:14, mes:4, nome:"Santa Ludovina", match:["ludovina"] },
  { dia:15, mes:4, nome:"São Crescente", match:["crescente"] },
  { dia:16, mes:4, nome:"Santa Bernadete Soubirous, vidente de Lourdes", match:["bernadete soubirous","maria bernadete"] },
  { dia:17, mes:4, nome:"Santo Aniceto, Papa", match:["aniceto"] },
  { dia:18, mes:4, nome:"Beata Maria da Encarnação", match:["maria da encarnacao"] },
  { dia:19, mes:4, nome:"Santo Expedito, mártir", match:["expedito"], bioId:"santo-expedito" },
  { dia:20, mes:4, nome:"Santa Inês de Montepulciano, virgem", match:["ines de montepulciano"] },
  { dia:21, mes:4, nome:"Santo Anselmo, bispo e doutor da Igreja", match:["anselmo"] },
  { dia:22, mes:4, nome:"São Caio, Papa", match:["caio, papa"] },
  { dia:23, mes:4, nome:"São Jorge, mártir", match:["jorge, martir"] },
  { dia:24, mes:4, nome:"São Fidélis de Sigmaringa, presbítero e mártir", match:["fidelis de sigmaringa"] },
  { dia:25, mes:4, nome:"São Marcos, evangelista", match:["marcos, evangelista"] },
  { dia:26, mes:4, nome:"São Pascásio Radberto", match:["pascasio"] },
  { dia:27, mes:4, nome:"Santa Zita, virgem", match:["zita"] },
  { dia:28, mes:4, nome:"São Luís Maria Grignion de Montfort", match:["luis maria grignion de montfort","luis de montfort"] },
  { dia:29, mes:4, nome:"Santa Catarina de Sena, virgem e doutora da Igreja", match:["catarina de sena"] },
  { dia:30, mes:4, nome:"São Pio V, Papa", match:["pio v"] },

  // ---------- MAIO ----------
  { dia:1, mes:5, nome:"São José Operário", match:["jose operario"] },
  { dia:2, mes:5, nome:"Santo Atanásio, bispo e doutor da Igreja", match:["atanasio"] },
  { dia:3, mes:5, nome:"São Filipe e São Tiago, Apóstolos", match:["filipe e sao tiago","filipe e tiago"] },
  { dia:4, mes:5, nome:"São Peregrino Laziosi", match:["peregrino laziosi","peregrino"] },
  { dia:5, mes:5, nome:"Santo Nuno de Santa Maria (Nuno Álvares Pereira)", match:["nuno de santa maria","nuno alvares"] },
  { dia:6, mes:5, nome:"São Domingos Sávio", match:["domingos savio"] },
  { dia:7, mes:5, nome:"Santa Flávia Domitila", match:["flavia domitila"] },
  { dia:8, mes:5, nome:"São Pedro de Tarantásia", match:["pedro de tarantasia"] },
  { dia:9, mes:5, nome:"Santa Luiza de Marillac", match:["luiza de marillac"] },
  { dia:10, mes:5, nome:"São João de Ávila, presbítero e doutor da Igreja", match:["joao de avila"] },
  { dia:11, mes:5, nome:"Santo Inácio de Láconi", match:["inacio de laconi"] },
  { dia:12, mes:5, nome:"Santos Nereu, Aquiles e Pancrácio, mártires", match:["nereu, aquiles"] },
  { dia:13, mes:5, nome:"Nossa Senhora de Fátima", match:["nossa senhora de fatima"], bioId:"nossa-senhora-de-fatima" },
  { dia:14, mes:5, nome:"São Matias, Apóstolo", match:["matias, apostolo"] },
  { dia:15, mes:5, nome:"Santo Isidoro Lavrador", match:["isidoro lavrador"] },
  { dia:16, mes:5, nome:"São Simão Stock", match:["simao stock"] },
  { dia:17, mes:5, nome:"São Pascoal Bailão", match:["pascoal bailao"] },
  { dia:18, mes:5, nome:"São João I, Papa e mártir", match:["joao i, papa"] },
  { dia:19, mes:5, nome:"Santo Ivo, padroeiro dos advogados", match:["santo ivo"] },
  { dia:20, mes:5, nome:"São Bernardino de Sena, presbítero", match:["bernardino de sena"] },
  { dia:21, mes:5, nome:"São Cristóvão de Magalhães e companheiros mártires", match:["cristovao de magalhaes"] },
  { dia:22, mes:5, nome:"Santa Rita de Cássia, viúva e religiosa", match:["rita de cassia"] },
  { dia:23, mes:5, nome:"São João Batista de Rossi", match:["joao batista de rossi"] },
  { dia:24, mes:5, nome:"Nossa Senhora Auxiliadora", match:["nossa senhora auxiliadora"] },
  { dia:25, mes:5, nome:"São Beda, o Venerável, doutor da Igreja", match:["beda venerav","beda, o veneravel"] },
  { dia:26, mes:5, nome:"São Filipe Néri, presbítero", match:["filipe neri"] },
  { dia:27, mes:5, nome:"Santo Agostinho de Cantuária, bispo", match:["agostinho de cantuaria"] },
  { dia:28, mes:5, nome:"São Germano, bispo de Paris", match:["germano, bispo de paris"] },
  { dia:29, mes:5, nome:"São Paulo VI, Papa", match:["paulo vi"] },
  { dia:30, mes:5, nome:"Santa Joana d'Arc, virgem", match:["joana d arc","joana darc"] },
  { dia:31, mes:5, nome:"Visitação de Nossa Senhora", match:["visitacao de nossa senhora","visitacao da bem"] },

  // ---------- JUNHO ----------
  { dia:1, mes:6, nome:"São Justino, mártir", match:["justino, martir"] },
  { dia:2, mes:6, nome:"Santos Marcelino e Pedro, mártires", match:["marcelino e pedro"] },
  { dia:3, mes:6, nome:"São Carlos Lwanga e companheiros, mártires", match:["carlos lwanga"] },
  { dia:4, mes:6, nome:"São Francisco Caracciolo", match:["francisco caracciolo"] },
  { dia:5, mes:6, nome:"São Bonifácio, bispo e mártir", match:["bonifacio, bispo"] },
  { dia:6, mes:6, nome:"São Marcelino Champagnat, presbítero", match:["marcelino champagnat"] },
  { dia:7, mes:6, nome:"Santo Antônio Maria Gianelli", match:["antonio maria gianelli"] },
  { dia:8, mes:6, nome:"Santo Efrém, diácono e doutor da Igreja", match:["efrem, diacono"] },
  { dia:9, mes:6, nome:"São José de Anchieta, sacerdote", match:["jose de anchieta"] },
  { dia:10, mes:6, nome:"Santa Olívia de Palermo, virgem e mártir", match:["olivia de palermo"] },
  { dia:11, mes:6, nome:"São Barnabé, Apóstolo", match:["barnabe, apostolo"] },
  { dia:12, mes:6, nome:"Santo Onofre", match:["onofre"] },
  { dia:13, mes:6, nome:"Santo Antônio de Lisboa (Pádua), presbítero e doutor da Igreja", match:["antonio de lisboa","antonio de padua"] },
  { dia:14, mes:6, nome:"Santa Clotilde", match:["clotilde"] },
  { dia:15, mes:6, nome:"Beata Albertina Berkenbrock, virgem e mártir", match:["albertina berkenbrock"] },
  { dia:16, mes:6, nome:"São Ciro e Santa Julita, mártires", match:["ciro e santa julita"] },
  { dia:17, mes:6, nome:"São Ranério de Pisa", match:["ranierio de pisa","raniero de pisa"] },
  { dia:18, mes:6, nome:"São Gregório de Barbarigo", match:["gregorio de barbarigo"] },
  { dia:19, mes:6, nome:"São Romualdo, abade", match:["romualdo, abade"] },
  { dia:20, mes:6, nome:"São Silvério, Papa e mártir", match:["silverio, papa"] },
  { dia:21, mes:6, nome:"São Luís Gonzaga, religioso", match:["luis gonzaga"] },
  { dia:22, mes:6, nome:"São Tomás More e São João Fisher, mártires", match:["tomas more","joao fisher"] },
  { dia:23, mes:6, nome:"São José Cafasso, presbítero", match:["jose cafasso"] },
  { dia:24, mes:6, nome:"Natividade de São João Batista", match:["natividade de sao joao batista"], bioId:"nascimento-joao-batista" },
  { dia:25, mes:6, nome:"São Guilherme de Vercelli", match:["guilherme de vercelli"] },
  { dia:26, mes:6, nome:"São Josemaria Escrivá, sacerdote", match:["josemaria escriva"] },
  { dia:27, mes:6, nome:"Nossa Senhora do Perpétuo Socorro", match:["nossa senhora do perpetuo socorro"] },
  { dia:28, mes:6, nome:"Santo Irineu, bispo e mártir", match:["irineu, bispo"] },
  { dia:29, mes:6, nome:"São Pedro e São Paulo, Apóstolos", match:["pedro e sao paulo","sao pedro e paulo"], bioId:"pedro-e-paulo" },
  { dia:30, mes:6, nome:"Protomártires da Santa Igreja de Roma", match:["protomartires da"] },

  // ---------- JULHO ----------
  { dia:1, mes:7, nome:"Preciosíssimo Sangue de Jesus", match:["preciosissimo sangue de jesus"] },
  { dia:2, mes:7, nome:"São Bernardino Realino", match:["bernardino realino"] },
  { dia:3, mes:7, nome:"São Tomé, Apóstolo", match:["tome, apostolo"] },
  { dia:4, mes:7, nome:"Santa Isabel, Rainha de Portugal", match:["isabel, rainha de portugal"] },
  { dia:5, mes:7, nome:"Santo Antônio Maria Zaccaria, presbítero", match:["antonio maria zaccaria"] },
  { dia:6, mes:7, nome:"Santa Maria Goretti, virgem e mártir", match:["maria goretti"] },
  { dia:7, mes:7, nome:"Beato Bento XI, Papa", match:["bento xi"] },
  { dia:8, mes:7, nome:"Santos Áquila e Priscila, discípulos de São Paulo", match:["aquila e priscila"] },
  { dia:9, mes:7, nome:"Santa Paulina do Coração Agonizante de Jesus", match:["paulina do coracao agonizante","santa paulina"], bioId:"santa-paulina" },
  { dia:10, mes:7, nome:"Santo Olavo, Rei da Noruega", match:["olavo, rei"] },
  { dia:11, mes:7, nome:"São Bento, Abade", match:["bento, abade"], bioId:"sao-bento" },
  { dia:12, mes:7, nome:"São João Gualberto, abade", match:["joao gualberto"] },
  { dia:13, mes:7, nome:"Santa Teresa de Jesus dos Andes", match:["teresa de jesus dos andes"] },
  { dia:14, mes:7, nome:"São Camilo de Lellis, presbítero", match:["camilo de lellis"] },
  { dia:15, mes:7, nome:"São Boaventura, bispo e doutor da Igreja", match:["boaventura"] },
  { dia:16, mes:7, nome:"Nossa Senhora do Carmo", match:["nossa senhora do carmo","monte carmelo","carmelo"] },
  { dia:17, mes:7, nome:"Beato Inácio de Azevedo e companheiros, mártires", match:["inacio de azevedo"], opcional:true, bioId:"beato-inacio-azevedo" },
  { dia:18, mes:7, nome:"São Francisco Solano, frade e missionário", match:["francisco solano"], bioId:"sao-francisco-solano" },
  { dia:19, mes:7, nome:"Santa Justa e Santa Rufina, mártires", match:["justa e rufina"], bioId:"santas-justa-rufina" },
  { dia:20, mes:7, nome:"Santa Margarida de Antioquia, virgem e mártir", match:["margarida de antioquia"], bioId:"santa-margarida-antioquia" },
  { dia:21, mes:7, nome:"São Lourenço de Brindisi, presbítero e doutor da Igreja", match:["lourenco de brindisi"], bioId:"sao-lourenco-brindisi" },
  { dia:22, mes:7, nome:"Santa Maria Madalena, discípula do Senhor", match:["maria madalena, discipula"], bioId:"santa-maria-madalena" },
  { dia:23, mes:7, nome:"Santa Brígida da Suécia, religiosa", match:["brigida da suecia","santa brigida"], bioId:"santa-brigida-suecia" },
  { dia:24, mes:7, nome:"Santa Cristina, virgem e mártir", match:["cristina, virgem"], bioId:"santa-cristina-bolsena" },
  { dia:25, mes:7, nome:"São Tiago Maior, Apóstolo", match:["tiago maior"], bioId:"sao-tiago-maior" },
  { dia:26, mes:7, nome:"São Joaquim e Santa Ana, pais de Nossa Senhora", match:["joaquim e santa ana","joaquim e ana"], bioId:"sao-joaquim-santa-ana" },
  { dia:27, mes:7, nome:"São Celestino I, Papa", match:["celestino i","celestino, papa"], bioId:"sao-celestino-i" },
  { dia:28, mes:7, nome:"São Pantaleão, mártir", match:["pantaleao"], bioId:"sao-pantaleao" },
  { dia:29, mes:7, nome:"Santa Marta, Santa Maria e São Lázaro de Betânia", match:["marta, maria e lazaro","santa marta"], bioId:"santos-marta-maria-lazaro" },
  { dia:30, mes:7, nome:"São Pedro Crisólogo, bispo e doutor da Igreja", match:["pedro crisologo"], bioId:"sao-pedro-crisologo" },
  { dia:31, mes:7, nome:"Santo Inácio de Loyola, presbítero e fundador da Companhia de Jesus", match:["inacio de loyola"], bioId:"santo-inacio-loyola" },

  // ---------- AGOSTO ----------
  { dia:1, mes:8, nome:"Santo Afonso Maria de Ligório, bispo e doutor da Igreja", match:["afonso maria de ligorio","afonso de ligorio"], bioId:"santo-afonso-ligorio" },
  { dia:2, mes:8, nome:"São Pedro Julião Eymard, presbítero", match:["pedro juliao eymard"], bioId:"sao-pedro-juliao-eymard" },
  { dia:3, mes:8, nome:"Santa Lídia, discípula de São Paulo", match:["lidia, discipula"], bioId:"santa-lidia" },
  { dia:4, mes:8, nome:"São João Maria Vianney, presbítero (Cura d'Ars)", match:["joao maria vianney","cura d ars"], bioId:"sao-joao-maria-vianney" },
  { dia:5, mes:8, nome:"Dedicação da Basílica de Santa Maria Maior", match:["dedicacao da basilica de santa maria maior"], bioId:"dedicacao-santa-maria-maior" },
  { dia:6, mes:8, nome:"Transfiguração do Senhor", match:["transfiguracao do senhor"], bioId:"transfiguracao" },
  { dia:7, mes:8, nome:"São Sisto II, Papa, e companheiros, mártires", match:["sisto ii"], bioId:"sao-sisto-ii" },
  { dia:8, mes:8, nome:"São Domingos de Gusmão, presbítero", match:["domingos de gusmao"], bioId:"sao-domingos-gusmao" },
  { dia:9, mes:8, nome:"Santa Teresa Benedita da Cruz (Edith Stein), virgem e mártir", match:["teresa benedita da cruz","edith stein"], bioId:"santa-teresa-benedita-cruz" },
  { dia:10, mes:8, nome:"São Lourenço, diácono e mártir", match:["lourenco, diacono"], bioId:"sao-lourenco-diacono" },
  { dia:11, mes:8, nome:"Santa Clara de Assis, virgem", match:["clara de assis","santa clara"], bioId:"santa-clara-assis" },
  { dia:12, mes:8, nome:"Santa Joana Francisca de Chantal", match:["joana francisca de chantal"], bioId:"santa-joana-francisca-chantal" },
  { dia:13, mes:8, nome:"Santa Dulce dos Pobres", match:["dulce dos pobres","dulce lopes pontes","santa dulce"], bioId:"santa-dulce" },
  { dia:14, mes:8, nome:"São Maximiliano Maria Kolbe, presbítero e mártir", match:["maximiliano maria kolbe","maximiliano kolbe"], bioId:"sao-maximiliano-kolbe" },
  { dia:15, mes:8, nome:"Assunção da Virgem Maria", match:["assuncao"], bioId:"assuncao" },
  { dia:16, mes:8, nome:"Santo Estêvão, Rei da Hungria", match:["estevao, rei da hungria"], bioId:"santo-estevao-hungria" },
  { dia:17, mes:8, nome:"São Jacinto", match:["sao jacinto"], bioId:"sao-jacinto-polonia" },
  { dia:18, mes:8, nome:"Santa Helena, imperatriz", match:["helena, imperatriz"], bioId:"santa-helena-imperatriz" },
  { dia:19, mes:8, nome:"São João Eudes, presbítero", match:["joao eudes"], bioId:"sao-joao-eudes" },
  { dia:20, mes:8, nome:"São Bernardo de Claraval, abade e doutor da Igreja", match:["bernardo de claraval","bernardo claraval","bernardo, abade"], bioId:"sao-bernardo-claraval" },
  { dia:21, mes:8, nome:"São Pio X, Papa", match:["pio x"], bioId:"sao-pio-x" },
  { dia:22, mes:8, nome:"Santa Maria Rainha", match:["maria rainha","nossa senhora rainha"], bioId:"santa-maria-rainha" },
  { dia:23, mes:8, nome:"Santa Rosa de Lima, virgem, padroeira da América Latina", match:["rosa de lima"], bioId:"santa-rosa-lima" },
  { dia:24, mes:8, nome:"São Bartolomeu, Apóstolo", match:["bartolomeu, apostolo"], bioId:"sao-bartolomeu-apostolo" },
  { dia:25, mes:8, nome:"São Luís, Rei da França", match:["luis, rei da franca"], bioId:"sao-luis-rei-franca" },
  { dia:26, mes:8, nome:"São Zeferino, Papa e mártir", match:["zeferino, papa"], bioId:"sao-zeferino-papa" },
  { dia:27, mes:8, nome:"Santa Mônica", match:["monica, mae de santo agostinho","santa monica"], bioId:"santa-monica" },
  { dia:28, mes:8, nome:"Santo Agostinho, bispo e doutor da Igreja", match:["agostinho, bispo"], bioId:"santo-agostinho-hipona" },
  { dia:29, mes:8, nome:"Martírio de São João Batista", match:["martirio de sao joao batista"], bioId:"martirio-joao-batista" },
  { dia:30, mes:8, nome:"Santos Félix e Adauto, mártires", match:["felix e adauto"], bioId:"santos-felix-adauto" },
  { dia:31, mes:8, nome:"São Raimundo Nonato", match:["raimundo nonato"], bioId:"sao-raimundo-nonato" },

  // ---------- SETEMBRO ----------
  { dia:1, mes:9, nome:"Santa Beatriz da Silva, virgem", match:["beatriz da silva"], bioId:"santa-beatriz-silva" },
  { dia:2, mes:9, nome:"Santa Doroteia, virgem e mártir de Cesareia", match:["doroteia, virgem e martir de cesareia"], bioId:"santa-doroteia-cesareia" },
  { dia:3, mes:9, nome:"São Gregório Magno, Papa e doutor da Igreja", match:["gregorio magno"], bioId:"sao-gregorio-magno" },
  { dia:4, mes:9, nome:"Santa Rosália", match:["rosalia"], bioId:"santa-rosalia" },
  { dia:5, mes:9, nome:"Santa Teresa de Calcutá", match:["teresa de calcuta"], bioId:"santa-teresa-calcuta" },
  { dia:6, mes:9, nome:"São Liberato de Loro", match:["liberato de loro"], bioId:"sao-liberato-loro" },
  { dia:7, mes:9, nome:"Santa Regina, virgem e mártir", match:["regina, virgem"], bioId:"santa-regina" },
  { dia:8, mes:9, nome:"Natividade da Virgem Maria", match:["natividade de maria","natividade da virgem maria","natividade da"], bioId:"natividade-virgem-maria" },
  { dia:9, mes:9, nome:"São Pedro Claver, presbítero", match:["pedro claver"], bioId:"sao-pedro-claver" },
  { dia:10, mes:9, nome:"São Nicolau de Tolentino", match:["nicolau de tolentino"], bioId:"sao-nicolau-tolentino" },
  { dia:11, mes:9, nome:"São João Gabriel Perboyre", match:["joao gabriel perboyre"], bioId:"sao-joao-gabriel-perboyre" },
  { dia:12, mes:9, nome:"Santíssimo Nome de Maria", match:["santissimo nome de maria"], bioId:"santissimo-nome-maria" },
  { dia:13, mes:9, nome:"São João Crisóstomo, bispo e doutor da Igreja", match:["joao crisostomo"], bioId:"sao-joao-crisostomo" },
  { dia:14, mes:9, nome:"Exaltação da Santa Cruz", match:["exaltacao da santa cruz"], bioId:"exaltacao-santa-cruz" },
  { dia:15, mes:9, nome:"Nossa Senhora das Dores", match:["nossa senhora das dores","das dores"], bioId:"nossa-senhora-das-dores" },
  { dia:16, mes:9, nome:"São Cornélio, Papa, e São Cipriano, bispo, mártires", match:["cornelio, papa","cipriano, bispo"], bioId:"sao-cornelio-cipriano" },
  { dia:17, mes:9, nome:"São Roberto Belarmino, bispo e doutor da Igreja", match:["roberto belarmino"], bioId:"sao-roberto-belarmino" },
  { dia:18, mes:9, nome:"São José de Cupertino", match:["jose de cupertino"], bioId:"sao-jose-cupertino" },
  { dia:19, mes:9, nome:"São Januário, bispo e mártir", match:["januario, bispo"], bioId:"sao-januario" },
  { dia:20, mes:9, nome:"Santo André Kim Taegon e companheiros, mártires", match:["andre kim taegon","andre kim tae gon","andre kim"], bioId:"santo-andre-kim-taegon" },
  { dia:21, mes:9, nome:"São Mateus, Apóstolo e Evangelista", match:["mateus, apostolo e evangelista"], bioId:"sao-mateus-apostolo" },
  { dia:22, mes:9, nome:"São Maurício e companheiros, mártires", match:["mauricio e companheiros"], bioId:"sao-mauricio-companheiros" },
  { dia:23, mes:9, nome:"São Pio de Pietrelcina (Padre Pio)", match:["pio de pietrelcina","padre pio"], bioId:"sao-pio-pietrelcina" },
  { dia:24, mes:9, nome:"Nossa Senhora das Mercês", match:["nossa senhora das merces"], bioId:"nossa-senhora-das-merces" },
  { dia:25, mes:9, nome:"São Cléofas", match:["cleofas"], bioId:"sao-cleofas" },
  { dia:26, mes:9, nome:"Santos Cosme e Damião, mártires", match:["cosme e damiao"], bioId:"santos-cosme-damiao" },
  { dia:27, mes:9, nome:"São Vicente de Paulo, presbítero", match:["vicente de paulo"], bioId:"sao-vicente-paulo" },
  { dia:28, mes:9, nome:"São Venceslau, mártir", match:["venceslau"], bioId:"sao-venceslau" },
  { dia:29, mes:9, nome:"Santos Miguel, Gabriel e Rafael, Arcanjos", match:["miguel, gabriel e rafael","arcanjos"], bioId:"santos-arcanjos" },
  { dia:30, mes:9, nome:"São Jerônimo, presbítero e doutor da Igreja", match:["jeronimo, presbitero"], bioId:"sao-jeronimo" },

  // ---------- OUTUBRO ----------
  { dia:1, mes:10, nome:"Santa Teresinha do Menino Jesus, virgem e doutora da Igreja", match:["teresinha do menino jesus","teresa do menino jesus"], bioId:"santa-teresinha" },
  { dia:2, mes:10, nome:"Santos Anjos da Guarda", match:["santos anjos da guarda"], bioId:"santos-anjos-guarda" },
  { dia:3, mes:10, nome:"Protomártires do Brasil", match:["protomartires do brasil"], bioId:"protomartires-brasil" },
  { dia:4, mes:10, nome:"São Francisco de Assis", match:["francisco de assis"], bioId:"sao-francisco-assis" },
  { dia:5, mes:10, nome:"Santa Faustina Kowalska, apóstola da Divina Misericórdia", match:["faustina kowalska"], bioId:"santa-faustina" },
  { dia:6, mes:10, nome:"São Bruno, presbítero", match:["bruno, presbitero"], bioId:"sao-bruno" },
  { dia:7, mes:10, nome:"Nossa Senhora do Rosário", match:["nossa senhora do rosario","do rosario"], bioId:"nossa-senhora-rosario" },
  { dia:8, mes:10, nome:"Santa Pelágia, virgem e mártir", match:["pelagia, virgem"], bioId:"santa-pelagia" },
  { dia:9, mes:10, nome:"São João Leonardo, presbítero", match:["joao leonardo"], bioId:"sao-joao-leonardo" },
  { dia:10, mes:10, nome:"São Daniel Comboni, bispo", match:["daniel comboni"], bioId:"sao-daniel-comboni" },
  { dia:11, mes:10, nome:"São João XXIII, Papa", match:["joao xxiii"], bioId:"sao-joao-xxiii" },
  { dia:12, mes:10, nome:"Nossa Senhora Aparecida, Padroeira do Brasil", match:["aparecida"], bioId:"nossa-senhora-aparecida" },
  { dia:13, mes:10, nome:"Beata Alexandrina Maria da Costa, virgem", match:["alexandrina maria da costa"], bioId:"beata-alexandrina-costa" },
  { dia:14, mes:10, nome:"São Calisto I, Papa e mártir", match:["calisto i"], bioId:"sao-calisto-i" },
  { dia:15, mes:10, nome:"Santa Teresa de Jesus (Teresa d'Ávila), virgem e doutora da Igreja", match:["teresa de jesus","teresa d avila","teresa d'avila"], bioId:"santa-teresa-avila" },
  { dia:16, mes:10, nome:"Santa Margarida Maria Alacoque, virgem", match:["margarida maria alacoque"], bioId:"santa-margarida-alacoque" },
  { dia:17, mes:10, nome:"Santo Inácio de Antioquia, bispo e mártir", match:["inacio de antioquia"], bioId:"santo-inacio-antioquia" },
  { dia:18, mes:10, nome:"São Lucas, Evangelista", match:["lucas, evangelista"], bioId:"sao-lucas" },
  { dia:19, mes:10, nome:"São Paulo da Cruz, presbítero", match:["paulo da cruz"], bioId:"sao-paulo-cruz" },
  { dia:20, mes:10, nome:"Santa Maria Bertila Boscardin, virgem", match:["maria bertila boscardin","bertila boscardin"], bioId:"santa-maria-bertila" },
  { dia:21, mes:10, nome:"Santa Úrsula e companheiras, mártires", match:["ursula e companheiras","santa ursula"], bioId:"santa-ursula" },
  { dia:22, mes:10, nome:"São João Paulo II, Papa", match:["joao paulo ii"], bioId:"sao-joao-paulo-ii" },
  { dia:23, mes:10, nome:"São João de Capistrano, presbítero", match:["joao de capistrano"], bioId:"sao-joao-capistrano" },
  { dia:24, mes:10, nome:"Santo Antônio Maria Claret, bispo", match:["antonio maria claret"], bioId:"santo-antonio-claret" },
  { dia:25, mes:10, nome:"Santo Antônio de Sant'Ana Galvão (Frei Galvão), presbítero", match:["frei galvao","antonio de sant ana galvao"], bioId:"santo-antonio-galvao" },
  { dia:26, mes:10, nome:"Santo Evaristo, Papa", match:["evaristo"], bioId:"santo-evaristo" },
  { dia:27, mes:10, nome:"Beato Gonçalo de Lagos, presbítero", match:["goncalo de lagos"], bioId:"beato-goncalo-lagos" },
  { dia:28, mes:10, nome:"São Simão e São Judas Tadeu, Apóstolos", match:["simao e sao judas tadeu","judas tadeu, apostolo"], bioId:"sao-judas-tadeu" },
  { dia:29, mes:10, nome:"São Narciso de Jerusalém, bispo", match:["narciso"], bioId:"sao-narciso-jerusalem" },
  { dia:30, mes:10, nome:"São Germano de Cápua, bispo", match:["germano, bispo","germano de capua"], bioId:"sao-germano-capua" },
  { dia:31, mes:10, nome:"Santo Afonso Rodrigues, religioso", match:["afonso rodrigues"], bioId:"santo-afonso-rodrigues" },

  // ---------- NOVEMBRO ----------
  { dia:1, mes:11, nome:"Todos os Santos", match:["todos os santos"], bioId:"todos-os-santos" },
  { dia:2, mes:11, nome:"Comemoração de Todos os Fiéis Defuntos", match:["todos os fieis defuntos","fieis defuntos"], bioId:"fieis-defuntos" },
  { dia:3, mes:11, nome:"São Martinho de Porres (Martinho de Lima), religioso", match:["martinho de porres","martinho de lima"], bioId:"sao-martinho-porres", opcional:true },
  { dia:4, mes:11, nome:"São Carlos Borromeu, bispo", match:["carlos borromeu"], bioId:"sao-carlos-borromeu" },
  { dia:5, mes:11, nome:"São Zacarias e Santa Isabel, pais de São João Batista", match:["zacarias e santa isabel"], bioId:"zacarias-isabel" },
  { dia:6, mes:11, nome:"São Leonardo de Noblac, eremita", match:["leonardo de noblac"], bioId:"sao-leonardo-noblac" },
  { dia:7, mes:11, nome:"São Wilibrordo, bispo", match:["wilibrordo","vilibrordo"], bioId:"sao-wilibrordo" },
  { dia:8, mes:11, nome:"São Deodato I, Papa", match:["deodato"], bioId:"sao-deodato" },
  { dia:9, mes:11, nome:"Dedicação da Basílica de Latrão", match:["dedicacao da basilica de sao joao de latrao","basilica de latrao","basilica do latrao","latrao"], bioId:"dedicacao-latrao" },
  { dia:10, mes:11, nome:"São Leão Magno, Papa e doutor da Igreja", match:["leao magno"], bioId:"sao-leao-magno" },
  { dia:11, mes:11, nome:"São Martinho de Tours, bispo", match:["martinho, bispo","martinho de tours"], bioId:"sao-martinho-tours" },
  { dia:12, mes:11, nome:"São Josafá Kuncewicz, bispo e mártir", match:["josafa","kuncewicz"], bioId:"sao-josafa-kuncewicz" },
  { dia:13, mes:11, nome:"Santo Estanislau Kostka, religioso", match:["estanislau kostka"], bioId:"santo-estanislau-kostka" },
  { dia:14, mes:11, nome:"São José Pignatelli, presbítero", match:["jose pignatelli"], bioId:"sao-jose-pignatelli" },
  { dia:15, mes:11, nome:"Santo Alberto Magno, bispo e doutor da Igreja", match:["alberto magno"], bioId:"santo-alberto-magno", opcional:true },
  { dia:16, mes:11, nome:"Santa Margarida da Escócia", match:["margarida da escocia"], bioId:"santa-margarida-escocia", opcional:true },
  { dia:17, mes:11, nome:"Santa Isabel da Hungria, religiosa", match:["isabel da hungria"], bioId:"santa-isabel-hungria" },
  { dia:18, mes:11, nome:"Dedicação das Basílicas de São Pedro e São Paulo", match:["dedicacao das basilicas de sao pedro e sao paulo"], bioId:"dedicacao-pedro-paulo", opcional:true },
  { dia:19, mes:11, nome:"São Roque González e companheiros, mártires", match:["roque gonzalez"] },
  { dia:20, mes:11, nome:"São Félix de Valois", match:["felix de valois"] },
  { dia:21, mes:11, nome:"Apresentação da Virgem Maria", match:["apresentacao da virgem maria","apresentacao de nossa senhora ao templo"] },
  { dia:22, mes:11, nome:"Santa Cecília, virgem e mártir, padroeira dos músicos", match:["cecilia, virgem"] },
  { dia:23, mes:11, nome:"São Clemente I, Papa e mártir", match:["clemente i"] },
  { dia:24, mes:11, nome:"Santo André Dung-Lac e companheiros, mártires", match:["andre dung lac"] },
  { dia:25, mes:11, nome:"Santa Catarina de Alexandria, virgem e mártir", match:["catarina de alexandria"] },
  { dia:26, mes:11, nome:"São Leonardo de Porto Maurício", match:["leonardo de porto mauricio"] },
  { dia:27, mes:11, nome:"Nossa Senhora das Graças (Medalha Milagrosa)", match:["nossa senhora das gracas","medalha milagrosa"] },
  { dia:28, mes:11, nome:"Santa Catarina Labouré, vidente de Nossa Senhora das Graças", match:["catarina laboure"] },
  { dia:29, mes:11, nome:"São Saturnino, mártir", match:["saturnino, martir"] },
  { dia:30, mes:11, nome:"Santo André, Apóstolo", match:["santo andre, apostolo"] },

  // ---------- DEZEMBRO ----------
  { dia:1, mes:12, nome:"Santo Elói, bispo", match:["santo eloi","eligio"] },
  { dia:2, mes:12, nome:"São Silvério, Papa", match:["silverio, papa"] },
  { dia:3, mes:12, nome:"São Francisco Xavier, presbítero", match:["francisco xavier"] },
  { dia:4, mes:12, nome:"São João Damasceno, presbítero e doutor da Igreja", match:["joao damasceno"] },
  { dia:5, mes:12, nome:"São Sabas, abade", match:["sabas, abade"] },
  { dia:6, mes:12, nome:"São Nicolau de Mira, bispo", match:["nicolau de mira"] },
  { dia:7, mes:12, nome:"Santo Ambrósio, bispo e doutor da Igreja", match:["ambrosio, bispo"] },
  { dia:8, mes:12, nome:"Imaculada Conceição da Virgem Maria", match:["imaculada conceicao"], bioId:"imaculada-conceicao" },
  { dia:9, mes:12, nome:"São Juan Diego", match:["juan diego"] },
  { dia:10, mes:12, nome:"São Melquíades, Papa", match:["melquiades"] },
  { dia:11, mes:12, nome:"São Dâmaso I, Papa", match:["damaso i"] },
  { dia:12, mes:12, nome:"Nossa Senhora de Guadalupe", match:["nossa senhora de guadalupe"] },
  { dia:13, mes:12, nome:"Santa Luzia, virgem e mártir", match:["luzia, virgem"] },
  { dia:14, mes:12, nome:"São João da Cruz, presbítero e doutor da Igreja", match:["joao da cruz"] },
  { dia:15, mes:12, nome:"Beata Maria Vitória de Fornari Strata", match:["maria vitoria de fornari"] },
  { dia:16, mes:12, nome:"Santa Adelaide", match:["adelaide"] },
  { dia:17, mes:12, nome:"Santa Olímpia", match:["olimpia"] },
  { dia:18, mes:12, nome:"Nossa Senhora do Ó (Expectativa do Parto)", match:["nossa senhora do o","expectativa do parto"] },
  { dia:19, mes:12, nome:"Beato Urbano V, Papa", match:["urbano v"] },
  { dia:20, mes:12, nome:"São Domingos de Silos", match:["domingos de silos"] },
  { dia:21, mes:12, nome:"São Pedro Canísio, presbítero e doutor da Igreja", match:["pedro canisio"] },
  { dia:22, mes:12, nome:"Santa Francisca Xavier Cabrini", match:["francisca xavier cabrini"] },
  { dia:23, mes:12, nome:"São João Câncio, presbítero", match:["joao cancio"] },
  { dia:24, mes:12, nome:"São Charbel, presbítero", match:["charbel"] },
  { dia:25, mes:12, nome:"Natal do Senhor", match:["natal de nosso senhor","natal do senhor"], bioId:"natal" },
  { dia:26, mes:12, nome:"Santo Estêvão, primeiro mártir", match:["estevao, primeiro martir","santo estevao"] },
  { dia:27, mes:12, nome:"São João, Apóstolo e Evangelista", match:["joao, apostolo e evangelista"] },
  { dia:28, mes:12, nome:"Santos Inocentes, mártires", match:["santos inocentes"] },
  { dia:29, mes:12, nome:"São Tomás Becket, bispo e mártir", match:["tomas becket"] },
  { dia:30, mes:12, nome:"Sexto Dia da Oitava do Natal", match:["oitava do natal"] },
  { dia:31, mes:12, nome:"São Silvestre I, Papa", match:["silvestre i"] },

]

export function findSaintOfDay(dia:number, mes:number){

  return SAINTS_OF_THE_DAY.find((s)=>
    s.dia === dia && s.mes === mes
  ) || null

}
