export type Phase =
  | 'HOME'
  | 'LOBBY'
  | 'COUNTDOWN'
  | 'MISSION_INTRO'
  | 'TURN_TRANSITION'
  | 'PLAYING'
  | 'MISSION_RESULT'
  | 'LEADERBOARD'
  | 'WINNER_CEREMONY'

export type MissionType = 'turn' | 'simultaneous' | 'cooperative'

export interface MissionConfig {
  id: string
  name: string
  emoji: string
  fullName: string
  type: MissionType
  timer: number
  desc: string
  scoring: string
}

export interface Player {
  id: string
  name: string
  avatar: string
  colorIndex: number
  score: number
  missionScore: number
  rank: number
  ready: boolean
  connected: boolean
  totalResponseTime: number
  joinedAt: number
}

export interface MemoryBoard {
  cards: MemoryCard[]
  flipped: number[]
  matched: number[]
  score: number
  moves: number
  finished: boolean
}

export interface MemoryCard {
  id: number
  emoji: string
  pairId: number
}

export interface LogicQuestion {
  sequence: string[]
  options: string[]
  answer: number
  hint: string
}

export interface PlayerResult {
  playerId: string
  missionScore: number
  detail: string
  responseTime: number
}

export interface TeamState {
  sequence: number[]          // correct order
  activated: number[]         // clicked in order so far
  success: boolean
  failed: boolean
}

export interface FastestFingerState {
  goTime: number | null       // timestamp when GO appeared
  responses: Record<string, number>  // playerId → timestamp pressed
  falseStarts: Record<string, boolean>
}

export interface GameState {
  phase: Phase
  players: Player[]
  hostId: string
  currentMissionIndex: number
  missionStartOffset: number
  turnOrder: string[]
  currentTurnIndex: number
  timeLeft: number
  submitted: Record<string, boolean>
  playerResults: Record<string, PlayerResult>
  goSignalTime: number | null
  teamState: TeamState | null
  memoryBoards: Record<string, MemoryBoard>
  finalClicks: Record<string, number>
  logicQuestion: LogicQuestion | null
  speedTargets: SpeedTarget[] | null
  showCountdownValue: number
  missionIntroCountdown: number
}

export interface SpeedTarget {
  id: number
  emoji: string
  isTarget: boolean
  x: number
  y: number
}

export type GameAction =
  | { type: 'CREATE_GAME'; name: string; avatar: string; colorIndex: number }
  | { type: 'ADD_PLAYER'; name: string; avatar: string; colorIndex: number }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'TOGGLE_READY'; id: string }
  | { type: 'START_GAME' }
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'BEGIN_MISSION' }
  | { type: 'BEGIN_TURN' }
  | { type: 'TIMER_TICK' }
  | { type: 'PLAYER_SUBMIT'; playerId: string; answer: any; responseTime: number }
  | { type: 'SPEED_HIT'; playerId: string; isCorrect: boolean; responseTime: number }
  | { type: 'MEMORY_FLIP'; playerId: string; cardIndex: number }
  | { type: 'FASTEST_PRESS'; playerId: string; timestamp: number }
  | { type: 'TEAM_CLICK'; componentId: number }
  | { type: 'FINAL_CLICK'; playerId: string }
  | { type: 'GO_SIGNAL' }
  | { type: 'ADVANCE_TURN' }
  | { type: 'END_MISSION' }
  | { type: 'SHOW_LEADERBOARD' }
  | { type: 'NEXT_MISSION' }
  | { type: 'REPLAY' }
  | { type: 'NEW_PLAYERS' }
  | { type: 'LOAD_REMOTE_STATE'; state: GameState }
