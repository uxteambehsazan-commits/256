import { useState, useCallback, useRef, useEffect } from 'react'
import { useGameEngine } from './useGameEngine'
import { useOnlineRoom, type JoinInfo } from './lib/useOnlineRoom'
import { MISSIONS } from './constants'
import type { GameState, GameAction } from './types'
import Home from './screens/Home'
import Lobby from './screens/Lobby'
import GameCountdown from './screens/GameCountdown'
import MissionIntro from './screens/MissionIntro'
import TurnTransition from './screens/TurnTransition'
import SpeedAttack from './missions/SpeedAttack'
import MemoryMaster from './missions/MemoryMaster'
import LogicBreaker from './missions/LogicBreaker'
import FastestFinger from './missions/FastestFinger'
import TeamChallenge from './missions/TeamChallenge'
import FinalMission from './missions/FinalMission'
import MissionBriefing from './screens/MissionBriefing'
import MissionResult from './screens/MissionResult'
import Leaderboard from './screens/Leaderboard'
import WinnerCeremony from './screens/WinnerCeremony'
import HighScores from './screens/HighScores'
import Credits from './screens/Credits'
import Tutorial from './screens/Tutorial'

export interface OnlineSession {
  code: string
  playerId: string
  isHost: boolean
  joinInfo?: JoinInfo
}

function MissionRenderer({ state, dispatch }: { state: GameState; dispatch: React.Dispatch<GameAction> }) {
  const mId = MISSIONS[state.currentMissionIndex]?.id
  const props = { state, dispatch }
  if (mId === 'SPEED') return <SpeedAttack {...props} />
  if (mId === 'MEMORY') return <MemoryMaster {...props} />
  if (mId === 'LOGIC') return <LogicBreaker {...props} />
  if (mId === 'FASTEST') return <FastestFinger {...props} />
  if (mId === 'TEAM') return <TeamChallenge {...props} />
  if (mId === 'FINAL') return <FinalMission {...props} />
  return null
}

function OnlineGame({ session, localEngine, onShowScores }: {
  session: OnlineSession
  localEngine: ReturnType<typeof useGameEngine>
  onShowScores: () => void
}) {
  const { state, dispatch } = localEngine
  const [remoteState, setRemoteState] = useState<GameState | null>(null)
  const phaseRef = useRef(state.phase)
  phaseRef.current = state.phase

  const handleRemoteState = useCallback((s: GameState) => {
    setRemoteState(s)
    // First broadcast received — load state to transition out of HOME
    if (!session.isHost && phaseRef.current === 'HOME') {
      dispatch({ type: 'LOAD_REMOTE_STATE', state: s } as any)
    }
  }, [session.isHost, dispatch])

  const { sendAction } = useOnlineRoom({
    code: session.code,
    isHost: session.isHost,
    state,
    dispatch,
    onRemoteState: handleRemoteState,
    joinInfo: session.joinInfo,
  })

  const displayState = session.isHost ? state : (remoteState ?? state)
  const effectiveDispatch = session.isHost ? dispatch : sendAction

  // Non-host waiting for first state broadcast
  if (!session.isHost && displayState.phase === 'HOME') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 game-bg" dir="rtl">
        <div className="text-4xl animate-spin" style={{ animationDuration: '1.2s' }}>⚙️</div>
        <p className="font-display text-xl font-black text-white">در حال اتصال به اتاق...</p>
        <p className="text-sm" style={{ color: '#6D6E71' }}>کد: <span style={{ color: '#CC2229' }}>{session.code}</span></p>
      </div>
    )
  }

  return <GameScreen state={displayState} dispatch={effectiveDispatch} session={session} onShowScores={onShowScores} />
}

function CancelGameModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" dir="rtl"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="glass-panel rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 animate-pop-in"
        style={{ border: '1.5px solid #CC222940' }}
        onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <h2 className="font-display text-xl font-black text-white mb-1">لغو بازی؟</h2>
          <p className="text-sm" style={{ color: '#6D6E71' }}>
            بازی فعلی پاک می‌شه و به صفحه اصلی بر می‌گردید
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="btn-game flex-1 py-3.5 rounded-2xl font-bold text-sm"
            style={{ background: '#1e1e20', border: '1.5px solid #2e2e32', color: '#9a9b9e' }}>
            ادامه بازی
          </button>
          <button onClick={onConfirm}
            className="btn-game flex-1 py-3.5 rounded-2xl font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 4px 20px #CC222944' }}>
            بله، لغو کن
          </button>
        </div>
      </div>
    </div>
  )
}

function GameScreen({
  state, dispatch, session, onShowScores,
}: {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  session?: OnlineSession
  onShowScores: () => void
}) {
  const [showCancel, setShowCancel] = useState(false)
  const isHost = !session || session.isHost
  const inGame = ['COUNTDOWN', 'MISSION_BRIEFING', 'MISSION_INTRO', 'TURN_TRANSITION', 'PLAYING', 'MISSION_RESULT', 'LEADERBOARD'].includes(state.phase)

  function handleCancel() {
    dispatch({ type: 'NEW_PLAYERS' })
    setShowCancel(false)
  }

  return (
    <>
      {state.phase === 'LOBBY' && <Lobby state={state} dispatch={dispatch} session={session} />}
      {state.phase === 'COUNTDOWN' && <GameCountdown value={state.showCountdownValue} />}
      {state.phase === 'MISSION_BRIEFING' && <MissionBriefing state={state} dispatch={dispatch} />}
      {state.phase === 'MISSION_INTRO' && <MissionIntro state={state} />}
      {state.phase === 'TURN_TRANSITION' && <TurnTransition state={state} />}
      {state.phase === 'PLAYING' && <MissionRenderer state={state} dispatch={dispatch} />}
      {state.phase === 'MISSION_RESULT' && <MissionResult state={state} />}
      {state.phase === 'LEADERBOARD' && <Leaderboard state={state} />}
      {state.phase === 'WINNER_CEREMONY' && (
        <WinnerCeremony state={state} dispatch={dispatch} onShowScores={onShowScores} />
      )}

      {/* Cancel button — host only, during active game phases */}
      {isHost && inGame && (
        <button
          onClick={() => setShowCancel(true)}
          className="fixed top-3 left-3 z-40 btn-game flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(17,17,18,0.85)', border: '1px solid #CC222930', color: '#6D6E71', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontSize: '10px' }}>✕</span>
          <span>لغو بازی</span>
        </button>
      )}

      {showCancel && <CancelGameModal onConfirm={handleCancel} onClose={() => setShowCancel(false)} />}
    </>
  )
}

export default function App() {
  const localEngine = useGameEngine()
  const { state, dispatch } = localEngine
  const [session, setSession] = useState<OnlineSession | null>(null)
  const [overlay, setOverlay] = useState<'none' | 'scores' | 'credits' | 'tutorial'>('none')

  function handleOnlineJoin(sess: OnlineSession, _initialState: GameState | null) {
    setSession(sess)
    // Initial state is always null now (broadcast-based) — OnlineGame handles the wait
  }

  function handleOnlineCreate(sess: OnlineSession) {
    setSession(sess)
  }

  const showScores = () => setOverlay('scores')
  const showCredits = () => setOverlay('credits')
  const showTutorial = () => setOverlay('tutorial')
  const closeOverlay = () => setOverlay('none')

  return (
    <div className="h-screen overflow-hidden game-bg" dir="rtl">
      {state.phase === 'HOME' && !session && (
        <Home
          dispatch={dispatch}
          onOnlineCreate={handleOnlineCreate}
          onOnlineJoin={handleOnlineJoin}
          onShowScores={showScores}
          onShowCredits={showCredits}
          onShowTutorial={showTutorial}
        />
      )}
      {(state.phase !== 'HOME' || session) && session && (
        <OnlineGame session={session} localEngine={localEngine} onShowScores={showScores} />
      )}
      {state.phase !== 'HOME' && !session && (
        <GameScreen state={state} dispatch={dispatch} onShowScores={showScores} />
      )}

      {overlay === 'scores' && <HighScores onClose={closeOverlay} />}
      {overlay === 'credits' && <Credits onClose={closeOverlay} />}
      {overlay === 'tutorial' && <Tutorial onClose={closeOverlay} />}
    </div>
  )
}
