import bibleData from "../data/bibliaAveMaria.json"

const bible:any = bibleData

export function getOldTestament(){
 return bible.antigoTestamento
}

export function getNewTestament(){
 return bible.novoTestamento
}

export function getBook(bookName:string){

 const allBooks = [
  ...bible.antigoTestamento,
  ...bible.novoTestamento
 ]

 return allBooks.find((b:any)=>b.nome === bookName)

}

export function getChapter(bookName:string, chapterNumber:number){

 const book = getBook(bookName)

 if(!book) return null

 return book.capitulos.find(
  (c:any)=>c.capitulo === chapterNumber
 )

}

export type VerseResult = {
 book: string
 chapter: number
 verse: number
 text: string
}

function normalize(text:string){
 return text
  .normalize("NFD")
  .replace(/[̀-ͯ]/g,"")
  .toLowerCase()
}

export function searchVerses(query:string, limit = 50): VerseResult[]{

 if(!query || query.length < 3) return []

 const q = normalize(query)
 const results: VerseResult[] = []
 const allBooks = [...bible.antigoTestamento,...bible.novoTestamento]

 for(const book of allBooks){
  for(const cap of book.capitulos){
   for(const v of cap.versiculos){
    if(normalize(v.texto).includes(q)){
     results.push({
      book: book.nome,
      chapter: cap.capitulo,
      verse: v.versiculo,
      text: v.texto
     })
     if(results.length >= limit) return results
    }
   }
  }
 }

 return results

}

/* ==============================
 BUSCA POR TEMA (qualquer palavra-chave do tema)
============================== */

export function searchVersesByKeywords(keywords:string[], limit = 200): VerseResult[]{

 if(!keywords || keywords.length === 0) return []

 const terms = keywords.map(normalize)
 const results: VerseResult[] = []
 const allBooks = [...bible.antigoTestamento,...bible.novoTestamento]

 for(const book of allBooks){
  for(const cap of book.capitulos){
   for(const v of cap.versiculos){
    const texto = normalize(v.texto)
    if(terms.some((t)=>texto.includes(t))){
     results.push({
      book: book.nome,
      chapter: cap.capitulo,
      verse: v.versiculo,
      text: v.texto
     })
     if(results.length >= limit) return results
    }
   }
  }
 }

 return results

}

/* ==============================
 PESQUISAS RECENTES (localStorage)
============================== */

const RECENT_SEARCHES_KEY = "oratio_biblia_recent_searches"
const MAX_RECENT_SEARCHES = 6

export function getRecentSearches(): string[]{
 try{
  const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
  return raw ? JSON.parse(raw) : []
 }catch{
  return []
 }
}

export function addRecentSearch(query:string){

 const q = query.trim()
 if(q.length < 3) return

 const current = getRecentSearches().filter(
  (item)=>item.toLowerCase() !== q.toLowerCase()
 )

 const updated = [q, ...current].slice(0, MAX_RECENT_SEARCHES)

 localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))

}

export function clearRecentSearches(){
 localStorage.removeItem(RECENT_SEARCHES_KEY)
}