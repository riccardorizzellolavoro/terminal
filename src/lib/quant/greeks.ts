function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2);
  // Abramowitz & Stegun approximation
  const t = 1 / (1 + 0.3275911 * absX);
  const erf =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t) *
      Math.exp(-absX * absX);
  return 0.5 * (1 + sign * erf);
}

export function computeOptionGreeks(params: {
  spot: number;
  strike: number;
  expiration: string;
  ivPct: number;
  type: "call" | "put";
  riskFreeRate?: number;
}): { delta: number; gamma: number; theta: number; vega: number } {
  const { spot, strike, expiration, ivPct, type, riskFreeRate = 0.042 } = params;
  const expMs = Date.parse(expiration);
  const nowMs = Date.now();
  const T = Math.max(1 / 365, Number.isNaN(expMs) ? 30 / 365 : (expMs - nowMs) / (365 * 86_400_000));
  const sigma = Math.max(0.05, Math.min(3.0, (ivPct || 25) / 100));
  const S = Math.max(0.0001, spot);
  const K = Math.max(0.0001, strike);
  const sqrtT = Math.sqrt(T);

  const d1 =
    (Math.log(S / K) + (riskFreeRate + 0.5 * sigma * sigma) * T) /
    (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const pdfD1 = normPdf(d1);

  const delta = type === "call" ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = pdfD1 / (S * sigma * sqrtT);
  const vega = (S * pdfD1 * sqrtT) / 100; // per 1% IV move
  const thetaAnnual =
    type === "call"
      ? -(S * pdfD1 * sigma) / (2 * sqrtT) -
        riskFreeRate * K * Math.exp(-riskFreeRate * T) * normCdf(d2)
      : -(S * pdfD1 * sigma) / (2 * sqrtT) +
        riskFreeRate * K * Math.exp(-riskFreeRate * T) * normCdf(-d2);
  const theta = thetaAnnual / 365;

  return {
    delta: Number(delta.toFixed(3)),
    gamma: Number(gamma.toFixed(4)),
    theta: Number(theta.toFixed(3)),
    vega: Number(vega.toFixed(3)),
  };
}
