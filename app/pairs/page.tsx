"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function formatNum(n: number): string {
  if (!n) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatPrice(p: number): string {
  if (!p) return "$0";
  if (p < 0.000001) return `$${p.toFixed(10)}`;
  if (p < 0.0001) return `$${p.toFixed(8)}`;
  if (p < 0.01) return `$${p.toFixed(6)}`;
  if (p < 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(2)}`;
}

function getAge(ts: number): string {
  const diff = Date.now() / 1000 - ts / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function getScore(pair: any): number {
  let score = 50;
  const liq = pair?.liquidity?.usd || 0;
  const vol = pair?.volume?.h24 || 0;
  const change = pair?.priceChange?.h1 || 0;
  if (liq > 50000) score += 15;
  else if (liq > 10000) score += 8;
  else score -= 10;
  if (vol > 100000) score += 15;
  else if (vol > 10000) score += 8;
  if (change > 0) score += 10;
  else score -= 5;
  return Math.min(99, Math.max(10, score));
}

function getSignal(score: number, up: boolean) {
  if (score >= 80 && up) return { text: "Strong buy", cls: "text-[#00C853] bg-[#00C853]/15" };
  if (score >= 65 && up) return { text: "Bullish", cls: "text-[#00C853] bg-[#00C853]/10" };
  if (score < 35) return { text: "Rug risk", cls: "text-red-400 bg-red-500/15" };
  if (!up) return { text: "Bearish", cls: "text-yellow-400 bg-yellow-500/15" };
  return { text: "Neutral", cls: "text-white/50 bg-white/5" };
}

export default function PairsPage() {
  const router = useRouter();
  const [pairs, setPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function fetchPairs() {
      try {
        const res = await fetch("https://api.dexscreener.com/token-profiles/latest/v1");
        const data = await res.json();
        const solTokens = data.filter((p: any) => p.chainId === "solana").slice(0, 25);
        const addresses = solTokens.map((p: any) => p.tokenAddress).join(",");
        const pRes = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${addresses}`);
        const pData = await pRes.json();
        const merged = solTokens.map((token: any) => {
          const pair = Array.isArray(pData) ? pData.find((p: any) => p.baseToken?.address === token.tokenAddress) : null;
          const price = parseFloat(pair?.priceUsd || "0");
          const change5m = pair?.priceChange?.m5 || 0;
          const change1h = pair?.priceChange?.h1 || 0;
          const score = getScore(pair);
          const signal = getSignal(score, change1h >= 0);
          return {
            name: pair?.baseToken?.name || "Unknown",
            sym: pair?.baseToken?.symbol || "???",
            address: token.tokenAddress,
            price: formatPrice(price),
            change5m: `${change5m >= 0 ? "+" : ""}${change5m.toFixed(1)}%`,
            change1h: `${change1h >= 0 ? "+" : ""}${change1h.toFixed(1)}%`,
            up5m: change5m >= 0,
            up1h: change1h >= 0,
            liquidity: formatNum(pair?.liquidity?.usd || 0),
            vol: formatNum(pair?.volume?.h24 || 0),
            age: pair?.pairCreatedAt ? getAge(pair.pairCreatedAt) : "?",
            score,
            signal: signal.text,
            signalCls: signal.cls,
          };
        });
        setPairs(merged);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPairs();
    const id = setInterval(fetchPairs, 30000);
    return () => clearInterval(id);
  }, []);

  const filtered = pairs.filter((p) => {
    if (filter === "Low risk" && p.score < 65) return false;
    if (filter === "Bullish" && !p.up1h) return false;
    if (filter === "Rug risk" && p.score >= 35) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#0A0B0F] text-white">
      <nav className="flex items-center justify-between px-8 h-14 border-b border-white/10 bg-[#161820]">
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00C853] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 34 34" fill="none">
              <circle cx="16" cy="16" r="9" stroke="#0A0B0F" strokeWidth="2.5"/>
              <circle cx="16" cy="16" r="3.5" fill="#0A0B0F"/>
              <path d="M22 22L29 29" stroke="#0A0B0F" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight">Wagmi<span className="text-[#00C853]">Scan</span></span>
        </a>
        <div className="flex items-center gap-2 text-[13px] text-white/50">
          <a href="/charts" className="px-3 py-1.5 hover:text-white transition">Charts</a>
          <a href="/pairs" className="px-3 py-1.5 text-[#00C853] font-semibold">New pairs</a>
          <a href="/wallet" className="px-3 py-1.5 hover:text-white transition">Wallet tracker</a>
          <a href="/signals" className="px-3 py-1.5 hover:text-white transition">AI signals</a>
        </div>
        <button className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-[#00C853] text-[#0A0B0F] hover:opacity-90 transition">
          Connect wallet
        </button>
      </nav>

      <div className="flex items-center justify-between px-8 py-4 bg-[#161820] border-b border-white/10 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[15px] font-bold">
            <div className="w-2 h-2 rounded-full bg-[#00C853]"/>
            New pairs
          </div>
          <div className="text-[12px] text-white/40 mt-0.5">Click any token to view details and buy · refreshes every 30s</div>
        </div>
        <div className="flex items-center gap-2">
          {["All", "Low risk", "Bullish", "Rug risk"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${filter === f ? "bg-[#00C853]/20 text-[#00C853] border-[#00C853]/30" : "border-white/10 text-white/40 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {loading ? (
          <div className="text-center py-20 text-white/40">Loading new pairs from DexScreener...</div>
        ) : (
          <div className="bg-[#161820] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-[#1A1D27]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">Token</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">Age</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">Price</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">5m</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">1h</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">Liquidity</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">Volume</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">AI score</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">Signal</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={i}
                    onClick={() => router.push(`/token/${p.address}`)}
                    className="border-b border-white/5 hover:bg-[#00C853]/5 transition cursor-pointer group"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60 flex-shrink-0">
                          {p.sym.slice(0, 3)}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-white group-hover:text-[#00C853] transition">{p.name}</div>
                          <div className="text-[11px] text-white/40 font-mono">{p.sym}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white/5 text-white/50">{p.age}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] font-mono text-white/80">{p.price}</td>
                    <td className={`px-4 py-3 text-right text-[12px] font-bold ${p.up5m ? "text-[#00C853]" : "text-red-400"}`}>{p.change5m}</td>
                    <td className={`px-4 py-3 text-right text-[12px] font-bold ${p.up1h ? "text-[#00C853]" : "text-red-400"}`}>{p.change1h}</td>
                    <td className="px-4 py-3 text-right text-[12px] text-white/50">{p.liquidity}</td>
                    <td className="px-4 py-3 text-right text-[12px] text-white/50">{p.vol}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: p.score >= 65 ? "#00C853" : p.score >= 45 ? "#D97706" : "#E03E3E" }}/>
                        </div>
                        <span className="text-[12px] font-bold" style={{ color: p.score >= 65 ? "#00C853" : p.score >= 45 ? "#D97706" : "#E03E3E" }}>{p.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${p.signalCls}`}>{p.signal}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/token/${p.address}`); }}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#00C853] text-[#0A0B0F] opacity-0 group-hover:opacity-100 transition"
                      >
                        Buy →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-white/10 flex justify-between">
              <span className="text-[12px] text-white/30">Showing {filtered.length} pairs · Click any row to view and buy</span>
              <span className="text-[12px] text-white/30">Auto-refreshes every 30s</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
