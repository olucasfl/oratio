import api from "./api"

/*
 Guia de boas-vindas de primeira entrada (spec `docs/specs/boas-vindas.md`).

 A visibilidade e a unicidade do guia são governadas por `showWelcome` do
 `GET /users/me` — nunca por um flag local (o cleanup de versão do `App.tsx`
 varreria uma chave `localStorage` a cada release e o guia voltaria pra base
 inteira). Aqui só há a chamada de conclusão.
*/
export async function markWelcomeSeen(){

 const res = await api.post("/users/me/welcome-seen")

 return res.data

}
