export function isPWA(){

 if (window.matchMedia("(display-mode: standalone)").matches) {
  return true
 }

 if ((window.navigator as any).standalone === true) {
  return true
 }

 return false
}