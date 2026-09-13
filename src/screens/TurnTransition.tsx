import type { GameState } from '../types'
import { MISSIONS, PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'

interface Props { state: GameState }

export default function TurnTransition({ state }: Props) {
  const nextIdx = state.currentTurnIndex + 1
  const isLast = nextIdx >= state.turnOrder.length
  const nextId = !isLast ? state.turnOrder[nextIdx] : null
  const nextPlayer = nextId ? state.players.find(p => p.id === nextId) : null
  const nextColor = nextPlayer ? PLAYER_COLORS[nextPlayer.colorIndex % PLAYER_COLORS.length] : null

  const prevId = state.turnOrder[state.currentTurnIndex]
  const prevPlayer = state.players.find(p => p.id === prevId)
  const prevResult = state.playerResults[prevId]

  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 px-4">
      {/* Prev result */}
      {prevPlayer && prevResult && (
        <div className="animate-slide-up text-center glass-panel rounded-2xl px-5 py-4 w-full max-w-xs">
          <div className="flex items-center gap-3 justify-center mb-1">
            <img src={avatarSrc(prevPlayer.avatar)} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            <span className="font-black text-white text-lg truncate max-w-[140px]">{prevPlayer.name}</span>
          </div>
          <div className={`font-display text-2xl font-black ${prevResult.missionScore >= 0 ? 'text-green-400' : 'text-red-400'}`}
            style={{ textShadow: prevResult.missionScore >= 0 ? '0 0 20px #00ff88' : '0 0 20px #ff2d78' }}>
            {prevResult.missionScore >= 0 ? '+' : ''}{prevResult.missionScore}
          </div>
          <div className="text-xs text-gray-400 mt-1">{prevResult.detail}</div>
        </div>
      )}

      {/* Next player */}
      {isLast ? (
        <div className="animate-pop-in text-center">
          <div className="text-5xl mb-3">🎉</div>
          <div className="font-display text-2xl font-black text-green-400">همه تموم کردن!</div>
        </div>
      ) : nextPlayer && nextColor ? (
        <div className="animate-pop-in text-center">
          <img src={avatarSrc(nextPlayer.avatar)} alt="" className="w-14 h-14 rounded-full object-cover mb-2 mx-auto" />
          <div className="text-gray-400 font-bold mb-1 text-sm">🎯 نوبت</div>
          <div className="font-display font-black truncate max-w-[240px] mx-auto"
            style={{ fontSize: 'clamp(1.5rem, 7vw, 2.5rem)', color: nextColor.light, textShadow: `0 0 25px ${nextColor.bg}` }}>
            {nextPlayer.name}
          </div>
          <div className="text-purple-400 text-sm mt-2">آماده باش...</div>
        </div>
      ) : null}
    </div>
  )
}
