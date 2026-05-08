/**
 * Decorative floating math symbols overlay.
 * Place inside a `relative isolate` container; symbols are hidden on mobile (sm:block).
 */
export default function MathBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      {/* Row 1 — ~6% */}
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '3%',  left: '2%',   fontSize: '52px' }}>π</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '6%',  left: '18%',  fontSize: '36px' }}>θ</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '4%',  left: '36%',  fontSize: '44px' }}>∑</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '8%',  left: '56%',  fontSize: '40px' }}>∞</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '3%',  left: '74%',  fontSize: '48px' }}>√</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '6%',  right: '2%',  fontSize: '38px' }}>φ</span>
      {/* Row 2 — ~32% */}
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '29%', left: '1%',   fontSize: '60px' }}>∫</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '33%', left: '16%',  fontSize: '38px' }}>Δ</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '28%', left: '40%',  fontSize: '44px' }}>×</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '35%', left: '60%',  fontSize: '34px' }}>≠</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '30%', left: '78%',  fontSize: '50px' }}>÷</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '34%', right: '2%',  fontSize: '42px' }}>ω</span>
      {/* Row 3 — ~58% */}
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '55%', left: '3%',   fontSize: '46px' }}>α</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '60%', left: '20%',  fontSize: '56px' }}>±</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '54%', left: '44%',  fontSize: '38px' }}>β</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '62%', left: '62%',  fontSize: '46px' }}>≤</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '56%', left: '80%',  fontSize: '40px' }}>σ</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '60%', right: '1%',  fontSize: '54px' }}>γ</span>
      {/* Row 4 — ~84% */}
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '82%', left: '4%',   fontSize: '48px' }}>∂</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '87%', left: '22%',  fontSize: '40px' }}>λ</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '81%', left: '44%',  fontSize: '52px' }}>μ</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '88%', left: '66%',  fontSize: '36px' }}>ε</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '83%', left: '82%',  fontSize: '44px' }}>∇</span>
      <span className="bm-float-symbol-light hidden sm:block" style={{ top: '86%', right: '1%',  fontSize: '50px' }}>∈</span>
    </div>
  )
}
