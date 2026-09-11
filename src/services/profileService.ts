import api from "./api"

/*
 Espelha o `return` de `UsersService.getProfile` no oratio-api. Note que
 `spiritualProgress` é montado lá — não é a relação `spiritualStats` crua do
 Prisma — e que `prayerStreak` conta dias de oração, não um recorde de
 sequência (nome enganoso herdado, documentado no ARCHITECTURE do backend).
*/
export interface SpiritualProgress {
  consecrationStarted: boolean
  daysCompleted: number
  prayersPrayed: number
  rosariesPrayed: number
  lastPrayerDate: string | null
  prayerStreak: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  pendingEmail: string | null
  createdAt: string
  emailVerified: boolean
  isAdmin: boolean
  /*
   `false` = conta que entrou só por Google e ainda não definiu senha.
   Governa "Definir senha" vs "Trocar senha" em Configurações da conta.
   O backend nunca manda o hash — só este booleano.
  */
  hasPassword: boolean
  /*
   `true` = existe um `LinkedAccount` google para esta conta. Junto com
   `hasPassword` diz se a conta tem senha, Google, ou OS DOIS — o
   `DeleteAccountModal` precisa saber pra oferecer a prova por senha e a
   prova por Google (spec prova-identidade). Aditivo; um cache antigo sem o
   campo vira `undefined` → tratado como `false`.
  */
  hasGoogle?: boolean
  /*
   `true` = a conta ainda não concluiu o guia de boas-vindas (`welcomeSeenAt`
   nulo no backend). O `WelcomeGate` redireciona pra `/oratio/boas-vindas`
   enquanto isto for `true`. Aditivo; cache antigo sem o campo vira
   `undefined` → nenhum redirect (fail-safe).
  */
  showWelcome?: boolean
  /*
   `true` = a conta aceitou o PAR Termos de Uso + Política de Privacidade
   NA VERSÃO ATUAL (`legalTermsVersion` bate com `LEGAL_TERMS_VERSION` no
   backend). O `LegalTermsGate` redireciona pra `/oratio/consentimento`
   enquanto isto não for `true` — inclusive quem aceitou uma versão antiga
   (o texto mudou) volta a ver a tela. Aditivo; cache antigo sem o campo
   vira `undefined` → tratado como não aceito pelo gate (fail-safe: nunca
   assume aceite por falta de campo).
  */
  legalTermsAccepted?: boolean
  spiritualProgress: SpiritualProgress
}

/*
 Dedupe + memo curto (spec: lentidão da tela de consentimento — 2026-09-11).
 Ao logar, `LegalTermsGate`, `WelcomeGate` e (depois do redirect)
 `LegalConsent`/`WelcomeGuide` chamavam `getProfile()` cada um por conta
 própria — até 3 idas ao Supabase (us-east-1, `connection_limit=1`) em
 sequência pela mesma navegação, serializando no banco. Aqui: uma requisição
 em voo é compartilhada (dedupe) e o resultado fica bom por `PROFILE_TTL_MS`
 (memo) — os gates que disparam quase juntos colapsam numa chamada só.

 `generation` existe pra `invalidateProfile()` não correr risco de um GET
 tardio (iniciado ANTES da invalidação, resolvido DEPOIS) repopular o cache
 com dado velho — só grava no cache quem começou na geração ainda vigente.
 `pending === request` no fim evita que o `finally` de um request antigo
 apague a referência de um request novo que já tomou o lugar dele.
*/
const PROFILE_TTL_MS = 5000

let cache: { data: UserProfile; expiresAt: number } | null = null
let pending: Promise<UserProfile> | null = null
let generation = 0

export async function getProfile(): Promise<UserProfile> {

 if(cache && Date.now() < cache.expiresAt){
  return cache.data
 }

 if(pending){
  return pending
 }

 const requestGeneration = generation

 const request = api.get("/users/me").then((res)=>res.data)

 pending = request

 request
  .then((data)=>{
   if(requestGeneration === generation){
    cache = { data, expiresAt: Date.now() + PROFILE_TTL_MS }
   }
  })
  .catch(()=>{
   // erro já propaga pra quem chamou via `request`/`pending`; aqui é só
   // pra não deixar uma rejection não tratada nesta ponta secundária.
  })
  .finally(()=>{
   if(pending === request) pending = null
  })

 return request

}

/*
 Invalida o memo/dedupe acima. Chamar depois de qualquer escrita que mude o
 que `GET /users/me` devolve — `acceptLegalTerms`, `markWelcomeSeen`
 (welcomeService.ts), `setPassword`, `updateName` e qualquer outra. Sem
 isso, um gate podia ler o cache de ANTES da escrita e mandar a pessoa de
 volta pra tela que ela acabou de completar.
*/
export function invalidateProfile(){
 generation++
 cache = null
 pending = null
}

/*
 Aceite do PAR Termos de Uso + Política de Privacidade (spec consentimento-
 privacidade.md). Sem corpo — o `userId` vem do token. Ao contrário de
 `markWelcomeSeen`, o backend SEMPRE regrava (chamar de novo depois de um
 bump de `LEGAL_TERMS_VERSION` precisa conseguir registrar o reaceite).
*/
export async function acceptLegalTerms(){

 const res = await api.post("/users/me/legal-terms-accepted")

 invalidateProfile()

 return res.data

}

/*
 Edita só o nome exibido no perfil. O backend valida (`UpdateProfileDto`:
 obrigatório, 2-80 caracteres, trim) e devolve uma lista branca explícita
 (nunca a senha nem os tokens de verificação/reset — ver ARCHITECTURE do
 oratio-api §7) — não o `UserProfile` inteiro, então quem chama funde o
 `name` novo no perfil que já tinha em vez de substituir tudo.
*/
export async function updateName(name:string){

 const res = await api.patch("/users/me", { name })

 invalidateProfile()

 return res.data

}

export async function changePassword(currentPassword:string, newPassword:string){

 const res = await api.post("/users/me/change-password", {
  currentPassword,
  newPassword
 })

 return res.data

}

/*
 Define a PRIMEIRA senha de uma conta que entrou só por Google (`hasPassword:
 false`). Rota separada do `changePassword` de propósito: não há "senha atual"
 pra informar, e o backend NÃO revoga as sessões aqui (nenhuma credencial
 antiga deixou de valer). Um 409 significa que a conta já tem senha — nesse
 caso a rota certa é "Trocar senha".
*/
export async function setPassword(password:string, confirmPassword:string){

 const res = await api.post("/users/me/set-password", {
  password,
  confirmPassword
 })

 invalidateProfile()

 return res.data

}

export async function requestEmailChange(email:string): Promise<{ emailChangePending:boolean, pendingEmail:string }>{

 const res = await api.post("/users/me/email", { email })

 return res.data

}

export async function cancelEmailChange(){

 const res = await api.post("/users/me/email/cancel")

 return res.data

}

/*
Excluir a conta exige uma prova FRESCA de identidade — o access token sozinho
(roubável) não pode destruir a conta (spec prova-identidade; ARCHITECTURE §7).
Conta com senha manda { password }; conta com Google manda um { googleCredential }
(id_token recém-emitido). Uma conta com OS DOIS métodos pode mandar qualquer um —
o backend (`assertFreshProof`) decide pelo que a conta tem, não por hasPassword.
*/
export async function deleteAccount(
 proof: { password?: string; googleCredential?: string },
){

 const res = await api.delete("/users/me", { data: proof })

 return res.data

}