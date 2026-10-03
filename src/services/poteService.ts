import api from "./api"
import type { Classification } from "../pages/Pote/domain/score"

/*
 "O Pote" — dinâmica multiplayer (spec mestra: oratio-api/docs/specs/pote.md).
 Espelha o contrato de `oratio-api/src/modules/pote/`. O servidor é a fonte da
 verdade: toda ação devolve o estado completo de quem chamou, e o tempo real é
 um polling de ~1 s em `getRoom(code, since)`.
*/

export type PotePhase =
  | "LOBBY"
  | "ROUND_1"
  | "RESULT_1"
  | "PARABLE"
  | "ROUND_2"
  | "FINAL"
  | "ENDED"
  | "CANCELLED"

export interface RoomView {
  code: string
  phase: PotePhase
  isPaused: boolean
  round2EndsAt: string | null
  round2RemainingMs: number | null
  serverNow: string
}

export interface PlayerRound1 {
  status: string
  index: number
  total: number
  currentItemId: string | null
  /** Itens que já passaram (a ordem é sorteada por jogador; o que vem por aí não é revelado). */
  seen: string[]
  placed: string[]
  free: number
  gaps: number
  fun: number
  /** null até o RESULT_1: a Vida da rodada 1 é a "surpresa". */
  life: number | null
  penalty: number | null
  rocksIn: number
  rocksMissing: string[]
  sandTired: boolean
}

export interface PlayerRound2 {
  status: string
  placed: string[]
  free: number
  gaps: number
  spaceLeft: number
  fun: number
  life: number
  combos: string[]
  rocksIn: number
  sandTired: boolean
  classification: Classification | null
}

export interface PlayerMe {
  displayName: string
  round1: PlayerRound1
  round2: PlayerRound2
  commitment: string | null
}

export interface PlayerState {
  changed: true
  version: number
  role: "PLAYER"
  removed?: undefined
  room: RoomView
  me: PlayerMe
  /** Só no LOBBY: quem já entrou na sala (nomes de exibição), em ordem de chegada. */
  lobby?: { players: { displayName: string; isMe: boolean }[] }
  progress: { total: number; round1Finished: number; round2Finished: number }
}

export interface RemovedState {
  changed: true
  version: number
  role: "PLAYER"
  removed: true
  room: RoomView
}

export interface LeaderPlayer {
  userId: string
  displayName: string
  joined: boolean
  connected: boolean
  round1: {
    status: string
    index: number
    total: number
    fill: number
    rocksIn: number
    rocksMissing: string[]
  }
  round2: {
    status: string
    fill: number
    spaceLeft: number
    rocksIn: number
    fun: number
    life: number
    classification: Classification | null
  }
}

export interface CountedItem {
  id: string
  count: number
}

export interface PoteStats {
  players: number
  round1: {
    finished: number
    withAllRocks: number
    mostMissedRock: CountedItem | null
    mostTakenSand: CountedItem | null
  }
  round2: {
    finished: number
    topChosen: CountedItem[]
    topLeftOut: CountedItem[]
    mostActivatedCombo: CountedItem | null
    avgFun: number
    avgLife: number
    withAllRocks: number
  }
  classifications: Record<Classification, number>
}

export interface LeaderState {
  changed: true
  version: number
  role: "LEADER"
  room: RoomView
  players: LeaderPlayer[]
  joinedCount: number
  invitedCount: number
  stats: PoteStats
}

export type RoomState = PlayerState | RemovedState | LeaderState
export type RoomResponse = RoomState | { changed: false; version: number }

export interface MyRoom {
  code: string
  phase: PotePhase
  createdAt: string
  invited: number
}

export interface SearchUser {
  id: string
  name: string
  email: string
}

const base = (code: string) => `/oratio/pote/rooms/${code}`

// ── admin ──

export const createRoom = async (): Promise<{ code: string }> =>
  (await api.post("/oratio/pote/rooms")).data

export const listMyRooms = async (): Promise<MyRoom[]> =>
  (await api.get("/oratio/pote/rooms/mine")).data

export const searchUsers = async (q: string): Promise<SearchUser[]> =>
  (await api.get("/oratio/pote/users/search", { params: { q } })).data

export const inviteUsers = async (
  code: string,
  userIds: string[],
): Promise<{ invited: number; alreadyInvited: number }> =>
  (await api.post(`${base(code)}/invites`, { userIds })).data

// ── estado ──

export const getRoom = async (code: string, since?: number): Promise<RoomResponse> =>
  (await api.get(base(code), { params: since === undefined ? {} : { since } })).data

export const joinRoom = async (code: string): Promise<RoomState> =>
  (await api.post(`${base(code)}/join`)).data

// ── líder ──

export const setPhase = async (code: string, to: PotePhase): Promise<RoomState> =>
  (await api.post(`${base(code)}/phase`, { to })).data

export const setPaused = async (code: string, paused: boolean): Promise<RoomState> =>
  (await api.post(`${base(code)}/pause`, { paused })).data

export const extendRound2 = async (code: string): Promise<RoomState> =>
  (await api.post(`${base(code)}/extend`)).data

export const removePlayer = async (code: string, userId: string): Promise<RoomState> =>
  (await api.delete(`${base(code)}/players/${userId}`)).data

export const cancelRoom = async (code: string): Promise<RoomState> =>
  (await api.post(`${base(code)}/cancel`)).data

// ── jogador ──

export const tutorialDone = async (code: string): Promise<RoomState> =>
  (await api.post(`${base(code)}/round1/tutorial-done`)).data

export const round1Action = async (
  code: string,
  index: number,
  action: "TAKE" | "PASS",
): Promise<RoomState> =>
  (await api.post(`${base(code)}/round1/action`, { index, action })).data

export const round2Place = async (code: string, itemId: string): Promise<RoomState> =>
  (await api.post(`${base(code)}/round2/place`, { itemId })).data

export const round2Remove = async (code: string, itemId: string): Promise<RoomState> =>
  (await api.post(`${base(code)}/round2/remove`, { itemId })).data

/**
 * Define o pote da rodada 2 de uma vez: manda a lista que o jogador QUER ter e o servidor
 * valida tudo junto. Vários toques seguidos viram um pedido só (o que mais pesa quando a
 * rede ou o servidor estão lentos).
 */
export const round2Sync = async (code: string, placed: string[]): Promise<RoomState> =>
  (await api.post(`${base(code)}/round2/sync`, { placed })).data

export const round2Finish = async (code: string): Promise<RoomState> =>
  (await api.post(`${base(code)}/round2/finish`)).data


/** Mensagem legível de um erro do backend (`message` do Nest) ou um texto padrão. */
export function poteErrorMessage(err: unknown, fallback = "Algo deu errado. Tente de novo."): string {
  const data = (err as { response?: { data?: { message?: unknown } } })?.response?.data
  const message = data?.message
  if (Array.isArray(message)) return String(message[0] ?? fallback)
  return typeof message === "string" && message ? message : fallback
}

export function poteErrorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status
}
