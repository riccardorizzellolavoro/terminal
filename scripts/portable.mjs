#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function findAvailablePort(startPort = 3000) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(findAvailablePort(startPort + 1)));
    server.listen(startPort, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : startPort;
      server.close(() => resolve(port));
    });
  });
}

function openBrowser(url) {
  const platform = process.platform;
  if (platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  } else if (platform === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
  } else {
    spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
  }
}

async function main() {
  const port = await findAvailablePort(3000);
  const url = `http://localhost:${port}`;
  const hasProdBuild = fs.existsSync(path.join(root, ".next", "BUILD_ID"));
  const nextCmd = hasProdBuild ? "start" : "dev";

  console.log(`\n  OpenTerminal (Portable Mode)`);
  console.log(`  SQLite Database: ${path.join(dataDir, "cache.db")}`);
  console.log(`  Starting Next.js (${nextCmd}) on ${url}...\n`);

  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", nextCmd, "-p", String(port)],
    { stdio: "inherit", env: { ...process.env, PORT: String(port) } }
  );

  setTimeout(() => {
    openBrowser(url);
  }, 2200);

  child.on("exit", (code) => process.exit(code ?? 0));
}

main();
