import bmLogo from '../imports/03-BMC-Right_FA-EN_1.png'
import teamPhoto from '../imports/image-3.png'
import { GAME_NAME } from '../constants'

interface Props { onClose: () => void }

const TEAM = [
  { name: 'سید رضا مانوسی', role: '' },
  { name: 'محمد رضا زارعی', role: '' },
  { name: 'رضا عبدالهی‌پور', role: '' },
  { name: 'سروش آذرنیا', role: '' },
  { name: 'محمد رضا جلالی فراهانی', role: '' },
  { name: 'سنا رباهاط', role: '' },
  { name: 'پریا زراعتی', role: '' },
  { name: 'حدیثه عبدی‌پور', role: '' },
]

export default function Credits({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: '#0e0e0f' }} dir="rtl">
      {/* Header */}
      <div className="glass-panel bm-header-bar px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onClose} className="btn-game text-2xl leading-none p-1" style={{ color: '#6D6E71' }}>←</button>
        <img src={bmLogo} alt="بهسازان ملت" className="h-8 object-contain opacity-80" />
        <div className="flex-1">
          <h1 className="font-display text-lg font-black text-white leading-tight">تهیه‌کنندگان</h1>
          <p className="text-xs" style={{ color: '#6D6E71' }}>{GAME_NAME}</p>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Team photo — cinematic vintage treatment */}
        <div className="relative w-full">
          <img
            src={teamPhoto}
            alt="تیم هسته تجربه کاربری بهسازان ملت"
            className="w-full object-cover object-center"
            style={{ maxHeight: 380, filter: 'contrast(1.04) saturate(0.92)' }}
          />
          {/* Vignette frame */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.55)' }} />
          {/* Gradient at bottom */}
          <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #0e0e0f)' }} />
          {/* Retro badge top-right */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black"
            style={{ background: '#CC2229', color: '#fff', boxShadow: '0 2px 12px #CC222988', letterSpacing: '0.04em' }}>
            UX Team • بهسازان ملت
          </div>
          {/* Film grain texture strip at top */}
          <div className="absolute top-0 inset-x-0 h-1 opacity-60"
            style={{ background: 'linear-gradient(to right,#CC2229,#9e1a20,#CC2229)' }} />
        </div>

        {/* Tagline */}
        <div className="px-6 pt-3 pb-4 text-center">
          <p className="font-display text-xs font-bold uppercase tracking-widest"
            style={{ color: '#CC2229', letterSpacing: '0.2em' }}>
            GREAT EXPERIENCES ARE BUILT TOGETHER
          </p>
        </div>

        {/* Section title */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left,#CC2229,transparent)' }} />
            <span className="font-black text-sm text-white">تیم هسته تجربه کاربری</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right,#CC2229,transparent)' }} />
          </div>
        </div>

        {/* Team list */}
        <div className="px-4 pb-4 flex flex-col gap-2 max-w-lg mx-auto">
          {TEAM.map((member, i) => (
            <div key={i}
              className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 animate-slide-up"
              style={{
                animationDelay: `${i * 0.07}s`,
                borderColor: '#CC222922',
              }}>
              {/* Number badge */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-display font-black text-sm"
                style={{ background: '#CC222918', color: '#CC2229', border: '1px solid #CC222944' }}>
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-black text-white">{member.name}</div>
              </div>
              {/* Decorative dot */}
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#CC2229', opacity: 0.6 }} />
            </div>
          ))}
        </div>

        {/* Footer branding */}
        <div className="px-5 py-6 flex flex-col items-center gap-3">
          <img src={bmLogo} alt="بهسازان ملت" className="h-10 object-contain opacity-60" />
          <p className="text-xs text-center" style={{ color: '#6D6E71' }}>
            ساخته شده با ❤️ توسط تیم UX بهسازان ملت
          </p>
          <p className="text-xs font-display" style={{ color: '#CC222966' }}>
            {GAME_NAME} — ۱۴۰۳
          </p>
        </div>
      </div>
    </div>
  )
}
