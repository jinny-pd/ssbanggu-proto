import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneShell from '../components/PhoneShell'

import imgTemplateRoom  from '../assets/images/template-room-preview.png'
import img941           from '../assets/images/status-941.svg'
import imgLevels        from '../assets/images/status-levels.svg'
import imgAutoArrange1  from '../assets/images/자동배치_1.png'
import imgAutoArrange2  from '../assets/images/자동배치_2.png'
import imgAutoArrange3  from '../assets/images/자동배치_3.png'
import iconArrowUpMedium  from '../assets/icons/[Icon] Arrow Up_Medium.svg'
import iconArrowLeft       from '../assets/icons/[Icon] Arrow Left.svg'
import imgSpinnerBg        from '../assets/images/spinner-bg.svg'
import imgSpinnerQ1        from '../assets/images/spinner-q1.svg'
import imgSpinnerQ2        from '../assets/images/spinner-q2.svg'
import iconSpaceAIView     from '../assets/icons/[Space AI] Icon Button_View.svg'
import iconSpaceAICapture  from '../assets/icons/[Space AI] Icon Button_Capture.svg'
import iconSpaceAIRoomlist from '../assets/icons/[Space AI] Icon Button_Roomlist.svg'
import iconSpaceAIMenu     from '../assets/icons/[Space AI] Icon Button_Menu.svg'

// 침실 고정 영역: roomFrameInner(280×188) 기준 우상단 98×98
const FIXED_ZONE = { x: 182, y: 0, w: 98, h: 98 }

export default function TemplateRoom() {
  const navigate = useNavigate()

  const [areaDrawn,       setAreaDrawn]       = useState(false)
  const [areaEditing,     setAreaEditing]     = useState(false)
  const [areaDragPreview, setAreaDragPreview] = useState(null)
  const [areaSnapping,    setAreaSnapping]    = useState(false)
  const [areaSnackbar,    setAreaSnackbar]    = useState(false)

  // 자동배치 바텀시트
  const [autoArrangeVisible, setAutoArrangeVisible] = useState(false)
  const [defaultRoomVisible, setDefaultRoomVisible] = useState(false)
  const [rollingText,   setRollingText]   = useState('침실에 사용자님이 미리 배치한 가구와 소품을 확인하고 있어요.')
  const [rollingHidden, setRollingHidden] = useState(false)
  const [rollingFinal,  setRollingFinal]  = useState(false)
  const [apReady,       setApReady]       = useState(false)
  const [apStep3,       setApStep3]       = useState(false)
  const [userBubbleIn,  setUserBubbleIn]  = useState(false)
  const [apAiAck,       setApAiAck]       = useState(false)
  const [apAiAckIn,     setApAiAckIn]     = useState(false)
  const [apAckText,     setApAckText]     = useState('이제 가장 적합한 배치를 찾아드릴게요.')
  const [apAckColor,    setApAckColor]    = useState('#8c8c8c')
  const [apAckBlink,    setApAckBlink]    = useState(false)
  const [apPlacement,        setApPlacement]        = useState(false)
  const [apPlacementIn,      setApPlacementIn]      = useState(false)
  const [apPlacementClosing, setApPlacementClosing] = useState(false)
  const [selectedPlacement,  setSelectedPlacement]  = useState(1)
  const [apSpinner2,    setApSpinner2]    = useState(false)
  const [apRoomAuto,    setApRoomAuto]    = useState(false)
  const [apRoomAutoIn,  setApRoomAutoIn]  = useState(false)
  const [apRoomDown,    setApRoomDown]    = useState(false)
  const [apSnackbar,    setApSnackbar]    = useState(false)
  const [apSnackbarIn,  setApSnackbarIn]  = useState(false)
  const [sheetHeight,   setSheetHeight]   = useState(320)
  const [sheetDragging, setSheetDragging] = useState(false)
  const [bodyOffset,    setBodyOffset]    = useState(0)

  const areaSvgRef           = useRef(null)
  const areaDragRef          = useRef({ active: false, moved: false, startX: 0, startY: 0 })
  const areaSnackbarTimerRef = useRef(null)
  const sheetHeightRef       = useRef(320)
  const sheetDragStartYRef   = useRef(0)
  const sheetDragStartHRef   = useRef(320)
  const apBodyRef            = useRef(null)
  const userBubbleRef        = useRef(null)
  const apAiAckRef           = useRef(null)
  const timersRef            = useRef([])

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }

  const getSvgPt = (e) => {
    const rect = areaSvgRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleAreaDown = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const pt = getSvgPt(e)
    areaDragRef.current = { active: true, moved: false, startX: pt.x, startY: pt.y }
    setAreaDrawn(false)
    setAreaEditing(false)
    setAreaDragPreview({ x: pt.x, y: pt.y, w: 0, h: 0 })
  }

  const handleAreaMove = (e) => {
    const d = areaDragRef.current
    if (!d.active) return
    const pt = getSvgPt(e)
    const dx = pt.x - d.startX, dy = pt.y - d.startY
    if (!d.moved && Math.hypot(dx, dy) > 5) d.moved = true
    if (d.moved) {
      setAreaDragPreview({
        x: Math.min(d.startX, pt.x), y: Math.min(d.startY, pt.y),
        w: Math.abs(dx), h: Math.abs(dy),
      })
    }
  }

  const handleAreaUp = () => {
    const d = areaDragRef.current
    if (!d.active) return
    d.active = false
    setAreaDragPreview(null)
    if (d.moved) {
      setAreaSnapping(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setAreaSnapping(false)))
      setAreaDrawn(true)
    }
  }

  const handleAreaEdit = () => {
    setAreaDrawn(false)
    setAreaEditing(false)
  }

  const handleAreaDelete = () => {
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

  /* ── 다음 → 자동배치 바텀시트 열기 ── */
  const handleAreaNext = () => {
    clearTimers()
    localStorage.setItem('ssOnboardingStep', 'area')
    setDefaultRoomVisible(true)
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
    setApPlacement(false)
    setApPlacementIn(false)
    setApPlacementClosing(false)
    setApSpinner2(false)
    setApRoomAuto(false)
    setApRoomAutoIn(false)
    setApRoomDown(false)
    setApSnackbar(false)
    setApSnackbarIn(false)
    setSheetHeight(320); sheetHeightRef.current = 320
    setBodyOffset(0)
    if (apBodyRef.current) apBodyRef.current.scrollTop = 0
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setAutoArrangeVisible(true)
      const tReady = setTimeout(() => setApReady(true), 1000)
      timersRef.current.push(tReady)
    }))
  }

  const scrollBodyTo = (target) => {
    const el = apBodyRef.current
    if (!el) return
    const start = el.scrollTop, dist = target - start, duration = 400
    const eio = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      el.scrollTop = start + dist * eio(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  /* ── Step3: "모두 배치해줘" 선택 ── */
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
        const tNav = setTimeout(() => navigate('/onboarding-done'), 500)
        timersRef.current.push(tNav)
      }, 3000)
      timersRef.current.push(tOut)
    }, 300)
    timersRef.current.push(tSnackbar)
  }

  const fz = FIXED_ZONE
  const fzCX = fz.x + fz.w / 2
  const fzCY = fz.y + fz.h / 2
  const chipW = 51, chipH = 20
  const chipX = fzCX - chipW / 2
  const chipY = fzCY - chipH / 2

  return (
    <PhoneShell bg="#222">
      <div style={s.page}>

        {/* ── Status Bar ── */}
        <div style={s.statusBar}>
          <div style={{ position: 'relative', width: 54, height: 50, flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: '32%', bottom: '26%', left: 0, right: 0, borderRadius: 32 }}>
              <img src={img941} alt="" style={{ position: 'absolute', left: 12.45, top: 5.17, width: 28.426, height: 11.089 }} />
            </div>
          </div>
          <div style={{ position: 'relative', width: 68, height: 50, flexShrink: 0 }}>
            <img src={imgLevels} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          </div>
        </div>

        {/* ── Top Bar ── */}
        {!defaultRoomVisible ? (
          <div style={s.topBar}>
            <div style={{ width: 24, flexShrink: 0 }} />
            <p style={s.topBarTitle}>침실 영역 지정하기</p>
            <button style={s.closeBtn} onClick={() => { localStorage.setItem('ssOnboardingStep', 'template'); navigate('/') }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <div style={{ ...s.topBar, justifyContent: 'space-between' }}>
            <button style={s.closeBtn} onClick={() => navigate(-1)}>
              <img src={iconArrowLeft} alt="뒤로" style={{ width: 24, height: 24 }} />
            </button>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <img src={iconSpaceAIView}     alt="뷰 변경" style={{ width: 40, height: 42 }} />
              <img src={iconSpaceAICapture}  alt="캡처"   style={{ width: 40, height: 42 }} />
              <img src={iconSpaceAIRoomlist} alt="방 목록" style={{ width: 40, height: 42 }} />
              <img src={iconSpaceAIMenu}     alt="메뉴"   style={{ width: 40, height: 42 }} />
            </div>
          </div>
        )}

        {/* ── Tutorial Card ── */}
        <div style={{ ...s.tutorialCard, pointerEvents: 'none' }}>
          <div style={s.tutorialInner}>
            {defaultRoomVisible ? (
              <>
                <span style={s.tutorialStep}>Step 3. 가구 자동 배치 해보기</span>
                <span style={s.tutorialTitle}>침실에 맞는 가구를 자동으로 배치해 드릴게요</span>
              </>
            ) : (
              <>
                <span style={s.tutorialStep}>Step 2. 방 영역 지정하기</span>
                <span style={s.tutorialTitle}>침실 영역을 지정해 보세요</span>
              </>
            )}
          </div>
        </div>

        {/* ── Template Room Image (center) ── */}
        <div style={{ ...s.roomFrame, opacity: defaultRoomVisible ? 0 : 1, transition: 'opacity 400ms ease-in-out' }}>
          <div style={s.roomFrameInner}>
            <img src={imgTemplateRoom} alt="템플릿 방" style={s.roomImg} />
            <svg
              ref={areaSvgRef}
              width={280} height={188}
              viewBox="0 0 280 188"
              style={{ position: 'absolute', inset: 0, zIndex: 5, touchAction: 'none' }}
              onPointerDown={handleAreaDown}
              onPointerMove={handleAreaMove}
              onPointerUp={handleAreaUp}
              onPointerCancel={handleAreaUp}
            >
              {/* 드래그 프리뷰 */}
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
              {/* 그린존 */}
              {areaDrawn && (
                <g style={{
                  transformOrigin: `${fzCX}px ${fzCY}px`,
                  transform: areaSnapping ? 'scale(0.7)' : 'scale(1)',
                  opacity: areaSnapping ? 0 : 1,
                  transition: areaSnapping ? 'none' : 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
                }}>
                  <rect
                    x={fz.x} y={fz.y} width={fz.w} height={fz.h} rx="3"
                    fill="#00B32D" fillOpacity="0.4"
                    stroke="#00B32D" strokeWidth="2"
                    pointerEvents="none"
                  />
                  <g transform={`translate(${chipX}, ${chipY})`} pointerEvents="none">
                    <rect x="0" y="0" width={chipW} height={chipH} rx="10" fill="#141414"/>
                    <circle cx="14" cy="10" r="5" fill="#00B32D"/>
                    <path d="M16.2828 8.617C16.1266 8.461 15.8734 8.461 15.7172 8.617L13.5361 10.798L12.2828 9.545C12.1266 9.389 11.8734 9.389 11.7172 9.545C11.561 9.701 11.561 9.954 11.7172 10.111L13.2533 11.647C13.3283 11.722 13.43 11.764 13.5361 11.764C13.6422 11.764 13.7439 11.722 13.8189 11.647L16.2828 9.183C16.439 9.027 16.439 8.773 16.2828 8.617Z" fill="white"/>
                    <text x="36" y="14" textAnchor="middle" fill="white" fontSize="10" fontFamily="'Pretendard', sans-serif" fontWeight="500" letterSpacing="-0.3">침실</text>
                  </g>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* ── 가이드 텍스트 ── */}
        <div style={{
          ...s.guideText,
          opacity: defaultRoomVisible ? 0 : (areaDrawn || areaDragPreview || areaSnackbar) ? 0 : 1,
          transition: 'opacity 300ms ease-in-out',
          pointerEvents: 'none',
        }}>
          <p style={s.guideTextLabel}>드래그하여 침실 영역을 지정해주세요.</p>
        </div>

        {/* ── 수정하기 / 삭제하기 ── */}
        {(areaDrawn || areaEditing) && !areaDragPreview && !areaSnackbar && !defaultRoomVisible && (
          <div style={{
            position: 'absolute', left: 0, bottom: 74, width: 375, height: 42, zIndex: 20,
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

        {/* ── 이전 / 다음 ── */}
        <div style={{
          position: 'absolute', left: 0, bottom: 0, width: 375,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, paddingLeft: 16, paddingRight: 16,
          paddingTop: 10, paddingBottom: 16,
          opacity: apPlacementClosing ? 0 : 1,
          pointerEvents: apPlacementClosing ? 'none' : 'auto',
          zIndex: 20,
        }}>
          <button style={{
            minWidth: 88, padding: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Pretendard', sans-serif",
            fontSize: 16, fontWeight: 500, color: 'white',
            letterSpacing: '-0.3px', lineHeight: '20px',
          }} onClick={() => navigate(-1)}>
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

        {/* ── Default Room 226×226 (Figma node 15238:129154) ── */}
        <div style={{
          position: 'absolute',
          left: 'calc(50% + 0.5px)',
          top: apRoomDown ? 'calc(50% + 1px)' : 'calc(50% - 89px)',
          transform: 'translate(-50%, -50%)',
          width: 226, height: 226,
          background: 'white',
          border: '5px solid #080809',
          overflow: 'hidden',
          zIndex: 5,
          opacity: defaultRoomVisible ? 1 : 0,
          pointerEvents: defaultRoomVisible ? 'auto' : 'none',
          transition: apRoomDown
            ? 'top 500ms ease-in-out, opacity 400ms ease-in-out'
            : 'opacity 400ms ease-in-out',
        }}>
          {/* 방 이미지 — 내부 216×216 좌상단 */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: 216, height: 216, overflow: 'hidden' }}>
            <img
              src={imgTemplateRoom}
              alt=""
              style={{
                position: 'absolute',
                width: '327.68%', height: '710.63%',
                left: '-204.06%', top: '-254.11%',
                maxWidth: 'none', pointerEvents: 'none',
              }}
            />
          </div>
          {/* 자동배치 결과 이미지 오버레이 */}
          {apRoomAuto && (
            <img
              key={selectedPlacement}
              src={[imgAutoArrange1, imgAutoArrange2, imgAutoArrange3][selectedPlacement - 1]}
              alt=""
              style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 216, height: 216,
                objectFit: 'contain', objectPosition: 'center',
                display: 'block', pointerEvents: 'none',
                opacity: apRoomAutoIn ? 1 : 0,
                animation: apRoomAutoIn ? 'ap-room-fadein 300ms ease-in both' : 'none',
              }}
            />
          )}
          {/* 스피너 — 226×226 프레임 중앙 40×40 (Figma Size=40, State=50%) */}
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 40, height: 40, transform: 'translate(-50%, -50%)', opacity: autoArrangeVisible ? (apSpinner2 ? 1 : 0) : (apPlacementClosing ? 0 : 1), transition: 'opacity 0.3s ease' }}>
            <div style={{ position: 'relative', width: 40, height: 40, animation: 'defaultRoomSpin 1.2s linear infinite', transformOrigin: '20px 20px' }}>
              {/* 회색 링 배경 */}
              <img src={imgSpinnerBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', maxWidth: 'none' }} />
              {/* Q1: 우상단 — 회전 없음 */}
              <div style={{ position: 'absolute', top: 0, left: '50%', right: 0, bottom: '50%' }}>
                <div style={{ position: 'absolute', top: '0.32%', left: 0, right: 0, bottom: 0 }}>
                  <img src={imgSpinnerQ1} alt="" style={{ display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
                </div>
              </div>
              {/* Q2: 우하단 — 90° 회전 */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 20, flexShrink: 0, transform: 'rotate(90deg)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, right: '0.32%', bottom: 0, left: 0 }}>
                    <img src={imgSpinnerQ2} alt="" style={{ display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 영역 삭제 스낵바 ── */}
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

        {/* ── 배치 완료 스낵바 ── */}
        {apSnackbar && (
          <div style={{
            position: 'absolute',
            left: 16, right: 16, bottom: 20,
            padding: '13px 16px',
            background: '#141414', color: '#fff',
            fontFamily: "'Pretendard', sans-serif",
            fontSize: 14, fontWeight: 400, lineHeight: '18px',
            letterSpacing: '-0.3px', borderRadius: 12,
            opacity: apSnackbarIn ? 1 : 0,
            pointerEvents: 'none', zIndex: 35,
            transition: apSnackbarIn ? 'opacity 300ms ease-out' : 'opacity 200ms ease-out',
          }}>
            침실 꾸미기가 완료되었어요.
          </div>
        )}

        {/* ── 자동배치 바텀시트 ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: 375,
          height: sheetHeight,
          background: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16,
          overflow: 'hidden', zIndex: 30,
          transform: autoArrangeVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: apPlacementClosing
            ? 'transform 300ms ease-in-out'
            : sheetDragging
              ? 'transform 450ms cubic-bezier(0.32, 0.72, 0, 1)'
              : 'height 350ms cubic-bezier(0.32,0.72,0,1), transform 450ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}>
          {/* Grabber */}
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

          {/* Navigation bar */}
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
            <button
              onClick={() => { clearTimers(); setAutoArrangeVisible(false); setDefaultRoomVisible(false) }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="#2f3438" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Body — 스크롤 */}
          <div
            ref={apBodyRef}
            style={{
              position: 'absolute', top: 68, left: 0, right: 0, bottom: apPlacement ? 214 : 64,
              transition: 'bottom 350ms cubic-bezier(0.32,0.72,0,1)',
              overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none',
            }}
          >
            {/* AI 롤링 텍스트 */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingTop: 20, paddingLeft: 16, paddingRight: 16 }}>
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

            {/* 유저 버블 */}
            {apStep3 && (
              <div ref={userBubbleRef} style={{ paddingTop: 20, paddingBottom: 20, paddingLeft: 16, paddingRight: 16 }}>
                <div style={{
                  background: '#f5f5f5', borderRadius: 20,
                  paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
                  opacity: userBubbleIn ? 1 : 0,
                  transform: userBubbleIn ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.28s ease, transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
                }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 400, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif", wordBreak: 'break-word' }}>
                    침대, 러그, 탁자, 스탠드를 모두 배치해줘.
                  </p>
                </div>
              </div>
            )}

            {/* AI ack */}
            {apAiAck && (
              <div ref={apAiAckRef} style={{
                display: 'flex', gap: 8, alignItems: apAckColor === '#141414' ? 'flex-start' : 'center',
                paddingBottom: 20, paddingLeft: 16, paddingRight: 16,
                opacity: apAiAckIn ? 1 : 0,
                transform: apAiAckIn ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.28s ease, transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
              }}>
                <svg className="ap-sparkles" width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: apAckColor === '#141414' ? 4 : 0 }}>
                  <path d="M8.5 7C10.5 11 12.5 13 16.5 15C12.5 17 10.5 19 8.5 23C6.5 19 4.5 17 0.5 15C4.5 13 6.5 11 8.5 7Z" fill="#0AA5FF"/>
                  <path d="M18.5 0.5C19.75 3 21 4.25 23.5 5.5C21 6.75 19.75 8 18.5 10.5C17.25 8 16 6.75 13.5 5.5C16 4.25 17.25 3 18.5 0.5Z" fill="#0AA5FF"/>
                </svg>
                <p style={{
                  margin: 0, flex: 1, fontSize: 15, fontWeight: 400,
                  color: apAckColor, letterSpacing: '-0.3px', lineHeight: '24px',
                  fontFamily: "'Pretendard', sans-serif", wordBreak: 'break-word',
                  opacity: apAckBlink ? 0 : 1,
                  transition: 'opacity 0.3s ease, color 0.3s ease',
                }}>
                  {apAckText}
                </p>
              </div>
            )}

            <div style={{ height: bodyOffset }} />
          </div>

          {/* 채팅 입력창 */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 }}>
            {!apPlacement && (
              <>
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
                    <div onClick={handleStep3} style={{ borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 8, alignItems: 'center', paddingTop: 14, paddingBottom: 14, cursor: 'pointer' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#141414', letterSpacing: '-0.3px', fontFamily: "'Pretendard', sans-serif" }}>1</div>
                      <p style={{ margin: 0, flex: 1, fontSize: 16, fontWeight: 400, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>모두 배치해줘.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 10 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#141414', letterSpacing: '-0.3px', fontFamily: "'Pretendard', sans-serif" }}>2</div>
                      <p style={{ margin: 0, flex: 1, fontSize: 16, fontWeight: 400, color: '#8c8c8c', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>직접 입력</p>
                      <div style={{ width: 36, height: 36, borderRadius: 99, background: '#141414', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
                <div style={{ paddingBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#141414', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif" }}>
                    적용할 배치안을 선택해주세요.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', paddingBottom: 14, borderBottom: '1px solid #e0e0e0' }}>
                  {[
                    { n: 1, img: imgAutoArrange1 },
                    { n: 2, img: imgAutoArrange2 },
                    { n: 3, img: imgAutoArrange3 },
                  ].map(({ n, img }) => {
                    const sel = selectedPlacement === n
                    return (
                      <div key={n} onClick={() => setSelectedPlacement(n)} style={{ width: 80, height: 80, borderRadius: 8, border: sel ? '2px solid #00a1ff' : '1px solid #e0e0e0', background: 'white', overflow: 'hidden', flexShrink: 0, position: 'relative', cursor: 'pointer' }}>
                        <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: 4, left: 4, width: 16, height: 16, borderRadius: '50%', background: sel ? '#00a1ff' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'white', letterSpacing: '-0.3px', fontFamily: "'Pretendard', sans-serif" }}>{n}</div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 47, background: 'rgba(0,0,0,0.4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.3px', fontFamily: "'Pretendard', sans-serif" }}>4</div>
                  <p style={{ margin: 0, flex: 1, fontSize: 16, fontWeight: 400, color: '#8c8c8c', letterSpacing: '-0.3px', lineHeight: '24px', fontFamily: "'Pretendard', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>직접 입력</p>
                  <div onClick={handlePlacementSubmit} style={{ width: 36, height: 36, borderRadius: 99, background: '#141414', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}>
                    <img src={iconArrowUpMedium} alt="" style={{ width: 16, height: 16 }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </PhoneShell>
  )
}

const s = {
  page: {
    position: 'absolute', inset: 0,
    background: '#222',
    overflow: 'hidden',
  },

  statusBar: {
    position: 'absolute', top: 0, left: 0, width: 375, height: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 21, paddingRight: 14, zIndex: 10,
  },

  topBar: {
    position: 'absolute', top: 50, left: 0, width: 375, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    paddingLeft: 16, paddingRight: 16, gap: 20, zIndex: 10,
  },
  topBarTitle: {
    flex: '1 0 0', minWidth: 0,
    fontSize: 16, fontWeight: 500, color: 'white',
    lineHeight: '20px', letterSpacing: '-0.3px',
    fontFamily: "'Pretendard', sans-serif",
    textAlign: 'center',
  },
  closeBtn: {
    width: 24, height: 24, flexShrink: 0,
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  tutorialCard: {
    position: 'absolute', top: 106, left: '50%',
    transform: 'translateX(-50%)',
    width: 343, zIndex: 5,
    backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)',
    background: 'rgba(0,0,0,0.15)', borderRadius: 16,
    paddingTop: 16, paddingBottom: 16,
  },
  tutorialInner: {
    paddingLeft: 24, paddingRight: 20,
    display: 'flex', flexDirection: 'column',
  },
  tutorialStep: {
    fontSize: 13, fontWeight: 500, color: '#7f7f7f',
    lineHeight: '18px', letterSpacing: '-0.3px',
    fontFamily: "'Pretendard', sans-serif",
    whiteSpace: 'nowrap',
  },
  tutorialTitle: {
    fontSize: 16, fontWeight: 600, color: '#e0e0e0',
    lineHeight: '28px', letterSpacing: '-0.3px',
    fontFamily: "'Pretendard', sans-serif",
    whiteSpace: 'nowrap',
  },

  roomFrame: {
    position: 'absolute',
    left: 'calc(50% + 0.5px)', top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 290, height: 198,
    border: '5px solid #080809',
    background: 'white',
    overflow: 'hidden',
    zIndex: 4,
  },
  roomFrameInner: {
    position: 'absolute', left: 0, top: 0,
    width: 280, height: 188,
    overflow: 'hidden',
  },
  roomImg: {
    position: 'absolute',
    width: '114.69%',
    height: '370.43%',
    left: '-6.42%',
    top: '-132.46%',
    maxWidth: 'none',
    pointerEvents: 'none',
  },

  guideText: {
    position: 'absolute', bottom: 82, left: '50%',
    transform: 'translateX(-50%)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    background: 'rgba(255,255,255,0.12)',
    paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
    borderRadius: 12, zIndex: 5,
    whiteSpace: 'nowrap',
  },
  guideTextLabel: {
    fontSize: 16, fontWeight: 400, color: 'white',
    lineHeight: '24px', letterSpacing: '-0.3px',
    fontFamily: "'Pretendard', sans-serif",
    whiteSpace: 'nowrap', textAlign: 'center',
  },
}
