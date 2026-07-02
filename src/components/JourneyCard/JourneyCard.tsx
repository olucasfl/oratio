import styles from "./JourneyCard.module.css"

import { useEffect, useState }
from "react"

import { useNavigate }
from "react-router-dom"

import {
  HeartHandshake,
  ChevronRight,
  Star
} from "lucide-react"

import { getJourney }
from "../../services/journeyService"

import Skeleton from "../Skeleton/Skeleton"

type JourneyMember = {

  id:string
  name:string

  rosariesCompleted:number

  totalPoints:number

  currentStreak:number

}

type Journey = {

  weekKey:string
  goal:number

  members:JourneyMember[]

}

export default function JourneyCard(){

  const navigate = useNavigate()

  const [journey,setJourney] =
    useState<Journey | null>(null)

  const [loading,setLoading] =
    useState(true)

  useEffect(()=>{

    loadJourney()

  },[])

  async function loadJourney(){

    try{

      const data =
        await getJourney()

      setJourney(data)

    }catch{

      setJourney(null)

    }finally{

      setLoading(false)

    }

  }

  /*
  =========================
  SEM JOURNEY
  =========================
  */

  if(!loading && !journey){
    return null
  }

  /* ── skeleton ── */
  if(loading){
    return(
      <section className={styles.card}>

        <div className={styles.backgroundGlow}/>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <HeartHandshake size={28} strokeWidth={2.2}/>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
            <Skeleton height={16} width="58%" radius={6}/>
            <Skeleton height={12} width="75%" radius={4}/>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <Skeleton height={12} width="38%" radius={4}/>
            <Skeleton height={12} width="12%" radius={4}/>
          </div>
          <Skeleton height={14} width="100%" radius={99}/>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[0,1].map(i=>(
            <div key={i} style={{background:"rgba(255,255,255,.55)",border:"1px solid #ece3d7",borderRadius:20,padding:18}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                <Skeleton height={46} circle style={{minWidth:46}}/>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                  <Skeleton height={14} width="50%" radius={4}/>
                  <Skeleton height={11} width="36%" radius={4}/>
                </div>
                <Skeleton width={64} height={40} radius={14}/>
              </div>
              <Skeleton height={12} width="100%" radius={99}/>
            </div>
          ))}
        </div>

        <Skeleton height={56} radius={18}/>

      </section>
    )
  }

  const members = journey?.members || []

  const totalProgress =
    Math.min(
      members.reduce((acc,m)=>acc + m.rosariesCompleted, 0),
      8
    )

  return(

    <section className={styles.card}>

      <div className={styles.backgroundGlow}/>

      <div className={styles.header}>

        <div className={styles.iconWrapper}>
          <HeartHandshake size={28} strokeWidth={2.2}/>
        </div>

        <div>
          <h2>Jornada Espiritual</h2>
          <p>Caminhada semanal de oração</p>
        </div>

      </div>

      <div className={styles.globalProgress}>

        <div className={styles.globalTop}>
          <span>Progresso semanal</span>
          <span>{totalProgress}/8</span>
        </div>

        <div className={styles.globalBar}>
          <div
            className={styles.globalFill}
            style={{ width:`${(totalProgress/8)*100}%` }}
          />
        </div>

      </div>

      <div className={styles.members}>

        {members.map(member=>(

          <div key={member.id} className={styles.member}>

            <div className={styles.memberHeader}>

              <div className={styles.avatar}>
                {member.name.charAt(0)}
              </div>

              <div className={styles.memberInfo}>
                <strong>{member.name}</strong>
                <span>{member.rosariesCompleted}/4 terços</span>
              </div>

              <div className={styles.points}>
                <Star size={16}/>
                <span>{member.totalPoints}</span>
              </div>

            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width:`${Math.min(member.rosariesCompleted,4)*25}%` }}
              />
            </div>

          </div>

        ))}

      </div>

      <button
        className={styles.button}
        onClick={()=>navigate("/oratio/journey")}
      >
        <span>Abrir jornada</span>
        <ChevronRight size={18}/>
      </button>

    </section>

  )

}