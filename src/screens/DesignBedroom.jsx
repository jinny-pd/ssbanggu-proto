import { useNavigate } from 'react-router-dom'
import PhoneShell from '../components/PhoneShell'

export default function DesignBedroom() {
  const navigate = useNavigate()

  return (
    <PhoneShell>
      <div style={styles.screen}>
        <p style={styles.label}>6 / 6</p>
        <p style={styles.title}>침실 영역 지정</p>
        <p style={styles.desc}>직접 만들기 플로우 종료</p>
        <button style={styles.btnDone} onClick={() => navigate('/')}>
          처음으로
        </button>
        <button style={styles.back} onClick={() => navigate(-1)}>← 뒤로</button>
      </div>
    </PhoneShell>
  )
}

const styles = {
  screen: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 16,
  },
  label: { color: '#555', fontSize: 13, letterSpacing: '-0.3px' },
  title: { color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' },
  desc: { color: '#888', fontSize: 14, letterSpacing: '-0.3px' },
  btnDone: {
    marginTop: 8,
    height: 48, padding: '0 24px',
    background: 'rgba(255,255,255,0.1)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    color: '#fff', borderRadius: 8,
    fontSize: 16, fontWeight: 600,
    fontFamily: 'inherit', letterSpacing: '-0.3px',
    cursor: 'pointer',
  },
  back: {
    background: 'none', border: 'none',
    color: '#555', fontSize: 13, cursor: 'pointer',
    fontFamily: 'inherit', letterSpacing: '-0.3px',
  },
}
