import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../utils/deviceDetect", () => ({
  isIOSDevice: vi.fn(),
  isAndroidDevice: vi.fn(),
}))

vi.mock("../../utils/installPrompt", () => ({
  canInstallDirectly: vi.fn(),
  promptInstall: vi.fn(),
}))

vi.mock("../../utils/overlayCoordinator", () => ({
  markOverlayOpen: vi.fn(),
  markOverlayClosed: vi.fn(),
}))

import { isIOSDevice, isAndroidDevice } from "../../utils/deviceDetect"
import { canInstallDirectly, promptInstall } from "../../utils/installPrompt"
import { markOverlayOpen, markOverlayClosed } from "../../utils/overlayCoordinator"
import InstallAppModal from "./InstallAppModal"

const isIOSMock = isIOSDevice as unknown as ReturnType<typeof vi.fn>
const isAndroidMock = isAndroidDevice as unknown as ReturnType<typeof vi.fn>
const canInstallMock = canInstallDirectly as unknown as ReturnType<typeof vi.fn>
const promptInstallMock = promptInstall as unknown as ReturnType<typeof vi.fn>
const markOpenMock = markOverlayOpen as unknown as ReturnType<typeof vi.fn>
const markClosedMock = markOverlayClosed as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  isIOSMock.mockReturnValue(false)
  isAndroidMock.mockReturnValue(false)
  canInstallMock.mockReturnValue(false)
})

describe("InstallAppModal", () => {

  it("renders nothing when closed", () => {
    render(<InstallAppModal open={false} onClose={vi.fn()} />)
    expect(screen.queryByText("Leve o Oratio com você")).not.toBeInTheDocument()
  })

  it("marks the overlay open while shown, closed on unmount", () => {
    const { unmount } = render(<InstallAppModal open onClose={vi.fn()} />)
    expect(markOpenMock).toHaveBeenCalledWith("install-app")

    unmount()
    expect(markClosedMock).toHaveBeenCalledWith("install-app")
  })

  it("shows the iOS share-sheet steps on iOS", () => {
    isIOSMock.mockReturnValue(true)
    render(<InstallAppModal open onClose={vi.fn()} />)

    expect(screen.getByText(/Adicionar à Tela de Início/)).toBeInTheDocument()
  })

  it("shows the Android browser-menu steps when Android can't install directly", () => {
    isAndroidMock.mockReturnValue(true)
    canInstallMock.mockReturnValue(false)
    render(<InstallAppModal open onClose={vi.fn()} />)

    expect(screen.getByText(/Toque no menu/)).toBeInTheDocument()
  })

  it("skips the tutorial entirely on Android when the browser can install directly", () => {
    isAndroidMock.mockReturnValue(true)
    canInstallMock.mockReturnValue(true)
    render(<InstallAppModal open onClose={vi.fn()} />)

    expect(screen.queryByText(/Toque no menu/)).not.toBeInTheDocument()
    expect(screen.getByText("Instalar agora")).toBeInTheDocument()
  })

  it("shows the generic desktop step on neither iOS nor Android", () => {
    render(<InstallAppModal open onClose={vi.fn()} />)
    expect(screen.getByText(/barra de endereço do navegador/)).toBeInTheDocument()
  })

  it("shows 'Instalar agora' and triggers the native prompt, closing only if accepted", async () => {
    canInstallMock.mockReturnValue(true)
    promptInstallMock.mockResolvedValue(true)
    const onClose = vi.fn()

    render(<InstallAppModal open onClose={onClose} />)
    fireEvent.click(screen.getByText("Instalar agora"))

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })

  it("does not close when the native prompt is dismissed", async () => {
    canInstallMock.mockReturnValue(true)
    promptInstallMock.mockResolvedValue(false)
    const onClose = vi.fn()

    render(<InstallAppModal open onClose={onClose} />)
    fireEvent.click(screen.getByText("Instalar agora"))

    await vi.waitFor(() => expect(promptInstallMock).toHaveBeenCalled())
    expect(onClose).not.toHaveBeenCalled()
  })

  it("shows 'Entendi' (no native prompt) when direct install isn't available, and it just closes", () => {
    canInstallMock.mockReturnValue(false)
    const onClose = vi.fn()

    render(<InstallAppModal open onClose={onClose} />)
    fireEvent.click(screen.getByText("Entendi"))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(promptInstallMock).not.toHaveBeenCalled()
  })

  it("closes on backdrop click but not on modal content click", () => {
    const onClose = vi.fn()
    render(<InstallAppModal open onClose={onClose} />)

    fireEvent.click(screen.getByText("Leve o Oratio com você"))
    expect(onClose).not.toHaveBeenCalled()
  })

})
