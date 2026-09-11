import api from "./api"
import { invalidateProfile } from "./profileService"

/*
 Guia de boas-vindas de primeira entrada (spec `docs/specs/boas-vindas.md`).

 A visibilidade e a unicidade do guia são governadas por `showWelcome` do
 `GET /users/me` — nunca por um flag local (o cleanup de versão do `App.tsx`
 varreria uma chave `localStorage` a cada release e o guia voltaria pra base
 inteira). Aqui só há a chamada de conclusão.

 `invalidateProfile()` depois do POST: sem isso, o memo de `getProfile()`
 (profileService.ts) podia devolver o `showWelcome: true` de ANTES desta
 chamada pra próxima navegação dentro da janela do memo, e o `WelcomeGate`
 mandaria a pessoa de volta pro guia que ela acabou de concluir.
*/
export async function markWelcomeSeen(){

 const res = await api.post("/users/me/welcome-seen")

 invalidateProfile()

 return res.data

}
