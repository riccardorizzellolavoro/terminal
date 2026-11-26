import { TerminalShell } from "@/components/terminal/TerminalShell";
import { loadFullTickerWorkspace } from "@/lib/services/ticker-service";
import { TerminalTabId } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_TABS = new Set<TerminalTabId>([
  "overview",
  "chart",
  "financials",
  "valuation",
  "seasonality",
  "options",
  "smart-money",
  "macro",
]);

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
  const initialTab: TerminalTabId =
    tab && VALID_TABS.has(tab as TerminalTabId)
      ? (tab as TerminalTabId)
      : "overview";

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
