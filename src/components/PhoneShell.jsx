export default function PhoneShell({ children, bg = '#222' }) {
  return (
    <div style={{
      position: 'relative',
      width: 375,
      height: 812,
      background: bg,
      overflow: 'hidden',
      borderRadius: 32,
      flexShrink: 0,
    }}>
      {children}
    </div>
  )
}
