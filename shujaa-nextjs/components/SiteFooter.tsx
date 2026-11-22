export default function SiteFooter() {
  return (
    <footer style={{ background: '#18352b', color: '#e9eee7', padding: '36px 0' }}>
      <div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: '#c0cec0' }}>
        <span className="brand-logo" style={{ color: '#fff', fontSize: 14 }}>
          SHUJAA <em>TOURS AND ADVENTURES</em>
        </span>
        <span>Founded and owned by Emmanuel Mweu &amp; Peter Chacha</span>
        <span>Pay in EUR, USD or GBP&nbsp; ✳</span>
      </div>
    </footer>
  )
}
