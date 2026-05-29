import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PhoneShell from '../components/PhoneShell'
import iconScale from '../assets/icons/[Icon] Scale.svg'
import iconTrash from '../assets/icons/[Icon] Trash.svg'
import iconMove  from '../assets/icons/[Icon] Arrow Orthogonal Outward.svg'
import imgRoomGeneral from '../assets/images/일반 방.png'
import imgRoomAdd     from '../assets/images/defalut_room_add.png'

import imgGrid   from '../assets/images/select-room-grid.svg'
import img941    from '../assets/images/status-941.svg'
import imgLevels from '../assets/images/status-levels.svg'

function SpaceAiSlider() {
  return (
    <div style={{ height: 20, position: 'relative', flex: '1 0 0', minWidth: 0 }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 9,
        height: 2, background: 'white', opacity: 0.4, borderRadius: 99,
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 125, top: 9,
        height: 2, background: 'white', borderRadius: 99,
      }} />
      <div style={{
        position: 'absolute', width: 20, height: 20, background: 'white',
        borderRadius: '50%', top: '50%', right: 115,
        transform: 'translateY(-50%)',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.12)',
      }} />
    </div>
  )
}

export default function SelectRoomType() {
  const navigate = useNavigate()
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true))
    )
    return () => cancelAnimationFrame(id)
  }, [])

  const btnAnim = {
    transform:  `scale(${visible ? 1 : 0})`,
    transition: visible ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
  }

  return (
    <PhoneShell>
      <div style={s.screen}>

        {/* Grid */}
        <img src={imgGrid} alt="" style={s.grid} />

        {/* Status Bar */}
        <div style={s.statusBar}>
          <div style={s.sbTime}>
            <img src={img941} alt="" style={{ width: 28.43, height: 11.09 }} />
          </div>
          <div style={s.sbLevels}>
            <img src={imgLevels} alt="" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        {/* Top Bar */}
        <div style={s.topBar}>
          <div style={{ width: 24, flexShrink: 0 }} />
          <span style={s.topTitle}>방 만들기</span>
          <button style={s.closeBtn} onClick={() => navigate('/create-room')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Tutorial Card */}
        <div style={s.tutorialCard}>
          <div style={s.tutorialInner}>
            <div>
              <p style={s.stepLabel}>Step 1. 방 만들기</p>
              <p style={s.cardTitle}>방의 크기와 위치를 변경할 수 있어요</p>
            </div>
            <button style={s.cardClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Default Room */}
        <div style={s.defaultRoom}>
          <div style={s.roomImgWrap}>
            <img src={imgRoomGeneral} alt="" style={s.roomImg} />
          </div>
        </div>

        {/* Add Room */}
        <div style={s.addRoom}>
          <div style={s.roomImgWrap}>
            <img src={imgRoomAdd} alt="" style={s.roomImg} />
          </div>
        </div>

        {/* Highlighting */}
        <div style={s.highlighting} />

        {/* Delete button */}
        <div style={{ ...s.deleteBtn, ...btnAnim }}>
          <img src={iconTrash} alt="" style={{ width: 20, height: 20 }} />
        </div>

        {/* Scale button */}
        <div style={{ ...s.scaleBtn, ...btnAnim }}>
          <img src={iconScale} alt="" style={{ width: 20, height: 20 }} />
        </div>

        {/* Handler button */}
        <div style={{ ...s.handlerBtn, ...btnAnim }}>
          <img src={iconMove} alt="" style={{ width: 24, height: 24 }} />
        </div>

        {/* Undo / Redo */}
        <div style={s.undoRedo}>
          <button style={s.undoRedoBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 14L4 9L9 4" stroke="#424242" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 9h11a5 5 0 010 10H12" stroke="#424242" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button style={s.undoRedoBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 14l5-5-5-5" stroke="#424242" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 9H9a5 5 0 000 10h3" stroke="#424242" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Bottom Sheet */}
        <div style={s.bottomSheet}>
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
              <SpaceAiSlider />
              <div style={s.inputRight}>
                <div style={s.inputBox}><span style={s.inputVal}>360</span></div>
                <span style={s.unitLabel}>cm</span>
              </div>
            </div>
            <div style={s.sliderRow}>
              <span style={s.sliderLabel}>세로</span>
              <SpaceAiSlider />
              <div style={s.inputRight}>
                <div style={s.inputBox}><span style={s.inputVal}>360</span></div>
                <span style={s.unitLabel}>cm</span>
              </div>
            </div>
          </div>
          <div style={s.ctaRow}>
            <button style={s.skipBtn} onClick={() => navigate('/create-room', { state: { restore: true, dir: location.state?.dir, type: location.state?.type } })}>이전</button>
            <button style={s.doneBtn} onClick={() => navigate('/adjust-room')}>완료</button>
          </div>
        </div>

      </div>
    </PhoneShell>
  )
}

const s = {
  screen: {
    position: 'absolute', inset: 0,
  },

  grid: {
    position: 'absolute', left: 9, top: 149,
    width: 356.521, height: 503.322,
    pointerEvents: 'none',
  },

  /* Status Bar — h:50, pl:21, pr:14 */
  statusBar: {
    position: 'absolute', top: 0, left: 0, width: 375, height: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 21, paddingRight: 14, boxSizing: 'border-box',
  },
  sbTime: {
    width: 54, height: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sbLevels: {
    width: 68, height: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  /* Top Bar — top:50, h:44, px:16, gap:20 */
  topBar: {
    position: 'absolute', top: 50, left: 0, width: 375, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 16, paddingRight: 16, boxSizing: 'border-box', gap: 20,
  },
  topTitle: {
    flex: '1 0 0', textAlign: 'center',
    fontSize: 16, fontWeight: 500, color: 'white',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: 'inherit',
  },
  closeBtn: {
    width: 24, height: 24, flexShrink: 0,
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  /* Tutorial Card — top:106, center, w:343, blur */
  tutorialCard: {
    position: 'absolute', top: 106, left: '50%',
    transform: 'translateX(-50%)',
    width: 343,
    backdropFilter: 'blur(2.5px)',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
    paddingTop: 20, paddingBottom: 24,
  },
  tutorialInner: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingLeft: 24, paddingRight: 20, gap: 10,
  },
  stepLabel: {
    fontSize: 13, fontWeight: 700, color: '#7f7f7f',
    letterSpacing: '-0.3px', lineHeight: '18px',
    margin: 0,
  },
  cardTitle: {
    fontSize: 17, fontWeight: 600, color: '#e0e0e0',
    letterSpacing: '-0.3px', lineHeight: '22px',
    margin: '8px 0 0',
    fontFamily: 'inherit',
  },
  cardClose: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    flexShrink: 0, width: 16, height: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: 3,
  },

  /* Rooms — 136×136, border 5px, translate-50 */
  defaultRoom: {
    position: 'absolute',
    left: 'calc(50% - 65.5px)', top: 'calc(50% - 12px)',
    transform: 'translate(-50%, -50%)',
    width: 136, height: 136,
    border: '5px solid #080809',
    overflow: 'hidden', background: 'white',
    boxSizing: 'border-box',
  },
  addRoom: {
    position: 'absolute',
    left: 'calc(50% + 65.5px)', top: 'calc(50% - 12px)',
    transform: 'translate(-50%, -50%)',
    width: 136, height: 136,
    border: '5px solid #080809',
    overflow: 'hidden', background: 'white',
    boxSizing: 'border-box',
  },
  roomImgWrap: {
    position: 'absolute', left: '50%', top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 126, height: 126,
  },
  roomImg: {
    width: '100%', height: '100%',
    objectFit: 'cover', objectPosition: 'center',
    display: 'block', pointerEvents: 'none',
  },
  highlighting: {
    position: 'absolute',
    left: 'calc(50% + 65.5px)', top: 'calc(50% - 12px)',
    transform: 'translate(-50%, -50%)',
    width: 136, height: 136,
    border: '5px solid white',
    background: 'transparent', boxSizing: 'border-box',
    pointerEvents: 'none',
  },

  /* Action Buttons — white circles, scale-in on mount */
  deleteBtn: {
    position: 'absolute', left: 233, top: 274,
    width: 40, height: 40, borderRadius: '50%',
    background: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transformOrigin: 'center center',
    cursor: 'pointer',
  },
  scaleBtn: {
    position: 'absolute', left: 301, top: 306,
    width: 40, height: 40, borderRadius: '50%',
    background: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transformOrigin: 'center center',
    cursor: 'pointer',
  },
  handlerBtn: {
    position: 'absolute', left: 227, top: 474,
    width: 52, height: 52, borderRadius: '50%',
    background: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transformOrigin: 'center center',
    cursor: 'pointer',
  },

  /* Undo / Redo — left:281, top:560, gap:10 */
  undoRedo: {
    position: 'absolute', left: 281, top: 560,
    display: 'flex', gap: 10,
  },
  undoRedoBtn: {
    width: 34, height: 34, borderRadius: 17,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 5, boxSizing: 'border-box',
  },

  /* Bottom Sheet — absolute bottom:0, bg overlay */
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, width: 375,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
  },
  infoRow: {
    display: 'flex', alignItems: 'flex-start', gap: 4,
    paddingTop: 20, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
    width: '100%', boxSizing: 'border-box',
  },
  infoText: {
    fontSize: 14, fontWeight: 500, color: '#8c8c8c',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: 'inherit',
  },
  sliderSection: {
    display: 'flex', flexDirection: 'column', gap: 4,
    paddingBottom: 16, paddingLeft: 16, paddingRight: 16,
    width: '100%', boxSizing: 'border-box',
  },
  sliderRow: {
    display: 'flex', alignItems: 'center', gap: 16,
    width: '100%',
  },
  sliderLabel: {
    fontSize: 14, fontWeight: 500, color: 'white',
    letterSpacing: '-0.3px', lineHeight: '20px',
    flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'inherit',
  },
  inputRight: {
    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
  },
  inputBox: {
    width: 55, border: '1px solid #7f7f7f', borderRadius: 4,
    padding: '6px 12px', boxSizing: 'border-box',
  },
  inputVal: {
    fontSize: 14, fontWeight: 400, color: 'white',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: 'inherit',
  },
  unitLabel: {
    fontSize: 14, fontWeight: 500, color: 'white',
    letterSpacing: '-0.3px', lineHeight: '20px',
    whiteSpace: 'nowrap', fontFamily: 'inherit',
  },

  /* CTA Row */
  ctaRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingTop: 10, paddingBottom: 16, paddingLeft: 16, paddingRight: 16,
    width: '100%', boxSizing: 'border-box',
  },
  skipBtn: {
    minWidth: 88, padding: '8px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Pretendard', sans-serif",
    fontSize: 16, fontWeight: 500, color: 'white',
    letterSpacing: '-0.3px', lineHeight: '20px',
  },
  doneBtn: {
    flex: 1, height: 48,
    background: '#00a1ff', color: 'white',
    border: 'none', borderRadius: 8,
    fontFamily: "'Pretendard', sans-serif",
    fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px',
    cursor: 'pointer',
  },
}
