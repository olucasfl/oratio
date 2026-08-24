import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  FONT_SCALE_OPTIONS,
  getStoredFontScale,
  applyFontScale,
  setFontScale,
  applyStoredFontScale,
} from "./fontScale"

const STORAGE_KEY = "oratio_font_scale"
const MAX_FONT_SCALE = FONT_SCALE_OPTIONS[FONT_SCALE_OPTIONS.length - 1].value

beforeEach(() => {
  localStorage.clear()
  document.documentElement.style.removeProperty("--oratio-font-scale")
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getStoredFontScale", () => {

  it("defaults to 1 when nothing is stored", () => {
    expect(getStoredFontScale()).toBe(1)
  })

  it("returns a validly stored scale", () => {
    localStorage.setItem(STORAGE_KEY, "0.9")
    expect(getStoredFontScale()).toBe(0.9)
  })

  it("clamps a legacy value above the current max option (removed 'Muito grande')", () => {
    localStorage.setItem(STORAGE_KEY, "1.3")
    expect(getStoredFontScale()).toBe(MAX_FONT_SCALE)
  })

  it("falls back to 1 for a non-numeric stored value", () => {
    localStorage.setItem(STORAGE_KEY, "not-a-number")
    expect(getStoredFontScale()).toBe(1)
  })

  it("falls back to 1 for a zero or negative stored value", () => {
    localStorage.setItem(STORAGE_KEY, "0")
    expect(getStoredFontScale()).toBe(1)

    localStorage.setItem(STORAGE_KEY, "-1")
    expect(getStoredFontScale()).toBe(1)
  })

  it("falls back to 1 when localStorage itself throws (e.g. private browsing)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked") })
    expect(getStoredFontScale()).toBe(1)
  })

})

describe("applyFontScale", () => {

  it("sets the CSS custom property on the root element", () => {
    applyFontScale(1.15)
    expect(document.documentElement.style.getPropertyValue("--oratio-font-scale")).toBe("1.15")
  })

})

describe("setFontScale", () => {

  it("persists the scale and applies it immediately", () => {
    setFontScale(0.9)

    expect(localStorage.getItem(STORAGE_KEY)).toBe("0.9")
    expect(document.documentElement.style.getPropertyValue("--oratio-font-scale")).toBe("0.9")
  })

  it("still applies the scale for this session even when localStorage.setItem throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked") })

    setFontScale(1.15)

    expect(document.documentElement.style.getPropertyValue("--oratio-font-scale")).toBe("1.15")
  })

})

describe("applyStoredFontScale", () => {

  it("applies whatever getStoredFontScale resolves to", () => {
    localStorage.setItem(STORAGE_KEY, "0.9")
    applyStoredFontScale()

    expect(document.documentElement.style.getPropertyValue("--oratio-font-scale")).toBe("0.9")
  })

})
