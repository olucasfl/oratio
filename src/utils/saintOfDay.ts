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

  if(!liturgy) return null

  const [diaStr, mesStr] = (liturgy.data || "").split("/")
  const dia = Number(diaStr)
  const mes = Number(mesStr)

  const fixedEntry = dia && mes
    ? findSaintOfDay(dia, mes)
    : null

  const celebration = liturgy.liturgia
    ? parseCelebration(liturgy.liturgia)
    : null

  if(!fixedEntry && !celebration) return null

  let nome = fixedEntry?.nome ?? celebration?.nome ?? ""
  let grau = fixedEntry
    ? fixedEntry.opcional ? "Memória Facultativa" : "Dia Comum"
    : celebration?.grau ?? ""
  let bio: SaintBio | null = null
  let opcional = !!fixedEntry
  let normalizedApiNome: string | null = null

  if(fixedEntry?.bioId){
    bio = SAINT_BIOS[fixedEntry.bioId] || null
  }

  if(celebration){
    normalizedApiNome = normalizeCelebrationName(celebration.nome)
    grau = celebration.grau

    if(fixedEntry){
      const bateData = fixedEntry.match.some((m)=>
        normalizedApiNome!.includes(m)
      )

      if(bateData){
        nome = fixedEntry.nome
      }
    }

    if(!fixedEntry){
      nome = celebration.nome
    }
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
