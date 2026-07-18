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

  const [diaStr, mesStr] = (liturgy?.data || "").split("/")
  const dia = Number(diaStr)
  const mes = Number(mesStr)

  const fixedEntry = dia && mes
    ? findSaintOfDay(dia, mes)
    : null

  const celebration = liturgy?.liturgia
    ? parseCelebration(liturgy.liturgia)
    : null

  let nome: string
  let grau: string
  let bio: SaintBio | null = null
  let opcional = false
  let normalizedApiNome: string | null = null

  if(fixedEntry){
    nome = fixedEntry.nome
    opcional = !!fixedEntry.opcional

    if(fixedEntry.bioId){
      bio = SAINT_BIOS[fixedEntry.bioId] || null
    }
  }

  if(celebration){
    normalizedApiNome = normalizeCelebrationName(celebration.nome)
    grau = celebration.grau

    if(fixedEntry){
      const bateData = fixedEntry.match.some((m)=>
        normalizedApiNome.includes(m)
      )

      if(bateData){
        nome = fixedEntry.nome
      }
    }

    if(!fixedEntry){
      nome = celebration.nome
    }

  } else if(fixedEntry){
    grau = fixedEntry.opcional ? "Memória Facultativa" : "Dia Comum"
  } else {
    return null
  }

  let referenceDate: Date | null = null

  if(dia && mes){
    const anoAtual = new Date().getFullYear()
    referenceDate = new Date(anoAtual, mes - 1, dia)
  }

  if(!bio && normalizedApiNome){
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
    grau,
    cor: corParaExibir || null,
    corHex: color.hex,
    corHexSoft: color.hexSoft,
    data: liturgy.data,
    bio,
    opcional
  }

}
