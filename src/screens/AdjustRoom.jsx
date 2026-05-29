import { useNavigate } from 'react-router-dom'
import PhoneShell from '../components/PhoneShell'

export default function AdjustRoom() {
  const navigate = useNavigate()

  return (
    <PhoneShell>
      <div style={styles.screen}>
        <p style={styles.label}>5 / 6</p>
        <p style={styles.title}>방 크기/위치 변경</p>
        <p style={styles.desc}>'완료' 버튼 탭</p>
        <button style={styles.btn} onClick={() => navigate('/design-bedroom')}>
          완료 →
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
  btn: {
    marginTop: 8,
    height: 48, padding: '0 24px',
    background: '#00C4E0', color: '#fff',
    border: 'none', borderRadius: 8,
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
