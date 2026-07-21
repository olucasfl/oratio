import {
 Wind,
 Shield,
 Heart,
 Sunrise,
 Flame,
 Leaf,
 HeartHandshake,
 Hand,
 Star,
 Droplet,
 Home,
 BookOpen,
 type LucideIcon
} from "lucide-react"

export type BibleTopic = {
 id: string
 label: string
 icon: LucideIcon
 keywords: string[]
}

export const BIBLE_TOPICS: BibleTopic[] = [
 { id:"ansiedade", label:"Ansiedade", icon:Wind, keywords:["não temas","não temais","ansiedade","preocupeis","inquietai","angústia"] },
 { id:"medo", label:"Medo", icon:Shield, keywords:["não temas","não temais","medo","temor"] },
 { id:"amor", label:"Amor", icon:Heart, keywords:["amor","amai","amado"] },
 { id:"esperanca", label:"Esperança", icon:Sunrise, keywords:["esperança","esperai"] },
 { id:"forca", label:"Força e coragem", icon:Flame, keywords:["força","fortaleza","coragem","ânimo"] },
 { id:"paz", label:"Paz", icon:Leaf, keywords:["paz"] },
 { id:"perdao", label:"Perdão", icon:HeartHandshake, keywords:["perdão","perdoai","perdoar"] },
 { id:"gratidao", label:"Gratidão", icon:Hand, keywords:["graças","gratidão"] },
 { id:"fe", label:"Fé", icon:Star, keywords:["pela fé","fiel","fidelidade","crede","credes"] },
 { id:"luto", label:"Luto e consolo", icon:Droplet, keywords:["consolo","consolar","lágrimas","tristeza"] },
 { id:"familia", label:"Família", icon:Home, keywords:["família","filhos"] },
 { id:"sabedoria", label:"Sabedoria", icon:BookOpen, keywords:["sabedoria","sábio","entendimento"] }
]
