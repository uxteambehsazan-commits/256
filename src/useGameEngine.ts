import { useReducer, useEffect, useCallback } from 'react'
import type { GameState, GameAction, Player, TeamState } from './types'
import { MISSIONS, LOGIC_PUZZLES, SPEED_EMOJIS, generateRoomCode } from './constants'

let _nextId = 1
const makeId = () => `p${_nextId++}`

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateSpeedTargets() {
  const set = SPEED_EMOJIS[Math.floor(Math.random() * SPEED_EMOJIS.length)]
  const shuffled = shuffleArray([...set]).slice(0, 9)
  const targetIdx = Math.floor(Math.random() * shuffled.length)
  return shuffled.map((emoji, i) => ({
    id: i, emoji, isTarget: i === targetIdx,
    x: (i % 3) * 30 + 10, y: Math.floor(i / 3) * 30 + 10,
  }))
}

function buildTurnOrder(players: Player[], offset: number): string[] {
  const active = players.filter(p => p.connected)
  if (!active.length) return []
  const start = offset % active.length
  return [...active.slice(start), ...active.slice(0, start)].map(p => p.id)
}

function calcRankings(players: Player[]): Player[] {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.totalResponseTime !== b.totalResponseTime) return a.totalResponseTime - b.totalResponseTime
    return a.joinedAt - b.joinedAt
  })
  return players.map(p => ({ ...p, rank: sorted.findIndex(s => s.id === p.id) + 1 }))
}

function applyResults(
  players: Player[],
  results: GameState['playerResults']
): Player[] {
  const updated = players.map(p => {
    const r = results[p.id]
    if (!r) return p
    return { ...p, score: p.score + r.missionScore, missionScore: r.missionScore, totalResponseTime: p.totalResponseTime + r.responseTime }
  })
  return calcRankings(updated)
}

const initial: GameState = {
  phase: 'HOME', players: [], hostId: '',
  currentMissionIndex: 0, missionStartOffset: 0,
  turnOrder: [], currentTurnIndex: 0, timeLeft: 0,
  submitted: {}, playerResults: {},
  goSignalTime: null, teamState: null,
  finalClicks: {}, logicQuestion: null, speedTargets: null,
  showCountdownValue: 3, missionIntroCountdown: 3, memoryBoards: {},
}

function startMissionPhase(state: GameState): GameState {
  const mi = state.currentMissionIndex
  const mission = MISSIONS[mi]
  const turnOrder = buildTurnOrder(state.players, state.missionStartOffset)

  let extra: Partial<GameState> = {}
  if (mission.id === 'LOGIC') {
    extra.logicQuestion = LOGIC_PUZZLES[Math.floor(Math.random() * LOGIC_PUZZLES.length)]
  } else if (mission.id === 'SPEED') {
    extra.speedTargets = generateSpeedTargets()
  } else if (mission.type === 'cooperative') {
    const seq = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7])
    extra.teamState = { sequence: seq, activated: [], success: false, failed: false }
  }

  // For turn missions, start with MISSION_INTRO; then move to PLAYING
  return {
    ...state, ...extra,
    phase: 'MISSION_INTRO',
    turnOrder, currentTurnIndex: 0,
    timeLeft: 3, // intro countdown
    submitted: {}, playerResults: {},
    goSignalTime: null, finalClicks: {},
    missionIntroCountdown: 3,
  }
}

function startCurrentTurn(state: GameState): GameState {
  const mission = MISSIONS[state.currentMissionIndex]
  return { ...state, phase: 'PLAYING', timeLeft: mission.timer }
}

function doEndMission(state: GameState): GameState {
  const mission = MISSIONS[state.currentMissionIndex]
  if (mission.id === 'FINAL') {
    const results: GameState['playerResults'] = {}
    const sorted = Object.entries(state.finalClicks).sort((a, b) => b[1] - a[1])
    state.players.forEach(p => {
      const clicks = state.finalClicks[p.id] || 0
      const isFirst = sorted[0]?.[0] === p.id
      const missionScore = (clicks * 10 + (isFirst ? 200 : 0)) * 2
      results[p.id] = { playerId: p.id, missionScore, detail: `${clicks} کلیک ×۲`, responseTime: 0 }
    })
    const players = applyResults(state.players, results)
    return { ...state, players, playerResults: results, phase: 'MISSION_RESULT' }
  }
  const players = applyResults(state.players, state.playerResults)
  return { ...state, players, phase: 'MISSION_RESULT' }
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'CREATE_GAME': {
      if (state.players.length >= 8) return state
      const id = makeId()
      const player: Player = {
        id, name: action.name, avatar: action.avatar, colorIndex: action.colorIndex,
        score: 0, missionScore: 0, rank: 0, ready: true,
        connected: true, totalResponseTime: 0, joinedAt: Date.now(),
      }
      return { ...state, phase: 'LOBBY', players: [player], hostId: id }
    }

    case 'ADD_PLAYER': {
      if (state.players.length >= 8) return state
      const id = makeId()
      const player: Player = {
        id, name: action.name, avatar: action.avatar, colorIndex: action.colorIndex,
        score: 0, missionScore: 0, rank: 0, ready: false,
        connected: true, totalResponseTime: 0, joinedAt: Date.now(),
      }
      return { ...state, players: [...state.players, player], hostId: state.hostId || id }
    }

    case 'REMOVE_PLAYER': {
      const players = state.players.filter(p => p.id !== action.id)
      return { ...state, players, hostId: state.hostId === action.id ? (players[0]?.id || '') : state.hostId }
    }

    case 'TOGGLE_READY': {
      return { ...state, players: state.players.map(p => p.id === action.id ? { ...p, ready: !p.ready } : p) }
    }

    case 'START_GAME': {
      return { ...state, phase: 'COUNTDOWN', showCountdownValue: 3, timeLeft: 4,
        currentMissionIndex: 0, missionStartOffset: 0 }
    }

    case 'COUNTDOWN_TICK': {
      const v = state.showCountdownValue - 1
      if (v <= 0) return startMissionPhase(state)
      return { ...state, showCountdownValue: v }
    }

    case 'TIMER_TICK': {
      const t = state.timeLeft - 1

      if (state.phase === 'MISSION_INTRO') {
        if (t <= 0) return startCurrentTurn(state)
        return { ...state, timeLeft: t, missionIntroCountdown: t }
      }

      if (state.phase === 'PLAYING') {
        if (t <= 0) {
          const mission = MISSIONS[state.currentMissionIndex]
          if (mission.type === 'turn') {
            const pid = state.turnOrder[state.currentTurnIndex]
            const sub = { ...state.submitted, [pid]: true }
            const res = {
              ...state.playerResults,
              [pid]: state.playerResults[pid] || { playerId: pid, missionScore: 0, detail: 'زمان تمام شد', responseTime: mission.timer },
            }
            const s2 = { ...state, submitted: sub, playerResults: res, timeLeft: 0 }
            // check if last turn
            if (state.currentTurnIndex + 1 >= state.turnOrder.length) {
              return doEndMission(s2)
            }
            return { ...s2, phase: 'TURN_TRANSITION' }
          }
          if (mission.type === 'cooperative') {
            const ts = state.teamState!
            if (!ts.success) {
              const res: GameState['playerResults'] = {}
              state.players.forEach(p => { res[p.id] = { playerId: p.id, missionScore: 0, detail: 'تیم شکست خورد!', responseTime: 0 } })
              const players = applyResults(state.players, res)
              return { ...state, players, playerResults: res, teamState: { ...ts, failed: true }, phase: 'MISSION_RESULT', timeLeft: 0 }
            }
          }
          return doEndMission({ ...state, timeLeft: 0 })
        }
        return { ...state, timeLeft: t }
      }

      return { ...state, timeLeft: Math.max(0, t) }
    }

    case 'GO_SIGNAL':
      return { ...state, goSignalTime: Date.now() }

    case 'SPEED_HIT': {
      if (state.submitted[action.playerId]) return state
      const base = action.isCorrect ? 100 : -25
      const bonus = action.isCorrect ? Math.round(Math.max(0, 100 * (1 - action.responseTime / 15))) : 0
      const ms = base + bonus
      const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: ms, detail: action.isCorrect ? `درست! +${base} بونوس+${bonus}` : `اشتباه`, responseTime: action.responseTime } }
      const sub = { ...state.submitted, [action.playerId]: true }
      const s2 = { ...state, submitted: sub, playerResults: res }
      if (state.currentTurnIndex + 1 >= state.turnOrder.length) return doEndMission(s2)
      return { ...s2, phase: 'TURN_TRANSITION' }
    }

    case 'PLAYER_SUBMIT': {
      if (state.submitted[action.playerId]) return state
      let ms = 0; let detail = ''
      const mission = MISSIONS[state.currentMissionIndex]
      if (mission.id === 'LOGIC') {
        const ok = state.logicQuestion?.answer === action.answer
        ms = ok ? 150 : 0; detail = ok ? 'درست! +۱۵۰' : 'اشتباه'
      } else if (mission.id === 'MEMORY') {
        ms = action.answer as number; detail = `${ms} امتیاز`
      }
      const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: ms, detail, responseTime: action.responseTime } }
      const sub = { ...state.submitted, [action.playerId]: true }
      const s2 = { ...state, submitted: sub, playerResults: res }
      if (state.currentTurnIndex + 1 >= state.turnOrder.length) return doEndMission(s2)
      return { ...s2, phase: 'TURN_TRANSITION' }
    }

    case 'FASTEST_PRESS': {
      if (state.submitted[action.playerId]) return state
      const sub = { ...state.submitted, [action.playerId]: true }
      if (!state.goSignalTime) {
        const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: -50, detail: 'استارت زود! ۵۰-', responseTime: 0 } }
        const s2 = { ...state, submitted: sub, playerResults: res }
        const allDone = state.players.filter(p => p.connected).every(p => sub[p.id])
        return allDone ? doEndMission(s2) : s2
      }
      const rt = (action.timestamp - state.goSignalTime) / 1000
      const prevCount = Object.values(state.playerResults).filter(r => r.missionScore > 0).length
      const scoreArr = [300, 200, 100]; const ms = scoreArr[prevCount] ?? 50
      const detail = prevCount === 0 ? '🥇 اول! +۳۰۰' : prevCount === 1 ? '🥈 دوم! +۲۰۰' : prevCount === 2 ? '🥉 سوم! +۱۰۰' : '+۵۰'
      const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: ms, detail, responseTime: rt } }
      const s2 = { ...state, submitted: sub, playerResults: res }
      const allDone = state.players.filter(p => p.connected).every(p => sub[p.id])
      return allDone ? doEndMission(s2) : s2
    }

    case 'TEAM_CLICK': {
      const ts = state.teamState
      if (!ts || ts.success || ts.failed) return state
      const expected = ts.sequence[ts.activated.length]
      if (action.componentId !== expected) return state
      const activated = [...ts.activated, action.componentId]
      const success = activated.length === ts.sequence.length
      const newTs: TeamState = { ...ts, activated, success }
      if (success) {
        const res: GameState['playerResults'] = {}
        state.players.forEach(p => { res[p.id] = { playerId: p.id, missionScore: 300, detail: 'تیم برنده! +۳۰۰', responseTime: 0 } })
        return { ...state, teamState: newTs, players: applyResults(state.players, res), playerResults: res, phase: 'MISSION_RESULT' }
      }
      return { ...state, teamState: newTs }
    }

    case 'FINAL_CLICK': {
      if (state.phase !== 'PLAYING') return state
      return { ...state, finalClicks: { ...state.finalClicks, [action.playerId]: (state.finalClicks[action.playerId] || 0) + 1 } }
    }

    case 'ADVANCE_TURN': {
      const nextIdx = state.currentTurnIndex + 1
      if (nextIdx >= state.turnOrder.length) return doEndMission(state)
      const mission = MISSIONS[state.currentMissionIndex]
      let extra: Partial<GameState> = {}
      if (mission.id === 'SPEED') extra.speedTargets = generateSpeedTargets()
      if (mission.id === 'LOGIC') extra.logicQuestion = LOGIC_PUZZLES[Math.floor(Math.random() * LOGIC_PUZZLES.length)]
      return { ...state, ...extra, currentTurnIndex: nextIdx, phase: 'PLAYING', timeLeft: mission.timer }
    }

    case 'END_MISSION': return doEndMission(state)

    case 'SHOW_LEADERBOARD': return { ...state, phase: 'LEADERBOARD' }

    case 'NEXT_MISSION': {
      const nextIdx = state.currentMissionIndex + 1
      if (nextIdx >= MISSIONS.length) return { ...state, phase: 'WINNER_CEREMONY' }
      return startMissionPhase({ ...state, currentMissionIndex: nextIdx, missionStartOffset: state.missionStartOffset + 1, submitted: {}, playerResults: {}, goSignalTime: null, teamState: null, finalClicks: {}, memoryBoards: {} })
    }

    case 'REPLAY': {
      const players = state.players.map(p => ({ ...p, score: 0, missionScore: 0, rank: 0, ready: false, totalResponseTime: 0 }))
      return { ...initial, phase: 'LOBBY', players, hostId: state.hostId }
    }

    case 'NEW_PLAYERS':
      return { ...initial, phase: 'HOME' }

    case 'LOAD_REMOTE_STATE':
      return { ...(action as any).state }

    default: return state
  }
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(reducer, initial)

  useEffect(() => {
    if (state.phase === 'COUNTDOWN') {
      const t = setInterval(() => dispatch({ type: 'COUNTDOWN_TICK' }), 1000)
      return () => clearInterval(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'MISSION_INTRO' || state.phase === 'PLAYING') {
      const t = setInterval(() => dispatch({ type: 'TIMER_TICK' }), 1000)
      return () => clearInterval(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'PLAYING') {
      const mission = MISSIONS[state.currentMissionIndex]
      if (mission.id === 'FASTEST' && !state.goSignalTime) {
        const delay = 2000 + Math.random() * 4000
        const t = setTimeout(() => dispatch({ type: 'GO_SIGNAL' }), delay)
        return () => clearTimeout(t)
      }
    }
  }, [state.phase, state.currentMissionIndex, state.goSignalTime])

  useEffect(() => {
    if (state.phase === 'TURN_TRANSITION') {
      const t = setTimeout(() => dispatch({ type: 'ADVANCE_TURN' }), 1400)
      return () => clearTimeout(t)
    }
  }, [state.phase, state.currentTurnIndex])

  useEffect(() => {
    if (state.phase === 'MISSION_RESULT') {
      const t = setTimeout(() => dispatch({ type: 'SHOW_LEADERBOARD' }), 3500)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'LEADERBOARD') {
      const t = setTimeout(() => dispatch({ type: 'NEXT_MISSION' }), 4500)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  const currentPlayer = useCallback(() => {
    if (state.turnOrder.length === 0) return null
    const id = state.turnOrder[state.currentTurnIndex]
    return state.players.find(p => p.id === id) || null
  }, [state.turnOrder, state.currentTurnIndex, state.players])

  const getPlayer = useCallback((id: string) => state.players.find(p => p.id === id), [state.players])

  return { state, dispatch, currentPlayer, getPlayer }
}
