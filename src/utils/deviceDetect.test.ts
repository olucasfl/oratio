import { describe, it, expect, afterEach } from "vitest"
import { isIOSDevice, isAndroidDevice } from "./deviceDetect"

const originalUA = navigator.userAgent
const originalTouchPoints = navigator.maxTouchPoints

function setUA(ua: string) {
  Object.defineProperty(navigator, "userAgent", { configurable: true, value: ua })
}

function setTouchPoints(n: number) {
  Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value: n })
}

afterEach(() => {
  setUA(originalUA)
  setTouchPoints(originalTouchPoints)
})

describe("isIOSDevice", () => {

  it("is true for an iPhone/iPad/iPod user agent", () => {
    setUA("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15")
    expect(isIOSDevice()).toBe(true)
  })

  it("is true for a modern iPad that reports as Macintosh, distinguished by touch support", () => {
    setUA("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15")
    setTouchPoints(5)
    expect(isIOSDevice()).toBe(true)
  })

  it("is false for a real Mac (Macintosh UA, no touch points)", () => {
    setUA("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15")
    setTouchPoints(0)
    expect(isIOSDevice()).toBe(false)
  })

  it("is false for an unrelated user agent", () => {
    setUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    setTouchPoints(0)
    expect(isIOSDevice()).toBe(false)
  })

})

describe("isAndroidDevice", () => {

  it("is true for an Android user agent", () => {
    setUA("Mozilla/5.0 (Linux; Android 14; Pixel 8)")
    expect(isAndroidDevice()).toBe(true)
  })

  it("is false for a non-Android user agent", () => {
    setUA("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")
    expect(isAndroidDevice()).toBe(false)
  })

})
