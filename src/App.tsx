import { useState, useCallback, useRef } from 'react'
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

function GameScreen({
  state, dispatch, session, onShowScores,
}: {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  session?: OnlineSession
  onShowScores: () => void
}) {
  return (
    <>
      {state.phase === 'LOBBY' && <Lobby state={state} dispatch={dispatch} session={session} />}
      {state.phase === 'COUNTDOWN' && <GameCountdown value={state.showCountdownValue} />}
      {state.phase === 'MISSION_INTRO' && <MissionIntro state={state} />}
      {state.phase === 'TURN_TRANSITION' && <TurnTransition state={state} />}
      {state.phase === 'PLAYING' && <MissionRenderer state={state} dispatch={dispatch} />}
      {state.phase === 'MISSION_RESULT' && <MissionResult state={state} />}
      {state.phase === 'LEADERBOARD' && <Leaderboard state={state} />}
      {state.phase === 'WINNER_CEREMONY' && (
        <WinnerCeremony state={state} dispatch={dispatch} onShowScores={onShowScores} />
      )}
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
