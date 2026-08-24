import { describe, it, expect } from "vitest"
import { getAuthErrorMessage } from "./authErrors"

describe("getAuthErrorMessage", () => {

  it("returns a network-down message when the error has no response at all", () => {
    const message = getAuthErrorMessage({})
    expect(message).toBe("Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.")
  })

  it("returns a rate-limit message for a 429, regardless of body", () => {
    const message = getAuthErrorMessage({ response: { status: 429, data: {} } })
    expect(message).toBe("Muitas tentativas seguidas. Aguarde um minuto e tente novamente.")
  })

  it("translates a known backend message to its Portuguese equivalent", () => {
    const message = getAuthErrorMessage({
      response: { status: 400, data: { message: "Invalid credentials" } },
    })
    expect(message).toBe("Email ou senha incorretos.")
  })

  it("takes the first element when the backend message is an array (class-validator shape)", () => {
    const message = getAuthErrorMessage({
      response: { status: 400, data: { message: ["Passwords do not match", "outro erro"] } },
    })
    expect(message).toBe("As senhas não coincidem.")
  })

  it("passes through an unrecognized non-empty backend message as-is", () => {
    const message = getAuthErrorMessage({
      response: { status: 400, data: { message: "Something backend-specific" } },
    })
    expect(message).toBe("Something backend-specific")
  })

  it("falls back to the default message when there is no usable message", () => {
    const message = getAuthErrorMessage({ response: { status: 500, data: {} } })
    expect(message).toBe("Algo deu errado. Tente novamente.")
  })

  it("uses the caller-supplied fallback instead of the default", () => {
    const message = getAuthErrorMessage(
      { response: { status: 500, data: {} } },
      "Mensagem customizada",
    )
    expect(message).toBe("Mensagem customizada")
  })

  it("falls back (not passes through) when the message is an empty string", () => {
    const message = getAuthErrorMessage({
      response: { status: 400, data: { message: "" } },
    })
    expect(message).toBe("Algo deu errado. Tente novamente.")
  })

})
