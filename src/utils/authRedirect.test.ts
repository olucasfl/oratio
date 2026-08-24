import { describe, it, expect } from "vitest"
import { withRedirect } from "./authRedirect"

describe("withRedirect", () => {

  it("appends the current path as an encoded ?redirect= query param", () => {
    expect(withRedirect("/login", "/oratio/rosary")).toBe("/login?redirect=%2Foratio%2Frosary")
  })

  it("works for /register the same way", () => {
    expect(withRedirect("/register", "/oratio/home")).toBe("/register?redirect=%2Foratio%2Fhome")
  })

  it("encodes special characters in the current path (query string, etc.)", () => {
    expect(withRedirect("/login", "/oratio/biblia?livro=Gênesis&cap=1"))
      .toBe("/login?redirect=%2Foratio%2Fbiblia%3Flivro%3DG%C3%AAnesis%26cap%3D1")
  })

})
