import { TerminalShell } from "@/components/terminal/TerminalShell";
import { WorkspaceTabKey } from "@/components/terminal/TickerWorkspace";
import { normalizeSymbol } from "@/lib/seed/universe";
import { loadFullTickerWorkspace } from "@/lib/services/ticker-service";

export const dynamic = "force-dynamic";

function resolveFocusedTab(raw?: string): WorkspaceTabKey {
  const key = raw?.toLowerCase() ?? "";
  if (key === "valuation" || key === "financials") return "valuation";
  if (key === "seasonality" || key === "smart-money") return "seasonality";
  if (key === "options") return "options";
  if (key === "spreads") return "spreads";
  if (key === "macro") return "macro";
  return "overview";
}

export default async function TickerTerminalPage({
  params,
  searchParams,
}: {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { ticker } = await params;
  const { tab } = await searchParams;
  const decoded = normalizeSymbol(decodeURIComponent(ticker));
  const initialTab = resolveFocusedTab(tab);

  const initialData = await loadFullTickerWorkspace(decoded, "1Y");

  return (
    <TerminalShell
      primarySymbol={decoded}
      initialData={initialData}
      initialTab={initialTab}
      mode="research"
    />
  );
}
