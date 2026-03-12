export async function getProfile(){

 const token = localStorage.getItem("access_token")

 const res = await fetch(
  "https://finance-api-y0ol.onrender.com/users/me",
  {
   headers:{
    Authorization:`Bearer ${token}`
   }
  }
 )

 if(!res.ok){
  throw new Error("Erro ao carregar perfil")
 }

 return res.json()

}