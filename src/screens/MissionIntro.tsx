import type { GameState } from '../types'
import { MISSIONS, PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'

interface Props { state: GameState }

export default function MissionIntro({ state }: Props) {
  const mission = MISSIONS[state.currentMissionIndex]
  const firstPlayerId = state.turnOrder[0]
  const firstPlayer = state.players.find(p => p.id === firstPlayerId)
  const firstColor = firstPlayer ? PLAYER_COLORS[firstPlayer.colorIndex % PLAYER_COLORS.length] : null

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-4 relative overflow-hidden">
      {/* Bg glow */}
      <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #9333ea, transparent)', top: '20%', left: '50%', transform: 'translateX(-50%)' }}
      />

      <div className="text-center animate-pop-in">
        <div className="text-6xl mb-3 animate-float">{mission.emoji}</div>
        <div className="text-purple-400 font-bold text-sm tracking-wider mb-2">
          مأموریت {String(state.currentMissionIndex + 1).padStart(2, '0')} از ۰۶
        </div>
        <h1 className="font-display font-black text-white mb-2"
          style={{ fontSize: 'clamp(1.6rem, 7vw, 3rem)', textShadow: '0 0 30px #a855f7' }}>
          {mission.name}
        </h1>
        <p className="text-purple-300 text-sm">{mission.desc}</p>
      </div>

      <div className="glass-panel rounded-2xl px-4 py-3 text-center animate-slide-up w-full max-w-sm" style={{ animationDelay: '0.2s' }}>
        <div className="text-xs text-gray-400 mb-1">امتیازدهی</div>
        <div className="text-purple-200 font-bold text-sm">{mission.scoring}</div>
      </div>

      {mission.type === 'turn' && firstPlayer && firstColor && (
        <div className="animate-slide-up text-center" style={{ animationDelay: '0.4s' }}>
          <div className="text-xs text-gray-400 mb-2">👑 شروع‌کننده راند</div>
          <div className="flex items-center gap-3 glass-panel rounded-2xl px-4 py-3">
            <img src={avatarSrc(firstPlayer.avatar)} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <span className="font-black text-lg truncate max-w-[160px]" style={{ color: firstColor.light }}>{firstPlayer.name}</span>
          </div>
        </div>
      )}

      {mission.type === 'simultaneous' && (
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-yellow-400 font-bold text-base">⚡ همه با هم بازی می‌کنید!</div>
        </div>
      )}

      {mission.type === 'cooperative' && (
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-green-400 font-bold text-base">🤝 با هم کار کنید!</div>
        </div>
      )}

      <div className="font-display font-black animate-timer-warning"
        style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', color: state.timeLeft <= 2 ? '#ff2d78' : '#ffd60a' }}>
        {state.timeLeft > 0 ? state.timeLeft : ''}
      </div>
    </div>
  )
}
