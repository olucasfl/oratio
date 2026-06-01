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