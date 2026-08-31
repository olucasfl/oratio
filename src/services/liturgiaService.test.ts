import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("./api", () => ({ default: { get: vi.fn() } }))

import api from "./api"
import { getLiturgiaFull } from "./liturgiaService"

const getMock = (api as unknown as { get: ReturnType<typeof vi.fn> }).get

beforeEach(() => vi.clearAllMocks())

describe("liturgiaService", () => {

  it("requests the full liturgy with the date params and returns the body", async () => {
    getMock.mockResolvedValue({ data: { liturgia: "Domingo" } })
    await expect(getLiturgiaFull("10", "02", 2026)).resolves.toEqual({ liturgia: "Domingo" })
    expect(getMock).toHaveBeenCalledWith("/liturgia/full", { params: { dia: "10", mes: "02", ano: 2026 } })
  })

})
