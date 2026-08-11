import { useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import type { ComponentType } from "react"

import {
  Menu,
  X,
  Calendar,
  Flame,
  Circle,
  HandHeart,
  Heart,
  Cross,
  BookOpen,
  Book,
  MessageCircleHeart,
  User,
  ChevronRight
} from "lucide-react"

import styles from "./MenuDrawer.module.css"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"
import { isLoggedIn } from "../../utils/auth"
import GuestGateModal from "../GuestGateModal/GuestGateModal"

type Item = {
  label: string
  path: string
  icon: ComponentType<{ size?: number }>
  locked?: boolean
  gateMessage?: string
}

type Group = {
  label: string
  items: Item[]
}

const GROUPS: Group[] = [
  {
    label: "Oração diária",
    items: [
      { label: "Liturgia do dia", path: "/oratio/liturgia-completa", icon: Calendar },
      {
        label: "Santo do dia",
        path: "/oratio/santo-do-dia",
        icon: Flame,
        locked: true,
        gateMessage: "Crie uma conta para ver os detalhes do Santo do Dia."
      },
      { label: "Terço & Rosário", path: "/oratio/rosary", icon: Circle },
      { label: "Orações e Ladainhas", path: "/oratio/prayers", icon: HandHeart }
    ]
  },
  {
    label: "Caminhos",
    items: [
      {
        label: "Consagração · 33 dias",
        path: "/oratio/consecration",
        icon: Heart,
        locked: true,
        gateMessage: "Crie uma conta para iniciar a Consagração de 33 dias e acompanhar seu progresso."
      },
      {
        label: "Guia de Confissão",
        path: "/oratio/confissao",
        icon: Cross,
        locked: true,
        gateMessage: "Crie uma conta para acessar o Guia de Confissão."
      }
    ]
  },
  {
    label: "Estudo",
    items: [
      { label: "Bíblia Sagrada", path: "/oratio/biblia", icon: BookOpen },
      {
        label: "Catecismo",
        path: "/oratio/catecismo",
        icon: Book,
        locked: true,
        gateMessage: "Crie uma conta para acessar o Catecismo completo."
      },
      {
        label: "VoxAI",
        path: "/oratio/vox",
        icon: MessageCircleHeart,
        locked: true,
        gateMessage: "Crie uma conta para conversar com o VoxAI, seu assistente espiritual católico."
      }
    ]
  }
]

export default function MenuDrawer(){

  const navigate = useNavigate()

  const [open,setOpen] = useState(false)
  const [gateMessage,setGateMessage] = useState<string | null>(null)

  useLockBodyScroll(open)

  function go(item:{ path:string; locked?:boolean; gateMessage?:string }){

    if(item.locked && !isLoggedIn()){
      setGateMessage(item.gateMessage || "Crie uma conta para acessar essa área.")
      return
    }

    setOpen(false)
    navigate(item.path)

  }

  return(

    <>

    <button
      className={styles.fab}
      onClick={()=>setOpen(true)}
      aria-label="Abrir menu do aplicativo"
    >
      <Menu size={22}/>
    </button>

    {createPortal(

      <>

      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        onClick={()=>setOpen(false)}
        aria-hidden={!open}
      />

      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-label="Menu do aplicativo"
        aria-hidden={!open}
      >

        <div className={styles.head}>

          <span className={styles.logo}>
            ORA<span className={styles.cross} aria-hidden="true"/>IO
          </span>

          <button
            className={styles.close}
            onClick={()=>setOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18}/>
          </button>

        </div>

        <nav className={styles.groups}>

          {GROUPS.map((group)=>(

            <div key={group.label} className={styles.group}>

              <span className={styles.groupLabel}>
                {group.label}
              </span>

              {group.items.map((item)=>{
                const Icon = item.icon
                return(
                  <button
                    key={item.label}
                    className={styles.item}
                    onClick={()=>go(item)}
                  >
                    <span className={styles.itemIcon}>
                      <Icon size={17}/>
                    </span>
                    <span className={styles.itemLabel}>{item.label}</span>
                    <ChevronRight size={16} className={styles.chev}/>
                  </button>
                )
              })}

            </div>

          ))}

        </nav>

        <button
          className={styles.user}
          onClick={()=>go({ path:"/oratio/profile", locked:true, gateMessage:"Crie uma conta para acessar seu perfil e acompanhar seu progresso espiritual." })}
        >
          <span className={styles.userAvatar}><User size={20}/></span>
          <span className={styles.userText}>
            <strong>Perfil e conta</strong>
            <span>Progresso, ajustes e mais</span>
          </span>
          <ChevronRight size={16} className={styles.chev}/>
        </button>

      </aside>

      </>,

      document.body

    )}

    <GuestGateModal
      open={gateMessage !== null}
      message={gateMessage || ""}
      onClose={()=>setGateMessage(null)}
    />

    </>

  )

}
