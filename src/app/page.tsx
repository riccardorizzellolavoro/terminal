import { DiscoverView } from "@/components/terminal/DiscoverView";
import { TerminalShell } from "@/components/terminal/TerminalShell";
import { loadScreenerUniverse } from "@/lib/services/ticker-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await loadScreenerUniverse();

  return (
    <TerminalShell
      primarySymbol="AAPL"
      mode="discover"
      discoverContent={<DiscoverView initialRows={rows} />}
    />
  );
}
