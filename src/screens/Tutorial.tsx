import { useState, useRef } from 'react'
import bmLogo from '../imports/03-BMC-Right_FA-EN_1.png'
import { GAME_NAME } from '../constants'

interface Props { onClose: () => void }

interface Slide {
  id: string
  emoji: string
  title: string
  color: string
  content: React.ReactNode
}

const slides: Slide[] = [
  {
    id: 'intro',
    emoji: '🎮',
    title: 'ماموریت ۲۵۶ چیه؟',
    color: '#CC2229',
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-base leading-7 text-white">
          یه بازی <strong style={{ color: '#CC2229' }}>رقابتی گروهی</strong> برای ۳ تا ۸ نفره که با موبایل بازی می‌کنید.
        </p>
        <div className="flex flex-col gap-3">
          {[
            { icon: '🎯', text: '۶ ماموریت متفاوت با قوانین مختلف' },
            { icon: '⏱️', text: 'هر ماموریت تایمر داره — سریع باش!' },
            { icon: '🏆', text: 'بیشترین امتیاز = قهرمان بازی' },
            { icon: '📱', text: 'یه دستگاه یا هر نفر با موبایل خودش' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <span className="text-sm text-white leading-5">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'modes',
    emoji: '📱',
    title: 'چطور شروع کنیم؟',
    color: '#CC2229',
    content: (
      <div className="flex flex-col gap-4">
        {[
          {
            icon: '🎮',
            title: 'یک دستگاه — همه دور هم',
            steps: ['میزبان «بازی گروهی» رو می‌زنه', 'اسم بازیکنان یکی یکی اضافه می‌شه', 'همه دور یه گوشی بازی می‌کنن'],
            color: '#CC2229',
          },
          {
            icon: '🌐',
            title: 'آنلاین — هر کس با موبایل خودش',
            steps: ['میزبان «اتاق آنلاین» می‌سازه', 'کد اتاق رو برای بقیه می‌فرسته', 'بقیه «ورود با کد» می‌زنن و وارد می‌شن'],
            color: '#6D6E71',
          },
        ].map((mode, i) => (
          <div key={i} className="rounded-2xl p-4"
            style={{ background: '#1a1a1c', border: `1.5px solid ${mode.color}33` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{mode.icon}</span>
              <span className="font-black text-white text-sm">{mode.title}</span>
            </div>
            <div className="flex flex-col gap-2">
              {mode.steps.map((step, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black"
                    style={{ background: mode.color, color: '#fff', marginTop: 1 }}>{j + 1}</span>
                  <span className="text-sm leading-5" style={{ color: '#c0c0c0' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'lobby',
    emoji: '🔑',
    title: 'اتاق بازی',
    color: '#CC2229',
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6" style={{ color: '#c0c0c0' }}>
          بعد از ورود به اتاق، این اتفاق‌ها می‌افته:
        </p>
        <div className="flex flex-col gap-3">
          {[
            { n: '۱', icon: '👥', title: 'ورود بازیکنان', desc: 'همه وارد اتاق می‌شن — می‌تونی اسم و رنگ خودت رو انتخاب کنی' },
            { n: '۲', icon: '✅', title: 'آماده شدن', desc: 'هر بازیکن دکمه «آماده‌ام» رو می‌زنه تا نشون بده آماده‌ست' },
            { n: '۳', icon: '🚀', title: 'شروع بازی', desc: 'وقتی همه آماده شدن، میزبان «شروع بازی» رو می‌زنه' },
          ].map(item => (
            <div key={item.n} className="flex gap-3 rounded-2xl px-4 py-3"
              style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
              <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-black text-xs"
                style={{ background: '#CC2229', color: '#fff' }}>{item.n}</span>
              <div>
                <div className="font-black text-white text-sm mb-0.5">{item.icon} {item.title}</div>
                <div className="text-xs leading-5" style={{ color: '#9a9b9e' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl px-4 py-3 text-sm"
          style={{ background: '#ffd60a10', border: '1px solid #ffd60a33', color: '#ffd60a' }}>
          ⚠️ حداقل ۳ بازیکن لازمه تا بشه بازی رو شروع کرد
        </div>
      </div>
    ),
  },
  {
    id: 'mission1',
    emoji: '⚡',
    title: 'ماموریت ۱ — حمله سرعت',
    color: '#f59e0b',
    content: (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl px-4 py-3 text-sm leading-6"
          style={{ background: '#f59e0b15', border: '1.5px solid #f59e0b44', color: '#fde68a' }}>
          <strong>نوبتی</strong> — هر بازیکن به نوبت یه بار می‌زنه
        </div>
        <p className="text-white text-sm leading-6">
          یه شبکه ۹ تایی از ایموجی‌ها نشون داده می‌شه. یه ایموجی خاص هدفه.
          <strong style={{ color: '#f59e0b' }}> هدف رو سریع‌تر از همه بزن!</strong>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {['🌙','⭐','☀️','🌟','⭐','💫','✨','🔥','💧'].map((e, i) => (
            <div key={i} className="h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: i === 1 || i === 4 ? '#f59e0b33' : '#1a1a1c', border: `1px solid ${i === 1 || i === 4 ? '#f59e0b' : '#2e2e32'}` }}>
              {e}
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-3" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
          <p className="text-xs font-black mb-2" style={{ color: '#6D6E71' }}>امتیازدهی:</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: '#c0c0c0' }}>
            <span>✅ درست: <strong style={{ color: '#4ade80' }}>+۱۰۰</strong> + بونوس سرعت تا <strong style={{ color: '#4ade80' }}>+۱۰۰</strong></span>
            <span>❌ اشتباه: <strong style={{ color: '#CC2229' }}>۲۵-</strong></span>
            <span>⏱️ تایمر: ۱۵ ثانیه</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'mission2',
    emoji: '🧠',
    title: 'ماموریت ۲ — استاد حافظه',
    color: '#8b5cf6',
    content: (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl px-4 py-3 text-sm leading-6"
          style={{ background: '#8b5cf615', border: '1.5px solid #8b5cf644', color: '#c4b5fd' }}>
          <strong>نوبتی</strong> — هر بازیکن مستقل بازی می‌کنه
        </div>
        <p className="text-white text-sm leading-6">
          ۱۲ کارت رو به رو نشون داده می‌شه.
          <strong style={{ color: '#8b5cf6' }}> کارت‌ها رو برگردون و جفت‌های یکسان رو پیدا کن.</strong>
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {['🍎','?','🍊','?','?','🍎','?','🍊','🍋','?','?','🍋'].map((e, i) => (
            <div key={i} className="h-10 rounded-lg flex items-center justify-center text-lg"
              style={{ background: e === '?' ? '#2e2e32' : '#8b5cf622', border: `1px solid ${e === '?' ? '#3e3e42' : '#8b5cf6'}` }}>
              {e === '?' ? '' : e}
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-3" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
          <p className="text-xs font-black mb-2" style={{ color: '#6D6E71' }}>امتیازدهی:</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: '#c0c0c0' }}>
            <span>✅ جفت درست: <strong style={{ color: '#4ade80' }}>+۱۰۰</strong></span>
            <span>❌ جفت اشتباه: <strong style={{ color: '#CC2229' }}>۲۰-</strong></span>
            <span>⏱️ تایمر: ۲۰ ثانیه</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'mission3',
    emoji: '🧩',
    title: 'ماموریت ۳ — شکست منطق',
    color: '#06b6d4',
    content: (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl px-4 py-3 text-sm leading-6"
          style={{ background: '#06b6d415', border: '1.5px solid #06b6d444', color: '#67e8f9' }}>
          <strong>نوبتی</strong> — هر بازیکن یه سوال می‌گیره
        </div>
        <p className="text-white text-sm leading-6">
          یه دنباله ناقص نشون داده می‌شه.
          <strong style={{ color: '#06b6d4' }}> الگو رو پیدا کن و گزینه درست رو انتخاب کن.</strong>
        </p>
        <div className="rounded-2xl p-4" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
          <div className="flex items-center gap-2 justify-center mb-3">
            {['🔴','🔴','🔵','🔴','🔴','🔵','?'].map((e, i) => (
              <span key={i} className="text-xl">{e}</span>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['🔴','🔵','🟢','🟡'].map((e, i) => (
              <div key={i} className="h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ background: i === 0 ? '#06b6d422' : '#222224', border: `1px solid ${i === 0 ? '#06b6d4' : '#2e2e32'}` }}>
                {e}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
          <p className="text-xs font-black mb-2" style={{ color: '#6D6E71' }}>امتیازدهی:</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: '#c0c0c0' }}>
            <span>✅ درست: <strong style={{ color: '#4ade80' }}>+۱۵۰</strong></span>
            <span>❌ اشتباه یا تایم‌اوت: <strong style={{ color: '#6D6E71' }}>+۰</strong></span>
            <span>⏱️ تایمر: ۱۵ ثانیه</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'mission4',
    emoji: '🎯',
    title: 'ماموریت ۴ — سریع‌ترین انگشت',
    color: '#CC2229',
    content: (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl px-4 py-3 text-sm leading-6"
          style={{ background: '#CC222915', border: '1.5px solid #CC222944', color: '#fca5a5' }}>
          <strong>همزمان</strong> — همه با هم بازی می‌کنن
        </div>
        <p className="text-white text-sm leading-6">
          همه بازیکنان منتظر سیگنال «برو!» می‌مونن.
          <strong style={{ color: '#CC2229' }}> بلافاصله بعد از سیگنال دکمه رو بزن!</strong>
        </p>
        <div className="rounded-2xl p-4 text-center" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
          <div className="text-4xl mb-2">🚦</div>
          <div className="text-lg font-black" style={{ color: '#4ade80' }}>برو! ←</div>
          <div className="text-xs mt-2" style={{ color: '#6D6E71' }}>زود نزنی — جریمه داره!</div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
          <p className="text-xs font-black mb-2" style={{ color: '#6D6E71' }}>امتیازدهی:</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: '#c0c0c0' }}>
            <span>🥇 اول: <strong style={{ color: '#ffd60a' }}>+۳۰۰</strong> &nbsp; 🥈 دوم: <strong style={{ color: '#c0c0c0' }}>+۲۰۰</strong> &nbsp; 🥉 سوم: <strong style={{ color: '#cd7f32' }}>+۱۰۰</strong></span>
            <span>بقیه: <strong style={{ color: '#4ade80' }}>+۵۰</strong></span>
            <span>⚠️ زود زدن: <strong style={{ color: '#CC2229' }}>۵۰-</strong></span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'mission5',
    emoji: '🤝',
    title: 'ماموریت ۵ — چالش تیمی',
    color: '#10b981',
    content: (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl px-4 py-3 text-sm leading-6"
          style={{ background: '#10b98115', border: '1.5px solid #10b98144', color: '#6ee7b7' }}>
          <strong>تعاونی</strong> — همه با هم کار می‌کنن
        </div>
        <p className="text-white text-sm leading-6">
          یه ماشین مجازی داره راه‌اندازی می‌شه.
          <strong style={{ color: '#10b981' }}> تیم باید دکمه‌ها رو به ترتیب درست بزنن.</strong>
        </p>
        <div className="rounded-2xl p-4" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
          <div className="text-xs mb-3 text-center" style={{ color: '#6D6E71' }}>ترتیب فعال‌سازی</div>
          <div className="flex items-center justify-center gap-2">
            {['🔋','⚙️','🖥️','🚀'].map((e, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ background: i < 2 ? '#10b98122' : '#222224', border: `1px solid ${i < 2 ? '#10b981' : '#2e2e32'}` }}>
                  {e}
                </div>
                {i < 3 && <span style={{ color: '#6D6E71' }}>→</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
          <p className="text-xs font-black mb-2" style={{ color: '#6D6E71' }}>امتیازدهی:</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: '#c0c0c0' }}>
            <span>✅ تیم موفق: هر نفر <strong style={{ color: '#4ade80' }}>+۳۰۰</strong></span>
            <span>❌ شکست: همه <strong style={{ color: '#6D6E71' }}>+۰</strong></span>
            <span>⏱️ تایمر: ۴۵ ثانیه</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'mission6',
    emoji: '💥',
    title: 'ماموریت ۶ — مأموریت ۲۵۶',
    color: '#CC2229',
    content: (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl px-4 py-3 text-sm leading-6"
          style={{ background: '#CC222915', border: '1.5px solid #CC222966', color: '#fca5a5' }}>
          <strong>مرحله نهایی</strong> — همه با هم، امتیاز ×۲!
        </div>
        <p className="text-white text-sm leading-6">
          هر نفر یه ناحیه داره.
          <strong style={{ color: '#CC2229' }}> هر چقدر بیشتر بزنی، بیشتر امتیاز می‌گیری.</strong>
          اینجا می‌تونه همه چیز عوض بشه!
        </p>
        <div className="rounded-2xl p-4" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
          <div className="text-center mb-3">
            <span className="text-3xl">💥</span>
            <div className="text-sm font-black mt-1" style={{ color: '#ffd60a' }}>هر کلیک = +۲۰ امتیاز</div>
            <div className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>(۱۰ × ضریب ×۲)</div>
          </div>
          <div className="flex justify-center gap-2">
            {['🔴','🔵','🟡'].map((c, i) => (
              <div key={i} className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl opacity-80"
                style={{ background: '#222224', border: '2px solid #3e3e42' }}>{c}</div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: '#ffd60a10', border: '1px solid #ffd60a33' }}>
          <p className="text-xs text-center" style={{ color: '#ffd60a' }}>
            🏆 بیشترین کلیک در این مرحله <strong>+۲۰۰ بونوس</strong> می‌گیره!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'scoring',
    emoji: '🏅',
    title: 'نکات مهم بازی',
    color: '#ffd60a',
    content: (
      <div className="flex flex-col gap-3">
        {[
          { icon: '👁️', title: 'مراقب تایمر باش', desc: 'هر ماموریت تایمر داره. وقتی تموم بشه نوبتت هم تموم می‌شه.' },
          { icon: '🔄', title: 'نوبت‌ها می‌چرخه', desc: 'در ماموریت‌های نوبتی، همه یه بار می‌زنن. ترتیب رندومه.' },
          { icon: '📊', title: 'جدول بعد از هر ماموریت', desc: 'بعد از هر ماموریت جدول امتیازات نشون داده می‌شه.' },
          { icon: '💥', title: 'مرحله آخر همه چیز رو عوض می‌کنه', desc: 'ماموریت آخر ضریب ×۲ داره — شاید کسی که پشتی جا مونده باشه جلو بزنه!' },
          { icon: '🏆', title: 'برنده کیه؟', desc: 'بعد از ۶ ماموریت، بالاترین امتیاز = قهرمان.' },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 rounded-2xl px-4 py-3"
            style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            <div>
              <div className="font-black text-white text-sm mb-0.5">{item.title}</div>
              <div className="text-xs leading-5" style={{ color: '#9a9b9e' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
]

export default function Tutorial({ onClose }: Props) {
  const [current, setCurrent] = useState(0)
  const startX = useRef<number | null>(null)

  const slide = slides[current]
  const isLast = current === slides.length - 1

  function onTouchStart(e: React.TouchEvent) { startX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = startX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 50) {
      if (dx > 0 && current < slides.length - 1) setCurrent(c => c + 1)
      if (dx < 0 && current > 0) setCurrent(c => c - 1)
    }
    startX.current = null
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0e0e0f' }} dir="rtl">

      {/* Header */}
      <div className="glass-panel bm-header-bar px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onClose} className="btn-game text-xl p-1" style={{ color: '#6D6E71' }}>←</button>
        <img src={bmLogo} alt="بهسازان ملت" className="h-7 object-contain opacity-80" />
        <div className="flex-1">
          <h1 className="font-display text-base font-black text-white leading-tight">راهنمای بازی</h1>
          <p className="text-xs" style={{ color: '#6D6E71' }}>{GAME_NAME}</p>
        </div>
        <div className="text-xs font-bold" style={{ color: '#6D6E71' }}>
          {current + 1} / {slides.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 flex-shrink-0" style={{ background: '#1e1e20' }}>
        <div className="h-full transition-all duration-300"
          style={{ width: `${((current + 1) / slides.length) * 100}%`, background: slide.color }} />
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-y-auto"
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="p-5 max-w-md mx-auto">

          {/* Slide header */}
          <div className="flex items-center gap-3 mb-5 animate-pop-in">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: `${slide.color}18`, border: `2px solid ${slide.color}55` }}>
              {slide.emoji}
            </div>
            <h2 className="font-display text-xl font-black text-white leading-tight">{slide.title}</h2>
          </div>

          {/* Slide body */}
          <div className="animate-slide-up" key={current}>
            {slide.content}
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 py-3 flex-shrink-0">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className="rounded-full transition-all btn-game"
            style={{
              width: i === current ? 24 : 7,
              height: 7,
              background: i === current ? slide.color : '#2e2e32',
            }} />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="glass-panel px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #2e2e32' }}>
        <div className="flex gap-3 max-w-md mx-auto">
          {current > 0 && (
            <button onClick={() => setCurrent(c => c - 1)}
              className="btn-game flex-1 py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: '#1e1e20', border: '1.5px solid #2e2e32', color: '#9a9b9e' }}>
              ← قبلی
            </button>
          )}
          {isLast ? (
            <button onClick={onClose}
              className="btn-game flex-1 py-3.5 rounded-2xl font-black text-white text-base"
              style={{ background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 4px 20px #CC222955' }}>
              🚀 شروع بازی!
            </button>
          ) : (
            <button onClick={() => setCurrent(c => c + 1)}
              className="btn-game py-3.5 rounded-2xl font-black text-white text-base"
              style={{ flex: current === 0 ? 1 : 2, background: 'linear-gradient(135deg,#CC2229,#e84249)' }}>
              بعدی ←
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
