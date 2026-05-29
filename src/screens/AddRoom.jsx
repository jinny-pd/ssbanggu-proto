import { useNavigate } from 'react-router-dom'
import PhoneShell from '../components/PhoneShell'
import iconArrowLeftMedium from '../assets/icons/[Icon] Arrow Left_Medium.svg'
import imgBasic    from '../assets/images/기본.png'
import img6pyeong  from '../assets/images/6평.png'
import img10pyeong from '../assets/images/10평.png'
import img11pyeong from '../assets/images/11평.png'
import img13pyeong from '../assets/images/13평.png'
import img15pyeong from '../assets/images/15평.png'

import imgCellular from '../assets/images/status-cellular.svg'
import imgWifi     from '../assets/images/status-wifi.svg'
import imgBattery  from '../assets/images/status-battery.svg'

/* ── 템플릿 목록 — Figma 이미지 사이즈 기준 ── */
const TEMPLATES = [
  { name: '기본',        img: imgBasic,    w: 157, h: 136 },
  { name: '6평 (23㎡)',  img: img6pyeong,  w: 106, h: 156 },
  { name: '10평 (35㎡)', img: img10pyeong, w: 126, h: 173 },
  { name: '11평 (39㎡)', img: img11pyeong, w: 117, h: 199 },
  { name: '13평 (46㎡)', img: img13pyeong, w: 156, h: 202 },
  { name: '15평 (51㎡)', img: img15pyeong, w: 136, h: 196 },
]

function RoomCard({ name, img, imgW, imgH, onUse }) {
  return (
    <div style={s.card}>
      <div style={s.imageArea}>
        <img
          src={img}
          alt={name}
          style={{
            position: 'absolute',
            width: imgW, height: imgH,
            left: '50%', top: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
            maxWidth: 'none', pointerEvents: 'none',
          }}
        />
      </div>
      <div style={s.cardBottom}>
        <span style={s.cardName}>{name}</span>
        <button style={s.templateBtn} onClick={onUse}>
          템플릿 사용
        </button>
      </div>
    </div>
  )
}

export default function AddRoom() {
  const navigate = useNavigate()
  const rows = [TEMPLATES.slice(0, 2), TEMPLATES.slice(2, 4), TEMPLATES.slice(4, 6)]

  return (
    <PhoneShell bg="white">
      <div style={s.page}>

        {/* ── Status Bar — h:48, pt:18 ── */}
        <div style={s.statusBar}>
          <div style={s.sbLeft}>
            <span style={s.timeText}>9:41</span>
          </div>
          <div style={s.sbIsland} />
          <div style={s.sbRight}>
            <img src={imgCellular} alt="" style={{ width: 19.2,   height: 12.226 }} />
            <img src={imgWifi}     alt="" style={{ width: 17.142,  height: 12.328 }} />
            <img src={imgBattery}  alt="" style={{ width: 27.328,  height: 13 }} />
          </div>
        </div>

        {/* ── Nav Bar — h:44 ── */}
        <div style={s.navBar}>
          <button onClick={() => navigate(-1)} style={s.backBtn}>
            <img src={iconArrowLeftMedium} alt="뒤로" style={{ width: 24, height: 24 }} />
          </button>
          <span style={s.navTitle}>방 추가하기</span>
          <div style={{ width: 24, flexShrink: 0 }} />
        </div>

        {/* ── 배너 — pt:12 px:16 ── */}
        <div style={s.bannerSection}>
          <div style={s.banner}>
            <span style={s.bannerTxt}>딱 맞는 방이 없으신가요?</span>
            <button style={s.directBtn} onClick={() => navigate('/create-room')}>
              직접 만들기
            </button>
          </div>
        </div>

        {/* ── 템플릿 섹션 — pt:8 pb:32 gap:8 ── */}
        <div style={s.templateSection}>
          {rows.map((row, ri) => (
            <div key={ri} style={s.row}>
              {row.map((t) => (
                <RoomCard
                  key={t.name}
                  name={t.name}
                  img={t.img}
                  imgW={t.w}
                  imgH={t.h}
                  onUse={() => navigate('/template-room')}
                />
              ))}
            </div>
          ))}
        </div>

      </div>
    </PhoneShell>
  )
}

/* ── 스타일 ── */
const s = {
  page: {
    position: 'absolute', inset: 0,
    overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    display: 'flex', flexDirection: 'column',
    background: 'white',
  },

  /* 상태바 */
  statusBar: {
    height: 48, paddingTop: 18, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  sbLeft: {
    flex: '1 0 0', display: 'flex', alignItems: 'center',
    justifyContent: 'center', paddingLeft: 16, paddingRight: 6,
  },
  timeText: {
    fontFamily: "'SF Pro Display', system-ui, sans-serif",
    fontSize: 17, fontWeight: 600, color: '#000', lineHeight: '22px',
  },
  sbIsland: { width: 124, flexShrink: 0 },
  sbRight: {
    flex: '1 0 0', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 7, paddingLeft: 6, paddingRight: 16,
  },

  /* 네비게이션 바 */
  navBar: {
    height: 44, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 20, paddingLeft: 16, paddingRight: 16,
  },
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    width: 24, height: 24, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  navTitle: {
    flex: '1 0 0', minWidth: 0,
    fontSize: 16, fontWeight: 500, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '20px',
    textAlign: 'center', fontFamily: "'Pretendard', sans-serif",
  },

  /* 배너 영역 — pt:12 px:16 */
  bannerSection: {
    flexShrink: 0, paddingTop: 12, paddingLeft: 16, paddingRight: 16,
  },
  banner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    border: '1px solid #e0e0e0', borderRadius: 12,
    paddingTop: 16, paddingBottom: 16, paddingLeft: 20, paddingRight: 16,
    background: 'white', overflow: 'hidden',
  },
  bannerTxt: {
    fontSize: 14, fontWeight: 600, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '20px',
    fontFamily: "'Pretendard', sans-serif",
  },
  directBtn: {
    flexShrink: 0, height: 32, padding: '0 12px',
    border: '1px solid #00a1ff', borderRadius: 8,
    background: 'white', color: '#00a1ff',
    fontSize: 13, fontWeight: 600, letterSpacing: '-0.3px', lineHeight: '18px',
    fontFamily: "'Pretendard', sans-serif", cursor: 'pointer',
  },

  /* 템플릿 섹션 — pt:8 pb:32 gap:8 */
  templateSection: {
    flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8,
    paddingTop: 8, paddingBottom: 32,
    width: '100%',
  },
  row: {
    display: 'flex', gap: 8,
    justifyContent: 'center', width: '100%',
  },

  /* 카드 */
  card: {
    width: 167.5, flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    background: 'white', border: '1px solid #e0e0e0',
    borderRadius: 12, overflow: 'hidden',
  },
  imageArea: {
    width: '100%', height: 220,
    position: 'relative', overflow: 'hidden', flexShrink: 0,
  },

  /* 카드 하단 — pt:8 pb:12 px:12 gap:8 */
  cardBottom: {
    display: 'flex', flexDirection: 'column', gap: 8,
    paddingTop: 8, paddingBottom: 12, paddingLeft: 12, paddingRight: 12,
  },
  cardName: {
    fontSize: 13, fontWeight: 600, color: '#141414',
    letterSpacing: '-0.3px', lineHeight: '18px',
    textAlign: 'center', display: 'block',
    fontFamily: "'Pretendard', sans-serif",
  },
  templateBtn: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: 32, alignSelf: 'stretch',
    border: 'none', borderRadius: 8,
    background: '#00a1ff', color: 'white',
    fontSize: 13, fontWeight: 600, letterSpacing: '-0.3px', lineHeight: '18px',
    fontFamily: "'Pretendard', sans-serif", cursor: 'pointer',
  },
}
