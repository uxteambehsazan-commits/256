import { useState } from 'react'
import { loadScores, clearScores, type ScoreEntry } from '../lib/scores'
import bmLogo from '../imports/03-BMC-Right_FA-EN_1.png'
import { GAME_NAME } from '../constants'

interface Props { onClose: () => void }

const RANK_MEDAL = ['🥇', '🥈', '🥉']

function buildShareText(scores: ScoreEntry[]): string {
  const top = scores.slice(0, 5)
  const lines = top.map((s, i) => `${RANK_MEDAL[i] ?? `${i + 1}.`} ${s.playerName} — ${s.score} امتیاز`)
  return `🏆 برترین‌های ${GAME_NAME}\n\n${lines.join('\n')}\n\nبهسازان ملت | Behsazan Mellat`
}

async function shareOrCopy(text: string, setCopied: (v: boolean) => void) {
  if (navigator.share) {
    try { await navigator.share({ title: GAME_NAME, text }); return } catch { /* fallthrough */ }
  }
  await navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

export default function HighScores({ onClose }: Props) {
  const [scores, setScores] = useState<ScoreEntry[]>(loadScores)
  const [copied, setCopied] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); return }
    clearScores(); setScores([]); setConfirmClear(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0e0e0f' }} dir="rtl">
      {/* Header */}
      <div className="glass-panel bm-header-bar px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onClose} className="btn-game text-2xl leading-none p-1" style={{ color: '#6D6E71' }}>←</button>
        <img src={bmLogo} alt="بهسازان ملت" className="h-8 object-contain opacity-80" />
        <div className="flex-1">
          <h1 className="font-display text-lg font-black text-white leading-tight">تابلوی افتخارات</h1>
          <p className="text-xs" style={{ color: '#6D6E71' }}>{GAME_NAME}</p>
        </div>
        {scores.length > 0 && (
          <button
            onClick={() => shareOrCopy(buildShareText(scores), setCopied)}
            className="btn-game px-3 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 0 16px #CC222944' }}>
            {copied ? '✓ کپی شد' : '📤 اشتراک'}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {scores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
            <div className="text-6xl">🏆</div>
            <p className="text-white font-bold text-lg">هنوز بازی‌ای ثبت نشده</p>
            <p className="text-sm" style={{ color: '#6D6E71' }}>بعد از اولین بازی اینجا نمایش داده می‌شه</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-w-lg mx-auto">
            {scores.map((s, i) => {
              const isTop = i < 3
              return (
                <div key={s.id}
                  className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 animate-slide-up"
                  style={{
                    animationDelay: `${Math.min(i, 10) * 0.05}s`,
                    borderColor: i === 0 ? '#ffd60a55' : i === 1 ? '#c0c0c044' : i === 2 ? '#cd7f3244' : '#CC222922',
                    boxShadow: i === 0 ? '0 0 20px #ffd60a22' : 'none',
                  }}>
                  {/* Rank */}
                  <div className="font-display text-xl font-black w-8 text-center flex-shrink-0">
                    {isTop ? RANK_MEDAL[i] : <span style={{ color: '#6D6E71' }}>{i + 1}</span>}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-sm truncate">{s.playerName}</div>
                    <div className="text-xs" style={{ color: '#6D6E71' }}>
                      {s.date} · {s.totalPlayers} نفر
                    </div>
                  </div>
                  {/* Score */}
                  <div className="text-left flex-shrink-0">
                    <div className="font-display text-xl font-black"
                      style={{ color: i === 0 ? '#ffd60a' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#CC2229' }}>
                      {s.score.toLocaleString('fa-IR')}
                    </div>
                    <div className="text-xs text-left" style={{ color: '#6D6E71' }}>امتیاز</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {scores.length > 0 && (
        <div className="glass-panel px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid #CC222922' }}>
          <button onClick={handleClear}
            className="btn-game w-full py-2 rounded-xl text-sm font-bold transition-colors"
            style={{ color: confirmClear ? '#e84249' : '#6D6E71', border: `1px solid ${confirmClear ? '#CC2229' : '#333'}`, background: confirmClear ? '#CC222911' : 'transparent' }}>
            {confirmClear ? '⚠️ دوباره بزن تا پاک بشه' : '🗑️ پاک کردن سوابق'}
          </button>
        </div>
      )}
    </div>
  )
}
