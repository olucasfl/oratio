import api from "./api"

/* =========================
   PING (ENTROU NO APP)
========================= */

export async function sendActivityPing() {
  const res = await api.post("/activity/ping")
  return res.data
}