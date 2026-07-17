import type { LiturgyData } from "../hooks/useLiturgy"

import {
  parseCelebration,
  getLiturgicalColor,
  normalizeCelebrationName,
  getFerialColor
} from "./liturgicalCelebration"

import {
  findSaintOfDay
} from "../data/saintsOfTheDay"

import {
  SAINT_BIOS,
  findMovableFeast,
  type SaintBio
} from "../data/saintBios"

export type SaintOfDayInfo = {
  nome: string
  grau: string
  cor: string | null
  corHex: string
  corHexSoft: string
  data?: string
  bio: SaintBio | null
  opcional: boolean
}

/*
Junta tudo: o texto AO VIVO da API (única fonte confiável
sobre o que está sendo celebrado hoje) com o índice local
de títulos/biografias (só usado quando bate com o que a
API está dizendo — nunca no lugar dela).
*/

export function resolveSaintOfDay(
  liturgy: LiturgyData | null | undefined
): SaintOfDayInfo | null {

  if(!liturgy?.liturgia) return null

  const celebration = parseCelebration(liturgy.liturgia)

  // dia comum (feria), sem celebração com nome próprio
  if(!celebration) return null

  const normalizedApiNome = normalizeCelebrationName(celebration.nome)

  let nome = celebration.nome
  let bio: SaintBio | null = null
  let opcional = false

  const [diaStr, mesStr] = (liturgy.data || "").split("/")
  const dia = Number(diaStr)
  const mes = Number(mesStr)

  let referenceDate: Date | null = null

  if(dia && mes){

    const anoAtual = new Date().getFullYear()

    referenceDate = new Date(anoAtual, mes - 1, dia)

    const fixedEntry = findSaintOfDay(dia, mes)

    const bateData =
      fixedEntry?.match.some((m)=>
        normalizedApiNome.includes(m)
      )

    if(fixedEntry && bateData){

      nome = fixedEntry.nome
      opcional = !!fixedEntry.opcional

      if(fixedEntry.bioId){
        bio = SAINT_BIOS[fixedEntry.bioId] || null
      }

    }

  }

  if(!bio){

    const movable = findMovableFeast(normalizedApiNome)

    if(movable){
      nome = movable.titulo
      bio = {
        titulo: movable.titulo,
        resumo: movable.resumo,
        texto: movable.texto
      }
    }

  }

  /*
  Memória Facultativa confirmada: a Igreja permite não
  celebrá-la, então a cor "correta" a exibir é a da
  estação litúrgica em curso (normalmente verde), não a
  do santo — o nome continua aparecendo, só como
  informação extra.
  */

  const corParaExibir =
    opcional && referenceDate
      ? getFerialColor(referenceDate)
      : liturgy.cor

  const color = getLiturgicalColor(corParaExibir)

  return {
    nome,
    grau: celebration.grau,
    cor: corParaExibir || null,
    corHex: color.hex,
    corHexSoft: color.hexSoft,
    data: liturgy.data,
    bio,
    opcional
  }

}
