"use client";
import { useState, useEffect } from "react";

export default function PairsPage() {
  const [loading, setLoading] = useState(true);
  const [pairs, setPairs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPairs() {
      try {
        const res = await fetch("https://api.dexscreener.com/token-profiles/latest/v1");
        const data = await res.json();
        const solPairs = data.filter((p: any) => p.chainId === "solana").slice(0, 20);
        setPairs(solPairs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPairs();
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0B0F] text-white p-8">
      <h1 className="text-2xl font-bold mb-6">New Pairs</h1>
      {loading ? (
        <div className="text-white/40">Loading...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {pairs.map((p, i) => (
            <div key={i} className="bg-[#161820] rounded-xl p-4 border border-white/10">
              <div className="font-mono text-sm text-white/60">{p.tokenAddress}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}