import styles from "./Journey.module.css"

import { useEffect, useState }
from "react"

import {
  HeartHandshake,
  Flame,
  Star,
  Trash2,
  Plus,
  Pin,
  Heart,
  ArrowLeft
} from "lucide-react"

import {
  getJourney,
  deleteJourney,
  createIntent,
  deleteIntent
} from "../../services/journeyService"

import { useNavigate }
from "react-router-dom"

export default function Journey(){

  const [journey,setJourney] =
    useState<any>(null)

  const [loading,setLoading] =
    useState(true)

  const [newIntent,setNewIntent] =
    useState("")

    const [creatingIntent,setCreatingIntent] =
    useState(false)

    const navigate = useNavigate()

    const [deletingId,setDeletingId] =
      useState<string | null>(null)
  /*
  ========================
  LOAD
  ========================
  */

  useEffect(()=>{

    loadJourney()

  },[])

  async function loadJourney(){

    try{

      const data =
        await getJourney()

      setJourney(data)

    }finally{

      setLoading(false)

    }

  }

  /*
  ========================
  DELETE JOURNEY
  ========================
  */

  async function handleDelete(){

    const confirmDelete =
      window.confirm(
        "Deseja encerrar a jornada?"
      )

    if(!confirmDelete){
      return
    }

    await deleteJourney()

    window.location.href =
      "/oratio/home"

  }

  /*
  ========================
  ADD INTENT
  ========================
  */

  async function addIntent(){

    if(!newIntent.trim()){
      return
    }

    try{

      setCreatingIntent(true)

      const createdIntent =
        await createIntent(
          newIntent.trim()
        )

      setJourney({

        ...journey,

        intents:[

          {

            ...createdIntent,

            canDelete:true

          },

          ...(journey.intents || [])

        ]

      })

      setNewIntent("")

    }catch(error){

      console.log(error)

      alert(
        "Erro ao criar intenção"
      )

    }finally{

      setCreatingIntent(false)

    }

  }

  /*
  ========================
  REMOVE INTENT
  ========================
  */

  async function removeIntent(
  id:string
){

  try{

    setDeletingId(id)

    await deleteIntent(id)

    const updated =
      journey.intents.filter(
        (intent:any)=>
          intent.id !== id
      )

    setJourney({

      ...journey,

      intents:updated

    })

  }finally{

    setDeletingId(null)

  }

}

  /*
  ========================
  LOADING
  ========================
  */

  if(loading){

    return(

      <main className={`${styles.container} page-enter`}>

        <button className={styles.backButton} onClick={()=>navigate(-1)}>
          <ArrowLeft size={18}/>
          Voltar
        </button>

        <section className={styles.card}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="skeleton" style={{height:24,width:"55%",borderRadius:8}}/>
            <div className="skeleton" style={{height:16,width:"40%",borderRadius:6}}/>
            <div className="skeleton" style={{height:12,width:"100%",borderRadius:99}}/>
            <div className="skeleton" style={{height:72,width:"100%",borderRadius:14}}/>
            <div className="skeleton" style={{height:72,width:"100%",borderRadius:14}}/>
            <div className="skeleton" style={{height:44,width:"100%",borderRadius:10}}/>
          </div>
        </section>

      </main>

    )

  }

  if(!journey){
    return null
  }

  return(

    <main className={`${styles.container} page-enter`}>

      <button
        className={styles.backButton}
        onClick={()=>
          navigate(-1)
        }
      >

        <ArrowLeft size={18}/>

        Voltar

      </button>

      <section className={styles.card}>

        {/* HEADER */}

        <div className={styles.header}>

          <div className={styles.icon}>

            <HeartHandshake size={34}/>

          </div>

          <div>

            <h1>
              Jornada Espiritual
            </h1>

            <p>
              Caminhada semanal de oração
            </p>

          </div>

        </div>

        {/* MEMBERS */}

        <div className={styles.members}>

          {journey.members.map((member:any)=>(

            <div
              key={member.id}
              className={styles.member}
            >

              <div className={styles.memberTop}>

                <div className={styles.memberInfoBlock}>

                  <h2>
                    {member.name}
                  </h2>

                  <div className={styles.rosaryProgressBadge}>

                    <div className={styles.rosaryProgressTop}>

                      <strong>
                        {member.rosariesCompleted}/4
                      </strong>

                      <span>
                        Terços rezados
                      </span>

                    </div>

                    <div className={styles.miniProgress}>

                      <div
                        className={styles.miniProgressFill}
                        style={{
                          width:`${
                            Math.min(
                              member.rosariesCompleted,
                              4
                            ) * 25
                          }%`
                        }}
                      />

                    </div>

                  </div>

                </div>

                <div className={styles.memberStats}>

                  <div className={styles.statCard}>

                    <div className={styles.statIconFlame}>

                      <Flame size={16}/>

                    </div>

                    <div className={styles.statContent}>

                      <span className={styles.statLabel}>
                        Sequência
                      </span>

                      <strong className={styles.statValue}>
                        {member.currentStreak}
                      </strong>

                    </div>

                  </div>

                  <div className={styles.statCard}>

                    <div className={styles.statIconStar}>

                      <Star size={16}/>

                    </div>

                    <div className={styles.statContent}>

                      <span className={styles.statLabel}>
                        Pontos
                      </span>

                      <strong className={styles.statValue}>
                        {member.totalPoints}
                      </strong>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* INTENTIONS */}

        <section className={styles.intentionsSection}>

          <div className={styles.intentionsHeader}>

            <div className={styles.intentionsTitle}>

              <Heart size={22}/>

              <h3>
                Intenções da Semana
              </h3>

            </div>

            <p>
              Coloquem aqui os pedidos
              e intenções pelas quais
              irão rezar juntos.
            </p>

          </div>

          {/* INPUT */}

          <div className={styles.intentInputBox}>

            <input
              type="text"
              placeholder="
              Escreva aqui suas intenções..."
              value={newIntent}
              onChange={(e)=>
                setNewIntent(e.target.value)
              }
            />

            <button
              onClick={addIntent}
              disabled={creatingIntent}
            >

              {creatingIntent ? (

                <div className={styles.spinner}/>

              ) : (

                <>

                  <Plus size={18}/>

                  Adicionar

                </>

              )}

            </button>

          </div>

          {/* WALL */}

          <div className={styles.intentionsWall}>

            {(journey.intents || []).length === 0 && (

              <div className={styles.emptyIntentions}>

                Nenhuma intenção adicionada
                nesta semana.

              </div>

            )}

            {(journey.intents || []).map(
              (intent:any)=>{

                return(

                  <div
                    key={intent.id}
                    className={styles.intentCard}
                  >

                    <div className={styles.pin}>

                      <Pin size={18}/>

                    </div>

                    <p className={styles.intentText}>

                      {intent.text}

                    </p>

                    <div className={styles.intentFooter}>

                      <span>

                        Adicionado por{" "}

                        <strong>
                          {intent.user.name}
                        </strong>

                      </span>

                      {intent.canDelete && (

                        <button

                          disabled={
                            deletingId === intent.id
                          }

                          onClick={()=>{

                            const confirmDelete =
                              window.confirm(
                                "Deseja remover esta intenção?"
                              )

                            if(confirmDelete){

                              removeIntent(intent.id)

                            }

                          }}
                        >

                          {deletingId === intent.id ? (

                            <div className={styles.spinnerDelete}/>

                          ) : (

                            <Trash2 size={16}/>

                          )}

                        </button>

                      )}

                    </div>

                  </div>

                )

              }
            )}

          </div>

        </section>

        {/* DELETE */}

        <button
          className={styles.deleteButton}
          onClick={handleDelete}
        >
          Encerrar Jornada
        </button>

      </section>

    </main>

  )

}