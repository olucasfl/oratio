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
Junta duas fontes:
  1. O texto AO VIVO da API — a fonte confiável sobre o que
     está sendo celebrado na Missa de hoje (grau, cor).
  2. O índice local de títulos/biografias — usado para dar
     nome bonito e biografia quando bate com o que a API diz,
     e como conteúdo COMPLEMENTAR (não litúrgico, informativo)
     nos dias em que a API não confirma nenhuma celebração com
     nome próprio, já que o Martirológio Romano tem alguma
     comemoração para todo dia do ano — mesmo quando ela não é
     promovida ao calendário da Missa daquele dia específico.

Por isso "opcional" tem dois significados possíveis, tratados
da mesma forma na exibição (cor da estação, não a cor "de
festa"): ou é uma Memória Facultativa confirmada pela API (a
Igreja permite não celebrá-la), ou é conteúdo só do índice
local, sem confirmação alguma da API naquele dia.
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
  let grau = celebration?.grau ?? "Dia Comum"
  let bio: SaintBio | null = null
  let normalizedApiNome: string | null = null

  // sem confirmação da API = conteúdo complementar do índice local
  let opcional = !celebration

  if(fixedEntry?.bioId){
    bio = SAINT_BIOS[fixedEntry.bioId] || null
  }

  if(celebration){

    normalizedApiNome = normalizeCelebrationName(celebration.nome)

    if(fixedEntry){

      const bateData = fixedEntry.match.some((m)=>
        normalizedApiNome!.includes(m)
      )

      if(bateData){
        nome = fixedEntry.nome
        opcional = !!fixedEntry.opcional
        grau = opcional ? "Memória Facultativa" : celebration.grau
      }

    }else{
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
