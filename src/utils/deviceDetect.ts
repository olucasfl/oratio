export function isIOSDevice(){
  const ua = navigator.userAgent

  if(/iPad|iPhone|iPod/.test(ua)) return true

  // iPad recente se identifica como "Macintosh" no user agent, mas
  // só Mac de verdade tem mouse (sem touch points)
  return ua.includes("Macintosh") && navigator.maxTouchPoints > 1
}

export function isAndroidDevice(){
  return /Android/.test(navigator.userAgent)
}
