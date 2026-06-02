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
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
            <div className="skeleton" style={{height:18,width:"55%",borderRadius:6}}/>
            <div className="skeleton" style={{height:14,width:"70%",borderRadius:4}}/>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div className="skeleton" style={{height:10,width:"100%",borderRadius:99}}/>
          <div className="skeleton" style={{height:64,width:"100%",borderRadius:14}}/>
          <div className="skeleton" style={{height:64,width:"100%",borderRadius:14}}/>
          <div className="skeleton" style={{height:44,width:"100%",borderRadius:10}}/>
        </div>

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