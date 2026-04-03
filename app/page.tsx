import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0B0F] text-white font-sans">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 h-14 border-b border-white/10 bg-[#161820]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00C853] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 34 34" fill="none">
              <circle cx="16" cy="16" r="9" stroke="#0A0B0F" strokeWidth="2.5"/>
              <circle cx="16" cy="16" r="3.5" fill="#0A0B0F"/>
              <path d="M22 22L29 29" stroke="#0A0B0F" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight">
            Wagmi<span className="text-[#00C853]">Scan</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-white/50">
          <span className="px-3 py-1.5 hover:text-white cursor-pointer transition">Charts</span>
          <span className="px-3 py-1.5 hover:text-white cursor-pointer transition">New pairs</span>
          <span className="px-3 py-1.5 hover:text-white cursor-pointer transition">Wallet tracker</span>
          <span className="px-3 py-1.5 hover:text-white cursor-pointer transition">AI signals</span>
        </div>
        <button className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-[#00C853] text-[#0A0B0F] hover:opacity-90 transition">
          Connect wallet
        </button>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <div className="text-[11px] font-bold tracking-widest uppercase text-[#00C853] mb-6">
          Solana Analytics · Powered by AI
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6 max-w-2xl">
          Scan first.<br />
          <span className="text-[#00C853]">Make it together.</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mb-10 leading-relaxed">
          Live charts, AI rug detection, wallet tracking and real-time token analytics — all in one place. Hold <span className="text-[#00C853] font-semibold">$WGMI</span> to unlock the full edge.
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-lg bg-[#00C853] text-[#0A0B0F] font-bold text-[15px] hover:opacity-90 transition">
            Launch app
          </button>
          <button className="px-6 py-3 rounded-lg border border-white/10 text-white/70 font-semibold text-[15px] hover:border-white/30 hover:text-white transition">
            Buy $WGMI
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-8 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {[
            { title: "AI rug detection", desc: "Every new token scored instantly. LP lock, mint authority, dev wallet behaviour — all checked automatically.", color: "#00C853" },
            { title: "Live new pairs", desc: "See every token launched on Solana in real time. Filter by age, liquidity, risk score and AI signal.", color: "#00C853" },
            { title: "Wallet tracker", desc: "Paste any wallet and get a full breakdown — holdings, PnL, transaction history and AI behaviour profile.", color: "#00C853" },
            { title: "AI chart analysis", desc: "Ask anything about any token. Our AI reads the chart and gives you a plain-English breakdown instantly.", color: "#00C853" },
            { title: "Token gating", desc: "Hold $WGMI to unlock AI features, go ad-free, get price alerts and earn revenue share as a Gold holder.", color: "#00C853" },
            { title: "Trending tokens", desc: "Real-time leaderboard of the hottest Solana tokens ranked by volume, holder growth and social momentum.", color: "#00C853" },
          ].map((f, i) => (
            <div key={i} className="bg-[#161820] border border-white/7 rounded-xl p-6 hover:border-white/15 transition">
              <div className="w-8 h-8 rounded-lg bg-[#00C853]/15 flex items-center justify-center mb-4">
                <div className="w-3 h-3 rounded-full bg-[#00C853]"></div>
              </div>
              <div className="text-[14px] font-bold text-white mb-2">{f.title}</div>
              <div className="text-[12px] text-white/40 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/7 px-8 py-6 flex items-center justify-between text-[12px] text-white/30">
        <span>© 2025 WagmiScan · wagmiscan.io</span>
        <span>Built on Solana</span>
      </footer>

    </main>
  );
}