export default function PhoneShell({ children, bg = '#222' }) {
  return (
    <div className="phone-shell" style={{ background: bg }}>
      {children}
    </div>
  )
}
