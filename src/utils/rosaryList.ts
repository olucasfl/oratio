export type Rosary = {

  name:string
  slug:string

}

export const ROSARIES:Rosary[] = [

  {
    name:"Mistérios Gozosos",
    slug:"gozosos"
  },

  {
    name:"Mistérios Dolorosos",
    slug:"dolorosos"
  },

  {
    name:"Mistérios Gloriosos",
    slug:"gloriosos"
  },

  {
    name:"Mistérios Luminosos",
    slug:"luminosos"
  },

  {
    name:"Terço das 7 Dores de Maria",
    slug:"sete-dores"
  },

  {
    name:"Coroa de Nossa Senhora das Lágrimas",
    slug:"coroa-lagrimas"
  },

  {
    name:"Terço de São Bento",
    slug:"sao-bento"
  },

  {
    name:"Terço da Divina Misericórdia",
    slug:"misericordia"
  },

  {
    name:"Terço do Sagrado Coração de Jesus",
    slug:"sagrado-coracao"
  },

  {
    name:"Terço de São José",
    slug:"sao-jose"
  },

  {
    name:"Terço de São Miguel Arcanjo",
    slug:"sao-miguel"
  },

  {
    name:"Terço do Espírito Santo",
    slug:"espirito-santo"
  },

  {
    name:"Via Sacra",
    slug:"via-sacra"
  },

]

export function getRosaryName(slug:string){

  return (
    ROSARIES.find((r)=> r.slug === slug)
      ?.name || slug
  )

}
