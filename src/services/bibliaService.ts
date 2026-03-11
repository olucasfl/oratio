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