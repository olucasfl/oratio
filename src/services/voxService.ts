export async function askVox(message:string,history:any[]){

 try{

  const res = await fetch("https://finance-api-y0ol.onrender.com/oratio/voxai/chat",{
   method:"POST",
   headers:{
    "Content-Type":"application/json"
   },
   body:JSON.stringify({
    message,
    history
   })
  })

  return await res.json()

 }catch{

  return {
   success:false,
   message:"Erro ao conectar com o Vox."
  }

 }

}