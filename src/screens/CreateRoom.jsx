import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PhoneShell from '../components/PhoneShell'

import imgRoomImage      from '../assets/images/default room.png'
import imgAutoArrange1   from '../assets/images/자동배치_1.png'
import imgAutoArrange2   from '../assets/images/자동배치_2.png'
import imgAutoArrange3   from '../assets/images/자동배치_3.png'
import imgRoomAdd        from '../assets/images/defalut_room_add.png'
import imgRoomAddKitchen from '../assets/images/kitchen_add.png'
import imgRoomAddBath    from '../assets/images/bathroom_add.png'
import imgRoomAddVeranda from '../assets/images/veranda_add.png'
import imgRoomAddFoyer   from '../assets/images/foyer_add.png'
import imgRoomGeneral    from '../assets/images/일반 방.png'
import imgRoomKitchen    from '../assets/images/주방.png'
import imgRoomBathroom   from '../assets/images/화장실.png'
import imgRoomBalcony    from '../assets/images/베란다.png'
import imgRoomEntrance   from '../assets/images/현관.png'
import iconArrowUp    from '../assets/icons/[Icon] Arrow Up.svg'
import iconArrowDown  from '../assets/icons/[Icon] Arrow Down.svg'
import iconArrowRight from '../assets/icons/[Icon] Arrow Right.svg'
import iconArrowLeft  from '../assets/icons/[Icon] Arrow Left.svg'
import iconBackButton from '../assets/icons/[Icon] Back Button.svg'
import iconArrowUpMedium from '../assets/icons/[Icon] Arrow Up_Medium.svg'
import iconScale from '../assets/icons/[Icon] Scale.svg'
import iconMove  from '../assets/icons/[Icon] Arrow Orthogonal Outward.svg'
import iconTrash from '../assets/icons/[Icon] Trash.svg'

import img941         from '../assets/images/status-941.svg'
import imgLevels      from '../assets/images/status-levels.svg'
import imgGrid        from '../assets/images/create-room-grid.svg'
import imgArrowCircle from '../assets/images/arrow-circle.svg'

const INIT_SIZE   = 175
const INIT_BORDER = 5
const ZOOM_SIZE   = 136
const SCALE       = ZOOM_SIZE / INIT_SIZE
const SCREEN_W    = 375
const SCREEN_H    = 812
const CM_TO_PX    = ZOOM_SIZE / 360   // visual px per cm (136/360)
const SLIDER_MIN  = 100
const SLIDER_MAX  = 1500
const KEYPAD_H    = 318  // pt:24 + 4rows×50 + 3gaps×6 + pb:76

const AUTO_ARRANGE_CX    = SCREEN_W / 2 + 0.5   // 188 — Figma: left calc(50%+0.5px)
const AUTO_ARRANGE_CY    = SCREEN_H / 2 - 89     // 317 — Figma: top  calc(50%-89px)
const AUTO_ARRANGE_SCALE = 226 / INIT_SIZE        // ≈1.291

// Default Room = 360×360 cm. Other types: px * 360 / ZOOM_SIZE
const INIT_CM = [
  { w: 360, h: 360 },  // 일반 방  136×136 px
  { w: 191, h: 283 },  // 주방      72×107 px
  { w: 161, h: 244 },  // 화장실   61×92 px
  { w: 116, h: 360 },  // 베란다   44×136 px
  { w: 169, h: 154 },  // 현관     64×58 px
]

const DIR_ROTATE = { right: 0, top: -90, left: -180, bottom: -270 }

const ROOM_TYPES = [
  { name: '일반 방', img: imgRoomGeneral,  addImg: imgRoomAdd,        w: 54, h: 52, zW: 136, zH: 136, imgAngle: 0   },
  { name: '주방',    img: imgRoomKitchen,  addImg: imgRoomAddKitchen, w: 53, h: 49, zW: 72,  zH: 107, imgAngle: 90  },
  { name: '화장실',  img: imgRoomBathroom, addImg: imgRoomAddBath,    w: 52, h: 52, zW: 61,  zH: 92,  imgAngle: 0   },
  { name: '베란다',  img: imgRoomBalcony,  addImg: imgRoomAddVeranda, w: 55, h: 44, zW: 44,  zH: 136, imgAngle: -90 },
  { name: '현관',    img: imgRoomEntrance, addImg: imgRoomAddFoyer,   w: 45, h: 47, zW: 64,  zH: 58,  imgAngle: 90  },
]

function getTypeConfig(typeIdx, dir) {
  const rt = ROOM_TYPES[typeIdx]
  const iW = rt.zW * INIT_SIZE / ZOOM_SIZE
  const c  = n => n >= 0 ? `calc(50% + ${n}px)` : `calc(50% - ${Math.abs(n)}px)`

  const addYoffset = -12
  const defOff = (rt.zW - INIT_BORDER) / 2
  const addOff = (ZOOM_SIZE - INIT_BORDER) / 2  // 65.5

  const ty = 19.5 + rt.zW / 4
  const by = -43.5 - rt.zW / 4

  return ({
    right: {
      adjacent:   { left: `calc(50% + ${87.5 + iW / 2}px)`, top: 'calc(50% - 15.5px)' },
      slideExtra: 'translateX(400px)',
      def:   { left: c(-defOff), top: 'calc(50% - 12px)' },
      added: { left: c(addOff),  top: c(addYoffset) },
    },
    left: {
      adjacent:   { left: `calc(50% - ${87.5 + iW / 2}px)`, top: 'calc(50% - 15.5px)' },
      slideExtra: 'translateX(-400px)',
      def:   { left: c(defOff),  top: 'calc(50% - 12px)' },
      added: { left: c(-addOff), top: c(addYoffset) },
    },
    top: {
      adjacent:   { left: '50%', top: `calc(50% - ${103 + iW / 2}px)` },
      slideExtra: 'translateY(-400px)',
      def:   { left: '50%', top: c(ty) },
      added: { left: '50%', top: c(by) },
    },
    bottom: {
      adjacent:   { left: '50%', top: `calc(50% + ${72 + iW / 2}px)` },
      slideExtra: 'translateY(400px)',
      def:   { left: '50%', top: c(by) },
      added: { left: '50%', top: c(ty) },
    },
  })[dir]
}

function SpaceAiSlider({ value, onChange }) {
  const trackRef = useRef(null)
  const pos = Math.max(0, Math.min(1, (value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)))

  const updateFromClientX = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    onChange(Math.round(SLIDER_MIN + p * (SLIDER_MAX - SLIDER_MIN)))
  }

  return (
    <div
      ref={trackRef}
      style={{ height: 20, position: 'relative', flex: '1 0 0', minWidth: 0, cursor: 'pointer' }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); updateFromClientX(e.clientX) }}
      onPointerMove={(e) => { if (e.buttons) updateFromClientX(e.clientX) }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, top: 9, height: 2, background: 'white', opacity: 0.4, borderRadius: 99 }} />
      <div style={{ position: 'absolute', left: 0, width: `${pos * 100}%`, top: 9, height: 2, background: 'white', borderRadius: 99 }} />
      <div style={{ position: 'absolute', width: 20, height: 20, background: 'white', borderRadius: '50%', top: '50%', left: `calc(${pos * 100}% - 10px)`, transform: 'translateY(-50%)', boxShadow: '0px 4px 10px rgba(0,0,0,0.12)' }} />
    </div>
  )
}

const iconStyle = {
  display: 'flex', width: 16, height: 16,
  flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  gap: 10, aspectRatio: '1 / 1',
}

function ArrowBtn({ left, top, icon, onClick, hiding, ready }) {
  const scale = hiding ? 0 : (ready ? 1 : 0)
  const hasTransition = hiding || !ready
  return (
    <button onClick={onClick} style={{
      ...s.arrowBtn, left, top,
      transform: `scale(${scale})`,
      transition: hasTransition ? 'transform 300ms ease-in-out' : 'none',
    }}>
      <img src={imgArrowCircle} alt="" style={s.arrowCircle} />
      <div style={{ ...iconStyle, position: 'absolute', left: 6, top: 6 }}>
        <img src={icon} alt="" style={{ width: '100%', height: '100%' }} />
      </div>
    </button>
  )
}

/* ── 한글 IME ── */

const KR_ROW1 = ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ']
const KR_ROW2 = ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ']
const KR_ROW3 = ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ']

function IOSKRKeyboard({ onKey, onDelete, onSpace, onEnter }) {
  const whiteKey = {
    flex: 1, height: 42, minWidth: 0, background: 'white', border: 'none',
    borderRadius: 5, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0px 1px 0px rgba(0,0,0,0.3)',
    fontSize: 22, fontFamily: "'Apple SD Gothic Neo', -apple-system, system-ui, sans-serif",
    color: '#000', userSelect: 'none', WebkitUserSelect: 'none', paddingTop: 2,
  }
  const fnKey = { ...whiteKey, background: '#abb0bc' }
  const s = (e) => e.preventDefault()

  return (
    <div style={{ width: 375, height: 291, background: '#d2d3d8' }}>
      {/* Keyboard rows area */}
      <div style={{ height: 220, position: 'relative' }}>
        {/* Row 1: 10 keys */}
        <div style={{ position: 'absolute', top: 8, left: 3, right: 3, height: 42, display: 'flex', gap: 5 }}>
          {KR_ROW1.map(ch => (
            <button key={ch} style={whiteKey} onPointerDown={(e) => { s(e); onKey(ch) }}>{ch}</button>
          ))}
        </div>
        {/* Row 2: 9 keys */}
        <div style={{ position: 'absolute', top: 62, left: 22.5, right: 22.5, height: 42, display: 'flex', gap: 5 }}>
          {KR_ROW2.map(ch => (
            <button key={ch} style={whiteKey} onPointerDown={(e) => { s(e); onKey(ch) }}>{ch}</button>
          ))}
        </div>
        {/* Row 3: Shift + 7 keys + Delete */}
        <div style={{ position: 'absolute', top: 116, left: 3, right: 3, height: 42, display: 'flex', gap: 6 }}>
          <button style={{ ...fnKey, flex: 'none', width: 44 }} onPointerDown={s}>
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
              <path d="M10 1L19 10H13.5V17H6.5V10H1L10 1Z" fill="#3C3C43" fillOpacity="0.6"/>
            </svg>
          </button>
          {KR_ROW3.map(ch => (
            <button key={ch} style={whiteKey} onPointerDown={(e) => { s(e); onKey(ch) }}>{ch}</button>
          ))}
          <button style={{ ...fnKey, flex: 'none', width: 44 }} onPointerDown={(e) => { s(e); onDelete() }}>
            <svg width="23" height="16" viewBox="0 0 23 16" fill="none">
              <path d="M8 1H21.5C22.05 1 22.5 1.45 22.5 2V14C22.5 14.55 22.05 15 21.5 15H8L1 8L8 1Z" stroke="#3C3C43" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M13.5 5L18.5 11M18.5 5L13.5 11" stroke="#3C3C43" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {/* Function row */}
        <div style={{ position: 'absolute', top: 170, left: 3, right: 3, height: 42, display: 'flex', gap: 6 }}>
          <button style={{ ...fnKey, flex: 'none', width: 43, fontSize: 16, fontFamily: "'SF Pro Text', system-ui", paddingTop: 0 }} onPointerDown={s}>
            123
          </button>
          <button style={{ ...fnKey, flex: 'none', width: 43 }} onPointerDown={s}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#3C3C43" strokeWidth="1.5"/>
              <circle cx="9" cy="10" r="1.2" fill="#3C3C43"/>
              <circle cx="15" cy="10" r="1.2" fill="#3C3C43"/>
              <path d="M8 14.5C8.83 16.17 10.3 17 12 17C13.7 17 15.17 16.17 16 14.5" stroke="#3C3C43" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button style={{ ...whiteKey, flex: 1, fontSize: 16, fontFamily: "'Apple SD Gothic Neo', -apple-system, system-ui", paddingTop: 0 }} onPointerDown={(e) => { s(e); onSpace() }}>
            스페이스
          </button>
          <button style={{ ...fnKey, flex: 'none', width: 91 }} onPointerDown={(e) => { s(e); onEnter() }}>
            <svg width="18" height="15" viewBox="0 0 18 15" fill="none">
              <path d="M16.5 1V6C16.5 7.1 15.6 8 14.5 8H2M2 8L6.5 3.5M2 8L6.5 12.5" stroke="#3C3C43" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Controller */}
      <div style={{ height: 71, position: 'relative' }}>
        {/* Globe */}
        <div style={{ position: 'absolute', left: 22, top: 6, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
            <circle cx="13.5" cy="13.5" r="12" stroke="#3C3C43" strokeWidth="1.3"/>
            <ellipse cx="13.5" cy="13.5" rx="5.5" ry="12" stroke="#3C3C43" strokeWidth="1.3"/>
            <path d="M2 9.5H25M1.5 13.5H25.5M2 17.5H25" stroke="#3C3C43" strokeWidth="1.3"/>
          </svg>
        </div>
        {/* Home indicator */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 138, height: 5, background: '#000', borderRadius: 100 }} />
        {/* Mic */}
        <div style={{ position: 'absolute', right: 22, top: 6, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
            <rect x="3.5" y="0.5" width="11" height="18" rx="5.5" stroke="#3C3C43" strokeWidth="1.3"/>
            <path d="M0.5 14.5C0.5 19.47 4.25 23.5 9 23.5C13.75 23.5 17.5 19.47 17.5 14.5" stroke="#3C3C43" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="9" y1="24" x2="9" y2="27.5" stroke="#3C3C43" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function CreateRoom() {
  const navigate = useNavigate()
  const location = useLocation()
  const resumeStep = location.state?.resume  // 'direction' | 'purpose' | 'size' | 'auto-arrange'
  const isResuming = resumeStep === 'auto-arrange'

  const [animPhase,        setAnimPhase]        = useState(
    resumeStep === 'auto-arrange' ? 'auto-arrange' :
    resumeStep === 'direction'    ? 'zoomed'        :
    resumeStep === 'purpose'      ? 'size-position' :
    resumeStep === 'size'         ? 'area-select'   : 'idle'
  )
  const [selectedDir,      setSelectedDir]      = useState(
    resumeStep && resumeStep !== 'auto-arrange' ? 'right' : null
  )
  const [newRoomReady,     setNewRoomReady]     = useState(
    resumeStep === 'direction' || resumeStep === 'purpose' || resumeStep === 'size'
  )
  const [slidingOut,       setSlidingOut]       = useState(false)
  const [sheetOpen,        setSheetOpen]        = useState(resumeStep === 'direction')
  const [sizePosSheetOpen, setSizePosSheetOpen] = useState(resumeStep === 'purpose')
  const [selectedType,     setSelectedType]     = useState(0)
  const [arrowsHiding,     setArrowsHiding]     = useState(false)
  const [arrowsReady,      setArrowsReady]      = useState(true)
  const [spVisible,        setSpVisible]        = useState(resumeStep === 'purpose' || resumeStep === 'size')
  // 크기/위치 동적 상태
  const [addWidthCm,  setAddWidthCm]  = useState(null)
  const [addHeightCm, setAddHeightCm] = useState(null)
  const [dynAddCX,    setDynAddCX]    = useState(null)
  const [dynAddCY,    setDynAddCY]    = useState(null)
  // 실행 취소 / 다시 실행 히스토리
  const [historyLen,  setHistoryLen]  = useState(0)
  const [redoLen,     setRedoLen]     = useState(0)
  const [isUndoing,   setIsUndoing]   = useState(false)
  // 두 손가락 제스처 (패닝 / 핀치 줌)
  const [gestPanX, setGestPanX] = useState(0)
  const [gestPanY, setGestPanY] = useState(0)
  const [gestZoom, setGestZoom] = useState(1)
  // 키패드
  const [keypadOpen,  setKeypadOpen]  = useState(false)
  const [activeInput, setActiveInput] = useState(null)   // 'width' | 'height'
  const [keypadDraft, setKeypadDraft] = useState('')
  // 영역 지정 가이드
  const [guideTextVisible, setGuideTextVisible] = useState(resumeStep === 'size')
  // 영역 지정 드래그
  const [areaZone,        setAreaZone]        = useState(null)   // {x,y,w,h}
  const [areaDrawn,       setAreaDrawn]       = useState(false)
  const [areaDragPreview, setAreaDragPreview] = useState(null)  // {x,y,w,h} 드래그 중
  const [areaEditing,     setAreaEditing]     = useState(false) // 수정하기 모드
  const [areaSnackbar,    setAreaSnackbar]    = useState(false) // 삭제 스낵바 노출
  const [areaSnapping,    setAreaSnapping]    = useState(false) // 스냅 애니메이션 중
  // 자동배치 전환
  const [autoArrangePos,     setAutoArrangePos]     = useState(isResuming)
  const [autoArrangeVisible, setAutoArrangeVisible] = useState(isResuming)
  // 자동배치 롤링 텍스트
  const [rollingText,   setRollingText]   = useState(isResuming ? '더 나은 배치를 위해 가구가 조금 더 필요해요. 필요한 가구를 추천해드릴게요.' : '침실에 사용자님이 미리 배치한 가구와 소품을 확인하고 있어요.')
  const [rollingHidden, setRollingHidden] = useState(false)
  const [rollingFinal,  setRollingFinal]  = useState(isResuming)
  // 자동배치 Ready 상태 (스피너 페이드아웃 + 입력창 전환)
  const [apReady, setApReady] = useState(isResuming)
  // 자동배치 Step3: 옵션1 선택 → 유저 버블 + AI ack 표시
  const [apStep3, setApStep3] = useState(false)
  const [userBubbleText, setUserBubbleText] = useState('침대, 러그, 탁자, 스탠드를 모두 배치해줘.')
  const [userBubbleIn, setUserBubbleIn] = useState(false)
  const [apAiAck, setApAiAck] = useState(false)
  const [apAiAckIn, setApAiAckIn] = useState(false)
  // 자동배치 Step4: 텍스트 롤링 + 스피너2 + 이미지 교체
  const [apAckText,    setApAckText]    = useState('이제 가장 적합한 배치를 찾아드릴게요.')
  const [apAckColor,   setApAckColor]   = useState('#8c8c8c')
  const [apAckBlink,   setApAckBlink]   = useState(false)
  const [apSpinner2,   setApSpinner2]   = useState(false)
  const [apRoomAuto,    setApRoomAuto]    = useState(false)
  const [apRoomAutoIn,  setApRoomAutoIn]  = useState(false)
  const [apPlacement,         setApPlacement]         = useState(false)
  const [apPlacementIn,       setApPlacementIn]       = useState(false)
  const [apPlacementClosing,  setApPlacementClosing]  = useState(false)
  const [selectedPlacement,   setSelectedPlacement]   = useState(1)
  const [apRoomDown,          setApRoomDown]          = useState(false)
  const [apSnackbar,          setApSnackbar]          = useState(false)
  const [apSnackbarIn,        setApSnackbarIn]        = useState(false)
  // 직접 입력 키보드
  const [apKeyboardOpen, setApKeyboardOpen] = useState(false)
  const [directText,     setDirectText]     = useState('')
  // 자동배치 Bottom Sheet 높이 (grabber 드래그 확장)
  const [sheetHeight, setSheetHeight] = useState(320)
  const [sheetDragging, setSheetDragging] = useState(false)
  const [bodyOffset, setBodyOffset] = useState(0)
  const sheetHeightRef = useRef(320)
  const sheetDragStartYRef = useRef(0)
  const sheetDragStartHRef = useRef(320)
  const apBodyRef = useRef(null)
  const userBubbleRef = useRef(null)
  const apAiAckRef = useRef(null)

  const timersRef      = useRef([])
  const typeRowRef     = useRef(null)
  const screenRef      = useRef(null)
  const dragRef        = useRef(null)
  const moveRef        = useRef(null)
  const historyRef     = useRef([])
  const redoRef        = useRef([])
  const gestPtrsRef    = useRef(new Map())  // pointerId → {x, y}
  const gestPrevRef    = useRef(null)       // {midX, midY, dist}
  const isGesturingRef = useRef(false)
  const viewScaleRef   = useRef(1)
  const gestZoomRef    = useRef(1)
  const gestPanXRef    = useRef(0)
  const gestPanYRef    = useRef(0)
  const areaSvgRef          = useRef(null)
  const areaZoneRef         = useRef(null)
  const areaSnackbarTimerRef = useRef(null)
  const defCXRef            = useRef(SCREEN_W / 2)
  const defCYRef            = useRef(SCREEN_H / 2)
  const areaDragRef         = useRef({
    active: false, moved: false,
    startX: 0, startY: 0,
    handle: null, opposite: null,
    prevX: 0, prevY: 0,
  })

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  useEffect(() => clearTimers, [])

  useEffect(() => {
    const el = typeRowRef.current
    if (!el) return
    const target = selectedType === 4 ? 25 : 0
    const start  = el.scrollLeft
    const diff   = target - start
    if (diff === 0) return
    const duration = 400
    const t0 = performance.now()
    const eio = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    let rafId
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1)
      el.scrollLeft = start + diff * eio(p)
      if (p < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [selectedType])

  useEffect(() => {
    if (animPhase !== 'size-position') {
      setGestPanX(0); setGestPanY(0); setGestZoom(1)
      gestPanXRef.current = 0; gestPanYRef.current = 0; gestZoomRef.current = 1
      gestPtrsRef.current.clear()
      isGesturingRef.current = false
      gestPrevRef.current = null
      setKeypadOpen(false); setActiveInput(null); setKeypadDraft('')
    }
  }, [animPhase])

  /* ── 영역 지정 state cleanup (phase 변경 시 리셋) ── */
  useEffect(() => {
    setAreaZone(null); areaZoneRef.current = null
    setAreaDrawn(false); setAreaEditing(false)
    setAreaDragPreview(null); setAreaSnackbar(false); setAreaSnapping(false)
    if (areaSnackbarTimerRef.current) {
      clearTimeout(areaSnackbarTimerRef.current)
      areaSnackbarTimerRef.current = null
    }
  }, [animPhase]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 영역 드래그 유틸 ── */
  const getAreaPt = (e) => {
    const rect = areaSvgRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // default room 내부 크기 절반 (126px / 2 = 63)
  const ROOM_HALF = (ZOOM_SIZE - INIT_BORDER * 2) / 2

  const handleAreaDown = (e) => {
    if (animPhase !== 'area-select') return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const corner = e.target?.dataset?.corner
    const pt     = getAreaPt(e)
    const zone   = areaZoneRef.current

    if (corner && areaEditing && zone) {
      // 코너 핸들 드래그
      const opp =
        corner === 'nw' ? { x: zone.x + zone.w, y: zone.y + zone.h } :
        corner === 'ne' ? { x: zone.x,           y: zone.y + zone.h } :
        corner === 'sw' ? { x: zone.x + zone.w, y: zone.y           } :
                          { x: zone.x,           y: zone.y           }
      areaDragRef.current = { active: true, moved: true, handle: corner, opposite: opp, prevX: pt.x, prevY: pt.y }
      setAreaDrawn(false)
      setAreaDragPreview(zone)
    } else {
      // 새 영역 드래그
      areaDragRef.current = { active: true, moved: false, startX: pt.x, startY: pt.y, handle: null, prevX: pt.x, prevY: pt.y }
      setAreaEditing(false)
      setAreaDrawn(false)
      setAreaDragPreview({ x: pt.x, y: pt.y, w: 0, h: 0 })
    }
  }

  const handleAreaMove = (e) => {
    const d = areaDragRef.current
    if (!d.active) return
    const pt = getAreaPt(e)
    d.prevX = pt.x; d.prevY = pt.y
    if (d.handle) {
      const opp = d.opposite
      setAreaDragPreview({
        x: Math.min(pt.x, opp.x), y: Math.min(pt.y, opp.y),
        w: Math.abs(pt.x - opp.x), h: Math.abs(pt.y - opp.y),
      })
    } else {
      const dx = pt.x - d.startX, dy = pt.y - d.startY
      if (!d.moved && Math.hypot(dx, dy) > 5) d.moved = true
      if (d.moved) {
        setAreaDragPreview({
          x: Math.min(d.startX, pt.x), y: Math.min(d.startY, pt.y),
          w: Math.abs(dx), h: Math.abs(dy),
        })
      }
    }
  }

  const handleAreaUp = () => {
    const d = areaDragRef.current
    if (!d.active) return
    d.active = false
    const prev      = areaZoneRef.current
    const hadHandle = !!d.handle
    d.handle = null

    setAreaDragPreview(null)
    setAreaEditing(false)

    if (hadHandle || d.moved) {
      const fullZone = {
        x: defCXRef.current - ROOM_HALF,
        y: defCYRef.current - ROOM_HALF,
        w: ROOM_HALF * 2,
        h: ROOM_HALF * 2,
      }

      // 1) fullZone을 즉시 배치하되 areaSnapping=true로 초기 상태(invisible/small) 렌더
      setAreaZone(fullZone); areaZoneRef.current = fullZone
      setAreaDrawn(true)
      setAreaSnapping(true)

      // 2) 다음 프레임에서 areaSnapping=false → CSS transition이 팝인 효과 발동
      requestAnimationFrame(() => setAreaSnapping(false))
    } else {
      // 탭 or 미세 드래그: 이전 zone 유지
      setAreaDrawn(!!prev)
    }
  }

  const handleAreaEdit = () => {
    if (!areaDrawn || !areaZoneRef.current) return
    setAreaEditing(true)
  }

  const handleAreaDelete = () => {
    setAreaZone(null); areaZoneRef.current = null
    setAreaDrawn(false)
    setAreaEditing(false)
    setAreaDragPreview(null)
    setAreaSnackbar(true)
    if (areaSnackbarTimerRef.current) clearTimeout(areaSnackbarTimerRef.current)
    areaSnackbarTimerRef.current = setTimeout(() => {
      setAreaSnackbar(false)
      areaSnackbarTimerRef.current = null
    }, 2500)
  }

  /* ── 방향 선택 ── */
  const handleArrow = (dir) => {
    clearTimers()
    localStorage.setItem('ssOnboardingStep', 'direction')
    setArrowsHiding(true)
    setSelectedDir(dir)
    setSelectedType(0)
    setAnimPhase('sliding')
    setNewRoomReady(false)
    setSlidingOut(false)
    setSheetOpen(false)

    const tArrow = setTimeout(() => setArrowsHiding(false), 300)
    timersRef.current.push(tArrow)
    requestAnimationFrame(() => requestAnimationFrame(() => setNewRoomReady(true)))

    const t1 = setTimeout(() => {
      setAnimPhase('zoomed')
      requestAnimationFrame(() => requestAnimationFrame(() => setSheetOpen(true)))
    }, 530)
    timersRef.current.push(t1)
  }

  /* ── 용도 선택 이전 → 방향 선택 ── */
  const handleBack = () => {
    clearTimers()
    setSheetOpen(false)
    const t1 = setTimeout(() => {
      setAnimPhase('unzooming')
      const t2 = setTimeout(() => {
        setAnimPhase('sliding-out')
        setSlidingOut(false)
        requestAnimationFrame(() => requestAnimationFrame(() => setSlidingOut(true)))
        const t3 = setTimeout(() => {
          setAnimPhase('idle')
          setSelectedDir(null)
          setNewRoomReady(false)
          setSlidingOut(false)
          setArrowsReady(false)
          requestAnimationFrame(() => requestAnimationFrame(() => setArrowsReady(true)))
        }, 500)
        timersRef.current.push(t3)
      }, 600)
      timersRef.current.push(t2)
    }, 400)
    timersRef.current.push(t1)
  }

  /* ── 용도 다음 → 크기/위치 ── */
  const handleNext = () => {
    clearTimers()
    localStorage.setItem('ssOnboardingStep', 'purpose')
    setSheetOpen(false)
    setAddWidthCm(null)
    setAddHeightCm(null)
    setDynAddCX(null)
    setDynAddCY(null)
    historyRef.current = []; setHistoryLen(0)
    redoRef.current    = []; setRedoLen(0)
    const t1 = setTimeout(() => {
      setAnimPhase('size-position')
      setSpVisible(false)
      requestAnimationFrame(() => requestAnimationFrame(() => setSpVisible(true)))
      const t2 = setTimeout(() => setSizePosSheetOpen(true), 50)
      timersRef.current.push(t2)
    }, 400)
    timersRef.current.push(t1)
  }

  /* ── 크기/위치 이전 → 용도 선택 ── */
  const handleSizePosBack = () => {
    clearTimers()
    setSizePosSheetOpen(false)
    setAddWidthCm(null)
    setAddHeightCm(null)
    setDynAddCX(null)
    setDynAddCY(null)
    historyRef.current = []; setHistoryLen(0)
    redoRef.current    = []; setRedoLen(0)
    const t1 = setTimeout(() => {
      setAnimPhase('zoomed')
      setSpVisible(false)
      const t2 = setTimeout(() => setSheetOpen(true), 50)
      timersRef.current.push(t2)
    }, 400)
    timersRef.current.push(t1)
  }

  /* ── 크기/위치: Delete → 방향 선택으로 복귀 ── */
  const handleDeleteRoom = () => {
    clearTimers()
    setSizePosSheetOpen(false)
    setSpVisible(false)
    setAddWidthCm(null); setAddHeightCm(null)
    setDynAddCX(null); setDynAddCY(null)
    historyRef.current = []; setHistoryLen(0)
    redoRef.current    = []; setRedoLen(0)
    const t1 = setTimeout(() => {
      setAnimPhase('unzooming')
      const t2 = setTimeout(() => {
        setAnimPhase('sliding-out')
        setSlidingOut(false)
        requestAnimationFrame(() => requestAnimationFrame(() => setSlidingOut(true)))
        const t3 = setTimeout(() => {
          setAnimPhase('idle')
          setSelectedDir(null)
          setNewRoomReady(false)
          setSlidingOut(false)
          setArrowsReady(false)
          requestAnimationFrame(() => requestAnimationFrame(() => setArrowsReady(true)))
        }, 500)
        timersRef.current.push(t3)
      }, 600)
      timersRef.current.push(t2)
    }, 400)
    timersRef.current.push(t1)
  }

  /* ── 크기/위치 다음 → 영역 지정 ── */
  const handleSizePosNext = () => {
    clearTimers()
    localStorage.setItem('ssOnboardingStep', 'size')
    setKeypadOpen(false)
    setGestPanX(0); setGestPanY(0); setGestZoom(1)
    gestPanXRef.current = 0; gestPanYRef.current = 0; gestZoomRef.current = 1
    gestPtrsRef.current.clear()
    isGesturingRef.current = false
    setAnimPhase('to-area')
    const t1 = setTimeout(() => {
      setAnimPhase('area-select')
      setGuideTextVisible(false)
      requestAnimationFrame(() => requestAnimationFrame(() => setGuideTextVisible(true)))
    }, 300)
    timersRef.current.push(t1)
  }

  /* ── 영역 지정 다음 → 자동배치 ── */
  const handleAreaNext = () => {
    clearTimers()
    localStorage.setItem('ssOnboardingStep', 'area')
    setAnimPhase('to-auto-arrange')
    setAutoArrangePos(false)
    setAutoArrangeVisible(false)
    setRollingText('더 나은 배치를 위해 가구가 조금 더 필요해요. 필요한 가구를 추천해드릴게요.')
    setRollingHidden(false)
    setRollingFinal(true)
    setApReady(false)
    setApStep3(false)
    setUserBubbleIn(false)
    setApAiAck(false)
    setApAiAckIn(false)
    setApAckText('이제 가장 적합한 배치를 찾아드릴게요.')
    setApAckColor('#8c8c8c')
    setApAckBlink(false)
    setApSpinner2(false)
    setApRoomAuto(false)
    setApRoomAutoIn(false)
    setApPlacement(false)
    setApPlacementIn(false)
    setApPlacementClosing(false)
    setApRoomDown(false)
    setApSnackbar(false)
    setApSnackbarIn(false)
    setApKeyboardOpen(false)
    setDirectText('')
    setUserBubbleText('침대, 러그, 탁자, 스탠드를 모두 배치해줘.')
    setSheetHeight(320); sheetHeightRef.current = 320
    setBodyOffset(0)
    if (apBodyRef.current) apBodyRef.current.scrollTop = 0
    // double-RAF: transition 활성화 후 목표 위치로 이동
    requestAnimationFrame(() => requestAnimationFrame(() => setAutoArrangePos(true)))
    const t1 = setTimeout(() => {
      setAnimPhase('auto-arrange')
      requestAnimationFrame(() => requestAnimationFrame(() => setAutoArrangeVisible(true)))
      const tReady = setTimeout(() => setApReady(true), 1000)
      timersRef.current.push(tReady)
    }, 650)
    timersRef.current.push(t1)
  }

  const scrollBodyTo = (target) => {
    const el = apBodyRef.current
    if (!el) return
    const start    = el.scrollTop
    const dist     = target - start
    const duration = 400
    const eio      = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const t0       = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      el.scrollTop = start + dist * eio(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  /* ── 자동배치 Step3: 옵션1("모두 배치해줘") 선택 ── */
  const handleStep3 = () => {
    if (!apReady || apStep3) return
    setApStep3(true)
    const t1 = setTimeout(() => {
      setUserBubbleIn(true)
      requestAnimationFrame(() => {
        if (userBubbleRef.current && apBodyRef.current) {
          const offset = userBubbleRef.current.offsetTop
          setBodyOffset(offset + 200)
          requestAnimationFrame(() => scrollBodyTo(offset))
        }
      })
      const t2 = setTimeout(() => {
        setApAiAck(true)
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setApAiAckIn(true)
          if (apAiAckRef.current && apBodyRef.current) {
            const offset = apAiAckRef.current.offsetTop
            setBodyOffset(offset + 200)
            requestAnimationFrame(() => scrollBodyTo(offset - 20))
          }

          // ── Step4: ack 텍스트 롤링 시퀀스 ──
          // HTML 스펙 동일: 각 3000ms 간격, 교체 딜레이 320ms (0.3s fade + 20ms 버퍼)
          // t=0    : ack 등장 ("이제 가장 적합한...")
          // t=200  : 스피너 재등장
          // t=2000 : blink out → t=2320 "침대" + 이미지
          // t=5000 : blink out → t=5320 "탁자"
          // t=8000 : blink out → t=8320 "러그"
          // t=11000: blink out → t=11320 완료 문구 + 스피너 아웃
          const tSp  = setTimeout(() => setApSpinner2(true), 200)
          const tB0  = setTimeout(() => setApAckBlink(true), 2000)
          const tP1  = setTimeout(() => {
            setApAckText('침대를 먼저 배치하고 있어요.')
            setApAckBlink(false)
            setApRoomAuto(true)
            requestAnimationFrame(() => requestAnimationFrame(() => setApRoomAutoIn(true)))
          }, 2320)
          const tB1  = setTimeout(() => setApAckBlink(true), 5000)
          const tP2  = setTimeout(() => { setApAckText('탁자를 배치하고 있어요.'); setApAckBlink(false) }, 5320)
          const tB2  = setTimeout(() => setApAckBlink(true), 8000)
          const tP3  = setTimeout(() => { setApAckText('러그를 깔고 소품들을 배치하고 있어요.'); setApAckBlink(false) }, 8320)
          const tB3  = setTimeout(() => setApAckBlink(true), 11000)
          const tFin = setTimeout(() => {
            setApAckText('침실 영역에 배치가 완료되었어요. 최적의 배치 후보안을 확인해보세요.')
            setApAckColor('#141414')
            setApAckBlink(false)
            setApSpinner2(false)
          }, 11320)
          const tPlace = setTimeout(() => {
            setSheetHeight(368); sheetHeightRef.current = 368
            setApPlacement(true)
            requestAnimationFrame(() => requestAnimationFrame(() => setApPlacementIn(true)))
          }, 11720)
          timersRef.current.push(tSp, tB0, tP1, tB1, tP2, tB2, tP3, tB3, tFin, tPlace)
        }))
      }, 1500)
      timersRef.current.push(t2)
    }, 500)
    timersRef.current.push(t1)
  }

  /* ── 직접 입력 submit: 유저 버블 '침대만 배치하고 싶어' + 단축 시퀀스 ── */
  const handleDirectInput = () => {
    if (!apReady || apStep3 || !directText.trim()) return
    document.activeElement?.blur()
    setApKeyboardOpen(false)
    setUserBubbleText('침대만 배치하고 싶어')
    setApStep3(true)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setUserBubbleIn(true)
      if (userBubbleRef.current && apBodyRef.current) {
        const offset = userBubbleRef.current.offsetTop
        setBodyOffset(offset + 200)
        requestAnimationFrame(() => scrollBodyTo(offset))
      }
    }))
    const t2 = setTimeout(() => {
        setApAiAck(true)
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setApAiAckIn(true)
          if (apAiAckRef.current && apBodyRef.current) {
            const offset = apAiAckRef.current.offsetTop
            setBodyOffset(offset + 200)
            requestAnimationFrame(() => scrollBodyTo(offset - 20))
          }
          const tSp  = setTimeout(() => setApSpinner2(true), 200)
          const tB0  = setTimeout(() => setApAckBlink(true), 2000)
          const tP1  = setTimeout(() => {
            setApAckText('침대를 배치하고 있어요.')
            setApAckBlink(false)
            setApRoomAuto(true)
            requestAnimationFrame(() => requestAnimationFrame(() => setApRoomAutoIn(true)))
          }, 2320)
          const tB1  = setTimeout(() => setApAckBlink(true), 5000)
          const tFin = setTimeout(() => {
            setApAckText('침실 영역에 배치가 완료되었어요. 최적의 배치 후보안을 확인해보세요.')
            setApAckColor('#141414')
            setApAckBlink(false)
            setApSpinner2(false)
          }, 5320)
          const tPlace = setTimeout(() => {
            setDirectText('')
            setSheetHeight(368); sheetHeightRef.current = 368
            setApPlacement(true)
            requestAnimationFrame(() => requestAnimationFrame(() => setApPlacementIn(true)))
          }, 5720)
          timersRef.current.push(tSp, tB0, tP1, tB1, tFin, tPlace)
        }))
    }, 1500)
    timersRef.current.push(t2)
  }

  /* ── 배치안 확정 → 바텀시트 닫기 + 스낵바 ── */
  const handlePlacementSubmit = () => {
    setApPlacementClosing(true)
    setAutoArrangeVisible(false)
    setApRoomDown(true)
    const tSnackbar = setTimeout(() => {
      setApSnackbar(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setApSnackbarIn(true)))
      const tOut = setTimeout(() => {
        setApSnackbarIn(false)
        const tUnmount = setTimeout(() => setApSnackbar(false), 200)
        const tNav    = setTimeout(() => navigate('/onboarding-done'), 500)
        timersRef.current.push(tUnmount, tNav)
      }, 3000)
      timersRef.current.push(tOut)
    }, 300)
    timersRef.current.push(tSnackbar)
  }

  /* ── 영역 지정 → 크기/위치로 돌아가기 ── */
  const handleAreaBack = () => {
    clearTimers()
    setGuideTextVisible(false)
    setSizePosSheetOpen(false)
    setSpVisible(false)
    setAnimPhase('size-position')
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setSpVisible(true)
      const t = setTimeout(() => setSizePosSheetOpen(true), 50)
      timersRef.current.push(t)
    }))
  }

  /* ── 파생 값 ── */
  const rt       = ROOM_TYPES[selectedType]
  const addInitW = rt.zW * INIT_SIZE / ZOOM_SIZE
  const addInitH = rt.zH * INIT_SIZE / ZOOM_SIZE
  const cfg      = selectedDir ? getTypeConfig(selectedType, selectedDir) : null
  const isActive = animPhase !== 'idle'
  const isZoomed = animPhase === 'zoomed' || animPhase === 'size-position' || animPhase === 'to-area' || animPhase === 'area-select'

  const rotDeg = selectedDir ? (DIR_ROTATE[selectedDir] ?? 0) : 0
  const rotStr = rotDeg !== 0 ? ` rotate(${rotDeg}deg)` : ''

  // Add Room 픽셀 중심 (config 기준)
  const addOff_px = (ZOOM_SIZE - INIT_BORDER) / 2  // 65.5
  const ty_px     = 19.5 + rt.zW / 4
  const by_px     = -43.5 - rt.zW / 4

  let addCX = SCREEN_W / 2, addCY = SCREEN_H / 2
  if (selectedDir === 'right')  { addCX = SCREEN_W / 2 + addOff_px; addCY = SCREEN_H / 2 - 12 }
  if (selectedDir === 'left')   { addCX = SCREEN_W / 2 - addOff_px; addCY = SCREEN_H / 2 - 12 }
  if (selectedDir === 'top')    { addCX = SCREEN_W / 2;             addCY = SCREEN_H / 2 + by_px }
  if (selectedDir === 'bottom') { addCX = SCREEN_W / 2;             addCY = SCREEN_H / 2 + ty_px }

  // Default Room 중심 좌표 (size-position 제약 계산용)
  const defOff = (rt.zW - INIT_BORDER) / 2
  let defCX = SCREEN_W / 2, defCY = SCREEN_H / 2
  if (selectedDir === 'right')  { defCX = SCREEN_W/2 - defOff; defCY = SCREEN_H/2 - 12 }
  if (selectedDir === 'left')   { defCX = SCREEN_W/2 + defOff; defCY = SCREEN_H/2 - 12 }
  if (selectedDir === 'top')    { defCX = SCREEN_W/2;           defCY = SCREEN_H/2 + ty_px }
  if (selectedDir === 'bottom') { defCX = SCREEN_W/2;           defCY = SCREEN_H/2 + by_px }
  defCXRef.current = defCX
  defCYRef.current = defCY

  // 크기/위치 동적 값
  const dfCm        = INIT_CM[selectedType]
  const curWidthCm  = addWidthCm  ?? dfCm.w
  const curHeightCm = addHeightCm ?? dfCm.h
  const curVisualW  = curWidthCm  * CM_TO_PX
  const curVisualH  = curHeightCm * CM_TO_PX
  const curAddCX    = dynAddCX ?? addCX
  const curAddCY    = dynAddCY ?? addCY

  // 회전 여부에 따른 화면 좌표 시각 크기
  const absRotDeg  = Math.abs(rotDeg) % 360
  const isSwapped  = absRotDeg === 90 || absRotDeg === 270
  const curEffVW   = isSwapped ? curVisualH : curVisualW
  const curEffVH   = isSwapped ? curVisualW : curVisualH

  // Scale 버튼 위치 및 드래그 pivot (방향별)
  // right/top: 우측 상단 꼭지점 / left: 좌측 상단 꼭지점 / bottom: 우측 하단 꼭지점
  let scaleBtnCX  = curAddCX + curEffVW / 2   // right / top
  let scaleBtnCY  = curAddCY - curEffVH / 2   // right / top / left
  let scalePivotX = curAddCX - curEffVW / 2   // right / top / bottom (좌측 엣지)
  let scalePivotY = curAddCY + curEffVH / 2   // right / top / left  (하단 엣지)
  if (selectedDir === 'left') {
    scaleBtnCX  = curAddCX - curEffVW / 2     // 좌측 상단 꼭지점
    scalePivotX = curAddCX + curEffVW / 2     // pivot: 우측 엣지
  }
  if (selectedDir === 'bottom') {
    scaleBtnCY  = curAddCY + curEffVH / 2     // 우측 하단 꼭지점
    scalePivotY = curAddCY - curEffVH / 2     // pivot: 상단 엣지
  }

  // size-position 에서 CSS 크기 (visual / SCALE)
  const dynAddInitW = (animPhase === 'size-position' || animPhase === 'to-area' || animPhase === 'area-select') ? curVisualW / SCALE : addInitW
  const dynAddInitH = (animPhase === 'size-position' || animPhase === 'to-area' || animPhase === 'area-select') ? curVisualH / SCALE : addInitH

  // size-position 이미지: 초기(자연) 크기 기준, 확대 시 함께 커짐 / 축소 시 크롭
  const isImgRotated  = rt.imgAngle % 180 !== 0
  const contentCssW   = dynAddInitW - INIT_BORDER * 2
  const contentCssH   = dynAddInitH - INIT_BORDER * 2
  const natCssW       = dfCm.w * CM_TO_PX / SCALE - INIT_BORDER * 2
  const natCssH       = dfCm.h * CM_TO_PX / SCALE - INIT_BORDER * 2
  // 이미지 CSS 크기: 현재 컨테이너와 자연 크기 중 큰 쪽 (확대 → 채움, 축소 → 크롭)
  // 회전된 이미지는 CSS W↔H 가 시각 H↔W 에 대응하므로 스왑
  const spImgCssW     = isImgRotated ? Math.max(natCssH, contentCssH) : Math.max(natCssW, contentCssW)
  const spImgCssH     = isImgRotated ? Math.max(natCssW, contentCssW) : Math.max(natCssH, contentCssH)

  // 화면 줌 아웃: scale 버튼 포함 content bounding box가 화면을 넘을 때 scale down
  // transform-origin 50% 50% → 화면 중앙 기준 반경으로 계산
  const MARGIN = 16
  let viewScale = 1
  if (animPhase === 'size-position' && selectedDir) {
    const cL = Math.min(curAddCX - curEffVW / 2, defCX - ZOOM_SIZE / 2, scaleBtnCX - 20)
    const cR = Math.max(curAddCX + curEffVW / 2, defCX + ZOOM_SIZE / 2, scaleBtnCX + 20)
    const cT = Math.min(curAddCY - curEffVH / 2, defCY - ZOOM_SIZE / 2, scaleBtnCY - 20)
    const cB = Math.max(curAddCY + curEffVH / 2, defCY + ZOOM_SIZE / 2, scaleBtnCY + 20)
    // 화면 중심(50% 50%) 기준 최대 반경 → 각 방향이 margin 내에 들어오도록
    const halfW = Math.max(cR - SCREEN_W / 2, SCREEN_W / 2 - cL)
    const halfH = Math.max(cB - SCREEN_H / 2, SCREEN_H / 2 - cT)
    const vsW = halfW > 0 ? (SCREEN_W / 2 - MARGIN) / halfW : 1
    const vsH = halfH > 0 ? (SCREEN_H / 2 - MARGIN) / halfH : 1
    viewScale = Math.min(1, vsW, vsH)
  }

  // 제스처 줌 합산 및 ref 동기화
  viewScaleRef.current = viewScale
  const totalScale = viewScale * gestZoom
  gestZoomRef.current = gestZoom

  // Delete 버튼 겹침 감지 → gap 전환 (totalScale 이후에 계산)
  const isSPDragging   = dragRef.current !== null || moveRef.current !== null
  const delBtnHalf     = 20 / totalScale
  const delBtnCenterY  = curAddCY - curEffVH / 2 - 12 - delBtnHalf
  const deleteOverlaps = animPhase === 'size-position' &&
    Math.abs(curAddCX - scaleBtnCX) < delBtnHalf * 2 &&
    Math.abs(delBtnCenterY - scaleBtnCY) < delBtnHalf * 2
  const delBtnGap = deleteOverlaps ? 24 : 12
  const delBtnTop = curAddCY - curEffVH / 2 - delBtnGap - delBtnHalf * 2
  const delBtnTransition = isSPDragging
    ? 'none'
    : isUndoing
      ? 'left 300ms ease-in-out, top 300ms ease-in-out'
      : 'top 400ms ease-in-out, left 400ms ease-in-out'
  gestPanXRef.current = gestPanX
  gestPanYRef.current = gestPanY

  // 제스처 패닝 허용 범위: 1500cm + 상하좌우 60px
  const PAN_HALF_EXTENT = SLIDER_MAX * CM_TO_PX / 2 + 60
  // 핀치 줌 최소 배율: 1500cm가 (화면 - 120px) 내에 들어오는 배율
  const MIN_TOTAL_SCALE = (Math.min(SCREEN_W, SCREEN_H) - 120) / (SLIDER_MAX * CM_TO_PX)

  /* ── 두 손가락 제스처 핸들러 ── */
  const handleWorldPtrDown = (e) => {
    if (animPhase !== 'size-position') return
    gestPtrsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (gestPtrsRef.current.size === 2) {
      const ptrs = [...gestPtrsRef.current.values()]
      const midX = (ptrs[0].x + ptrs[1].x) / 2
      const midY = (ptrs[0].y + ptrs[1].y) / 2
      const dist = Math.hypot(ptrs[1].x - ptrs[0].x, ptrs[1].y - ptrs[0].y)
      gestPrevRef.current = { midX, midY, dist }
      isGesturingRef.current = true
    }
  }

  const handleWorldPtrMove = (e) => {
    if (animPhase !== 'size-position') return
    if (!gestPtrsRef.current.has(e.pointerId)) return
    gestPtrsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (gestPtrsRef.current.size < 2 || !gestPrevRef.current) return

    const ptrs = [...gestPtrsRef.current.values()]
    const midX = (ptrs[0].x + ptrs[1].x) / 2
    const midY = (ptrs[0].y + ptrs[1].y) / 2
    const dist = Math.hypot(ptrs[1].x - ptrs[0].x, ptrs[1].y - ptrs[0].y)

    const panDX = midX - gestPrevRef.current.midX
    const panDY = midY - gestPrevRef.current.midY
    const zoomRatio = gestPrevRef.current.dist > 10 ? dist / gestPrevRef.current.dist : 1
    gestPrevRef.current = { midX, midY, dist }

    const vs = viewScaleRef.current
    const newZoom = gestZoomRef.current * zoomRatio
    const minGZ = vs > 0 ? MIN_TOTAL_SCALE / vs : 0.1
    const clampedZoom = Math.max(minGZ, Math.min(4, newZoom))
    const ts = vs * clampedZoom
    const boundX = Math.max(0, PAN_HALF_EXTENT * ts - SCREEN_W / 2)
    const boundY = Math.max(0, PAN_HALF_EXTENT * ts - SCREEN_H / 2)
    const clampedPanX = Math.max(-boundX, Math.min(boundX, gestPanXRef.current + panDX))
    const clampedPanY = Math.max(-boundY, Math.min(boundY, gestPanYRef.current + panDY))

    gestZoomRef.current  = clampedZoom
    gestPanXRef.current  = clampedPanX
    gestPanYRef.current  = clampedPanY
    setGestZoom(clampedZoom)
    setGestPanX(clampedPanX)
    setGestPanY(clampedPanY)
  }

  const handleWorldPtrUp = (e) => {
    gestPtrsRef.current.delete(e.pointerId)
    if (gestPtrsRef.current.size < 2) {
      isGesturingRef.current = false
      gestPrevRef.current = null
    } else {
      const ptrs = [...gestPtrsRef.current.values()]
      const midX = (ptrs[0].x + ptrs[1].x) / 2
      const midY = (ptrs[0].y + ptrs[1].y) / 2
      const dist = Math.hypot(ptrs[1].x - ptrs[0].x, ptrs[1].y - ptrs[0].y)
      gestPrevRef.current = { midX, midY, dist }
    }
  }

  /* ── Scale 버튼 드래그 핸들러 ── */
  const handleScalePtrDown = (e) => {
    if (isGesturingRef.current) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = screenRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: SCREEN_W, height: SCREEN_H }
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startEVW: curEffVW,
      startEVH: curEffVH,
      pivotX:  scalePivotX,
      pivotY:  scalePivotY,
      scaleX:  SCREEN_W / rect.width,
      scaleY:  SCREEN_H / rect.height,
      vs:      totalScale,
      dir:     selectedDir,
      snapshot: { wCm: curWidthCm, hCm: curHeightCm, cx: curAddCX, cy: curAddCY },
      didChange: false,
    }
  }

  const handleScalePtrMove = (e) => {
    if (isGesturingRef.current) return
    const d = dragRef.current
    if (!d) return
    const dx = (e.clientX - d.startClientX) * d.scaleX / d.vs
    const dy = (e.clientY - d.startClientY) * d.scaleY / d.vs
    const MIN_PX = SLIDER_MIN * CM_TO_PX
    const MAX_PX = SLIDER_MAX * CM_TO_PX
    d.didChange = true
    if (d.dir === 'right') {
      // dx → W 증가, -dy → H 증가 / pivot: 좌측 하단
      const newW = Math.max(MIN_PX, Math.min(MAX_PX, d.startEVW + dx))
      const newH = Math.max(MIN_PX, Math.min(MAX_PX, d.startEVH - dy))
      setAddWidthCm(Math.round(newW / CM_TO_PX))
      setAddHeightCm(Math.round(newH / CM_TO_PX))
      setDynAddCX(d.pivotX + newW / 2)
      setDynAddCY(d.pivotY - newH / 2)
    } else if (d.dir === 'left') {
      // -dx → W 증가, -dy → H 증가 / pivot: 우측 하단
      const newW = Math.max(MIN_PX, Math.min(MAX_PX, d.startEVW - dx))
      const newH = Math.max(MIN_PX, Math.min(MAX_PX, d.startEVH - dy))
      setAddWidthCm(Math.round(newW / CM_TO_PX))
      setAddHeightCm(Math.round(newH / CM_TO_PX))
      setDynAddCX(d.pivotX - newW / 2)
      setDynAddCY(d.pivotY - newH / 2)
    } else if (d.dir === 'top') {
      // isSwapped: dx → curVisualH(EVW), -dy → curVisualW(EVH) / pivot: 좌측 하단
      const newEVW = Math.max(MIN_PX, Math.min(MAX_PX, d.startEVW + dx))
      const newEVH = Math.max(MIN_PX, Math.min(MAX_PX, d.startEVH - dy))
      setAddHeightCm(Math.round(newEVW / CM_TO_PX))  // EVW = curVisualH
      setAddWidthCm(Math.round(newEVH / CM_TO_PX))   // EVH = curVisualW
      setDynAddCX(d.pivotX + newEVW / 2)
      setDynAddCY(d.pivotY - newEVH / 2)
    } else if (d.dir === 'bottom') {
      // isSwapped: dx → curVisualH(EVW), dy → curVisualW(EVH) / pivot: 좌측 상단
      const newEVW = Math.max(MIN_PX, Math.min(MAX_PX, d.startEVW + dx))
      const newEVH = Math.max(MIN_PX, Math.min(MAX_PX, d.startEVH + dy))
      setAddHeightCm(Math.round(newEVW / CM_TO_PX))  // EVW = curVisualH
      setAddWidthCm(Math.round(newEVH / CM_TO_PX))   // EVH = curVisualW
      setDynAddCX(d.pivotX + newEVW / 2)
      setDynAddCY(d.pivotY + newEVH / 2)
    }
  }

  const handleScalePtrUp = () => {
    const d = dragRef.current
    if (d?.didChange) {
      historyRef.current.push(d.snapshot)
      setHistoryLen(historyRef.current.length)
      redoRef.current = []; setRedoLen(0)
    }
    dragRef.current = null
  }

  /* ── Handler 버튼 드래그 핸들러 ── */
  const handleMovePtrDown = (e) => {
    if (isGesturingRef.current) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = screenRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: SCREEN_W, height: SCREEN_H }
    moveRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startCX: curAddCX,
      startCY: curAddCY,
      scaleX:  SCREEN_W / rect.width,
      scaleY:  SCREEN_H / rect.height,
      vs:      totalScale,
      snapshot: { wCm: curWidthCm, hCm: curHeightCm, cx: curAddCX, cy: curAddCY },
      didChange: false,
    }
  }

  const handleMovePtrMove = (e) => {
    if (isGesturingRef.current) return
    const d = moveRef.current
    if (!d) return
    const dx = (e.clientX - d.startClientX) * d.scaleX / d.vs
    const dy = (e.clientY - d.startClientY) * d.scaleY / d.vs
    const minOvPx = SLIDER_MIN * CM_TO_PX

    if (selectedDir === 'right' || selectedDir === 'left') {
      const newCY  = d.startCY + dy
      const minCY  = defCY - ZOOM_SIZE / 2 + minOvPx - curEffVH / 2
      const maxCY  = defCY + ZOOM_SIZE / 2 - minOvPx + curEffVH / 2
      const clampedCY = Math.max(minCY, Math.min(maxCY, newCY))
      if (clampedCY !== d.startCY) d.didChange = true
      setDynAddCY(clampedCY)
    } else {
      const newCX  = d.startCX + dx
      const minCX  = defCX - ZOOM_SIZE / 2 + minOvPx - curEffVW / 2
      const maxCX  = defCX + ZOOM_SIZE / 2 - minOvPx + curEffVW / 2
      const clampedCX = Math.max(minCX, Math.min(maxCX, newCX))
      if (clampedCX !== d.startCX) d.didChange = true
      setDynAddCX(clampedCX)
    }
  }

  const handleMovePtrUp = () => {
    const d = moveRef.current
    if (d?.didChange) {
      historyRef.current.push(d.snapshot)
      setHistoryLen(historyRef.current.length)
      redoRef.current = []; setRedoLen(0)
    }
    moveRef.current = null
  }

  /* ── 슬라이더/인풋 변경 (pivot 유지) ── */
  const handleWidthChange = (newCm) => {
    const clamped = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, newCm))
    const newW    = clamped * CM_TO_PX
    setAddWidthCm(clamped)
    if (selectedDir === 'right' || selectedDir === 'top') {
      // right: 좌측 엣지 고정, top(isSwapped): W 변화 → 화면 Y 하단 엣지 고정
      if (selectedDir === 'top') {
        const pivotY = curAddCY + curVisualW / 2  // 화면 하단 엣지
        setDynAddCY(pivotY - newW / 2)
      } else {
        const pivotX = curAddCX - curVisualW / 2
        setDynAddCX(pivotX + newW / 2)
      }
    } else if (selectedDir === 'left') {
      // 우측 엣지 고정
      const pivotX = curAddCX + curVisualW / 2
      setDynAddCX(pivotX - newW / 2)
    } else if (selectedDir === 'bottom') {
      // isSwapped: W 변화 → 화면 Y 상단 엣지 고정
      const pivotY = curAddCY - curVisualW / 2
      setDynAddCY(pivotY + newW / 2)
    }
  }

  const handleHeightChange = (newCm) => {
    const clamped = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, newCm))
    const newH    = clamped * CM_TO_PX
    setAddHeightCm(clamped)
    if (selectedDir === 'right' || selectedDir === 'left') {
      // 하단 엣지 고정, 위쪽으로 성장
      const pivotY = curAddCY + curVisualH / 2
      setDynAddCY(pivotY - newH / 2)
    } else if (selectedDir === 'top' || selectedDir === 'bottom') {
      // isSwapped: H 변화 → 화면 X 좌측 엣지 고정
      const pivotX = curAddCX - curVisualH / 2
      setDynAddCX(pivotX + newH / 2)
    }
  }

  /* ── 실행 취소 ── */
  const handleUndo = () => {
    if (historyRef.current.length === 0) return
    const prev = historyRef.current.pop()
    setHistoryLen(historyRef.current.length)
    // 현재 상태를 redo 스택에 보존
    redoRef.current.push({ wCm: curWidthCm, hCm: curHeightCm, cx: curAddCX, cy: curAddCY })
    setRedoLen(redoRef.current.length)
    setIsUndoing(true)
    setAddWidthCm(prev.wCm)
    setAddHeightCm(prev.hCm)
    setDynAddCX(prev.cx)
    setDynAddCY(prev.cy)
    const t = setTimeout(() => setIsUndoing(false), 300)
    timersRef.current.push(t)
  }

  /* ── 다시 실행 ── */
  const handleRedo = () => {
    if (redoRef.current.length === 0) return
    const next = redoRef.current.pop()
    setRedoLen(redoRef.current.length)
    // 현재 상태를 history 스택에 보존
    historyRef.current.push({ wCm: curWidthCm, hCm: curHeightCm, cx: curAddCX, cy: curAddCY })
    setHistoryLen(historyRef.current.length)
    setIsUndoing(true)
    setAddWidthCm(next.wCm)
    setAddHeightCm(next.hCm)
    setDynAddCX(next.cx)
    setDynAddCY(next.cy)
    const t = setTimeout(() => setIsUndoing(false), 300)
    timersRef.current.push(t)
  }

  /* ── 키패드 핸들러 ── */
  const openKeypad = (field) => {
    setActiveInput(field)
    setKeypadDraft('')
    setKeypadOpen(true)
  }

  const closeKeypad = () => {
    setKeypadOpen(false)
    setActiveInput(null)
    setKeypadDraft('')
  }

  const handleKeypadPress = (key) => {
    const isWidth = activeInput === 'width'
    if (key === 'del') {
      const newDraft = keypadDraft.slice(0, -1)
      setKeypadDraft(newDraft)
      if (newDraft !== '') {
        const val = parseInt(newDraft, 10)
        if (!isNaN(val)) isWidth ? handleWidthChange(val) : handleHeightChange(val)
      }
    } else {
      if (keypadDraft.length >= 4) return
      const newDraft = keypadDraft + key
      setKeypadDraft(newDraft)
      const val = parseInt(newDraft, 10)
      if (!isNaN(val)) isWidth ? handleWidthChange(val) : handleHeightChange(val)
    }
  }

  /* ── 기본 방 스타일 ── */
  const isAutoPhase = animPhase === 'to-auto-arrange' || animPhase === 'auto-arrange'
  const defRoomLeft = isAutoPhase
    ? (autoArrangePos ? `${AUTO_ARRANGE_CX}px` : (cfg ? cfg.def.left : '50%'))
    : (isZoomed && cfg ? cfg.def.left : '50%')
  const defRoomTop = isAutoPhase
    ? (autoArrangePos ? `${AUTO_ARRANGE_CY + (apRoomDown ? 90 : 0)}px` : (cfg ? cfg.def.top : 'calc(50% - 15.5px)'))
    : (isZoomed && cfg ? cfg.def.top : 'calc(50% - 15.5px)')
  const defRoomScaleVal = isAutoPhase
    ? (autoArrangePos ? AUTO_ARRANGE_SCALE : SCALE)
    : (isZoomed ? SCALE : 1)

  const defaultRoomStyle = {
    ...s.room,
    border:    `${INIT_BORDER / totalScale}px solid #080809`,
    left:      defRoomLeft,
    top:       defRoomTop,
    transform: `translateX(-50%) translateY(-50%) scale(${defRoomScaleVal})`,
    transition: apRoomDown
      ? 'top 500ms ease-in-out'
      : (animPhase === 'to-auto-arrange')
        ? 'left 600ms ease-in-out, top 600ms ease-in-out, transform 600ms ease-in-out'
        : (animPhase === 'zoomed' || animPhase === 'unzooming')
          ? 'left 600ms ease-in-out, top 600ms ease-in-out, transform 600ms ease-in-out'
        : 'none',
  }

  /* ── 추가 방 스타일 ── */
  const getAddedTransform = () => {
    const base = 'translateX(-50%) translateY(-50%)'
    if (isZoomed)                    return `${base} scale(${SCALE})${rotStr}`
    if (animPhase === 'unzooming')   return `${base}${rotStr}`
    if (animPhase === 'sliding-out') return slidingOut
      ? `${base} ${cfg.slideExtra}${rotStr}`
      : `${base}${rotStr}`
    return newRoomReady ? `${base}${rotStr}` : `${base} ${cfg.slideExtra}${rotStr}`
  }

  const getAddedTransition = () => {
    if (animPhase === 'sliding')     return 'transform 500ms ease-in-out'
    if (animPhase === 'zoomed')      return 'left 600ms ease-in-out, top 600ms ease-in-out, transform 600ms ease-in-out'
    if (animPhase === 'unzooming')   return 'left 600ms ease-in-out, top 600ms ease-in-out, transform 600ms ease-in-out'
    if (animPhase === 'sliding-out') return 'transform 500ms ease-in-out, opacity 500ms ease-in-out'
    return 'none'
  }

  const addedRoomStyle = cfg ? {
    ...s.room,
    width:      dynAddInitW,
    height:     dynAddInitH,
    border:     `${INIT_BORDER / totalScale}px solid ${(animPhase === 'to-area' || animPhase === 'area-select') ? '#080809' : '#FFFFFF'}`,
    // auto 페이즈엔 area-select 시점 위치/transform 그대로 고정 (위치 이동 없이 opacity만)
    left:       (animPhase === 'size-position' || animPhase === 'to-area' || animPhase === 'area-select' || isAutoPhase) ? `${curAddCX}px` : (isZoomed ? cfg.added.left : cfg.adjacent.left),
    top:        (animPhase === 'size-position' || animPhase === 'to-area' || animPhase === 'area-select' || isAutoPhase) ? `${curAddCY}px` : (isZoomed ? cfg.added.top  : cfg.adjacent.top),
    transform:  isAutoPhase
      ? `translateX(-50%) translateY(-50%) scale(${SCALE})${rotStr}`
      : getAddedTransform(),
    opacity:    (animPhase === 'sliding-out' && slidingOut) || isAutoPhase ? 0 : 1,
    transition: isAutoPhase
      ? 'opacity 400ms ease-in-out'
      : (animPhase === 'to-area' || animPhase === 'area-select')
        ? 'none'
        : animPhase === 'size-position'
          ? (isUndoing ? 'left 300ms ease-in-out, top 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out' : 'none')
          : getAddedTransition(),
  } : null

  /* ── 그리드 스타일 ── */
  const gridStyle = {
    ...s.grid,
    left:   isZoomed ? 0   : -25,
    top:    isZoomed ? 113 : 106,
    width:  isZoomed ? 375 : 425,
    height: isZoomed ? 591 : 600,
    transition: (animPhase === 'zoomed' || animPhase === 'unzooming')
      ? 'left 600ms ease-in-out, top 600ms ease-in-out, width 600ms ease-in-out, height 600ms ease-in-out'
      : 'none',
  }

  const spBtnAnim = {
    transform:  animPhase === 'to-area' ? 'scale(0)' : `scale(${spVisible ? 1 : 0})`,
    transition: animPhase === 'to-area' ? 'transform 300ms ease-in-out' : (spVisible ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'),
  }

  return (
    <PhoneShell bg="#222">
      <div ref={screenRef} style={s.screen}>

        {/* ── Status Bar — 키패드 시 배경 fill ── */}
        <div style={{
          ...s.statusBar,
          background: keypadOpen ? '#222222' : 'transparent',
          transition: 'background 300ms ease-in-out',
          zIndex: 100,
        }}>
          <div style={s.sbTime}><div style={s.sbTimeInner}><img src={img941} alt="" style={s.sbTimeImg} /></div></div>
          <div style={s.sbLevels}><img src={imgLevels} alt="" style={s.sbLevelsImg} /></div>
        </div>

        {/* ── Content wrapper — 키패드 open 시 위로 슬라이드 ── */}
        <div
          style={{
            position: 'absolute', inset: 0,
            transform: keypadOpen ? `translateY(-${KEYPAD_H}px)` : 'none',
            transition: 'transform 300ms ease-in-out',
          }}
          onClick={keypadOpen ? closeKeypad : undefined}
        >

        {/* ── World (zoomable + pannable) ── */}
        <div
          onPointerDown={handleWorldPtrDown}
          onPointerMove={handleWorldPtrMove}
          onPointerUp={handleWorldPtrUp}
          onPointerCancel={handleWorldPtrUp}
          style={{
            position: 'absolute', inset: 0,
            touchAction: animPhase === 'size-position' ? 'none' : undefined,
            transform: animPhase === 'size-position'
              ? (gestPanX || gestPanY || totalScale !== 1
                ? `translate(${gestPanX}px, ${gestPanY}px) scale(${totalScale})`
                : undefined)
              : (viewScale < 1 ? `scale(${viewScale})` : undefined),
            transformOrigin: '50% 50%',
          }}
        >
          <img src={imgGrid} alt="" style={{
            ...gridStyle,
            opacity: (animPhase === 'to-area' || animPhase === 'area-select' || isAutoPhase) ? 0 : 1,
            transition: animPhase === 'to-area' ? 'opacity 300ms ease-in-out' : gridStyle.transition,
          }} />

          {/* 기본 방 */}
          <div style={defaultRoomStyle}>
            <img src={imgRoomImage} alt="" style={s.roomImg} />
            {apRoomAuto && (
              <img
                key={selectedPlacement}
                src={[imgAutoArrange1, imgAutoArrange2, imgAutoArrange3][selectedPlacement - 1]}
                alt=""
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: INIT_SIZE - INIT_BORDER * 2, height: INIT_SIZE - INIT_BORDER * 2,
                  objectFit: 'contain', objectPosition: 'center',
                  display: 'block', pointerEvents: 'none',
                  opacity: apRoomAutoIn ? 1 : 0,
                  animation: apRoomAutoIn ? 'ap-room-fadein 300ms ease-in both' : 'none',
                }}
              />
            )}
            {animPhase === 'auto-arrange' && (
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 40 / AUTO_ARRANGE_SCALE, height: 40 / AUTO_ARRANGE_SCALE,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none', zIndex: 5,
                opacity: apReady ? (apSpinner2 ? 1 : 0) : 1,
                transition: 'opacity 0.3s ease',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none"
                  style={{ animation: 'spaceai-spin 1s linear infinite' }}>
                  <circle cx="20" cy="20" r="15" stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none"/>
                  <circle cx="20" cy="20" r="15" stroke="#00A1FF" strokeWidth="3" fill="none"
                    strokeDasharray="28 66" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>

          {/* 추가 방 */}
          {isActive && addedRoomStyle && (
            <div style={addedRoomStyle}>
              <img
                src={rt.addImg}
                alt=""
                style={(animPhase === 'size-position' || animPhase === 'to-area' || animPhase === 'area-select' || isAutoPhase) ? {
                  position:      'absolute',
                  top:           '50%',
                  left:          '50%',
                  width:         spImgCssW,
                  height:        spImgCssH,
                  transform:     `translate(-50%, -50%)${rt.imgAngle ? ` rotate(${rt.imgAngle}deg)` : ''}`,
                  display:       'block',
                  pointerEvents: 'none',
                } : {
                  width:         rt.imgAngle % 180 !== 0 ? addInitH - INIT_BORDER * 2 : addInitW - INIT_BORDER * 2,
                  height:        rt.imgAngle % 180 !== 0 ? addInitW - INIT_BORDER * 2 : addInitH - INIT_BORDER * 2,
                  transform:     rt.imgAngle ? `rotate(${rt.imgAngle}deg)` : undefined,
                  objectFit:     'cover',
                  objectPosition:'center',
                  display:       'block',
                  pointerEvents: 'none',
                }}
              />
            </div>
          )}

          {/* 크기/위치: 하이라이팅 */}
          {(animPhase === 'size-position' || animPhase === 'to-area') && cfg && (
            <div style={{
              position: 'absolute',
              left: `${curAddCX}px`,
              top:  `${curAddCY}px`,
              width:  dynAddInitW,
              height: dynAddInitH,
              border: `${INIT_BORDER / totalScale}px solid white`,
              background: 'transparent',
              boxSizing: 'border-box',
              pointerEvents: 'none',
              transform: `translateX(-50%) translateY(-50%) scale(${SCALE})${rotStr}`,
              opacity: animPhase === 'to-area' ? 0 : 1,
              transition: animPhase === 'to-area'
                ? 'opacity 300ms ease-in-out'
                : (isUndoing ? 'left 300ms ease-in-out, top 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out' : 'none'),
            }} />
          )}

          {/* 크기/위치: Scale 버튼 (방향별 꼭지점) */}
          {(animPhase === 'size-position' || animPhase === 'to-area') && (
            <div
              style={{ ...s.spBtn, ...spBtnAnim, width: 40 / totalScale, height: 40 / totalScale, left: scaleBtnCX - 20 / totalScale, top: scaleBtnCY - 20 / totalScale, transition: isUndoing ? 'left 300ms ease-in-out, top 300ms ease-in-out' : 'none' }}
              onPointerDown={handleScalePtrDown}
              onPointerMove={handleScalePtrMove}
              onPointerUp={handleScalePtrUp}
            >
              <img src={iconScale} alt="" style={{ width: 20 / totalScale, height: 20 / totalScale, transform: selectedDir === 'left' ? 'rotate(90deg)' : selectedDir === 'bottom' ? 'rotate(-90deg)' : undefined }} />
            </div>
          )}

          {/* 크기/위치: Handler 버튼 (중앙 하단 12px gap) */}
          {(animPhase === 'size-position' || animPhase === 'to-area') && (
            <div
              style={{ ...s.spBtn, ...spBtnAnim, width: 52 / totalScale, height: 52 / totalScale, left: curAddCX - 26 / totalScale, top: curAddCY + curEffVH / 2 + 12, transition: isUndoing ? 'left 300ms ease-in-out, top 300ms ease-in-out' : 'none' }}
              onPointerDown={handleMovePtrDown}
              onPointerMove={handleMovePtrMove}
              onPointerUp={handleMovePtrUp}
            >
              <img src={iconMove} alt="" style={{ width: 24 / totalScale, height: 24 / totalScale }} />
            </div>
          )}

          {/* 크기/위치: Delete 버튼 (add room 상단 중앙 12px gap) */}
          {animPhase === 'size-position' && (
            <div
              style={{ ...s.spBtn, ...spBtnAnim, cursor: 'pointer', width: 40 / totalScale, height: 40 / totalScale, left: curAddCX - 20 / totalScale, top: delBtnTop, transition: delBtnTransition }}
              onClick={handleDeleteRoom}
            >
              <img src={iconTrash} alt="" style={{ width: 20 / totalScale, height: 20 / totalScale }} />
            </div>
          )}
        </div>{/* /world */}

        {/* Top Bar */}
        {animPhase === 'auto-arrange' ? (
          <div style={s.topBar}>
            <button style={s.closeBtn} onClick={() => navigate('/')}>
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
        ) : (
          <div style={s.topBar}>
            <div style={{ width: 24, height: 24, flexShrink: 0 }} />
            <span style={s.topTitle}>{animPhase === 'area-select' ? '침실 영역 지정하기' : '방 만들기'}</span>
            <button style={s.closeBtn} onClick={() => navigate('/')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M18 6L6 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Tutorial Card */}
        {(animPhase === 'area-select' || animPhase === 'to-auto-arrange') ? (
          <div style={s.card}>
            <div style={s.cardInner}>
              <div style={s.cardTexts}>
                <span style={s.cardStep}>Step 2. 방 영역 지정하기</span>
                <span style={s.cardDesc}>침실 영역을 지정해 보세요</span>
              </div>
            </div>
          </div>
        ) : animPhase === 'auto-arrange' ? (
          <div style={s.card}>
            <div style={s.cardInner}>
              <div style={s.cardTexts}>
                <span style={s.cardStep}>Step 3. 가구 자동 배치 해보기</span>
                <span style={s.cardDesc}>침실에 맞는 가구를 자동으로 배치해 드릴게요</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={s.card}>
            <div style={s.cardInner}>
              <div style={s.cardTexts}>
                <span style={s.cardStep}>Step 1. 방 만들기</span>
                <span style={s.cardDesc}>
                  {(animPhase === 'size-position' || animPhase === 'to-area')
                    ? '방의 크기와 위치를 변경할 수 있어요'
                    : isActive
                      ? '방의 용도를 선택해 주세요'
                      : '붙이고 싶은 방의 방향을 선택해 주세요'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 크기/위치: Undo / Redo */}
        {(animPhase === 'size-position' || animPhase === 'to-area') && (
          <div style={{
            ...s.undoRedo,
            transform: animPhase === 'to-area' ? 'translateY(300px)' : 'none',
            transition: animPhase === 'to-area' ? 'transform 300ms ease-in-out' : 'none',
          }}>
            {/* Left — undo, active when history exists */}
            <button
              style={{
                ...s.undoRedoBtn,
                background: historyLen > 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                border:     '1px solid rgba(255,255,255,0.2)',
                cursor:     historyLen > 0 ? 'pointer' : 'default',
              }}
              onClick={handleUndo}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 14L4 9L9 4" stroke={historyLen > 0 ? 'white' : '#757575'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 9h11a5 5 0 010 10H12" stroke={historyLen > 0 ? 'white' : '#757575'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* Right — redo, active when redo stack exists */}
            <button
              style={{
                ...s.undoRedoBtn,
                background: redoLen > 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                border:     '1px solid rgba(255,255,255,0.2)',
                cursor:     redoLen > 0 ? 'pointer' : 'default',
              }}
              onClick={handleRedo}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 14l5-5-5-5" stroke={redoLen > 0 ? 'white' : '#757575'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 9H9a5 5 0 000 10h3" stroke={redoLen > 0 ? 'white' : '#757575'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* 방향 화살표 */}
        {(animPhase === 'idle' || arrowsHiding) && (
          <>
            <ArrowBtn left={173} top={255} icon={iconArrowUp}    hiding={arrowsHiding} ready={arrowsReady} onClick={() => handleArrow('top')} />
            <ArrowBtn left={173} top={498} icon={iconArrowDown}  hiding={arrowsHiding} ready={arrowsReady} onClick={() => handleArrow('bottom')} />
            <ArrowBtn left={295} top={377} icon={iconArrowRight} hiding={arrowsHiding} ready={arrowsReady} onClick={() => handleArrow('right')} />
            <ArrowBtn left={52}  top={377} icon={iconArrowLeft}  hiding={arrowsHiding} ready={arrowsReady} onClick={() => handleArrow('left')} />
          </>
        )}

        {/* 용도 선택 Bottom Sheet */}
        {isActive && animPhase !== 'size-position' && !isAutoPhase && (
          <div style={{ ...s.bottomSheet, transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)' }}>
            <div ref={typeRowRef} style={s.typeRow}>
              {ROOM_TYPES.map((type, i) => (
                <button key={i} style={s.typeCard} onClick={() => setSelectedType(i)}>
                  {selectedType === i && <div style={s.typeCardSelect} />}
                  <div style={s.thumbnail}>
                    <img src={type.img} alt={type.name} style={{ width: type.w, height: type.h, display: 'block', objectFit: 'contain' }} />
                  </div>
                  <span style={s.typeLabel}>{type.name}</span>
                </button>
              ))}
            </div>
            <div style={s.ctaArea}>
              <button style={s.skipBtn} onClick={handleBack}>이전</button>
              <button style={s.nextBtn} onClick={handleNext}>다음</button>
            </div>
          </div>
        )}

        {/* 크기/위치 Bottom Sheet */}
        {(animPhase === 'size-position' || animPhase === 'to-area') && (
          <div
            style={{
              ...s.bottomSheet,
              transform: animPhase === 'to-area' ? 'translateY(100%)' : (sizePosSheetOpen ? 'translateY(0)' : 'translateY(100%)'),
              transition: animPhase === 'to-area' ? 'transform 300ms ease-in-out' : 'transform 400ms ease-in-out',
            }}
            onClick={e => keypadOpen && e.stopPropagation()}
          >
            <div style={s.infoRow}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="8" cy="8" r="6.5" stroke="#8c8c8c" strokeWidth="1.1" />
                <path d="M8 7.5v3.5" stroke="#8c8c8c" strokeWidth="1.1" strokeLinecap="round" />
                <circle cx="8" cy="5.5" r="0.7" fill="#8c8c8c" />
              </svg>
              <span style={s.infoText}>가로·세로는 100~1500 범위에서 설정할 수 있어요.</span>
            </div>
            <div style={s.sliderSection}>
              <div style={s.sliderRow}>
                <span style={s.sliderLabel}>가로</span>
                <SpaceAiSlider value={curWidthCm}  onChange={handleWidthChange} />
                <div style={s.inputRight}>
                  <div style={{
                    ...s.inputBox,
                    borderColor: keypadOpen && activeInput === 'width' ? '#00a1ff' : '#7f7f7f',
                  }}>
                    <input
                      type="text"
                      inputMode="none"
                      readOnly
                      value={keypadOpen && activeInput === 'width' && keypadDraft !== '' ? keypadDraft : String(curWidthCm)}
                      style={s.inputField}
                      onClick={() => openKeypad('width')}
                    />
                  </div>
                  <span style={s.unitLabel}>cm</span>
                </div>
              </div>
              <div style={s.sliderRow}>
                <span style={s.sliderLabel}>세로</span>
                <SpaceAiSlider value={curHeightCm} onChange={handleHeightChange} />
                <div style={s.inputRight}>
                  <div style={{
                    ...s.inputBox,
                    borderColor: keypadOpen && activeInput === 'height' ? '#00a1ff' : '#7f7f7f',
                  }}>
                    <input
                      type="text"
                      inputMode="none"
                      readOnly
                      value={keypadOpen && activeInput === 'height' && keypadDraft !== '' ? keypadDraft : String(curHeightCm)}
                      style={s.inputField}
                      onClick={() => openKeypad('height')}
                    />
                  </div>
                  <span style={s.unitLabel}>cm</span>
                </div>
              </div>
            </div>
            <div style={s.ctaArea}>
              <button style={s.skipBtn} onClick={handleSizePosBack}>이전</button>
              <button style={s.nextBtn} onClick={handleSizePosNext}>완료</button>
            </div>
          </div>
        )}

        </div>{/* /content-wrapper */}

        {/* ── 영역 지정 Guide Text ── */}
        {animPhase === 'area-select' && (
          <div style={{
            position: 'absolute',
            left: 'calc(50% + 0.5px)',
            bottom: 86,
            transform: (!areaDrawn && !areaDragPreview && !areaSnackbar && guideTextVisible)
              ? 'translate(-50%, 0)' : 'translate(-50%, 80px)',
            opacity: (!areaDrawn && !areaDragPreview && !areaSnackbar && guideTextVisible) ? 1 : 0,
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 12,
            color: '#fff',
            fontFamily: "'Pretendard', sans-serif",
            fontSize: 16, fontWeight: 400, lineHeight: '24px',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 7,
            transition: 'transform 0.4s ease, opacity 0.3s ease',
          }}>
            드래그하여 침실 영역을 지정해주세요.
          </div>
        )}

        {/* ── 영역 지정 SVG 오버레이 ── */}
        {(animPhase === 'area-select' || animPhase === 'to-auto-arrange') && (
          <svg
            ref={areaSvgRef}
            width={SCREEN_W}
            height={SCREEN_H}
            viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
            style={{
              position: 'absolute', inset: 0, zIndex: 15,
              touchAction: animPhase === 'area-select' ? 'none' : undefined,
              pointerEvents: animPhase === 'to-auto-arrange' ? 'none' : undefined,
              opacity: animPhase === 'to-auto-arrange' ? 0 : 1,
              transition: animPhase === 'to-auto-arrange' ? 'opacity 400ms ease-in-out' : 'none',
            }}
            onPointerDown={handleAreaDown}
            onPointerMove={handleAreaMove}
            onPointerUp={handleAreaUp}
            onPointerCancel={handleAreaUp}
          >
            {/* 드래그 프리뷰 (파란 점선) */}
            {areaDragPreview && areaDragPreview.w > 5 && areaDragPreview.h > 5 && (
              <rect
                x={areaDragPreview.x} y={areaDragPreview.y}
                width={areaDragPreview.w} height={areaDragPreview.h}
                rx="4"
                fill="#00A1FF" fillOpacity="0.2"
                stroke="#00A1FF" strokeWidth="2" strokeDasharray="6 6"
                pointerEvents="none"
              />
            )}
            {/* 지정 영역 — 수정하기 모드: 파란 점선 + 핸들 / 일반: 초록 + 칩 */}
            {areaZone && areaDrawn && (() => {
              const z = areaZone
              if (areaEditing) {
                return (
                  <>
                    <rect
                      x={z.x} y={z.y} width={z.w} height={z.h} rx="4"
                      fill="#00A1FF" fillOpacity="0.2"
                      stroke="#00A1FF" strokeWidth="2" strokeDasharray="6 6"
                      pointerEvents="none"
                    />
                    <circle data-corner="nw" cx={z.x}       cy={z.y}       r="6" fill="#fff" stroke="#00A1FF" strokeWidth="2" style={{ cursor: 'nwse-resize' }}/>
                    <circle data-corner="ne" cx={z.x + z.w} cy={z.y}       r="6" fill="#fff" stroke="#00A1FF" strokeWidth="2" style={{ cursor: 'nesw-resize' }}/>
                    <circle data-corner="sw" cx={z.x}       cy={z.y + z.h} r="6" fill="#fff" stroke="#00A1FF" strokeWidth="2" style={{ cursor: 'nesw-resize' }}/>
                    <circle data-corner="se" cx={z.x + z.w} cy={z.y + z.h} r="6" fill="#fff" stroke="#00A1FF" strokeWidth="2" style={{ cursor: 'nwse-resize' }}/>
                  </>
                )
              }
              const chipW = 51, chipH = 20
              const cX = z.x + z.w / 2 - chipW / 2
              const cY = z.y + z.h / 2 - chipH / 2
              const zoneCX = z.x + z.w / 2
              const zoneCY = z.y + z.h / 2
              return (
                <>
                  <g style={{
                    transformOrigin: `${zoneCX}px ${zoneCY}px`,
                    transform: areaSnapping ? 'scale(0.7)' : 'scale(1)',
                    opacity: areaSnapping ? 0 : 1,
                    transition: areaSnapping ? 'none' : 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
                  }}>
                  <rect
                    x={z.x} y={z.y} width={z.w} height={z.h} rx="3"
                    fill="#00B32D" fillOpacity="0.4"
                    stroke="#00B32D" strokeWidth="2"
                    pointerEvents="none"
                  />
                  <g style={{ transform: `translate(${cX}px, ${cY}px)` }} pointerEvents="none">
                    <rect x="0" y="0" width="51" height="20" rx="10" fill="#141414"/>
                    <circle cx="14" cy="10" r="5" fill="#00B32D"/>
                    <path d="M16.2828 8.617C16.1266 8.461 15.8734 8.461 15.7172 8.617L13.5361 10.798L12.2828 9.545C12.1266 9.389 11.8734 9.389 11.7172 9.545C11.561 9.701 11.561 9.954 11.7172 10.111L13.2533 11.647C13.3283 11.722 13.43 11.764 13.5361 11.764C13.6422 11.764 13.7439 11.722 13.8189 11.647L16.2828 9.183C16.439 9.027 16.439 8.773 16.2828 8.617Z" fill="white"/>
                    <text x="36" y="14" textAnchor="middle" fill="white" fontSize="10" fontFamily="'Pretendard', sans-serif" fontWeight="500" letterSpacing="-0.3">침실</text>
                  </g>
                  </g>
                </>
              )
            })()}
          </svg>
        )}

        {/* ── 영역 지정 완료: 수정하기 / 삭제하기 ── */}
        {(animPhase === 'area-select' || animPhase === 'to-auto-arrange') && (areaDrawn || areaEditing) && !areaDragPreview && !areaSnackbar && (
          <div style={{
            position: 'absolute', left: 0, bottom: 74, width: 375, height: 42, zIndex: 20,
            transform: animPhase === 'to-auto-arrange' ? 'translateY(200px)' : 'translateY(0)',
            opacity:   animPhase === 'to-auto-arrange' ? 0 : 1,
            transition: animPhase === 'to-auto-arrange' ? 'transform 400ms ease-in-out, opacity 400ms ease-in-out' : 'none',
          }}>
            <svg width="375" height="42" viewBox="0 0 375 42" fill="none" style={{ display: 'block', width: '100%', height: '100%' }}>
              <defs>
                <mask id="areaMask0" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="138" y="2" width="19" height="20">
                  <path fillRule="evenodd" clipRule="evenodd" d="M150.777 3.70248C152.066 2.41375 154.155 2.41376 155.444 3.70248L155.798 4.05605C157.086 5.34478 157.086 7.43422 155.798 8.72294L143.729 20.7917C143.487 21.0339 143.158 21.1707 142.816 21.1724L139.619 21.188C138.907 21.1914 138.327 20.6228 138.313 19.9156L138.312 19.8818L138.328 16.6843C138.329 16.3417 138.466 16.0135 138.708 15.7712L150.777 3.70248ZM139.927 16.8153L139.914 19.5866L142.685 19.5731L152.392 9.86586L149.634 7.10815L139.927 16.8153ZM154.313 4.83383C153.649 4.16995 152.572 4.16996 151.908 4.83383L150.766 5.9768L153.523 8.73451L154.666 7.59159C155.33 6.92771 155.33 5.85129 154.666 5.18739L154.313 4.83383Z" fill="black"/>
                </mask>
                <mask id="areaMask1" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="217" y="2" width="21" height="20">
                  <path d="M225.3 10.25C225.742 10.25 226.1 10.6082 226.1 11.05V16.35L226.1 16.3707C226.089 16.8029 225.735 17.15 225.3 17.15C224.865 17.15 224.512 16.8029 224.501 16.3707L224.5 16.35V11.05C224.5 10.6082 224.859 10.25 225.3 10.25Z" fill="black"/>
                  <path d="M229.75 10.25C230.192 10.25 230.55 10.6082 230.55 11.05V16.35L230.55 16.3707C230.539 16.8029 230.185 17.15 229.75 17.15C229.315 17.15 228.962 16.8029 228.951 16.3707L228.95 16.35V11.05C228.95 10.6082 229.309 10.25 229.75 10.25Z" fill="black"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M236.321 5.40024C236.753 5.4112 237.1 5.76508 237.1 6.2C237.1 6.63492 236.753 6.9888 236.321 6.99975L236.3 7H235.55V17.6198C235.55 18.9485 235.247 20.0886 234.45 20.8859C233.653 21.6833 232.512 21.9864 231.184 21.9864H223.817C222.488 21.9864 221.348 21.6833 220.551 20.8859C219.754 20.0886 219.45 18.9485 219.45 17.6198V7H218.7C218.259 7 217.9 6.64183 217.9 6.2C217.9 5.75817 218.259 5.4 218.7 5.4H236.3L236.321 5.40024ZM221.05 17.6198C221.05 18.7369 221.308 19.3801 221.682 19.7546C222.057 20.1291 222.7 20.3864 223.817 20.3864H231.184C232.301 20.3864 232.944 20.1291 233.319 19.7546C233.693 19.3801 233.95 18.7369 233.95 17.6198V7H221.05V17.6198Z" fill="black"/>
                  <path d="M229.75 2.35C230.192 2.35 230.55 2.70817 230.55 3.15C230.55 3.59183 230.192 3.95 229.75 3.95H225.25C224.809 3.95 224.45 3.59183 224.45 3.15C224.45 2.70817 224.809 2.35 225.25 2.35H229.75Z" fill="black"/>
                </mask>
              </defs>
              <g mask="url(#areaMask0)"><rect x="135.5" width="24" height="24" fill="white"/></g>
              <path d="M132.973 29.4219C132.962 30.8164 134.673 32.1289 136.735 32.3984L136.302 33.3125C134.585 33.0371 133.073 32.1465 132.399 30.9102C131.708 32.1523 130.202 33.0371 128.497 33.3125L128.052 32.3984C130.114 32.1289 131.802 30.8281 131.813 29.4219V28.8477H132.973V29.4219ZM137.169 34.3438V35.2578H132.903V38.9961H131.813V35.2578H127.595V34.3438H137.169ZM146.42 28.4961V34.7422H145.306V32.082H143.349V31.168H145.306V28.4961H146.42ZM142.904 35.0352C145.107 35.0352 146.455 35.7617 146.455 37.0156C146.455 38.2695 145.107 38.9844 142.904 38.9961C140.701 38.9844 139.341 38.2695 139.353 37.0156C139.341 35.7617 140.701 35.0352 142.904 35.0352ZM142.904 35.9023C141.369 35.9023 140.455 36.3008 140.455 37.0156C140.455 37.7188 141.369 38.1289 142.904 38.1172C144.439 38.1289 145.353 37.7188 145.353 37.0156C145.353 36.3008 144.439 35.9023 142.904 35.9023ZM141.427 30.3477C141.427 31.6836 142.377 32.9727 143.959 33.5117L143.384 34.3906C142.207 33.9805 141.339 33.1426 140.888 32.1055C140.425 33.2832 139.505 34.2266 138.252 34.6836L137.666 33.793C139.295 33.2305 140.291 31.8125 140.291 30.3594V30.125H138.017V29.2227H143.677V30.125H141.427V30.3477ZM155.916 28.4961V32.75H157.604V33.6758H155.916V38.9961H154.815V28.4961H155.916ZM153.901 30.1367V31.0508H147.678V30.1367H150.268V28.6367H151.381V30.1367H153.901ZM150.83 31.8242C152.33 31.8242 153.432 32.832 153.444 34.2617C153.432 35.7031 152.33 36.6992 150.83 36.7109C149.319 36.6992 148.217 35.7031 148.217 34.2617C148.217 32.832 149.319 31.8242 150.83 31.8242ZM150.83 32.7383C149.94 32.7383 149.272 33.3594 149.284 34.2617C149.272 35.1758 149.94 35.7852 150.83 35.7734C151.721 35.7852 152.377 35.1758 152.377 34.2617C152.377 33.3594 151.721 32.7383 150.83 32.7383ZM166.538 28.4961V38.9961H165.413V28.4961H166.538ZM163.409 29.6211C163.409 32.6914 162.097 35.3633 158.499 37.0859L157.913 36.1836C160.708 34.8535 162.068 32.9609 162.284 30.5117H158.417V29.6211H163.409Z" fill="#8C8C8C"/>
              <g mask="url(#areaMask1)"><rect x="215.5" width="24" height="24" fill="white"/></g>
              <path d="M211.239 30.1719C211.239 31.543 212.2 32.8203 213.794 33.3477L213.22 34.2148C212.036 33.8223 211.163 32.9844 210.712 31.9297C210.249 33.084 209.352 33.9688 208.11 34.4023L207.536 33.5234C209.188 32.9609 210.138 31.6016 210.138 30.0781V29.0352H211.239V30.1719ZM215.845 28.4961V31.2031H217.368V32.1406H215.845V34.8594H214.731V28.4961H215.845ZM215.845 35.3398V38.9961H214.731V36.2422H208.907V35.3398H215.845ZM226.677 28.4961V38.9961H225.611V28.4961H226.677ZM224.545 28.7188V38.4688H223.49V33.125H221.861V32.2109H223.49V28.7188H224.545ZM220.83 31.4258C220.83 33.2188 221.556 35.0117 223.033 35.8672L222.365 36.6875C221.363 36.0898 220.671 35.0293 220.314 33.7578C219.933 35.1289 219.218 36.2949 218.193 36.9336L217.513 36.1016C219.002 35.1992 219.763 33.2891 219.763 31.4258V30.582H217.83V29.6797H222.634V30.582H220.83V31.4258ZM235.916 28.4961V32.75H237.604V33.6758H235.916V38.9961H234.815V28.4961H235.916ZM233.901 30.1367V31.0508H227.678V30.1367H230.268V28.6367H231.381V30.1367H233.901ZM230.83 31.8242C232.33 31.8242 233.432 32.832 233.444 34.2617C233.432 35.7031 232.33 36.6992 230.83 36.7109C229.319 36.6992 228.217 35.7031 228.217 34.2617C228.217 32.832 229.319 31.8242 230.83 31.8242ZM230.83 32.7383C229.94 32.7383 229.272 33.3594 229.284 34.2617C229.272 35.1758 229.94 35.7852 230.83 35.7734C231.721 35.7852 232.377 35.1758 232.377 34.2617C232.377 33.3594 231.721 32.7383 230.83 32.7383ZM246.538 28.4961V38.9961H245.413V28.4961H246.538ZM243.409 29.6211C243.409 32.6914 242.097 35.3633 238.499 37.0859L237.913 36.1836C240.708 34.8535 242.068 32.9609 242.284 30.5117H238.417V29.6211H243.409Z" fill="#8C8C8C"/>
            </svg>
            <button
              style={{ position: 'absolute', top: 0, left: 128, width: 40, height: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={handleAreaEdit}
              aria-label="수정하기"
            />
            <button
              style={{ position: 'absolute', top: 0, left: 208, width: 40, height: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={handleAreaDelete}
              aria-label="삭제하기"
            />
          </div>
        )}

        {/* ── 영역 지정 CTA: 이전 + 다음 ── */}
        {(animPhase === 'area-select' || animPhase === 'to-auto-arrange') && (
          <div style={{
            position: 'absolute', left: 0, bottom: 0, width: 375,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, paddingLeft: 16, paddingRight: 16,
            paddingTop: 10, paddingBottom: 16,
            zIndex: 20,
            transform: animPhase === 'to-auto-arrange' ? 'translateY(200px)' : 'translateY(0)',
            opacity:   animPhase === 'to-auto-arrange' ? 0 : 1,
            transition: animPhase === 'to-auto-arrange' ? 'transform 400ms ease-in-out, opacity 400ms ease-in-out' : 'none',
          }}>
            <button style={{
              minWidth: 88, padding: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Pretendard', sans-serif",
              fontSize: 16, fontWeight: 500, color: 'white',
              letterSpacing: '-0.3px', lineHeight: '20px',
            }} onClick={handleAreaBack}>
              이전
            </button>
            <button
              disabled={!areaDrawn}
              onClick={areaDrawn ? handleAreaNext : undefined}
              style={{
                flex: 1, height: 48,
                background: areaDrawn ? '#00a1ff' : 'rgba(255,255,255,0.15)',
                color: areaDrawn ? 'white' : 'rgba(255,255,255,0.35)',
                border: 'none', borderRadius: 8,
                fontFamily: "'Pretendard', sans-serif",
                fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px',
                cursor: areaDrawn ? 'pointer' : 'default',
                transition: 'background 200ms ease, color 200ms ease',
              }}
            >
              다음
            </button>
          </div>
        )}

        {/* ── 영역 삭제 스낵바 ── */}
        {animPhase === 'area-select' && (
          <div style={{
            position: 'absolute',
            left: 16, right: 16, bottom: 82,
            padding: '13px 16px',
            background: '#141414',
            color: '#fff',
            fontFamily: "'Pretendard', sans-serif",
            fontSize: 14, fontWeight: 400, lineHeight: '18px',
            letterSpacing: '-0.3px',
            borderRadius: 8,
            opacity: areaSnackbar ? 1 : 0,
            transform: areaSnackbar ? 'translateY(0)' : 'translateY(100px)',
            pointerEvents: 'none',
            zIndex: 25,
            transition: 'opacity 0.3s ease, transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
          }}>
            침실 영역이 삭제되었어요.
          </div>
        )}

        {/* ── 배치 완료 스낵바 ── */}
        {animPhase === 'auto-arrange' && apSnackbar && (
          <div style={{
            position: 'absolute',
            left: 16, right: 16, bottom: 20,
            padding: '13px 16px',
            background: '#141414',
            color: '#fff',
            fontFamily: "'Pretendard', sans-serif",
            fontSize: 14, fontWeight: 400, lineHeight: '18px',
            letterSpacing: '-0.3px',
            borderRadius: 12,
            opacity: apSnackbarIn ? 1 : 0,
            pointerEvents: 'none',
            zIndex: 35,
            transition: apSnackbarIn ? 'opacity 300ms ease-out' : 'opacity 200ms ease-out',
          }}>
            침실 꾸미기가 완료되었어요.
          </div>
        )}

        {/* ── 자동배치 Bottom Sheet ── */}
        {animPhase === 'auto-arrange' && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: 375,
            height: sheetHeight,
            background: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16,
            overflow: 'hidden', zIndex: 30,
            transform: autoArrangeVisible
              ? (apKeyboardOpen ? 'translateY(-291px)' : 'translateY(0)')
              : 'translateY(100%)',
            transition: apPlacementClosing
              ? 'transform 300ms ease-in-out'
              : sheetDragging
                ? 'transform 450ms cubic-bezier(0.32, 0.72, 0, 1)'
                : 'height 350ms cubic-bezier(0.32,0.72,0,1), transform 360ms cubic-bezier(0.32,0.72,0,1)',
          }}>
            {/* Grabber — 드래그로 시트 높이 조절 */}
            <div
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2,
                paddingTop: 8, paddingBottom: 12, display: 'flex', justifyContent: 'center',
                cursor: 'ns-resize', touchAction: 'none',
              }}
              onPointerDown={(e) => {
                e.preventDefault()
                e.currentTarget.setPointerCapture(e.pointerId)
                sheetDragStartYRef.current = e.clientY
                sheetDragStartHRef.current = sheetHeightRef.current
                setSheetDragging(true)
              }}
              onPointerMove={(e) => {
                if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
                const dy = sheetDragStartYRef.current - e.clientY
                const newH = Math.max(320, Math.min(706, sheetDragStartHRef.current + dy))
                sheetHeightRef.current = newH
                setSheetHeight(newH)
              }}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId)
                setSheetDragging(false)
                const snapH = apPlacement
                  ? (sheetHeightRef.current > 537 ? 706 : 368)
                  : (sheetHeightRef.current > 513 ? 706 : 320)
                sheetHeightRef.current = snapH
                setSheetHeight(snapH)
              }}
            >
              <div style={{ width: 40, height: 4, background: 'rgba(140,140,140,0.2)', borderRadius: 40 }} />
            </div>

            {/* Navigation bar — top:24 */}
            <div style={{
              position: 'absolute', top: 24, left: 0, right: 0, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingLeft: 16, paddingRight: 16, background: 'white',
            }}>
              <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="#2f3438" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 16, fontWeight: 700, color: '#2f3438', letterSpacing: '-0.3px', lineHeight: '20px', fontFamily: "'Pretendard', sans-serif", whiteSpace: 'nowrap' }}>
                침실 영역 자동 배치
              </span>
              <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="#2f3438" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Body — 스크롤 가능, spacer로 scrollTop 범위 확보 */}
            <div
              ref={apBodyRef}
              style={{
                position: 'absolute', top: 68, left: 0, right: 0, bottom: apPlacement ? 214 : 64,
                transition: 'bottom 350ms cubic-bezier(0.32,0.72,0,1)',
                overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none',
              }}
            >
              {/* AI rolling text row — 항상 최상단 유지 */}
              <div style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                paddingTop: 20, paddingLeft: 16, paddingRight: 16,
                paddingBottom: 0,
              }}>
                <svg className="ap-sparkles" width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 4 }}>
                  <path d="M8.5 7C10.5 11 12.5 13 16.5 15C12.5 17 10.5 19 8.5 23C6.5 19 4.5 17 0.5 15C4.5 13 6.5 11 8.5 7Z" fill="#0AA5FF"/>
                  <path d="M18.5 0.5C19.75 3 21 4.25 23.5 5.5C21 6.75 19.75 8 18.5 10.5C17.25 8 16 6.75 13.5 5.5C16 4.25 17.25 3 18.5 0.5Z" fill="#0AA5FF"/>
                </svg>
                <p style={{
                  flex: 1, minWidth: 0, fontSize: 15, fontWeight: 400,
                  color: rollingFinal ? '#141414' : '#8c8c8c',
                  letterSpacing: '-0.3px', lineHeight: '24px',
                  fontFamily: "'Pretendard', sans-serif", wordBreak: 'break-word',
                  opacity: rollingHidden ? 0 : 1,
                  transition: 'opacity 0.3s ease, color 0.3s ease',
                }}>
                  {rollingText}
                </p>
              </div>

              {/* 유저 버블 — step3 후 AI row 아래에 추가 */}
              {apStep3 && (
                <div ref={userBubbleRef} style={{ paddingTop: 20, paddingBottom: 20, paddingLeft: 16, paddingRight: 16 }}>
                  <div style={{
                    background: '#f5f5f5', borderRadius: 20,
                    paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
                    opacity: userBubbleIn ? 1 : 0,
                    transform: userBubbleIn ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
                  }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 400, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif", wordBreak: 'break-word' }}>
                      {userBubbleText}
                    </p>
                  </div>
                </div>
              )}

              {/* AI ack row — 유저 버블 아래 */}
              {apAiAck && (
                <div ref={apAiAckRef} style={{
                  display: 'flex', gap: 8, alignItems: apAckColor === '#141414' ? 'flex-start' : 'center',
                  paddingBottom: 20, paddingLeft: 16, paddingRight: 16,
                  opacity: apAiAckIn ? 1 : 0,
                  transform: apAiAckIn ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
                }}>
                  <svg className="ap-sparkles" width="16" height="16" viewBox="0 0 24 24" fill="none" style={{
                    flexShrink: 0,
                    marginTop: apAckColor === '#141414' ? 4 : 0,
                  }}>
                    <path d="M8.5 7C10.5 11 12.5 13 16.5 15C12.5 17 10.5 19 8.5 23C6.5 19 4.5 17 0.5 15C4.5 13 6.5 11 8.5 7Z" fill="#0AA5FF"/>
                    <path d="M18.5 0.5C19.75 3 21 4.25 23.5 5.5C21 6.75 19.75 8 18.5 10.5C17.25 8 16 6.75 13.5 5.5C16 4.25 17.25 3 18.5 0.5Z" fill="#0AA5FF"/>
                  </svg>
                  <p style={{
                    margin: 0, flex: 1, fontSize: 15, fontWeight: 400,
                    color: apAckColor,
                    letterSpacing: '-0.3px', lineHeight: '24px',
                    fontFamily: "'Pretendard', sans-serif", wordBreak: 'break-word',
                    opacity: apAckBlink ? 0 : 1,
                    transition: 'opacity 0.3s ease, color 0.3s ease',
                  }}>
                    {apAckText}
                  </p>
                </div>
              )}

              {/* scrollTop 범위 확보 spacer */}
              <div style={{ height: bodyOffset }} />
            </div>

            {/* 채팅 입력창 — bottom:0 */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 }}>
              {!apPlacement && (
                <>
                  {/* 기본 입력창 */}
                  <div style={{
                    display: 'flex', gap: 4, alignItems: 'flex-end',
                    opacity: (apReady && !apStep3) ? 0 : 1,
                    transition: (apReady && !apStep3) ? 'opacity 0.3s ease 0.32s' : 'none',
                    pointerEvents: (apReady && !apStep3) ? 'none' : 'auto',
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 99, background: '#f5f5f5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="#141414" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, height: 44, borderRadius: 99, background: '#f5f5f5', display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 4, gap: 10, overflow: 'hidden' }}>
                      <span style={{ flex: 1, fontSize: 16, fontWeight: 400, color: '#c1c1c1', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {apStep3 ? '작업하는 중' : '생각하는 중'}
                      </span>
                      <div style={{ width: 36, height: 36, borderRadius: 99, background: '#141414', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: 'white' }} />
                      </div>
                    </div>
                  </div>
                  {/* Ready 카드 */}
                  {apReady && !apStep3 && (
                    <div style={{
                      position: 'absolute', bottom: 10, left: 10, right: 10,
                      background: '#f5f5f5', border: '1.5px solid rgba(0,0,0,0.05)',
                      borderRadius: 20, paddingLeft: 16, paddingRight: 16,
                      paddingTop: 10, paddingBottom: 10, overflow: 'hidden',
                      animation: 'ap-pill-fade-in 0.4s ease 0.32s both',
                    }}>
                      <div style={{ paddingBottom: 8 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif", wordBreak: 'break-word' }}>
                          침대, 러그, 탁자, 스탠드를 배치해볼까요?
                        </p>
                      </div>
                      <div
                        onClick={handleStep3}
                        style={{ borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 8, alignItems: 'center', paddingTop: 14, paddingBottom: 14, cursor: 'pointer' }}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#141414', letterSpacing: '-0.3px', fontFamily: "'Pretendard', sans-serif" }}>1</div>
                        <p style={{ margin: 0, flex: 1, fontSize: 16, fontWeight: 400, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>모두 배치해줘.</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 10, cursor: 'text' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#141414', letterSpacing: '-0.3px', fontFamily: "'Pretendard', sans-serif" }}>2</div>
                        <input
                          type="text"
                          value={directText}
                          onChange={e => setDirectText(e.target.value)}
                          onFocus={() => setApKeyboardOpen(true)}
                          onBlur={() => setApKeyboardOpen(false)}
                          placeholder="직접 입력"
                          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: 0, fontSize: 16, fontWeight: 400, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif" }}
                        />
                        <div
                          onMouseDown={e => { if (!directText.trim()) return; e.preventDefault(); handleDirectInput() }}
                          style={{ width: 36, height: 36, borderRadius: 99, background: directText.trim() ? '#141414' : 'rgba(20,20,20,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: directText.trim() ? 'pointer' : 'default', transition: 'background 0.2s ease' }}>
                          <img src={iconArrowUpMedium} alt="" style={{ width: 16, height: 16 }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 배치 선택 카드 */}
              {apPlacement && (
                <div style={{
                  background: '#f5f5f5', border: '1.5px solid rgba(0,0,0,0.05)',
                  borderRadius: 20, paddingLeft: 16, paddingRight: 16,
                  paddingTop: 10, paddingBottom: 10, overflow: 'hidden',
                  boxShadow: '0px 4px 10px rgba(0,0,0,0.12)',
                  opacity: apPlacementIn ? 1 : 0,
                  transform: apPlacementIn ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.32,0.72,0,1)',
                }}>
                  {/* 타이틀 */}
                  <div style={{ paddingBottom: 8 }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif" }}>
                      적용할 배치안을 선택해주세요.
                    </p>
                  </div>
                  {/* 배치 이미지 프레임 */}
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', paddingBottom: 14, borderBottom: '1px solid #e0e0e0' }}>
                    {[
                      { n: 1, img: imgAutoArrange1 },
                      { n: 2, img: imgAutoArrange2 },
                      { n: 3, img: imgAutoArrange3 },
                    ].map(({ n, img }) => {
                      const sel = selectedPlacement === n
                      return (
                        <div
                          key={n}
                          onClick={() => setSelectedPlacement(n)}
                          style={{ width: 80, height: 80, borderRadius: 8, border: sel ? '2px solid #00a1ff' : '1px solid #e0e0e0', background: 'white', overflow: 'hidden', flexShrink: 0, position: 'relative', cursor: 'pointer' }}
                        >
                          <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                          <div style={{ position: 'absolute', top: 4, left: 4, width: 16, height: 16, borderRadius: '50%', background: sel ? '#00a1ff' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'white', letterSpacing: '-0.3px', fontFamily: "'Pretendard', sans-serif" }}>{n}</div>
                        </div>
                      )
                    })}
                  </div>
                  {/* 직접 입력 */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 10, cursor: 'text' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 47, background: 'rgba(0,0,0,0.4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.3px', fontFamily: "'Pretendard', sans-serif" }}>4</div>
                    <input
                      type="text"
                      value={directText}
                      onChange={e => setDirectText(e.target.value)}
                      onFocus={() => setApKeyboardOpen(true)}
                      onBlur={() => setApKeyboardOpen(false)}
                      placeholder="직접 입력"
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: 0, fontSize: 16, fontWeight: 400, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif" }}
                    />
                    <div
                      onClick={handlePlacementSubmit}
                      style={{ width: 36, height: 36, borderRadius: 99, background: '#141414', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}>
                      <img src={iconArrowUpMedium} alt="" style={{ width: 16, height: 16 }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── iOS 키보드 (자동배치 직접입력) ── */}
        {animPhase === 'auto-arrange' && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: 375, height: 291,
            transform: apKeyboardOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 360ms cubic-bezier(0.32,0.72,0,1)',
            zIndex: 100,
          }}>
            <IOSKRKeyboard
              onKey={(ch) => document.execCommand('insertText', false, ch)}
              onDelete={() => document.execCommand('delete')}
              onSpace={() => document.execCommand('insertText', false, ' ')}
              onEnter={() => { document.activeElement?.blur(); setApKeyboardOpen(false) }}
            />
          </div>
        )}

        {/* ── 커스텀 키패드 ── */}
        {animPhase === 'size-position' && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: 375, height: KEYPAD_H,
            transform: keypadOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 300ms ease-in-out',
            zIndex: 50,
            background: '#c7cbd3',
            borderTopLeftRadius: 27, borderTopRightRadius: 27,
            display: 'flex', flexDirection: 'column',
            paddingTop: 24, paddingBottom: 76,
            paddingLeft: 7.67, paddingRight: 7.67,
            gap: 6, boxSizing: 'border-box',
          }}>
            {[['1','2','3'],['4','5','6'],['7','8','9'],[null,'0','del']].map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 6, flex: '0 0 50px' }}>
                {row.map((key, ki) => key === null ? (
                  <div key={ki} style={{ flex: 1 }} />
                ) : (
                  <button
                    key={ki}
                    style={{
                      flex: 1, height: 50, borderRadius: 8.5,
                      background: key === 'del' ? '#adb5bc' : '#ffffff',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: key !== 'del' ? '0 1px 0 rgba(0,0,0,0.35)' : 'none',
                      fontFamily: "'SF Pro Display', system-ui, sans-serif",
                      fontSize: 23, fontWeight: 400, color: '#000',
                      userSelect: 'none', WebkitUserSelect: 'none',
                    }}
                    onPointerDown={(e) => { e.preventDefault(); handleKeypadPress(key) }}
                  >
                    {key === 'del' ? (
                      <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                        <path d="M9 1H22C22.5523 1 23 1.44772 23 2V16C23 16.5523 22.5523 17 22 17H9L1 9L9 1Z" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M14 6L18 12M18 6L14 12" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    ) : key}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </PhoneShell>
  )
}

const s = {
  screen: { position: 'absolute', inset: 0, background: '#222', overflow: 'hidden' },
  grid:   { position: 'absolute', pointerEvents: 'none' },

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

  topBar: {
    position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)',
    width: 375, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 16, paddingRight: 16, gap: 20, zIndex: 20,
  },
  topTitle: {
    flex: '1 0 0', fontFamily: "'Pretendard', sans-serif",
    fontSize: 16, fontWeight: 500, color: 'white',
    letterSpacing: '-0.3px', lineHeight: '20px', textAlign: 'center',
  },
  closeBtn: {
    width: 24, height: 24, flexShrink: 0,
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  card: {
    position: 'absolute', top: 106, zIndex: 10,
    left: '50%', transform: 'translateX(-50%)', width: 343,
    backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)',
    background: 'rgba(0,0,0,0.15)', borderRadius: 16,
    paddingTop: 16, paddingBottom: 16,
  },
  cardInner:  { display: 'flex', alignItems: 'flex-start', paddingLeft: 24, paddingRight: 20 },
  cardTexts:  { display: 'flex', flexDirection: 'column' },
  cardStep:   { fontFamily: "'Pretendard', sans-serif", fontSize: 13, fontWeight: 500, color: '#7f7f7f', letterSpacing: '-0.3px', lineHeight: '18px' },
  cardDesc:   { fontFamily: "'Pretendard', sans-serif", fontSize: 16, fontWeight: 600, color: '#e0e0e0', letterSpacing: '-0.3px', lineHeight: '28px' },

  room: {
    position: 'absolute',
    width: INIT_SIZE, height: INIT_SIZE,
    background: 'white',
    border: `${INIT_BORDER}px solid #080809`,
    overflow: 'hidden', boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  roomImg: {
    width: INIT_SIZE - INIT_BORDER * 2, height: INIT_SIZE - INIT_BORDER * 2,
    objectFit: 'contain', objectPosition: 'center',
    display: 'block', pointerEvents: 'none',
  },

  arrowBtn:   { position: 'absolute', width: 28, height: 28, background: 'none', border: 'none', padding: 0, cursor: 'pointer' },
  arrowCircle:{ position: 'absolute', inset: 0, width: '100%', height: '100%' },

  spBtn: {
    position: 'absolute', borderRadius: '50%',
    background: 'white', cursor: 'grab',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transformOrigin: 'center center',
    touchAction: 'none',
  },

  undoRedo:    { position: 'absolute', left: 281, bottom: 222, display: 'flex', gap: 10, alignItems: 'center' },
  undoRedoBtn: {
    width: 34, height: 34, borderRadius: 17,
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 5, boxSizing: 'border-box', flexShrink: 0,
    transition: 'background 200ms ease, border-color 200ms ease',
  },

  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0,
    display: 'flex', flexDirection: 'column',
    width: 375, zIndex: 20,
    transition: 'transform 400ms ease-in-out',
  },
  typeRow: {
    display: 'flex', gap: 12, width: 375, padding: '20px 16px',
    alignItems: 'flex-start', background: 'rgba(0,0,0,0.4)',
    boxSizing: 'border-box', overflowX: 'auto',
    WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
  },
  typeCard: {
    position: 'relative', display: 'flex', flexDirection: 'column', gap: 6,
    alignItems: 'center', padding: 0,
    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
  },
  typeCardSelect: {
    position: 'absolute', top: -8, left: -8, right: -8, bottom: -20,
    border: '2px solid #00a1ff', borderRadius: 12,
    background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
  },
  thumbnail: {
    width: 64, height: 64, background: 'white', borderRadius: 8,
    overflow: 'hidden', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  typeLabel: {
    fontFamily: "'Pretendard', sans-serif",
    fontSize: 12, fontWeight: 400, color: 'white',
    letterSpacing: '-0.3px', lineHeight: '16px', textAlign: 'center',
    width: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },

  ctaArea: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingLeft: 16, paddingRight: 16,
    paddingTop: 10, paddingBottom: 16, background: 'rgba(0,0,0,0.4)',
  },
  skipBtn: {
    minWidth: 88, padding: '8px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Pretendard', sans-serif",
    fontSize: 16, fontWeight: 500, color: 'white',
    letterSpacing: '-0.3px', lineHeight: '20px',
  },
  nextBtn: {
    flex: 1, height: 48, background: '#00a1ff', color: 'white',
    border: 'none', borderRadius: 8,
    fontFamily: "'Pretendard', sans-serif",
    fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px', cursor: 'pointer',
  },

  infoRow: {
    display: 'flex', alignItems: 'flex-start', gap: 4,
    paddingTop: 20, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
    width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)',
  },
  infoText: {
    fontSize: 14, fontWeight: 500, color: '#8c8c8c',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: "'Pretendard', sans-serif",
  },
  sliderSection: {
    display: 'flex', flexDirection: 'column', gap: 4,
    paddingBottom: 16, paddingLeft: 16, paddingRight: 16,
    width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)',
  },
  sliderRow:  { display: 'flex', alignItems: 'center', gap: 16, width: '100%' },
  sliderLabel:{ fontSize: 14, fontWeight: 500, color: 'white', letterSpacing: '-0.3px', lineHeight: '20px', flexShrink: 0, whiteSpace: 'nowrap', fontFamily: "'Pretendard', sans-serif" },
  inputRight: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  inputBox:   { width: 60, border: '1px solid #7f7f7f', borderRadius: 4, padding: '6px 8px', boxSizing: 'border-box' },
  inputField: {
    width: '100%', background: 'none', border: 'none', outline: 'none',
    fontSize: 14, fontWeight: 400, color: 'white',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: "'Pretendard', sans-serif",
    MozAppearance: 'textfield',
  },
  unitLabel:  { fontSize: 14, fontWeight: 500, color: 'white', letterSpacing: '-0.3px', lineHeight: '20px', whiteSpace: 'nowrap', fontFamily: "'Pretendard', sans-serif" },
}
