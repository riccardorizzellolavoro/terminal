import { ScreenerView } from "@/components/terminal/ScreenerView";
import { TerminalShell } from "@/components/terminal/TerminalShell";
import { loadScreenerUniverse } from "@/lib/services/ticker-service";

export const dynamic = "force-dynamic";

export default async function ScreenerPage() {
  const rows = await loadScreenerUniverse();

  return (
    <TerminalShell
      primarySymbol="AAPL"
      mode="screener"
      screenerContent={<ScreenerView initialRows={rows} />}
    />
  );
}
