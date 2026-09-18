/*
 Ordem canônica dos livros (Antigo/Novo Testamento), extraída de
 `bibliaAveMaria.json`. Fica num arquivo pequeno e separado — em vez de
 importar `bibliaService`/o JSON de ~5MB só para ordenar por livro — porque
 "Minha Bíblia" e a Coleção agrupam por livro sem precisar do texto bíblico
 (o texto já vem como snapshot em cada mark/item, ver ARCHITECTURE.md §4).

 Fonte da verdade continua sendo o JSON; se a tradução/edição da Bíblia
 mudar de arquivo, regenerar esta lista com os nomes de
 `antigoTestamento[].nome` e `novoTestamento[].nome`, nesta mesma ordem.
*/

export const OT_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué",
  "Juízes", "Rute", "I Samuel", "II Samuel", "I Reis", "II Reis",
  "I Crônicas", "II Crônicas", "Esdras", "Neemias", "Tobias", "Judite",
  "Ester", "Jó", "Salmos", "I Macabeus", "II Macabeus", "Provérbios",
  "Eclesiastes", "Cântico dos Cânticos", "Sabedoria", "Eclesiástico",
  "Isaías", "Jeremias", "Lamentações", "Baruc", "Ezequiel", "Daniel",
  "Oséias", "Joel", "Amós", "Abdias", "Jonas", "Miquéias", "Naum",
  "Habacuc", "Sofonias", "Ageu", "Zacarias", "Malaquias",
] as const

export const NT_BOOKS = [
  "São Mateus", "São Marcos", "São Lucas", "São João", "Atos dos Apóstolos",
  "Romanos", "I Coríntios", "II Coríntios", "Gálatas", "Efésios",
  "Filipenses", "Colossenses", "I Tessalonicenses", "II Tessalonicenses",
  "I Timóteo", "II Timóteo", "Tito", "Filêmon", "Hebreus", "São Tiago",
  "I São Pedro", "II São Pedro", "I São João", "II São João",
  "III São João", "São Judas", "Apocalipse",
] as const

// índice de ordenação: Antigo Testamento antes do Novo, cada um na ordem
// canônica acima. Livro desconhecido (não deveria acontecer — todo mark
// vem de um livro real da Bíblia) vai pro fim, sem quebrar a tela.
const ORDER_INDEX: Record<string, number> = {}
;[...OT_BOOKS, ...NT_BOOKS].forEach((name, i) => { ORDER_INDEX[name] = i })
const OT_COUNT = OT_BOOKS.length

export type Testament = "AT" | "NT"

export function testamentOf(book: string): Testament {
  return (ORDER_INDEX[book] ?? 0) < OT_COUNT ? "AT" : "NT"
}

export function bookOrderIndex(book: string): number {
  return ORDER_INDEX[book] ?? Number.MAX_SAFE_INTEGER
}

export function compareByBookOrder(a: string, b: string): number {
  return bookOrderIndex(a) - bookOrderIndex(b)
}
