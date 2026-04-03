"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function formatNum(n: number): string {
  if (!n) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function formatPrice(p: number): string {
  if (!p) return "$0";
  if (p < 0.000001) return `$${p.toFixed(10)}`;
  if (p < 0.0001) return `$${p.toFixed(8)}`;
  if (p < 0.01) return `$${p.toFixed(6)}`;
  if (p < 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(2)}`;
}

export default function TokenPage() {
  const { address } = useParams();
  const { connected } = useWallet();
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [buyAmount, setBuyAmount] = useState("0.1");
  const [showBuy, setShowBuy] = useState(false);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${address}`);
        const data = await res.json();
        const pair = Array.isArray(data) ? data[0] : null;
        setToken(pair);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (address) fetchToken();
  }, [address]);

  function copyAddress() {
    navigator.clipboard.writeText(address as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openJupiter() {
    window.open(`https://jup.ag/swap/SOL-${address}`, "_blank");
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center">
      <div className="text-white/40">Loading token data...</div>
    </div>
  );

  const price = parseFloat(token?.priceUsd || "0");
  const change24h = token?.priceChange?.h24 || 0;
  const change1h = token?.priceChange?.h1 || 0;
  const change5m = token?.priceChange?.m5 || 0;
  const up = change24h >= 0;
  const name = token?.baseToken?.name || "Unknown";
  const sym = token?.baseToken?.symbol || "???";
  const mcap = token?.marketCap || 0;
  const vol24h = token?.volume?.h24 || 0;
  const liq = token?.liquidity?.usd || 0;
  const txns = token?.txns?.h24;

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
          <a href="/pairs" className="px-3 py-1.5 hover:text-white transition">New pairs</a>
          <a href="/wallet" className="px-3 py-1.5 hover:text-white transition">Wallet tracker</a>
          <a href="/signals" className="px-3 py-1.5 hover:text-white transition">AI signals</a>
        </div>
        <WalletMultiButton style={{ background: "#00C853", color: "#0A0B0F", fontSize: "13px", fontWeight: 700, borderRadius: "8px", height: "36px" }} />
      </nav>

      <div className="px-8 py-4 border-b border-white/10 bg-[#161820]">
        <a href="/pairs" className="text-[12px] text-white/40 hover:text-white transition">← Back to new pairs</a>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-3 gap-6">

        <div className="col-span-2 flex flex-col gap-6">

          <div className="bg-[#161820] rounded-xl border border-white/10 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-[14px] font-bold text-white/70">
                  {sym.slice(0, 3)}
                </div>
                <div>
                  <div className="text-[22px] font-bold">{name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[13px] font-mono text-white/40">{(address as string).slice(0, 16)}...{(address as string).slice(-8)}</span>
                    <button onClick={copyAddress} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/5 text-white/40 hover:text-white transition">
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[28px] font-bold">{formatPrice(price)}</div>
                <div className={`text-[15px] font-bold mt-1 ${up ? "text-[#00C853]" : "text-red-400"}`}>
                  {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}% 24h
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Market cap", value: formatNum(mcap) },
                { label: "24h volume", value: formatNum(vol24h) },
                { label: "Liquidity", value: formatNum(liq) },
                { label: "24h txns", value: txns ? `${txns.buys + txns.sells}` : "?" },
              ].map((m) => (
                <div key={m.label} className="bg-[#0A0B0F] rounded-xl p-4">
                  <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">{m.label}</div>
                  <div className="text-[18px] font-bold">{m.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                { label: "5m change", value: `${change5m >= 0 ? "+" : ""}${change5m.toFixed(2)}%`, up: change5m >= 0 },
                { label: "1h change", value: `${change1h >= 0 ? "+" : ""}${change1h.toFixed(2)}%`, up: change1h >= 0 },
                { label: "24h change", value: `${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}%`, up: change24h >= 0 },
              ].map((m) => (
                <div key={m.label} className="bg-[#0A0B0F] rounded-xl p-4">
                  <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">{m.label}</div>
                  <div className={`text-[18px] font-bold ${m.up ? "text-[#00C853]" : "text-red-400"}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#161820] rounded-xl border border-white/10 p-6">
            <div className="text-[14px] font-semibold mb-4">Price chart</div>
            <div className="h-48 flex items-end gap-0.5">
              {Array.from({ length: 60 }, (_, i) => {
                const h = 20 + Math.random() * 70;
                const up = Math.random() > 0.4;
                return (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: up ? "#00C853" : "#E03E3E", opacity: 0.75 }}/>
                );
              })}
            </div>
            <div className="mt-3 p-3 bg-[#00C853]/10 border border-[#00C853]/20 rounded-lg text-[12px] text-[#00C853]">
              Full candlestick charts coming soon via Birdeye API
            </div>
          </div>

          <div className="bg-[#161820] rounded-xl border border-white/10 p-6">
            <div className="text-[14px] font-semibold mb-4">Buy/sell activity</div>
            {txns ? (
              <div>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 bg-[#00C853]/10 rounded-lg p-3 text-center">
                    <div className="text-[11px] text-white/40 mb-1">Buys</div>
                    <div className="text-[20px] font-bold text-[#00C853]">{txns.buys}</div>
                  </div>
                  <div className="flex-1 bg-red-500/10 rounded-lg p-3 text-center">
                    <div className="text-[11px] text-white/40 mb-1">Sells</div>
                    <div className="text-[20px] font-bold text-red-400">{txns.sells}</div>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00C853] rounded-full"
                    style={{ width: `${Math.round((txns.buys / (txns.buys + txns.sells)) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[11px] text-white/30">
                  <span>{Math.round((txns.buys / (txns.buys + txns.sells)) * 100)}% buys</span>
                  <span>{Math.round((txns.sells / (txns.buys + txns.sells)) * 100)}% sells</span>
                </div>
              </div>
            ) : (
              <div className="text-white/30 text-sm">No transaction data available</div>
            )}
          </div>

        </div>

        <div className="flex flex-col gap-6">

          <div className="bg-[#161820] rounded-xl border border-[#00C853]/30 p-5">
            <div className="text-[14px] font-bold mb-4 text-[#00C853]">Buy {sym}</div>
            <div className="mb-3">
              <div className="text-[11px] text-white/40 mb-1">You pay (SOL)</div>
              <div className="flex gap-2">
                {["0.1", "0.5", "1", "5"].map((a) => (
                  <button key={a} onClick={() => setBuyAmount(a)} className={`flex-1 py-2 rounded-lg text-[12px] font-bold border transition ${buyAmount === a ? "bg-[#00C853]/20 text-[#00C853] border-[#00C853]/30" : "border-white/10 text-white/40 hover:text-white"}`}>
                    {a}
                  </button>
                ))}
              </div>
              <input
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-full mt-2 bg-[#0A0B0F] border border-white/10 rounded-lg px-3 py-2 text-[14px] font-bold text-white outline-none focus:border-[#00C853]/50"
                placeholder="Custom amount..."
              />
            </div>
            <div className="bg-[#0A0B0F] rounded-lg p-3 mb-4 text-[12px] text-white/40">
              <div className="flex justify-between mb-1">
                <span>You receive (est.)</span>
                <span className="text-white font-semibold">Via Jupiter</span>
              </div>
              <div className="flex justify-between">
                <span>Slippage</span>
                <span className="text-white">Auto</span>
              </div>
            </div>
            {connected ? (
              <button onClick={openJupiter} className="w-full py-3 rounded-xl bg-[#00C853] text-[#0A0B0F] font-bold text-[15px] hover:opacity-90 transition">
                Buy {sym} on Jupiter →
              </button>
            ) : (
              <div className="text-center">
                <div className="text-[12px] text-white/40 mb-3">Connect wallet to buy</div>
                <WalletMultiButton style={{ width: "100%", background: "#00C853", color: "#0A0B0F", fontSize: "13px", fontWeight: 700, borderRadius: "8px", justifyContent: "center" }} />
              </div>
            )}
          </div>

          <div className="bg-[#161820] rounded-xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-semibold">Rug risk score</div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#00C853]/15 text-[#00C853]">AI</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[32px] font-bold text-[#00C853]">72</span>
              <span className="text-[11px] text-white/30">out of 100</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-[#00C853] rounded-full" style={{ width: "72%" }}/>
            </div>
            {[
              { label: "LP locked", val: liq > 10000 ? "Likely" : "Unknown", ok: liq > 10000 },
              { label: "Liquidity", val: liq > 50000 ? "Strong" : liq > 10000 ? "Moderate" : "Low", ok: liq > 10000 },
              { label: "Buy pressure", val: txns && txns.buys > txns.sells ? "Positive" : "Negative", ok: txns && txns.buys > txns.sells },
              { label: "Volume", val: vol24h > 10000 ? "Active" : "Low", ok: vol24h > 10000 },
            ].map((c) => (
              <div key={c.label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-[12px] text-white/40">{c.label}</span>
                <span className={`text-[12px] font-semibold ${c.ok ? "text-[#00C853]" : "text-red-400"}`}>{c.val}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#161820] rounded-xl border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#00C853]"/>
              <div className="text-[13px] font-semibold">AI analysis</div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#00C853]/15 text-[#00C853] ml-auto">$WGMI</span>
            </div>
            <div className="text-[12px] text-white/50 leading-relaxed bg-[#0A0B0F] rounded-lg p-3 border border-white/5">
              <span className="text-white font-semibold">{sym} {up ? "showing positive momentum." : "under selling pressure."}</span>{" "}
              24h change {change24h >= 0 ? "+" : ""}{change24h.toFixed(1)}%. Liquidity {formatNum(liq)}.{" "}
              {txns && txns.buys > txns.sells ? "More buys than sells — bullish signal." : "More sells than buys — caution advised."}{" "}
              {liq > 50000 ? "Liquidity looks healthy." : "Low liquidity — high risk of slippage."}
            </div>
            <input className="w-full mt-3 bg-[#0A0B0F] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white placeholder-white/30 outline-none focus:border-[#00C853]/50" placeholder="Ask AI about this token..." />
          </div>

          <a href={`https://dexscreener.com/solana/${address}`} target="_blank" className="block text-center py-3 rounded-xl border border-white/10 text-[13px] font-semibold text-white/50 hover:text-white hover:border-white/30 transition">
            View on DexScreener →
          </a>
          <a href={`https://solscan.io/token/${address}`} target="_blank" className="block text-center py-3 rounded-xl border border-white/10 text-[13px] font-semibold text-white/50 hover:text-white hover:border-white/30 transition">
            View on Solscan →
          </a>
        </div>
      </div>
    </main>
  );
}
