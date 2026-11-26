import { TerminalShell } from "@/components/terminal/TerminalShell";
import { FocusedTabId } from "@/components/terminal/TickerWorkspace";
import { loadFullTickerWorkspace } from "@/lib/services/ticker-service";

export const dynamic = "force-dynamic";

function resolveFocusedTab(raw?: string): FocusedTabId {
  const key = raw?.toLowerCase() ?? "";
  if (key === "valuation" || key === "financials") return "valuation";
  if (key === "seasonality" || key === "smart-money") return "seasonality";
  if (key === "options") return "options";
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
  const decoded = decodeURIComponent(ticker).toUpperCase();
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
