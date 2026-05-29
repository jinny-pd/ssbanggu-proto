import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneShell from '../components/PhoneShell'
import iconBackButton      from '../assets/icons/[Icon] Back Button.svg'
import iconArrowUturnLeft  from '../assets/icons/[Icon] Arrow Uturn Left.svg'
import iconArrowUturnRight from '../assets/icons/[Icon] Arrow Uturn Right.svg'
import iconChevronRight    from '../assets/icons/[Icon] Chevron Right.svg'
import iconX               from '../assets/icons/[Icon] X.svg'
import imgCardDefault  from '../assets/images/최초.png'
import imgCardPurpose  from '../assets/images/용도.png'
import imgCardSize     from '../assets/images/크기위치.png'
import imgCardArea     from '../assets/images/영역 지정.png'
import imgCardAuto     from '../assets/images/자동배치.png'
import imgBg       from '../assets/images/home-bg.png'
import imgRoom     from '../assets/images/home-room.png'
import img941      from '../assets/images/status-941.svg'
import imgLevels   from '../assets/images/status-levels.svg'
import _imgP1  from '../assets/images/product-1.png'
import _imgP2  from '../assets/images/product-2.png'
import _imgP3  from '../assets/images/product-3.png'
import _imgP4  from '../assets/images/product-4.png'
import _imgP5  from '../assets/images/product-5.png'
import _imgP6  from '../assets/images/product-6.png'
import _imgP7  from '../assets/images/product-7.png'
import _imgP8  from '../assets/images/product-8.png'
import _imgP9  from '../assets/images/product-9.png'

const imgProducts = [_imgP1, _imgP2, _imgP3, _imgP4, _imgP5, _imgP6, _imgP7, _imgP8, _imgP9]

const PRODUCTS = [
  { brand: '레이어',    discount: '6%', price: '490,000원', dims: [800,283,301], badge: '옵션' },
  { brand: '에몬스',    discount: '6%', price: '385,000원', dims: [720,310,450] },
  { brand: '장수돌침대', discount: '6%', price: '510,000원', dims: [800,283,301] },
  { brand: '까사미아',  discount: '6%', price: '190,000원', dims: [750,270,310], badge: '옵션' },
  { brand: '에이스침대',               price: '270,000원', dims: [700,290,330] },
  { brand: '시몬스',    discount: '6%', price: '380,000원', dims: [680,250,320], badge: '옵션' },
  { brand: '소프라믹',               price: '290,000원', dims: [810,285,315] },
  { brand: '일룸',                   price: '410,000원', dims: [790,280,300] },
  { brand: '한샘',                   price: '320,000원', dims: [780,295,305] },
]

const CHIP_TABS = ['배치상품', '스크랩', '내3D상품', '수납장']
const SUB_CATS  = ['전체', '거실테이블', '식탁', '책상', '콘솔', '사이드테이블']

/* ── SpaceAI 상단 아이콘 (inline SVG, viewBox="8 0 24 24" 로 텍스트 레이블 크롭) ── */
const TOP_ICONS = [
  {
    key: 'view', label: '뷰 변경',
    svg: (
      <svg width="24" height="24" viewBox="8 0 24 24" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M19.3262 2.59584C19.8831 2.2744 20.5691 2.27434 21.126 2.59584L28.126 6.63686C28.6829 6.95839 29.0264 7.55335 29.0264 8.19643V16.2794C29.0262 16.9223 28.6827 17.5166 28.126 17.838L21.126 21.879C20.5691 22.2006 19.8831 22.2006 19.3262 21.879L12.3262 17.838C11.7694 17.5166 11.426 16.9223 11.4258 16.2794V8.19643C11.4258 7.55336 11.7693 6.95839 12.3262 6.63686L19.3262 2.59584ZM13.0264 16.2794C13.0265 16.3507 13.0642 16.4166 13.126 16.4523L19.4287 20.091L19.4443 12.7121L13.0264 9.00502V16.2794ZM21.0439 12.713L21.0293 20.088L27.3262 16.4523C27.3878 16.4166 27.4256 16.3506 27.4258 16.2794V9.02846L21.0439 12.713ZM20.3262 3.98158C20.2643 3.94586 20.1879 3.94586 20.126 3.98158L13.8262 7.61928L20.2451 11.3263L26.6465 7.631L20.3262 3.98158Z" fill="white"/>
      </svg>
    ),
  },
  {
    key: 'capture', label: '캡처',
    svg: (
      <svg width="24" height="24" viewBox="8 0 24 24" fill="none">
        <path d="M11.9992 13.2C12.441 13.2 12.7992 13.5581 12.7992 14V19.2H17.9992C18.441 19.2 18.7992 19.5581 18.7992 20C18.7992 20.4418 18.441 20.8 17.9992 20.8H11.9992C11.5574 20.8 11.1992 20.4418 11.1992 20V14C11.1992 13.5581 11.5574 13.2 11.9992 13.2Z" fill="white"/>
        <path d="M27.9992 3.19995C28.441 3.19995 28.7992 3.55812 28.7992 3.99995V9.99995C28.7992 10.4418 28.441 10.8 27.9992 10.8C27.5574 10.8 27.1992 10.4418 27.1992 9.99995V4.79995H21.9992C21.5574 4.79995 21.1992 4.44178 21.1992 3.99995C21.1992 3.55812 21.5574 3.19995 21.9992 3.19995H27.9992Z" fill="white"/>
      </svg>
    ),
  },
  {
    key: 'roomlist', label: '방 목록',
    svg: (
      <svg width="24" height="24" viewBox="8 0 24 24" fill="none">
        <path d="M15.9992 14.7C16.4963 14.7 16.8992 15.1029 16.8992 15.6C16.8992 16.097 16.4963 16.5 15.9992 16.5C15.5022 16.5 15.0992 16.097 15.0992 15.6C15.0992 15.1029 15.5022 14.7 15.9992 14.7Z" fill="white"/>
        <path d="M24.2492 14.8C24.691 14.8 25.0492 15.1581 25.0492 15.6C25.0492 16.0418 24.691 16.4 24.2492 16.4H19.3492C18.9074 16.4 18.5492 16.0418 18.5492 15.6C18.5492 15.1581 18.9074 14.8 19.3492 14.8H24.2492Z" fill="white"/>
        <path d="M15.9992 11.1C16.4963 11.1 16.8992 11.5029 16.8992 12C16.8992 12.497 16.4963 12.9 15.9992 12.9C15.5022 12.9 15.0992 12.497 15.0992 12C15.0992 11.5029 15.5022 11.1 15.9992 11.1Z" fill="white"/>
        <path d="M24.2492 11.2C24.691 11.2 25.0492 11.5581 25.0492 12C25.0492 12.4418 24.691 12.8 24.2492 12.8H19.3492C18.9074 12.8 18.5492 12.4418 18.5492 12C18.5492 11.5581 18.9074 11.2 19.3492 11.2H24.2492Z" fill="white"/>
        <path d="M15.9992 7.49995C16.4963 7.49995 16.8992 7.9029 16.8992 8.39995C16.8992 8.89701 16.4963 9.29995 15.9992 9.29995C15.5022 9.29995 15.0992 8.89701 15.0992 8.39995C15.0992 7.9029 15.5022 7.49995 15.9992 7.49995Z" fill="white"/>
        <path d="M24.2492 7.59995C24.691 7.59995 25.0492 7.95812 25.0492 8.39995C25.0492 8.84178 24.691 9.19995 24.2492 9.19995H19.3492C18.9074 9.19995 18.5492 8.84178 18.5492 8.39995C18.5492 7.95812 18.9074 7.59995 19.3492 7.59995H24.2492Z" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M24.1242 2.94995C25.6443 2.94995 26.924 3.29689 27.8131 4.18599C28.7022 5.07508 29.0492 6.35482 29.0492 7.87495V16.125C29.0492 17.6451 28.7022 18.9248 27.8131 19.8139C26.924 20.703 25.6443 21.05 24.1242 21.05H15.8742C14.3542 21.05 13.0744 20.703 12.1853 19.8139C11.2962 18.9248 10.9492 17.6451 10.9492 16.125V7.87495C10.9492 6.35482 11.2962 5.07508 12.1853 4.18599C13.0744 3.29689 14.3542 2.94995 15.8742 2.94995H24.1242ZM15.8742 4.54995C14.5657 4.54995 13.7829 4.85115 13.3167 5.31738C12.8505 5.78362 12.5492 6.5664 12.5492 7.87495V16.125C12.5492 17.4335 12.8505 18.2163 13.3167 18.6825C13.7829 19.1488 14.5657 19.45 15.8742 19.45H24.1242C25.4327 19.45 26.2155 19.1488 26.6817 18.6825C27.148 18.2163 27.4492 17.4335 27.4492 16.125V7.87495C27.4492 6.5664 27.148 5.78362 26.6817 5.31738C26.2155 4.85115 25.4327 4.54995 24.1242 4.54995H15.8742Z" fill="white"/>
      </svg>
    ),
  },
  {
    key: 'menu', label: '메뉴',
    svg: (
      <svg width="24" height="24" viewBox="8 0 24 24" fill="none">
        <path d="M27.5496 17.65C27.9914 17.65 28.3496 18.0082 28.3496 18.45C28.3496 18.8918 27.9914 19.25 27.5496 19.25H12.3996C11.9578 19.25 11.5996 18.8918 11.5996 18.45C11.5996 18.0082 11.9578 17.65 12.3996 17.65H27.5496Z" fill="white"/>
        <path d="M27.5496 11.2C27.9914 11.2 28.3496 11.5582 28.3496 12C28.3496 12.4418 27.9914 12.8 27.5496 12.8H12.3996C11.9578 12.8 11.5996 12.4418 11.5996 12C11.5996 11.5582 11.9578 11.2 12.3996 11.2H27.5496Z" fill="white"/>
        <path d="M27.5496 4.75C27.9914 4.75 28.3496 5.10817 28.3496 5.55C28.3496 5.99183 27.9914 6.35 27.5496 6.35H12.3996C11.9578 6.35 11.5996 5.99183 11.5996 5.55C11.5996 5.10817 11.9578 4.75 12.3996 4.75H27.5496Z" fill="white"/>
      </svg>
    ),
  },
]

/* ── Product card ── */
function ProductCard({ p, imgSrc }) {
  const [d0, d1, d2] = p.dims
  return (
    <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ height: 100, borderRadius: 4, overflow: 'hidden', position: 'relative', background: '#f5f5f5' }}>
        <img src={imgSrc} alt={p.brand}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <p style={{ fontSize: 11, color: '#8c8c8c', lineHeight: '14px', letterSpacing: '-0.3px', fontWeight: 400 }}>{p.brand}</p>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {p.discount && <span style={{ fontSize: 14, fontWeight: 600, color: '#00a1ff', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>{p.discount}</span>}
        <span style={{ fontSize: 14, fontWeight: 600, color: '#141414', letterSpacing: '-0.3px', flex: '1 0 0', minWidth: 0 }}>{p.price}</span>
      </div>
      <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'nowrap' }}>
        {[d0, '×', d1, '×', d2, 'cm'].map((v, i) => (
          <span key={i} style={{ fontSize: i % 2 === 1 ? 10 : 11, color: '#141414', opacity: 0.64, letterSpacing: '-0.3px', lineHeight: '14px', whiteSpace: 'nowrap' }}>{v}</span>
        ))}
      </div>
      {p.badge && (
        <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 4, padding: '3px 4px', alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#141414', letterSpacing: '-0.3px', lineHeight: '14px' }}>{p.badge}</span>
        </div>
      )}
    </div>
  )
}

const STEP_IMG = {
  direction: imgCardPurpose,
  purpose:   imgCardSize,
  size:      imgCardArea,
  template:  imgCardArea,
  area:      imgCardAuto,
}

const STEP_CARD = {
  direction: { sub: '방 만들기를 진행하고 계셨군요!', title: '방 용도를 이어서 지정해볼까요?' },
  purpose:   { sub: '방 만들기를 진행하고 계셨군요!', title: '방의 크기와 위치도 바꿀 수 있어요' },
  size:      { sub: '꾸미기가 더 쉬워지는',          title: '방 영역을 지정해 볼 차례예요' },
  template:  { sub: '꾸미기가 더 쉬워지는',          title: '방 영역을 지정해 볼 차례예요' },
  area:      { sub: '방 꾸미기 고민 끝!',            title: '방에 어울리는 가구를 추천해 드릴게요' },
}

export default function Home() {
  const navigate = useNavigate()
  const [cardVisible, setCardVisible] = useState(true)
  const [step, setStep] = useState(localStorage.getItem('ssOnboardingStep'))

  return (
    <div style={{ position: 'relative', width: 375, height: 812, flexShrink: 0 }}>
    <PhoneShell bg="#222">

      {/* ── Background (grid + dark) ── */}
      <img src={imgBg} alt=""
        style={{ position: 'absolute', left: 0, top: 0, width: 375, height: 744, objectFit: 'cover', pointerEvents: 'none', zIndex: 0 }}
      />

      {/* ── 3D Room ── */}
      <img src={imgRoom} alt=""
        style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%) translateX(-0.25px)', top: 229, width: 250.5, height: 220.5, objectFit: 'cover', pointerEvents: 'none', zIndex: 1 }}
      />

      {/* ── Status Bar ── */}
      <div style={s.statusBar}>
        <div style={{ position: 'relative', width: 54, height: 50, flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '32%', bottom: '26%', left: 0, right: 0 }}>
            <img src={img941} alt="9:41"
              style={{ position: 'absolute', width: 28.426, height: 11.089, left: 12.45, top: 5.17 }}
            />
          </div>
        </div>
        <div style={{ position: 'relative', width: 68, height: 50, flexShrink: 0 }}>
          <img src={imgLevels} alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* ── Top Bar ── */}
      <div style={s.topBar}>
        <button style={s.backBtn}>
          <img src={iconBackButton} alt="뒤로" style={{ width: 24, height: 24 }} />
        </button>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {TOP_ICONS.map(({ key, label, svg }) => (
            <div key={key} style={s.topIconWrap}>
              {svg}
              <span style={s.topIconLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tutorial Card ── */}
      {cardVisible && (
        <div
          onClick={() => {
            if (!step) {
              navigate('/add-room')
            } else if (step === 'template') {
              navigate('/template-room')
            } else if (step === 'area') {
              navigate('/create-room', { state: { resume: 'auto-arrange' } })
            } else {
              navigate('/create-room', { state: { resume: step } })
            }
          }}
          style={s.card}
        >
          <div style={s.cardInner}>
            <div style={s.cardLeft}>
              <img src={STEP_IMG[step] ?? imgCardDefault} alt="" style={{ width: 36, height: 36, flexShrink: 0 }} />
              <div style={s.cardText}>
                {(() => { const c = STEP_CARD[step] ?? { sub: '5분 만에 완성!', title: '내 방과 똑같이 만들어보기' }; return (<>
                  <span style={s.cardSub}>{c.sub}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <span style={s.cardTitle}>{c.title}</span>
                    <img src={iconChevronRight} alt="" style={{ width: 14, height: 14, flexShrink: 0 }} />
                  </div>
                </>) })()}
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setCardVisible(false) }}
              style={s.cardClose}
            >
              <img src={iconX} alt="" style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Controls ── */}
      <div style={s.floatingRow}>
        <div style={s.recommendPill}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M8.5 7C10.5 11 12.5 13 16.5 15C12.5 17 10.5 19 8.5 23C6.5 19 4.5 17 0.5 15C4.5 13 6.5 11 8.5 7Z" fill="#0AA5FF"/>
            <path d="M18.5 0.5C19.75 3 21 4.25 23.5 5.5C21 6.75 19.75 8 18.5 10.5C17.25 8 16 6.75 13.5 5.5C16 4.25 17.25 3 18.5 0.5Z" fill="#0AA5FF"/>
          </svg>
          <span style={s.recommendText}>맞춤 상품 추천</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={s.undoBtn}>
            <img src={iconArrowUturnLeft} alt="undo" style={{ width: 20, height: 20 }} />
          </div>
          <div style={s.redoBtn}>
            <img src={iconArrowUturnRight} alt="redo" style={{ width: 20, height: 20 }} />
          </div>
        </div>
      </div>

      {/* ── Bottom Sheet ── */}
      <div style={s.sheet}>
        {/* Grabber */}
        <div style={s.grabberWrap}>
          <div style={s.grabber} />
        </div>

        {/* Tab Depth1 */}
        <div style={{ padding: '0 12px', flexShrink: 0 }}>
          <div style={s.tabBar}>
            {['상품', '공간수정', '아이디어'].map((t, i) => (
              <div key={t} style={{ ...s.tabItem, ...(i === 0 ? s.tabActive : {}) }}>
                <span style={{ fontSize: 15, fontWeight: i === 0 ? 600 : 500, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px' }}>
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Depth2: Chips */}
        <div style={s.chipArea}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {/* Search chip */}
            <div style={{ ...s.chip, gap: 4 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="#141414" strokeWidth="1.2"/>
                <line x1="10.5" y1="10.5" x2="13" y2="13" stroke="#141414" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span style={s.chipLabel}>검색</span>
            </div>
            {/* Divider */}
            <div style={{ width: 1, height: 24, background: '#e0e0e0', flexShrink: 0 }} />
            {/* Normal chips */}
            {CHIP_TABS.map((c) => {
              const active = c === '내3D상품'
              return (
                <div key={c} style={{ ...s.chip, ...(active ? s.chipActive : {}) }}>
                  <span style={{ ...s.chipLabel, color: active ? 'white' : '#141414', fontWeight: active ? 600 : 500 }}>{c}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sub-category */}
        <div style={s.subCatRow}>
          {SUB_CATS.map((c, i) => (
            <span key={c} style={{ fontSize: 14, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#141414' : '#8c8c8c', letterSpacing: '-0.3px', lineHeight: '20px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {c}
            </span>
          ))}
        </div>

        {/* Result + filter */}
        <div style={s.resultRow}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#141414', letterSpacing: '-0.3px', lineHeight: '20px' }}>테이블 56개</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['색상', '인기순'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 14, color: '#141414', letterSpacing: '-0.3px' }}>{f}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 5L6 8L9 5" stroke="#141414" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Product list (3 rows × 3) */}
        <div style={s.productList}>
          {[0, 1, 2].map(row => (
            <div key={row} style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2].map(col => {
                const idx = row * 3 + col
                return <ProductCard key={idx} p={PRODUCTS[idx]} imgSrc={imgProducts[idx]} />
              })}
            </div>
          ))}
        </div>
      </div>

    </PhoneShell>
    <button
      style={{ ...s.resetBtn, ...(!step ? s.resetBtnDisabled : {}) }}
      disabled={!step}
      onClick={() => {
        localStorage.removeItem('ssOnboardingStep')
        setStep(null)
        setCardVisible(true)
      }}
    >
      온보딩 초기화
    </button>
    </div>
  )
}

/* ── Styles ── */
const s = {
  statusBar: {
    position: 'absolute', top: 0, left: 0, width: 375, height: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 21, paddingRight: 14, overflow: 'hidden', zIndex: 10,
  },
  topBar: {
    position: 'absolute', top: 50, left: 0, width: 375, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 16, paddingRight: 16, zIndex: 10,
  },
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  topIconWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    width: 40, cursor: 'pointer',
  },
  topIconLabel: {
    color: '#8c8c8c', fontSize: 12, fontWeight: 500, letterSpacing: '-0.3px', lineHeight: '16px',
  },
  card: {
    position: 'absolute', top: 106, left: '50%', transform: 'translateX(-50%)',
    width: 343, zIndex: 20,
    backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)',
    background: 'rgba(0,0,0,0.15)', borderRadius: 16,
    paddingTop: 12, paddingBottom: 12, cursor: 'pointer',
  },
  cardInner: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingLeft: 20, paddingRight: 20,
  },
  cardLeft: {
    display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0,
  },
  cardText: { display: 'flex', flexDirection: 'column' },
  cardSub: {
    color: '#7f7f7f', fontSize: 13, fontWeight: 500, lineHeight: '18px', letterSpacing: '-0.3px',
  },
  cardTitle: {
    color: '#e0e0e0', fontSize: 15, fontWeight: 600, lineHeight: '24px', letterSpacing: '-0.3px', whiteSpace: 'nowrap',
  },
  cardClose: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  resetBtn: {
    position: 'absolute', top: 0, right: 475, zIndex: 5,
    background: '#e0e0e0', borderRadius: 6, border: 'none', cursor: 'pointer',
    paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
    fontSize: 12, fontWeight: 600, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '20px', fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  resetBtnDisabled: {
    background: '#383838', color: '#1E1E1E', cursor: 'default',
  },
  floatingRow: {
    position: 'absolute', top: 502, left: 0, right: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 16, paddingRight: 16, zIndex: 5,
  },
  recommendPill: {
    height: 34, display: 'flex', alignItems: 'center',
    background: '#f0f8fc', borderRadius: 99, paddingLeft: 10, paddingRight: 12, gap: 4,
  },
  recommendText: { fontSize: 14, fontWeight: 500, color: '#141414', letterSpacing: '-0.3px', lineHeight: '18px' },
  undoBtn: {
    width: 34, height: 34, borderRadius: 17,
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  redoBtn: {
    width: 34, height: 34, borderRadius: 17,
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  sheet: {
    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
    bottom: -442, height: 706, width: 375,
    background: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16,
    overflow: 'hidden', zIndex: 30, display: 'flex', flexDirection: 'column',
  },
  grabberWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    paddingTop: 8, paddingBottom: 12, flexShrink: 0,
  },
  grabber: { width: 40, height: 4, background: '#8c8c8c', borderRadius: 40, opacity: 0.2 },
  tabBar: {
    background: '#f5f5f5', borderRadius: 99, display: 'flex', gap: 4,
    padding: 4, height: 44, alignItems: 'center',
  },
  tabItem: {
    flex: '1 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 99, height: 36,
  },
  tabActive: {
    background: 'white', border: '1px solid #e0e0e0',
    boxShadow: '0 2px 2.5px rgba(63,71,77,0.05)',
  },
  chipArea: {
    paddingTop: 14, paddingBottom: 16, paddingLeft: 12, paddingRight: 12,
    borderBottom: '1px solid #e6e6e6', flexShrink: 0,
  },
  chip: {
    height: 32, padding: '0 10px', display: 'flex', alignItems: 'center',
    borderRadius: 99, flexShrink: 0, background: 'white', border: '1px solid #e0e0e0',
  },
  chipActive: { background: '#141414', border: '1px solid #141414' },
  chipLabel: { fontSize: 13, fontWeight: 500, color: '#141414', letterSpacing: '-0.3px', whiteSpace: 'nowrap' },
  subCatRow: {
    display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none',
    padding: '12px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0,
  },
  resultRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 16px', flexShrink: 0,
  },
  productList: {
    display: 'flex', flexDirection: 'column', gap: 8,
    paddingLeft: 16, paddingRight: 16, paddingBottom: 64,
    overflow: 'hidden', background: 'white',
  },
}
