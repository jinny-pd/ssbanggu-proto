import { useNavigate } from 'react-router-dom'
import PhoneShell from '../components/PhoneShell'
import imgOnboardingDone from '../assets/images/온보딩 완료.png'
import iconBackButton from '../assets/icons/[Icon] Back Button.svg'
import imgProduct1 from '../assets/images/Product Image_1.png'
import imgProduct2 from '../assets/images/Product Image_2.png'
import imgProduct3 from '../assets/images/Product Image_3.png'
import iconArrowUturnLeft  from '../assets/icons/[Icon] Arrow Uturn Left.svg'
import iconArrowUturnRight from '../assets/icons/[Icon] Arrow Uturn Right.svg'
import iconRightIcon       from '../assets/icons/[Icon] Right Icon.svg'


import img941    from '../assets/images/status-941.svg'
import imgLevels from '../assets/images/status-levels.svg'

export default function OnboardingDone() {
  const navigate = useNavigate()

  const handleReset = () => {
    localStorage.removeItem('ssOnboardingStep')
    navigate('/', { replace: true })
  }

  return (
    <div style={{ position: 'relative', width: 375, height: 812, flexShrink: 0 }}>
    <PhoneShell bg="#222">
      <div style={s.page}>

        {/* ── Status Bar ── */}
        <div style={s.statusBar}>
          <div style={s.sbTime}>
            <div style={s.sbTimeInner}>
              <img src={img941} alt="" style={s.sbTimeImg} />
            </div>
          </div>
          <div style={s.sbLevels}>
            <img src={imgLevels} alt="" style={s.sbLevelsImg} />
          </div>
        </div>

        {/* ── Top Bar ── */}
        <div style={s.topBar}>
          <button style={s.closeBtn} onClick={() => navigate(-1)}>
            <img src={iconBackButton} alt="뒤로" style={{ width: 24, height: 24 }} />
          </button>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[
              {
                label: '뷰 변경',
                svg: (
                  <svg width="24" height="24" viewBox="8 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.3262 2.59584C19.8831 2.2744 20.5691 2.27434 21.126 2.59584L28.126 6.63686C28.6829 6.95839 29.0264 7.55335 29.0264 8.19643V16.2794C29.0262 16.9223 28.6827 17.5166 28.126 17.838L21.126 21.879C20.5691 22.2006 19.8831 22.2006 19.3262 21.879L12.3262 17.838C11.7694 17.5166 11.426 16.9223 11.4258 16.2794V8.19643C11.4258 7.55336 11.7693 6.95839 12.3262 6.63686L19.3262 2.59584ZM13.0264 16.2794C13.0265 16.3507 13.0642 16.4166 13.126 16.4523L19.4287 20.091L19.4443 12.7121L13.0264 9.00502V16.2794ZM21.0439 12.713L21.0293 20.088L27.3262 16.4523C27.3878 16.4166 27.4256 16.3506 27.4258 16.2794V9.02846L21.0439 12.713ZM20.3262 3.98158C20.2643 3.94586 20.1879 3.94586 20.126 3.98158L13.8262 7.61928L20.2451 11.3263L26.6465 7.631L20.3262 3.98158Z" fill="white"/>
                  </svg>
                ),
              },
              {
                label: '캡처',
                svg: (
                  <svg width="24" height="24" viewBox="8 0 24 24" fill="none">
                    <path d="M11.9992 13.2C12.441 13.2 12.7992 13.5581 12.7992 14V19.2H17.9992C18.441 19.2 18.7992 19.5581 18.7992 20C18.7992 20.4418 18.441 20.8 17.9992 20.8H11.9992C11.5574 20.8 11.1992 20.4418 11.1992 20V14C11.1992 13.5581 11.5574 13.2 11.9992 13.2Z" fill="white"/>
                    <path d="M27.9992 3.19995C28.441 3.19995 28.7992 3.55812 28.7992 3.99995V9.99995C28.7992 10.4418 28.441 10.8 27.9992 10.8C27.5574 10.8 27.1992 10.4418 27.1992 9.99995V4.79995H21.9992C21.5574 4.79995 21.1992 4.44178 21.1992 3.99995C21.1992 3.55812 21.5574 3.19995 21.9992 3.19995H27.9992Z" fill="white"/>
                  </svg>
                ),
              },
              {
                label: '방 목록',
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
                label: '메뉴',
                svg: (
                  <svg width="24" height="24" viewBox="8 0 24 24" fill="none">
                    <path d="M27.5496 17.65C27.9914 17.65 28.3496 18.0082 28.3496 18.45C28.3496 18.8918 27.9914 19.25 27.5496 19.25H12.3996C11.9578 19.25 11.5996 18.8918 11.5996 18.45C11.5996 18.0082 11.9578 17.65 12.3996 17.65H27.5496Z" fill="white"/>
                    <path d="M27.5496 11.2C27.9914 11.2 28.3496 11.5582 28.3496 12C28.3496 12.4418 27.9914 12.8 27.5496 12.8H12.3996C11.9578 12.8 11.5996 12.4418 11.5996 12C11.5996 11.5582 11.9578 11.2 12.3996 11.2H27.5496Z" fill="white"/>
                    <path d="M27.5496 4.75C27.9914 4.75 28.3496 5.10817 28.3496 5.55C28.3496 5.99183 27.9914 6.35 27.5496 6.35H12.3996C11.9578 6.35 11.5996 5.99183 11.5996 5.55C11.5996 5.10817 11.9578 4.75 12.3996 4.75H27.5496Z" fill="white"/>
                  </svg>
                ),
              },
            ].map(({ label, svg }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 40 }}>
                {svg}
                <span style={{ fontSize: 12, fontWeight: 500, color: '#8c8c8c', letterSpacing: '-0.3px', lineHeight: '16px', fontFamily: "'Pretendard', sans-serif" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

{/* ── 온보딩 완료 이미지 ── */}
        <div style={s.imageArea}>
          <img src={imgOnboardingDone} alt="" style={s.mainImg} />
        </div>

        {/* ── Component Area : AI chip + undo/redo ── */}
        <div style={s.componentArea}>
          <div style={s.aiChip}>
            <SparklesIcon />
            <span style={s.aiChipText}>맞춤 상품 추천</span>
          </div>
          <div style={s.undoRedoArea}>
            <div style={s.ghostBtn}>
              <img src={iconArrowUturnLeft} alt="undo" style={{ width: 20, height: 20 }} />
            </div>
            <div style={s.ghostBtn}>
              <img src={iconArrowUturnRight} alt="redo" style={{ width: 20, height: 20 }} />
            </div>
          </div>
        </div>

        {/* ── Grabber Area (피그마 14912:33248 기준) ── */}
        <div style={s.bottomSheet}>

          {/* Grabber handle */}
          <div style={s.grabberWrap}>
            <div style={s.grabberHandle} />
          </div>

          {/* Tab_Depth1 — 상품 / 공간수정 / 아이디어 */}
          <div style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 0, paddingBottom: 0 }}>
            <div style={s.tabRow}>
              {['상품', '공간수정', '아이디어'].map((tab, i) => (
                <div key={tab} style={{ ...s.tabItem, ...(i === 0 ? s.tabItemActive : {}) }}>
                  <span style={{ ...s.tabText, ...(i === 0 ? s.tabTextActive : {}) }}>{tab}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tab2 Area — 검색 + 카테고리 칩 */}
          <div style={s.tab2Area}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              {/* 검색 칩 */}
              <div style={s.chipSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="#141414" strokeWidth="1.5"/>
                  <path d="M16.5 16.5L21 21" stroke="#141414" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={s.chipText}>검색</span>
              </div>
              {/* 구분선 */}
              <div style={{ width: 1, height: 24, background: '#e0e0e0', flexShrink: 0 }} />
              {/* 카테고리 칩 */}
              {[
                { label: '배치상품', solid: false },
                { label: '스크랩',   solid: false },
                { label: '내3D상품', solid: false },
                { label: '테이블',   solid: true  },
                { label: '수납장',   solid: false },
                { label: '침대',     solid: false },
                { label: '소파',     solid: false },
              ].map(({ label, solid }) => (
                <div key={label} style={{ ...s.chip, ...(solid ? s.chipSolid : {}) }}>
                  <span style={{ ...s.chipText, ...(solid ? { color: '#fff' } : {}) }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* StoreSubCategoryListSection — 전체/거실테이블/식탁/책상... */}
          <div style={s.subCatArea}>
            {['전체', '거실테이블', '식탁', '책상', '콘솔', '사이드테이블'].map((label, i) => (
              <span key={label} style={{ ...s.subCatItem, ...(i === 0 ? s.subCatActive : {}) }}>{label}</span>
            ))}
          </div>

          {/* Body — Result row + Product list */}
          <div style={s.resultRow}>
            <span style={s.resultCount}>테이블 56개</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {['색상', '인기순'].map((label) => (
                <button key={label} style={s.filterBtn}>
                  <span>{label}</span>
                  <img src={iconRightIcon} alt="" style={{ width: 12, height: 12 }} />
                </button>
              ))}
            </div>
          </div>
          <div style={s.productList}>
            <div style={s.productRow}>
              {[
                { img: imgProduct1, brand: '레이어', price: '490,000원', discount: '6%', size: '가로 120 세로 60 cm' },
                { img: imgProduct2, brand: '에몬스', price: '385,000원', discount: '6%', size: '가로 100 세로 50 cm' },
                { img: imgProduct3, brand: '장수돌침대', price: '510,000원', discount: '6%', size: '가로 140 세로 70 cm' },
              ].map((item) => (
                <div key={item.brand} style={s.productCard}>
                  <div style={s.productThumb}>
                    <img src={item.img} alt={item.brand} style={s.productImg} />
                    <div style={s.bookmarkBtn}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M6 4h12a1 1 0 0 1 1 1v14.382a.5.5 0 0 1-.724.447L12 17.236l-6.276 2.593A.5.5 0 0 1 5 19.382V5a1 1 0 0 1 1-1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div style={s.productInfo}>
                    <span style={s.productBrand}>{item.brand}</span>
                    <span style={s.productPrice}><span style={s.productDiscount}>{item.discount} </span>{item.price}</span>
                    <span style={s.productSize}>{item.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </PhoneShell>
    <button onClick={handleReset} style={s.resetBtn}>
      온보딩 초기화
    </button>
    </div>
  )
}

/* ── 아이콘 ── */
function SparklesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M8.5 7C10.5 11 12.5 13 16.5 15C12.5 17 10.5 19 8.5 23C6.5 19 4.5 17 0.5 15C4.5 13 6.5 11 8.5 7Z" fill="#0AA5FF"/>
      <path d="M18.5 0.5C19.75 3 21 4.25 23.5 5.5C21 6.75 19.75 8 18.5 10.5C17.25 8 16 6.75 13.5 5.5C16 4.25 17.25 3 18.5 0.5Z" fill="#0AA5FF"/>
    </svg>
  )
}

/* ── 스타일 ── */
const s = {
  page: {
    position: 'absolute', inset: 0,
    background: '#222',
    overflow: 'hidden',
  },

  /* 상태바 */
  statusBar: {
    position: 'absolute', left: 0, top: 0, width: 375, height: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 21, paddingRight: 14, overflow: 'hidden',
  },
  sbTime:      { position: 'relative', width: 54, height: 50, flexShrink: 0 },
  sbTimeInner: { position: 'absolute', top: '32%', right: 0, bottom: '26%', left: 0, borderRadius: 32 },
  sbTimeImg:   { position: 'absolute', left: 12.45, top: 5.17, width: 28.426, height: 11.089 },
  sbLevels:    { position: 'relative', width: 68, height: 50, flexShrink: 0 },
  sbLevelsImg: { position: 'absolute', inset: 0, width: '100%', height: '100%' },

  /* 탑바 */
  topBar: {
    position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)',
    width: 375, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 16, paddingRight: 16, gap: 20, zIndex: 20,
  },
  closeBtn: {
    width: 24, height: 24, flexShrink: 0,
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  /* 이미지 영역 */
  imageArea: {
    position: 'absolute',
    left: '50%', top: 214,
    transform: 'translateX(-50%)',
    width: 298, height: 171,
  },
  mainImg: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
  },

  /* 온보딩 초기화 버튼 */
  resetBtn: {
    position: 'absolute', top: 0, right: 475,
    background: '#e0e0e0', border: 'none', borderRadius: 6,
    padding: '4px 8px', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: "'Pretendard', sans-serif",
    whiteSpace: 'nowrap',
  },

  /* Component Area */
  componentArea: {
    position: 'absolute', top: 502, left: 0, right: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 16, paddingRight: 16,
  },
  aiChip: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f0f8fc', borderRadius: 99,
    paddingTop: 8, paddingBottom: 8, paddingLeft: 10, paddingRight: 12,
    height: 34,
  },
  aiChipText: {
    fontSize: 14, fontWeight: 500, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '18px',
    fontFamily: "'Pretendard', sans-serif", whiteSpace: 'nowrap',
  },
  undoRedoArea: { display: 'flex', gap: 10, alignItems: 'center' },
  ghostBtn: {
    width: 34, height: 34, borderRadius: 17,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  /* 바텀시트 */
  bottomSheet: {
    position: 'absolute', top: 548, left: '50%',
    transform: 'translateX(-50%)',
    width: 375,
    background: 'white',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    overflow: 'hidden',
    zIndex: 30,
  },
  grabberWrap: {
    paddingTop: 8, paddingBottom: 12,
    display: 'flex', justifyContent: 'center',
  },
  grabberHandle: {
    width: 40, height: 4, borderRadius: 40,
    background: 'rgba(140,140,140,0.2)',
  },

  /* Tab_Depth1 */
  tabRow: {
    display: 'flex', alignItems: 'center',
    background: '#f5f5f5', borderRadius: 99,
    padding: 4, height: 44, gap: 4,
  },
  tabItem: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6,
    borderRadius: 99,
  },
  tabItemActive: {
    background: 'white',
    boxShadow: '0px 2px 2.5px rgba(63,71,77,0.05)',
    border: '1px solid #e0e0e0',
  },
  tabText: {
    fontSize: 15, fontWeight: 500, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '24px',
    fontFamily: "'Pretendard', sans-serif",
  },
  tabTextActive: { fontWeight: 600 },

  /* Tab2 Area */
  tab2Area: {
    borderBottom: '1px solid #e6e6e6',
    paddingTop: 14, paddingBottom: 16, paddingLeft: 12, paddingRight: 12,
  },
  chipSearch: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: -2, flexShrink: 0,
    height: 32, minHeight: 32, maxHeight: 32,
    paddingLeft: 4, paddingRight: 4,
    border: '1px solid #e0e0e0', borderRadius: 99,
    background: 'white',
  },
  chip: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: -2,
    height: 32, minHeight: 32, maxHeight: 32,
    paddingLeft: 4, paddingRight: 4,
    border: '1px solid #e0e0e0', borderRadius: 99,
    background: 'white', flexShrink: 0,
  },
  chipActive: {
    background: '#141414', border: '1px solid #141414',
  },
  chipSolid: {
    background: '#141414',
    border: '1px solid rgba(0,0,0,0)',
    borderRadius: 9999,
  },
  chipText: {
    paddingLeft: 6, paddingRight: 6,
    fontSize: 14, fontWeight: 500, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '18px',
    fontFamily: "'Pretendard', sans-serif", whiteSpace: 'nowrap',
  },

  /* SubCategory */
  subCatArea: {
    display: 'flex', gap: 16, alignItems: 'center',
    paddingLeft: 16, paddingRight: 16,
    paddingTop: 12, paddingBottom: 12,
    overflowX: 'auto', scrollbarWidth: 'none',
    borderBottom: '1px solid #e0e0e0',
  },
  subCatItem: {
    fontSize: 14, fontWeight: 400, color: '#8c8c8c',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: "'Pretendard', sans-serif", whiteSpace: 'nowrap', flexShrink: 0,
  },
  subCatActive: { fontWeight: 600, color: '#141414' },

  /* Result row */
  resultRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16,
  },
  resultCount: {
    fontSize: 14, fontWeight: 600, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: "'Pretendard', sans-serif",
  },
  filterBtn: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4,
    paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8,
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 500, color: '#595959',
    letterSpacing: '-0.3px', lineHeight: '18px',
    fontFamily: "'Pretendard', sans-serif",
  },

  /* Product list */
  productList: {
    display: 'flex', flexDirection: 'column', gap: 8,
    paddingLeft: 16, paddingRight: 16, paddingBottom: 64,
    background: 'white',
  },
  productRow: {
    display: 'flex', gap: 8,
  },
  productCard: {
    flex: 1, minWidth: 0,
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  productThumb: {
    width: '100%', height: 100,
    borderRadius: 4, overflow: 'hidden',
    position: 'relative', background: '#f5f5f5',
  },
  productImg: {
    width: '100%', height: '100%', objectFit: 'cover',
  },
  bookmarkBtn: {
    position: 'absolute', top: 4, right: 4,
    width: 20, height: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  productInfo: {
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  productBrand: {
    fontSize: 11, fontWeight: 400, color: '#8c8c8c',
    letterSpacing: '-0.3px', lineHeight: '16px',
    fontFamily: "'Pretendard', sans-serif",
  },
  productPrice: {
    fontSize: 14, fontWeight: 600, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: "'Pretendard', sans-serif",
  },
  productDiscount: {
    color: '#ff4242',
  },
  productSize: {
    fontSize: 11, fontWeight: 400, color: '#8c8c8c',
    letterSpacing: '-0.3px', lineHeight: '16px',
    fontFamily: "'Pretendard', sans-serif",
  },
}
