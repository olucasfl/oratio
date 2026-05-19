import api from "./api"

export async function getJourney(){

  const res =
    await api.get("/oratio/journey")

  return res.data

}

export async function getJourneyHistory(){

  const res =
    await api.get("/oratio/journey/history")

  return res.data

}

export async function createJourney(
  partnerEmail:string
){

  const res =
    await api.post(
      "/oratio/journey/create",
      { partnerEmail }
    )

  return res.data

}

export async function deleteJourney(){

  const res =
    await api.delete("/oratio/journey")

  return res.data

}

export async function createIntent(
  text:string
){

  const res =
    await api.post(
      "/oratio/journey/intent",
      { text }
    )

  return res.data

}

export async function deleteIntent(
  id:string
){

  const res =
    await api.delete(
      `/oratio/journey/intent/${id}`
    )

  return res.data

}