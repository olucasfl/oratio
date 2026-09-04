export function isPWA(){

 if (window.matchMedia("(display-mode: standalone)").matches) {
  return true
 }

 /* `standalone` é uma extensão do Safari no iOS, fora da tipagem padrão de Navigator. */
 if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) {
  return true
 }

 return false
}