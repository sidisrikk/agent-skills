#!/usr/bin/env npx ts-node

/* -------------------------------------------------------------------------- */
/*                                example input                               */
/* -------------------------------------------------------------------------- */
// git log --format=%at | npx ts-node --skip-project --compiler-options '{"module":"commonjs"}' ./calculate_time.ts > time_report.html
// Note: --skip-project prevents a project tsconfig.json from forcing ESM mode, which breaks stdin reading.

// configuration
const SESSION_TIMEOUT_HOURS = 1;
const DEFAULT_COMMIT_MINUTES = 20;
const POST_LAST_COMMIT_BUFFER_MINUTES = 10;

// --------------------------------------------------------------------------

const SESSION_TIMEOUT_SECONDS = SESSION_TIMEOUT_HOURS * 60 * 60;
const DEFAULT_COMMIT_SECONDS = DEFAULT_COMMIT_MINUTES * 60;
const POST_LAST_COMMIT_BUFFER_SECONDS = POST_LAST_COMMIT_BUFFER_MINUTES * 60;

async function readStdin(): Promise<string> {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const input = await readStdin();
  const timestamps = input
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map(Number)
    .sort((a, b) => a - b);

  if (timestamps.length === 0) {
    console.log('No commits found for the specified author.');
    return;
  }

  // --- Chart 1: Time series calculation ---
  let totalSeconds = 0;
  let previousTimestamp = 0;
  const accumulatedHoursData = [];
  // removed timeOfDayData (scatter) as requested

  for (const currentTimestamp of timestamps) {
    if (previousTimestamp === 0) {
      totalSeconds = DEFAULT_COMMIT_SECONDS;
    } else {
      const diff = currentTimestamp - previousTimestamp;
      if (diff <= SESSION_TIMEOUT_SECONDS) {
        totalSeconds += diff;
      } else {
        totalSeconds += DEFAULT_COMMIT_SECONDS;
      }
    }

    const accumulatedHours = totalSeconds / 3600;
    const commitDate = new Date(currentTimestamp * 1000);
    const thailandTime = new Date(commitDate.getTime() + 7 * 60 * 60 * 1000);
    const commitHour = thailandTime.getUTCHours() + thailandTime.getUTCMinutes() / 60;

    accumulatedHoursData.push({ x: commitDate.getTime(), y: accumulatedHours.toFixed(2) });
    previousTimestamp = currentTimestamp;
  }
  totalSeconds += POST_LAST_COMMIT_BUFFER_SECONDS;

  // --- Chart 2: Session Histogram Calculation ---
  const sessionDurationsMinutes = [];
  // We'll also collect session objects with start time (timestamp) and duration (minutes)
  const sessions: { start: number; durationMinutes: number }[] = [];
  if (timestamps.length > 0) {
    let sessionStartTime = timestamps[0];
    let lastCommitTime = timestamps[0];

    for (let i = 1; i < timestamps.length; i++) {
      const currentTimestamp = timestamps[i];
      const diffSeconds = currentTimestamp - lastCommitTime;

      if (diffSeconds > SESSION_TIMEOUT_SECONDS) {
        const sessionDurationSeconds = lastCommitTime - sessionStartTime;
        const durationMinutes = (sessionDurationSeconds + DEFAULT_COMMIT_SECONDS) / 60;
        sessionDurationsMinutes.push(durationMinutes);
        sessions.push({ start: sessionStartTime, durationMinutes });
        sessionStartTime = currentTimestamp;
      }
      lastCommitTime = currentTimestamp;
    }
    const lastSessionDurationSeconds = lastCommitTime - sessionStartTime;
    const lastDurationMinutes = (lastSessionDurationSeconds + DEFAULT_COMMIT_SECONDS) / 60;
    sessionDurationsMinutes.push(lastDurationMinutes);
    sessions.push({ start: sessionStartTime, durationMinutes: lastDurationMinutes });
  }

  const bins = { '<30m': 0, '30-60m': 0, '1-2h': 0, '2-3h': 0, '3-4h': 0, '4-5h': 0, '5h+': 0 };
  for (const duration of sessionDurationsMinutes) {
    if (duration < 30) bins['<30m']++;
    else if (duration < 60) bins['30-60m']++;
    else if (duration < 120) bins['1-2h']++;
    else if (duration < 180) bins['2-3h']++;
    else if (duration < 240) bins['3-4h']++;
    else if (duration < 300) bins['4-5h']++;
    else bins['5h+']++;
  }
  const histogramData = Object.values(bins);
  const histogramLabels = Object.keys(bins);

  // --- Additional: per-day stacked counts for session-length bins ---
  // We'll group sessions by Thailand day (UTC timestamp at 00:00 in Thailand timezone)
  function getThailandDayStartMs(unixSeconds: number) {
    const dt = new Date(unixSeconds * 1000);
    // shift to Thailand (UTC+7)
    const thailand = new Date(dt.getTime() + 7 * 60 * 60 * 1000);
    thailand.setUTCHours(0, 0, 0, 0);
    // shift back to UTC ms for consistent x values in Chart.js
    return thailand.getTime() - 7 * 60 * 60 * 1000;
  }

  // bins keys to use for stacked bar order (exclude '5h+' misspelling handled below)
  const stackBinKeys = ['<30m', '30-60m', '1-2h', '2-3h', '3-4h', '4-5h', '5h+'];

  // Map dayStartMs -> total hours per bin
  const dayMap: Record<number, Record<string, number>> = {};
  for (const s of sessions) {
    const dayStart = getThailandDayStartMs(s.start);
    if (!dayMap[dayStart]) {
      // initialize totals in hours
      dayMap[dayStart] = Object.fromEntries(stackBinKeys.map((k) => [k, 0]));
    }
    const d = s.durationMinutes;
    const hours = d / 60;
    if (d < 30) dayMap[dayStart]['<30m'] += hours;
    else if (d < 60) dayMap[dayStart]['30-60m'] += hours;
    else if (d < 120) dayMap[dayStart]['1-2h'] += hours;
    else if (d < 180) dayMap[dayStart]['2-3h'] += hours;
    else if (d < 240) dayMap[dayStart]['3-4h'] += hours;
    else if (d < 300) dayMap[dayStart]['4-5h'] += hours;
    else dayMap[dayStart]['5h+'] += hours;
  }

  // Create sorted day array
  const dayStarts = Object.keys(dayMap)
    .map(Number)
    .sort((a, b) => a - b);

  // Prepare dataset arrays for stacked bars
  const stackedDataByBin: Record<string, Array<{ x: number; y: number }>> = {};
  for (const key of stackBinKeys) stackedDataByBin[key] = [];

  for (const day of dayStarts) {
    for (const key of stackBinKeys) {
      // round to 2 decimals for hours
      const val = Math.round((dayMap[day][key] || 0) * 100) / 100;
      stackedDataByBin[key].push({ x: day, y: val });
    }
  }

  // Map dayStart -> sequential day index (1-based) for tick labels
  const dayIndexMap: Record<number, number> = {};
  dayStarts.forEach((d, i) => {
    dayIndexMap[d] = i + 1;
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Time Visualization</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
    <style>
        body { font-family: sans-serif; margin: 0; background-color: #f0f2f5; }
        h1, h2 { text-align: center; color: #333; }
        .chart-container { padding: 20px; height: 60vh; margin-bottom: 40px; }
        .histogram-container { padding: 20px; height: 40vh; }
        .methodology { padding: 0 20px; }
    </style>
</head>
<body>
    <h1>Project Time Visualization</h1>
    <div class="methodology">
        <h3>Methodology</h3>
        <ul>
            <li><b>Session Timeout:</b> ${SESSION_TIMEOUT_HOURS} hours</li>
            <li><b>Minimum Session Time:</b> ${DEFAULT_COMMIT_MINUTES} minutes</li>
            <li><b>Post-Commit Buffer:</b> ${POST_LAST_COMMIT_BUFFER_MINUTES} minutes</li>
        </ul>
    </div>
    <div class="chart-container">
        <canvas id="commitChart"></canvas>
    </div>
    <h2>Session Length Distribution</h2>
    <div class="histogram-container">
        <canvas id="histogramChart"></canvas>
    </div>
    <script>
  const accumulatedHoursData = ${JSON.stringify(accumulatedHoursData)};
    const dayIndexMap = ${JSON.stringify(dayIndexMap)};
    const histogramData = ${JSON.stringify(histogramData)};
    const histogramLabels = ${JSON.stringify(histogramLabels)};
        
    // Chart 1: Combo Chart with stacked bars for session-length bins (left axis)
    const ctx1 = document.getElementById('commitChart').getContext('2d');
    const stackedColors = [
      'rgba(75, 192, 192, 0.9)',
      'rgba(54, 162, 235, 0.9)',
      'rgba(153, 102, 255, 0.9)',
      'rgba(255, 159, 64, 0.9)',
      'rgba(255, 205, 86, 0.9)',
      'rgba(201, 203, 207, 0.9)',
      'rgba(255, 99, 132, 0.9)'
    ];

    const stackedDatasets = Object.keys(${JSON.stringify(stackBinKeys)}).map((_, idx) => null);
    // Build datasets programmatically so order matches stackBinKeys
    const stackBinKeys = ${JSON.stringify(['<30m', '30-60m', '1-2h', '2-3h', '3-4h', '4-5h', '5h+'])};
    const stackedDatasetsFinal = stackBinKeys.map((k, idx) => ({
      type: 'bar',
      label: k,
      data: ${JSON.stringify(stackedDataByBin)}[k] || [],
      backgroundColor: stackedColors[idx % stackedColors.length],
      yAxisID: 'y-stacked',
      stack: 'sessions'
    }));

    new Chart(ctx1, {
      data: {
        datasets: [
          // stacked bar datasets first (appear on left y-axis)
          ...stackedDatasetsFinal,
                    // scatter removed
          // accumulated line on right axis
          { type: 'line', label: 'Accumulated Work Hours', data: accumulatedHoursData, yAxisID: 'y-accumulated', borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.5)', tension: 0.4, pointRadius: 0 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            title: { display: true, text: 'Workday' },
            time: { unit: 'day', stepSize: 1, displayFormats: { day: 'yyyy-MM-dd' }, tooltipFormat: 'PP' },
            ticks: {
              callback: function(value, index, ticks) {
                try {
                  // value may be numeric ms or label; normalize to number
                  let ms = typeof value === 'number' ? value : (this.getLabelForValue ? this.getLabelForValue(value) : value);
                  ms = Number(ms);
                  if (dayIndexMap[ms]) return 'Day ' + dayIndexMap[ms];
                  const d = new Date(ms);
                  return d.toISOString().slice(0,10);
                } catch (e) { return value; }
              }
            }
          },
          // left stacked axis for total hours per day (stacked by session length)
          'y-stacked': { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: 'Total Work Hours per Day (stacked by length)' }, stacked: true },
          'y-accumulated': { type: 'linear', position: 'right', beginAtZero: true, title: { display: true, text: 'Accumulated Work Hours' }, grid: { drawOnChartArea: false } }
        }
      }
    });

        // Chart 2: Histogram
        const ctx2 = document.getElementById('histogramChart').getContext('2d');
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: histogramLabels,
                datasets: [{
                    label: 'Number of Sessions',
                    data: histogramData,
                    backgroundColor: 'rgba(75, 192, 192, 0.8)'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Session Count' } } }
            }
        });
    </script>
</body>
</html>
`;
  console.log(htmlContent);
}
main();
