import { useState } from "react"

export type ReadingSize = "sm" | "md" | "lg"

const KEY = "oratio-reading-size"

const FONT_SIZES: Record<ReadingSize, number> = {
  sm: 15,
  md: 18,
  lg: 22,
}

export function useReadingSize() {

  const [size, setSize] = useState<ReadingSize>(() => {
    const saved = localStorage.getItem(KEY) as ReadingSize | null
    return saved && ["sm","md","lg"].includes(saved) ? saved : "md"
  })

  function change(s: ReadingSize) {
    setSize(s)
    localStorage.setItem(KEY, s)
  }

  return { size, fontSize: FONT_SIZES[size], setSize: change }

}
