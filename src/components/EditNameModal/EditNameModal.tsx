import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { updateName } from "../../services/profileService"
import { getAuthErrorMessage } from "../../utils/authErrors"

import styles from "./EditNameModal.module.css"

interface Props{
 open:boolean
 name:string
 onClose:()=>void
 onSaved:(name:string)=>void
}

export default function EditNameModal({ open, name, onClose, onSaved }:Props){

 const [value,setValue] = useState(name)
 const [loading,setLoading] = useState(false)
 const [error,setError] = useState<string | null>(null)

 /*
  Reajusta pro nome atual toda vez que o modal abre — sem isso, cancelar
  uma edição e abrir de novo mostraria o rascunho descartado da vez
  anterior, não o nome que está salvo.
 */
 useEffect(()=>{
  if(open) setValue(name)
 },[open, name])

 if(!open) return null

 function handleClose(){
  setError(null)
  onClose()
 }

 async function handleSubmit(){

  setError(null)

  const trimmed = value.trim()

  // Mesma faixa do `UpdateProfileDto` no backend — valida aqui só pra dar
  // feedback sem round-trip; o backend segue sendo a fonte da verdade.
  if(trimmed.length < 2 || trimmed.length > 80){
   setError("O nome deve ter entre 2 e 80 caracteres.")
   return
  }

  setLoading(true)

  try{

   await updateName(trimmed)
   onSaved(trimmed)
   onClose()

  }catch(err){

   setError(getAuthErrorMessage(err, "Não foi possível salvar o nome. Tente novamente."))

  }finally{

   setLoading(false)

  }

 }

 return createPortal(

  <div className={styles.overlay}>

   <div className={styles.modal}>

    <h2>Editar nome</h2>

    {error && <p className={styles.errorText}>{error}</p>}

    <input
     className={styles.input}
     type="text"
     placeholder="Seu nome"
     value={value}
     onChange={(e)=>setValue(e.target.value)}
     maxLength={80}
    />

    <button
     className={styles.buttonPrimary}
     onClick={handleSubmit}
     disabled={loading}
    >
     {loading ? "Salvando..." : "Salvar"}
    </button>

    <button className={styles.buttonSecondary} onClick={handleClose}>
     Cancelar
    </button>

   </div>

  </div>,

  document.body

 )

}
