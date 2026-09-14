/*
Mensagem "flash" de uma navegação só: quem dispara grava aqui e navega; o
<FlashToast/> (montado no App, fora das Routes) lê UMA vez na próxima rota e
mostra um toast. Usado pelo E4 do login com Google — o toast "Sua conta Google
foi conectada" precisa sobreviver ao navigate() que troca de tela.

sessionStorage de propósito: efêmero (não persiste entre abas/sessões), e o
cleanup de APP_VERSION do App.tsx e o clearSession do api.ts só mexem em
localStorage — esta chave não é varrida por eles.
*/

const KEY = "oratio_flash";

export function setFlash(message: string) {
  try {
    sessionStorage.setItem(KEY, message);
  } catch {
    /* modo privado / storage cheio — o toast é dispensável, seguir sem ele */
  }
}

/* Lê e consome (remove) a mensagem. Retorna null se não houver. */
export function readFlash(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value !== null) sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}
