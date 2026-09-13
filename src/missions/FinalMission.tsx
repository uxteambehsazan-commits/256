import { useEffect, useRef, useState } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'
import GameHUD from '../components/GameHUD'

interface Props { state: GameState; dispatch: React.Dispatch<GameAction> }

export default function FinalMission({ state, dispatch }: Props) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const partId = useRef(0)
  const ended = state.timeLeft === 0

  function addParticle(x: number, y: number) {
    const id = partId.current++
    setParticles(p => [...p.slice(-20), { id, x, y }])
    setTimeout(() => setParticles(p => p.filter(px => px.id !== id)), 600)
  }

  function handleClick(playerId: string, e: React.MouseEvent) {
    if (ended) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    addParticle(e.clientX - rect.left, e.clientY - rect.top)
    dispatch({ type: 'FINAL_CLICK', playerId })
  }

  const sorted = [...state.players].filter(p => p.connected)
    .sort((a, b) => (state.finalClicks[b.id] || 0) - (state.finalClicks[a.id] || 0))

  return (
    <div className="h-full flex flex-col">
      <GameHUD state={state} />

      <div className="flex-1 flex flex-col p-3 gap-3">
        {/* Header */}
        <div className="text-center py-2">
          <div className="font-display text-2xl font-black text-red-400 animate-pulse"
            style={{ textShadow: '0 0 20px #ff2d78' }}>
            💥 مأموریت نهایی — ضریب ×۲
          </div>
          <div className="text-purple-300 text-sm mt-1">«همه چیز می‌تونه عوض بشه»</div>
        </div>

        {/* Click zones */}
        <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden">
          {sorted.map((p, rank) => {
            const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            const clicks = state.finalClicks[p.id] || 0
            const score = clicks * 10 * 2

            return (
              <div key={p.id} className="relative overflow-hidden">
                <button
                  onClick={(e) => handleClick(p.id, e)}
                  disabled={ended}
                  className="btn-game w-full h-full rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 select-none relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${color.bg}22, ${color.bg}11)`,
                    border: `2px solid ${color.bg}`,
                    boxShadow: clicks > 0 ? `0 0 ${Math.min(30, clicks * 2)}px ${color.bg}` : 'none',
                  }}>
                  <img src={avatarSrc(p.avatar)} alt="" className="w-16 h-16 rounded-full object-cover" />
                  <div className="font-black text-base" style={{ color: color.light }}>{p.name}</div>
                  <div className="font-display text-3xl font-black text-white">{clicks}</div>
                  <div className="text-xs" style={{ color: color.light }}>کلیک</div>
                  <div className="font-display text-xl font-black" style={{ color: '#ffd60a' }}>+{score}</div>
                  {rank === 0 && clicks > 0 && (
                    <div className="absolute top-2 left-2 text-2xl animate-bounce">🥇</div>
                  )}

                  {/* Tap ripples */}
                  {particles.filter(pp => pp.id % sorted.length === sorted.indexOf(p)).map(pp => (
                    <div key={pp.id} className="absolute pointer-events-none animate-ping rounded-full"
                      style={{
                        width: 24, height: 24,
                        left: pp.x - 12, top: pp.y - 12,
                        background: color.bg,
                        opacity: 0.6,
                        animationDuration: '0.4s',
                      }}
                    />
                  ))}
                </button>

                {ended && (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center animate-pop-in">
                    <div className="text-center">
                      <div className="font-display text-2xl font-black text-yellow-400">امتیاز</div>
                      <div className="font-display text-4xl font-black text-white">+{score}</div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {ended && (
          <div className="text-center animate-pop-in py-2">
            <div className="font-display text-2xl font-black text-green-400">🎉 تموم شد! نتایج محاسبه می‌شه...</div>
          </div>
        )}
      </div>
    </div>
  )
}
