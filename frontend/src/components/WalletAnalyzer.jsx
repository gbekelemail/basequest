import { useState } from "react";
import { ethers } from "ethers";
import { getWalletAnalysis } from "../utils/basescan.js";

export default function WalletAnalyzer({ wallet }) {
  const [input,    setInput]    = useState(wallet.address || "");
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const analyze = async () => {
    const addr = input.trim();
    if (!ethers.isAddress(addr)) { setError("Invalid Ethereum address."); return; }
    setLoading(true); setError(null); setAnalysis(null);
    try { setAnalysis(await getWalletAnalysis(addr)); }
    catch (err) { setError(err.message || "Failed to analyze wallet."); }
    finally { setLoading(false); }
  };

  const scoreColor = (s) => s >= 70 ? "#00c853" : s >= 40 ? "#f0b429" : "#ff3b3b";
  const scoreLabel = (s) => s >= 70 ? "OG Farmer" : s >= 40 ? "Active User" : "Newbie";

  return (
    <div style={{ padding: "24px 0", maxWidth: "700px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: "800", margin: "0 0 6px" }}>
          🔍 Wallet Analyzer
        </h2>
        <p style={{ color: "#8892a4", fontSize: "14px", margin: 0 }}>
          Analyze any Base wallet's on-chain activity and get a Base Score.
        </p>
      </div>

      {/* Input card */}
      <div style={{
        background:   "rgba(255,255,255,0.02)",
        border:       "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding:      "20px",
        marginBottom: "20px",
      }}>
        <label style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
          Wallet Address
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="0x..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            style={{
              flex:         1,
              background:   "rgba(255,255,255,0.05)",
              border:       "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding:      "10px 14px",
              color:        "white",
              fontSize:     "14px",
              outline:      "none",
            }}
          />
          <button
            onClick={analyze}
            disabled={loading}
            style={{
              background:   loading ? "rgba(0,82,255,0.3)" : "linear-gradient(135deg, #0052ff, #0041cc)",
              border:       "none",
              borderRadius: "10px",
              padding:      "10px 20px",
              color:        "white",
              fontWeight:   "700",
              fontSize:     "14px",
              cursor:       loading ? "not-allowed" : "pointer",
              boxShadow:    loading ? "none" : "0 4px 16px rgba(0,82,255,0.3)",
              whiteSpace:   "nowrap",
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Use connected wallet shortcut */}
        {wallet.address && wallet.address !== input && (
          <button
            onClick={() => setInput(wallet.address)}
            style={{
              background: "none",
              border:     "none",
              color:      "#0052ff",
              fontSize:   "12px",
              fontWeight: "600",
              cursor:     "pointer",
              marginTop:  "8px",
              padding:    0,
            }}
          >
            Use connected wallet →
          </button>
        )}

        {error && (
          <div style={{ color: "#ff6b6b", fontSize: "13px", marginTop: "10px", fontWeight: "600" }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
          <div style={{ color: "#8892a4", fontSize: "14px" }}>Fetching on-chain data...</div>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Base Score */}
          <div style={{
            background:   "rgba(255,255,255,0.02)",
            border:       `1px solid ${scoreColor(analysis.baseScore)}40`,
            borderRadius: "20px",
            padding:      "28px",
            textAlign:    "center",
          }}>
            <div style={{ color: "#8892a4", fontSize: "13px", marginBottom: "8px" }}>Base Score</div>
            <div style={{ color: scoreColor(analysis.baseScore), fontWeight: "900", fontSize: "72px", lineHeight: 1, marginBottom: "8px" }}>
              {analysis.baseScore}
            </div>
            <div style={{ color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "4px" }}>
              {scoreLabel(analysis.baseScore)}
            </div>
            <div style={{ color: "#8892a4", fontSize: "12px" }}>out of 100</div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: "12px" }}>
            {[
              { label: "Total Txs",  value: analysis.totalTxs.toLocaleString() },
              { label: "Wallet Age", value: analysis.walletAgeDays + "d"        },
              { label: "Contracts",  value: analysis.uniqueContracts             },
              { label: "Failed Txs", value: analysis.failedCount                 },
            ].map(s => (
              <div key={s.label} style={{
                background:   "rgba(255,255,255,0.02)",
                border:       "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                padding:      "16px",
                textAlign:    "center",
              }}>
                <div style={{ color: "white", fontWeight: "800", fontSize: "22px", marginBottom: "4px" }}>{s.value}</div>
                <div style={{ color: "#8892a4", fontSize: "12px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div style={{
            background:   "rgba(255,255,255,0.02)",
            border:       "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            padding:      "20px",
          }}>
            <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "14px" }}>
              Activity Heatmap (90 days)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
              {analysis.heatmap.cells.map((count, i) => (
                <div key={i} title={count + " txs"} style={{
                  width:        "12px",
                  height:       "12px",
                  borderRadius: "3px",
                  background:   count === 0
                    ? "rgba(255,255,255,0.05)"
                    : `rgba(0,82,255,${Math.min(0.9, 0.2 + (count / analysis.heatmap.maxCount) * 0.7)})`,
                }} />
              ))}
            </div>
            <div style={{ color: "#8892a4", fontSize: "12px", marginTop: "10px" }}>
              Longest streak: {analysis.heatmap.longestStreak} days
            </div>
          </div>

          {/* Volume + Top Contracts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

            {/* Volume */}
            <div style={{
              background:   "rgba(255,255,255,0.02)",
              border:       "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding:      "18px",
            }}>
              <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "14px" }}>Volume</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Sent",     value: analysis.totalSentEth + " ETH" },
                  { label: "Received", value: analysis.totalRecvEth + " ETH" },
                  { label: "Avg Gas",  value: analysis.avgGasUsed.toLocaleString() },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8892a4", fontSize: "13px" }}>{r.label}</span>
                    <span style={{ color: "white",   fontSize: "13px", fontWeight: "600" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contracts */}
            <div style={{
              background:   "rgba(255,255,255,0.02)",
              border:       "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding:      "18px",
            }}>
              <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "14px" }}>Top Contracts</div>
              {analysis.topContracts.length === 0 ? (
                <div style={{ color: "#8892a4", fontSize: "13px" }}>No contract interactions.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {analysis.topContracts.map(c => (
                    <div key={c.contract} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <a
                        href={`https://basescan.org/address/${c.contract}`}
                        target="_blank" rel="noreferrer"
                        style={{ color: "#00d4ff", fontSize: "12px", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "130px" }}
                      >
                        {c.contract.slice(0,6)}...{c.contract.slice(-4)}
                      </a>
                      <span style={{
                        background:   "rgba(255,255,255,0.06)",
                        border:       "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "20px",
                        padding:      "2px 8px",
                        color:        "#8892a4",
                        fontSize:     "11px",
                        fontWeight:   "600",
                        flexShrink:   0,
                      }}>
                        {c.count} txs
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Basescan link */}
          <div style={{ textAlign: "center" }}>
            <a
              href={`https://basescan.org/address/${analysis.address}`}
              target="_blank" rel="noreferrer"
              style={{
                display:      "inline-block",
                background:   "rgba(255,255,255,0.04)",
                border:       "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding:      "10px 20px",
                color:        "#8892a4",
                fontSize:     "13px",
                fontWeight:   "600",
                textDecoration: "none",
              }}
            >
              View on Basescan ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
              }
