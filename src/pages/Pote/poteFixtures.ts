import type {
  LeaderPlayer,
  LeaderState,
  PlayerMe,
  PlayerRound1,
  PlayerRound2,
  PlayerState,
  PotePhase,
  PoteStats,
  RoomView,
} from "../../services/poteService"

/* Fábricas de estado para os testes das telas do Pote (dados sintéticos). */

export const room = (phase: PotePhase, over: Partial<RoomView> = {}): RoomView => ({
  code: "1234",
  phase,
  isPaused: false,
  round2EndsAt: null,
  round2RemainingMs: null,
  serverNow: new Date().toISOString(),
  ...over,
})

export const round1 = (over: Partial<PlayerRound1> = {}): PlayerRound1 => ({
  status: "PLAYING",
  index: 0,
  total: 19,
  currentItemId: "reels",
  seen: [],
  placed: [],
  free: 100,
  gaps: 0,
  fun: 0,
  life: null,
  penalty: null,
  rocksIn: 0,
  rocksMissing: [],
  sandTired: false,
  ...over,
})

export const round2 = (over: Partial<PlayerRound2> = {}): PlayerRound2 => ({
  status: "PLAYING",
  placed: [],
  free: 100,
  gaps: 0,
  spaceLeft: 100,
  fun: 0,
  life: 0,
  combos: [],
  rocksIn: 0,
  sandTired: false,
  classification: null,
  ...over,
})

export const playerState = (
  phase: PotePhase,
  me: Partial<PlayerMe> = {},
  roomOver: Partial<RoomView> = {},
): PlayerState => ({
  changed: true,
  version: 1,
  role: "PLAYER",
  room: room(phase, roomOver),
  me: { displayName: "Ana", round1: round1(), round2: round2(), commitment: null, ...me },
  progress: { total: 2, round1Finished: 0, round2Finished: 0 },
})

export const emptyStats = (): PoteStats => ({
  players: 0,
  round1: { finished: 0, withAllRocks: 0, mostMissedRock: null, mostTakenSand: null },
  round2: {
    finished: 0,
    topChosen: [],
    topLeftOut: [],
    mostActivatedCombo: null,
    avgFun: 0,
    avgLife: 0,
    withAllRocks: 0,
  },
  classifications: { PLENA: 0, PESADA: 0, VAZIA: 0, CORRIDA: 0 },
})

export const leaderPlayer = (over: Partial<LeaderPlayer> = {}): LeaderPlayer => ({
  userId: "u1",
  displayName: "Ana",
  joined: true,
  connected: true,
  round1: { status: "PLAYING", index: 12, total: 19, fill: 40, rocksIn: 0, rocksMissing: [] },
  round2: { status: "WAITING", fill: 0, spaceLeft: 100, rocksIn: 0, fun: 0, life: 0, classification: null },
  ...over,
})

export const leaderState = (
  phase: PotePhase,
  players: LeaderPlayer[] = [leaderPlayer()],
  over: Partial<LeaderState> = {},
): LeaderState => ({
  changed: true,
  version: 1,
  role: "LEADER",
  room: room(phase),
  players,
  joinedCount: players.filter((p) => p.joined).length,
  invitedCount: players.length,
  stats: emptyStats(),
  ...over,
})
