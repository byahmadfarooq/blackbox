import { scanUrl } from '../lib/engine/scanner';
import { scoreTelemetry } from '../lib/engine/scorer';

async function main() {
  const target = process.argv[2] || 'https://linear.app';
  console.log(`\n========================================`);
  console.log(`[BLACKBOX ENGINE] Probing: ${target}`);
  console.log(`========================================\n`);

  try {
    const rawMetrics = await scanUrl(target);
    const result = scoreTelemetry(rawMetrics);

    console.log(`OVERALL SCORE : ${result.overallScore} / 100`);
    console.log(`TIER          : ${result.tierLabel}`);
    console.log(`LATENCY       : ${result.probeLatencyMs}ms\n`);

    console.log(`--- 4 PILLARS ---`);
    console.log(`1. Architecture : ${result.pillars.architecture.score}/${result.pillars.architecture.maxScore} (${result.pillars.architecture.percentage}%)`);
    console.log(`2. Messaging    : ${result.pillars.messaging.score}/${result.pillars.messaging.maxScore} (${result.pillars.messaging.percentage}%)`);
    console.log(`3. Proof Density: ${result.pillars.proof.score}/${result.pillars.proof.maxScore} (${result.pillars.proof.percentage}%)`);
    console.log(`4. Tech Velocity: ${result.pillars.velocity.score}/${result.pillars.velocity.maxScore} (${result.pillars.velocity.percentage}%)`);

    console.log(`\n--- INCIDENT LOG (${result.incidents.length} items) ---`);
    result.incidents.slice(0, 5).forEach((inc) => {
      console.log(`[${inc.severity}] ${inc.headline} (${inc.pointsDelta > 0 ? '+' : ''}${inc.pointsDelta} pts)`);
      console.log(`  Impact: ${inc.plainEnglishImpact}`);
      console.log(`  Fix   : ${inc.actionableFix}\n`);
    });

    console.log(`[OK] Telemetry scan verified successfully.`);
  } catch (err) {
    console.error(`[ERROR] Scan failed:`, err);
    process.exit(1);
  }
}

main();
