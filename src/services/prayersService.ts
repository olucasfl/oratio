import api from "./api"

export async function getPrayerCategories(){

 const res = await api.get("/oratio/prayers/categories")

 return res.data

}

export async function getPrayersByCategory(slug:string){

 const res = await api.get(`/oratio/prayers?category=${slug}`)

 return res.data

}

export async function getPrayer(id:string){

 const res = await api.get(`/oratio/prayers/${id}`)

 return res.data

}

export async function completePrayer(){

 const token = localStorage.getItem("access_token")

 const res = await api.post(
  "/oratio/prayers/complete",
  {},
  {
   headers:{
    Authorization:`Bearer ${token}`
   }
  }
 )

 return res.data

}