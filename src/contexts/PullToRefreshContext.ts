/* v8 ignore file -- createContext + tipos, sem lógica própria; exercitado via usePullToRefresh.test.tsx */
import { createContext } from "react"

export type RefreshHandler = () => Promise<void>

export interface PullToRefreshContextValue{
 register: (handler: RefreshHandler | null) => void
}

export const PullToRefreshContext =
 createContext<PullToRefreshContextValue | null>(null)
