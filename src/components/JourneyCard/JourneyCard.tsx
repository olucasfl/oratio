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

  /*
  =========================
  LOADING
  =========================
  */

  const members =
    loading
      ? [
          {
            id:"1",
            name:"Carregando...",
            rosariesCompleted:0,
            totalPoints:0,
            currentStreak:0
          },
          {
            id:"2",
            name:"Carregando...",
            rosariesCompleted:0,
            totalPoints:0,
            currentStreak:0
          }
        ]
      : journey?.members || []

  const totalProgress =
    journey
      ? Math.min(
          journey.members.reduce(
            (acc,member)=>
              acc + member.rosariesCompleted,
            0
          ),
          8
        )
      : 0

  return(

    <section className={styles.card}>

      <div className={styles.backgroundGlow}/>

      <div className={styles.header}>

        <div className={styles.iconWrapper}>

          <HeartHandshake
            size={28}
            strokeWidth={2.2}
          />

        </div>

        <div>

          <h2>
            Jornada Espiritual
          </h2>

          <p>
            Caminhada semanal de oração
          </p>

        </div>

      </div>

      <div className={styles.globalProgress}>

        <div className={styles.globalTop}>

          <span>
            Progresso semanal
          </span>

          <span>
            {loading
              ? "--/8"
              : `${totalProgress}/8`
            }
          </span>

        </div>

        <div className={styles.globalBar}>

          <div
            className={styles.globalFill}
            style={{
              width: `${
                loading
                  ? 20
                  : (totalProgress / 8) * 100
              }%`
            }}
          />

        </div>

      </div>

      <div className={styles.members}>

        {members.map(member=>(

          <div
            key={member.id}
            className={styles.member}
          >

            <div className={styles.memberHeader}>

              <div className={styles.avatar}>

                {loading
                  ? "..."
                  : member.name.charAt(0)
                }

              </div>

              <div className={styles.memberInfo}>

                <strong>
                  {member.name}
                </strong>

                <span>
                  {loading
                    ? "Carregando..."
                    : `${member.rosariesCompleted}/4 terços`
                  }
                </span>

              </div>

              <div className={styles.points}>

                <Star size={16}/>

                <span>
                  {loading
                    ? "--"
                    : member.totalPoints
                  }
                </span>

              </div>

            </div>

            <div className={styles.progressBar}>

              <div
                className={styles.progressFill}
                style={{
                  width: `${
                    loading
                      ? 15
                      : Math.min(
                          member.rosariesCompleted,
                          4
                        ) * 25
                  }%`
                }}
              />

            </div>

          </div>

        ))}

      </div>

      <button
        className={styles.button}
        onClick={()=>
          navigate("/oratio/journey")
        }
        disabled={loading}
      >

        <span>
          Abrir jornada
        </span>

        <ChevronRight size={18}/>

      </button>

    </section>

  )

}