/*
Depois de logar/criar conta a partir de um popup de "crie sua conta"
aberto no meio de alguma tela (ex: tentando concluir uma oração), a
pessoa deve voltar pra exatamente onde estava, não pra Home — daí
todo navigate("/login")/navigate("/register") feito a partir de um
ponto bloqueado carrega a página atual como ?redirect=..., e as
telas de Login/Register repassam esse parâmetro entre si e usam ele
no destino final.
*/
export function withRedirect(path: "/login" | "/register", currentPath: string){
  return `${path}?redirect=${encodeURIComponent(currentPath)}`
}
