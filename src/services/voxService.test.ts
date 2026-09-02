import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}))

import api from "./api"
import {
  getBootstrap,
  getActiveConversation,
  createConversation,
  askVox,
  askVoxStream,
  getConversations,
  getMessages,
  deleteConversation,
  renameConversation,
  getVoxProfiles,
  setVoxProfile,
  dismissVoxIntro,
} from "./voxService"

const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

beforeEach(() => {
  vi.clearAllMocks()
})

describe("simple try/catch wrappers", () => {

  it("getBootstrap returns the payload on success", async () => {
    mockedApi.get.mockResolvedValue({ data: { conversations: [] } })
    await expect(getBootstrap()).resolves.toEqual({ conversations: [] })
    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/voxai/bootstrap")
  })

  it("getBootstrap returns a FETCH_ERROR shape on failure, not a thrown error", async () => {
    mockedApi.get.mockRejectedValue(new Error("down"))
    await expect(getBootstrap()).resolves.toEqual({
      error: "FETCH_ERROR",
      message: "Não foi possível carregar suas conversas.",
    })
  })

  it("getActiveConversation returns the payload on success / a FETCH_ERROR shape on failure", async () => {
    mockedApi.get.mockResolvedValue({ data: { id: "c1" } })
    await expect(getActiveConversation()).resolves.toEqual({ id: "c1" })

    mockedApi.get.mockRejectedValue(new Error("down"))
    await expect(getActiveConversation()).resolves.toEqual({
      error: "FETCH_ERROR",
      message: "Não foi possível obter a conversa ativa.",
    })
  })

  it("createConversation posts with no body and returns the created conversation / a FETCH_ERROR shape on failure", async () => {
    mockedApi.post.mockResolvedValue({ data: { id: "c2" } })
    await expect(createConversation()).resolves.toEqual({ id: "c2" })
    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/voxai/conversation")

    mockedApi.post.mockRejectedValue(new Error("down"))
    await expect(createConversation()).resolves.toEqual({
      error: "FETCH_ERROR",
      message: "Não foi possível criar nova conversa.",
    })
  })

  it("getConversations returns the list on success / null on failure", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ id: "c1" }] })
    await expect(getConversations()).resolves.toEqual([{ id: "c1" }])

    mockedApi.get.mockRejectedValue(new Error("down"))
    await expect(getConversations()).resolves.toBeNull()
  })

  it("getMessages returns the messages on success / null on failure", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ id: "m1" }] })
    await expect(getMessages("c1")).resolves.toEqual([{ id: "m1" }])
    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/voxai/conversation/c1")

    mockedApi.get.mockRejectedValue(new Error("down"))
    await expect(getMessages("c1")).resolves.toBeNull()
  })

  it("deleteConversation returns the response on success / null on failure", async () => {
    mockedApi.delete.mockResolvedValue({ data: { ok: true } })
    await expect(deleteConversation("c1")).resolves.toEqual({ ok: true })
    expect(mockedApi.delete).toHaveBeenCalledWith("/oratio/voxai/conversation/c1")

    mockedApi.delete.mockRejectedValue(new Error("down"))
    await expect(deleteConversation("c1")).resolves.toBeNull()
  })

  it("renameConversation PATCHes the title and returns the response / null on failure", async () => {
    mockedApi.patch.mockResolvedValue({ data: { id: "c1", title: "Nova" } })
    await expect(renameConversation("c1", "Nova")).resolves.toEqual({ id: "c1", title: "Nova" })
    expect(mockedApi.patch).toHaveBeenCalledWith("/oratio/voxai/conversation/c1", { title: "Nova" })

    mockedApi.patch.mockRejectedValue(new Error("down"))
    await expect(renameConversation("c1", "Nova")).resolves.toBeNull()
  })

  it("getVoxProfiles returns the catalog on success / an empty list on failure", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ key: "DEFAULT" }] })
    await expect(getVoxProfiles()).resolves.toEqual([{ key: "DEFAULT" }])
    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/voxai/profiles")

    mockedApi.get.mockRejectedValue(new Error("down"))
    await expect(getVoxProfiles()).resolves.toEqual([])
  })

  it("setVoxProfile PATCHes the chosen key and returns the response / null on failure", async () => {
    mockedApi.patch.mockResolvedValue({ data: { profile: "STUDY" } })
    await expect(setVoxProfile("STUDY")).resolves.toEqual({ profile: "STUDY" })
    expect(mockedApi.patch).toHaveBeenCalledWith("/oratio/voxai/profile", { profile: "STUDY" })

    mockedApi.patch.mockRejectedValue(new Error("down"))
    await expect(setVoxProfile("STUDY")).resolves.toBeNull()
  })

  it("dismissVoxIntro POSTs to intro-seen and returns the response / null on failure", async () => {
    mockedApi.post.mockResolvedValue({ data: { ok: true } })
    await expect(dismissVoxIntro()).resolves.toEqual({ ok: true })
    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/voxai/profile/intro-seen")

    mockedApi.post.mockRejectedValue(new Error("down"))
    await expect(dismissVoxIntro()).resolves.toBeNull()
  })

})

describe("askVox", () => {

  it("posts the message + conversationId and returns the reply on success", async () => {
    mockedApi.post.mockResolvedValue({ data: { success: true, reply: "Paz seja convosco" } })

    const result = await askVox("oi", "c1")

    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/voxai/chat", { message: "oi", conversationId: "c1" })
    expect(result).toEqual({ success: true, reply: "Paz seja convosco" })
  })

  it("maps a 429 to LIMIT_EXCEEDED", async () => {
    mockedApi.post.mockRejectedValue({ response: { status: 429 } })
    await expect(askVox("oi", "c1")).resolves.toEqual({
      success: false, error: "LIMIT_EXCEEDED", message: "Limite diário atingido.",
    })
  })

  it("maps a response-less error to NETWORK_ERROR", async () => {
    mockedApi.post.mockRejectedValue({})
    await expect(askVox("oi", "c1")).resolves.toEqual({
      success: false, error: "NETWORK_ERROR", message: "Sem conexão com a internet.",
    })
  })

  it("maps any other error status to AI_PROVIDER_ERROR", async () => {
    mockedApi.post.mockRejectedValue({ response: { status: 500 } })
    await expect(askVox("oi", "c1")).resolves.toEqual({
      success: false, error: "AI_PROVIDER_ERROR", message: "Erro na comunicação com o Vox.",
    })
  })

})

/*
askVoxStream() reaproveita o axios com onDownloadProgress pra ler um SSE
por baixo de um XHR de texto puro. O parser guarda quantas linhas já
processou (processedLines) porque cada callback recebe o texto ACUMULADO
até agora, não só o pedaço novo -- o risco real é processar uma linha
"data: {...}" cortada ao meio antes dela terminar de chegar.
*/
describe("askVoxStream", () => {

  function mockStreamedResponse(chunks: string[], finalData?: string) {
    mockedApi.post.mockImplementation(
      async (_url: string, _body: unknown, config: { onDownloadProgress: (e: unknown) => void }) => {
        for (const chunk of chunks) {
          config.onDownloadProgress({ event: { target: { responseText: chunk } } })
        }
        return { data: finalData ?? chunks[chunks.length - 1] ?? "" }
      },
    )
  }

  it("calls onDelta for each 'delta' event and resolves success once 'done' arrives", async () => {
    const full = 'data: {"type":"delta","text":"Ola "}\n'
      + 'data: {"type":"delta","text":"mundo"}\n'
      + 'data: {"type":"done"}\n'
    mockStreamedResponse([full])
    const onDelta = vi.fn()

    const result = await askVoxStream("oi", "c1", onDelta)

    expect(onDelta).toHaveBeenNthCalledWith(1, "Ola ")
    expect(onDelta).toHaveBeenNthCalledWith(2, "mundo")
    expect(result).toEqual({ success: true })
  })

  it("correctly reassembles an SSE line split mid-way across two progress events", async () => {
    const full = 'data: {"type":"delta","text":"Ola mundo"}\n'
      + 'data: {"type":"done"}\n'
    const midLineCut = full.slice(0, 20) // corta dentro do primeiro "data:" ainda incompleto
    mockStreamedResponse([midLineCut, full], full)
    const onDelta = vi.fn()

    const result = await askVoxStream("oi", "c1", onDelta)

    // se a linha cortada tivesse sido processada cedo demais, isso teria
    // disparado com JSON incompleto ou duplicado a chamada
    expect(onDelta).toHaveBeenCalledTimes(1)
    expect(onDelta).toHaveBeenCalledWith("Ola mundo")
    expect(result).toEqual({ success: true })
  })

  it("returns the error payload when the stream sends an 'error' event", async () => {
    const full = 'data: {"type":"error","error":"CONTENT_FILTERED","message":"Bloqueado","retryAfterSeconds":5}\n'
    mockStreamedResponse([full])

    const result = await askVoxStream("oi", "c1", vi.fn())

    expect(result).toEqual({
      success: false,
      error: "CONTENT_FILTERED",
      message: "Bloqueado",
      retryAfterSeconds: 5,
    })
  })

  it("returns UNKNOWN_ERROR when the stream ends without ever sending a 'done' event", async () => {
    const full = 'data: {"type":"delta","text":"Ola"}\n'
    mockStreamedResponse([full])

    const result = await askVoxStream("oi", "c1", vi.fn())

    expect(result).toEqual({
      success: false,
      error: "UNKNOWN_ERROR",
      message: "A resposta foi interrompida antes de terminar.",
    })
  })

  it("ignores a malformed JSON data line instead of throwing", async () => {
    const full = "data: {not-json\n" + 'data: {"type":"done"}\n'
    mockStreamedResponse([full])

    await expect(askVoxStream("oi", "c1", vi.fn())).resolves.toEqual({ success: true })
  })

  it("ignores a progress event with no accumulated text yet", async () => {
    mockedApi.post.mockImplementation(
      async (_url: string, _body: unknown, config: { onDownloadProgress: (e: unknown) => void }) => {
        config.onDownloadProgress({ event: { target: { responseText: "" } } })
        config.onDownloadProgress({})
        return { data: 'data: {"type":"done"}\n' }
      },
    )

    await expect(askVoxStream("oi", "c1", vi.fn())).resolves.toEqual({ success: true })
  })

  it("maps a 429 to LIMIT_EXCEEDED", async () => {
    mockedApi.post.mockRejectedValue({ response: { status: 429 } })
    await expect(askVoxStream("oi", "c1", vi.fn())).resolves.toEqual({
      success: false, error: "LIMIT_EXCEEDED", message: "Limite diário atingido.",
    })
  })

  it("maps a response-less error to NETWORK_ERROR", async () => {
    mockedApi.post.mockRejectedValue({})
    await expect(askVoxStream("oi", "c1", vi.fn())).resolves.toEqual({
      success: false, error: "NETWORK_ERROR", message: "Sem conexão com a internet.",
    })
  })

  it("maps any other error status to AI_PROVIDER_ERROR", async () => {
    mockedApi.post.mockRejectedValue({ response: { status: 500 } })
    await expect(askVoxStream("oi", "c1", vi.fn())).resolves.toEqual({
      success: false, error: "AI_PROVIDER_ERROR", message: "Erro na comunicação com o Vox.",
    })
  })

})
