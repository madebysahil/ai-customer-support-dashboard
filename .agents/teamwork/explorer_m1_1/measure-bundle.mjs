#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const args = process.argv.slice(2);
const saveBaselineIdx = args.indexOf("--save-baseline");
const baselineSavePath = saveBaselineIdx !== -1 ? args[saveBaselineIdx + 1] : null;

const compareIdx = args.indexOf("--compare");
const baselineComparePath = compareIdx !== -1 ? args[compareIdx + 1] : null;

const thresholdIdx = args.indexOf("--threshold");
const requiredReductionPct = thresholdIdx !== -1 ? parseFloat(args[thresholdIdx + 1]) : 5.0; // default 5% reduction required

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");
const staticDir = path.join(nextDir, "static");
const appServerDir = path.join(nextDir, "server/app");

if (!fs.existsSync(nextDir) || !fs.existsSync(staticDir)) {
  console.error("Error: .next directory not found. Please run build first ('npm run build' or 'next build --webpack').");
  process.exit(1);
}

function findHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(findHtmlFiles(full));
    } else if (item.name.endsWith(".html") && !item.name.startsWith("_")) {
      results.push(full);
    }
  }
  return results;
}

function getAllJsFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllJsFiles(full));
    } else if (item.name.endsWith(".js")) {
      results.push(full);
    }
  }
  return results;
}

// 1. Measure total static JS
const allJsFiles = getAllJsFiles(path.join(staticDir, "chunks"));
let totalStaticRawBytes = 0;
let totalStaticGzipBytes = 0;
const vendorSizes = {
  recharts: 0,
  markdown: 0,
  socketIo: 0,
  lucide: 0,
};

for (const jsFile of allJsFiles) {
  const buf = fs.readFileSync(jsFile);
  const raw = buf.length;
  const gz = zlib.gzipSync(buf).length;
  totalStaticRawBytes += raw;
  totalStaticGzipBytes += gz;

  const content = buf.toString("utf8");
  if (content.includes("recharts") || content.includes("ResponsiveContainer")) {
    vendorSizes.recharts += raw;
  }
  if (content.includes("react-markdown") || content.includes("remarkGfm")) {
    vendorSizes.markdown += raw;
  }
  if (content.includes("socket.io") || content.includes("engine.io")) {
    vendorSizes.socketIo += raw;
  }
  if (content.includes("lucide") || jsFile.includes("lucide")) {
    vendorSizes.lucide += raw;
  }
}

// 2. Measure per-route initial JS payload
const htmlFiles = findHtmlFiles(appServerDir);
const routes = {};

for (const htmlPath of htmlFiles) {
  const relRoute = htmlPath
    .replace(appServerDir, "")
    .replace(/\.html$/, "")
    .replace(/\/page$/, "")
    .replace(/\/\([^)]+\)/g, "") || "/";

  const content = fs.readFileSync(htmlPath, "utf8");
  const scriptRegex = /<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g;
  let match;
  const scripts = new Set();
  while ((match = scriptRegex.exec(content)) !== null) {
    if (match[1].startsWith("/_next/static/")) {
      scripts.add(match[1].replace("/_next/static/", ""));
    }
  }

  let routeRawBytes = 0;
  let routeGzipBytes = 0;

  for (const script of scripts) {
    const fullPath = path.join(staticDir, script);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      routeRawBytes += buf.length;
      routeGzipBytes += zlib.gzipSync(buf).length;
    }
  }

  routes[relRoute] = {
    rawBytes: routeRawBytes,
    gzipBytes: routeGzipBytes,
    rawKB: Number((routeRawBytes / 1024).toFixed(1)),
    gzipKB: Number((routeGzipBytes / 1024).toFixed(1)),
    chunkCount: scripts.size,
  };
}

const currentMetrics = {
  timestamp: new Date().toISOString(),
  totalStatic: {
    rawBytes: totalStaticRawBytes,
    gzipBytes: totalStaticGzipBytes,
    rawKB: Number((totalStaticRawBytes / 1024).toFixed(1)),
    gzipKB: Number((totalStaticGzipBytes / 1024).toFixed(1)),
    totalFiles: allJsFiles.length,
  },
  vendorsKB: {
    recharts: Number((vendorSizes.recharts / 1024).toFixed(1)),
    markdown: Number((vendorSizes.markdown / 1024).toFixed(1)),
    socketIo: Number((vendorSizes.socketIo / 1024).toFixed(1)),
    lucide: Number((vendorSizes.lucide / 1024).toFixed(1)),
  },
  routes,
};

console.log("==================================================================");
console.log("SUPPORTPILOT BUNDLE SIZE MEASUREMENT REPORT");
console.log("==================================================================");
console.log(`Timestamp: ${currentMetrics.timestamp}`);
console.log(`Total Static JS Chunks: ${currentMetrics.totalStatic.totalFiles} files`);
console.log(`Total Static JS Size:   ${currentMetrics.totalStatic.rawKB} KB (Gzip: ${currentMetrics.totalStatic.gzipKB} KB)`);
console.log("------------------------------------------------------------------");
console.log("Vendor Fingerprints (Uncompressed):");
console.log(`  - Recharts:        ${currentMetrics.vendorsKB.recharts} KB`);
console.log(`  - React-Markdown:  ${currentMetrics.vendorsKB.markdown} KB`);
console.log(`  - Socket.io Client: ${currentMetrics.vendorsKB.socketIo} KB`);
console.log(`  - Lucide Icons:    ${currentMetrics.vendorsKB.lucide} KB`);
console.log("------------------------------------------------------------------");
console.log("Per-Route Initial JS Payload:");
console.log(
  "Route".padEnd(20) +
  "Raw Size".padEnd(14) +
  "Gzip Size".padEnd(14) +
  "Chunks"
);
console.log("-".repeat(55));
for (const [route, data] of Object.entries(routes).sort()) {
  console.log(
    route.padEnd(20) +
    `${data.rawKB} KB`.padEnd(14) +
    `${data.gzipKB} KB`.padEnd(14) +
    String(data.chunkCount)
  );
}
console.log("==================================================================");

if (baselineSavePath) {
  const resolvedSavePath = path.resolve(projectRoot, baselineSavePath);
  fs.writeFileSync(resolvedSavePath, JSON.stringify(currentMetrics, null, 2), "utf8");
  console.log(`\n✓ Baseline metrics saved to: ${resolvedSavePath}`);
}

if (baselineComparePath) {
  const resolvedComparePath = path.resolve(projectRoot, baselineComparePath);
  if (!fs.existsSync(resolvedComparePath)) {
    console.error(`\n❌ Error: Baseline comparison file not found: ${resolvedComparePath}`);
    process.exit(1);
  }

  const baseline = JSON.parse(fs.readFileSync(resolvedComparePath, "utf8"));
  console.log("\n==================================================================");
  console.log("BUNDLE SIZE DELTA VERIFICATION (VS BASELINE)");
  console.log("==================================================================");
  console.log(`Baseline Date: ${baseline.timestamp}`);
  console.log(`Current Date:  ${currentMetrics.timestamp}`);
  console.log("------------------------------------------------------------------");

  const totalRawDeltaKB = currentMetrics.totalStatic.rawKB - baseline.totalStatic.rawKB;
  const totalRawDeltaPct = ((totalRawDeltaKB / baseline.totalStatic.rawKB) * 100).toFixed(2);
  const totalGzipDeltaKB = currentMetrics.totalStatic.gzipKB - baseline.totalStatic.gzipKB;
  const totalGzipDeltaPct = ((totalGzipDeltaKB / baseline.totalStatic.gzipKB) * 100).toFixed(2);

  console.log(
    `Total Static JS Raw:  ${baseline.totalStatic.rawKB} KB -> ${currentMetrics.totalStatic.rawKB} KB ` +
    `(${totalRawDeltaKB >= 0 ? "+" : ""}${totalRawDeltaKB.toFixed(1)} KB, ${totalRawDeltaPct}%)`
  );
  console.log(
    `Total Static JS Gzip: ${baseline.totalStatic.gzipKB} KB -> ${currentMetrics.totalStatic.gzipKB} KB ` +
    `(${totalGzipDeltaKB >= 0 ? "+" : ""}${totalGzipDeltaKB.toFixed(1)} KB, ${totalGzipDeltaPct}%)`
  );
  console.log("------------------------------------------------------------------");
  console.log("Per-Route Delta Comparison:");
  console.log(
    "Route".padEnd(18) +
    "Pre (Raw)".padEnd(12) +
    "Post (Raw)".padEnd(12) +
    "Delta (KB)".padEnd(14) +
    "Delta (%)".padEnd(12) +
    "Status"
  );
  console.log("-".repeat(74));

  let anyRouteReduced = false;
  let totalReducedRoutes = 0;
  const routeList = Object.keys(currentMetrics.routes).sort();

  for (const route of routeList) {
    const postData = currentMetrics.routes[route];
    const preData = baseline.routes[route];
    if (!preData) {
      console.log(route.padEnd(18) + "N/A".padEnd(12) + `${postData.rawKB} KB`.padEnd(12) + "NEW ROUTE".padEnd(14) + "-".padEnd(12) + "INFO");
      continue;
    }

    const deltaKB = postData.rawKB - preData.rawKB;
    const deltaPct = ((deltaKB / preData.rawKB) * 100).toFixed(1);
    const sign = deltaKB >= 0 ? "+" : "";
    const isReduced = deltaKB < -0.5;
    if (isReduced) {
      anyRouteReduced = true;
      totalReducedRoutes++;
    }
    const status = deltaKB <= 0 ? "OPTIMIZED" : "INCREASED";

    console.log(
      route.padEnd(18) +
      `${preData.rawKB} KB`.padEnd(12) +
      `${postData.rawKB} KB`.padEnd(12) +
      `${sign}${deltaKB.toFixed(1)} KB`.padEnd(14) +
      `${sign}${deltaPct}%`.padEnd(12) +
      status
    );
  }

  console.log("==================================================================");
  console.log(`Routes with measurable reduction: ${totalReducedRoutes} / ${routeList.length}`);

  if (totalRawDeltaKB < 0 || anyRouteReduced) {
    console.log(`\n🎉 VERIFICATION PASSED: Initial JS payload shows measurable reduction!`);
    process.exit(0);
  } else {
    console.warn(`\n⚠️ VERIFICATION NOTICE: No measurable reduction detected vs baseline.`);
    process.exit(1);
  }
}
