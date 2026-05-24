#!/usr/bin/env npx ts-node

/* -------------------------------------------------------------------------- */
/*                                example input                               */
/* -------------------------------------------------------------------------- */
// git log --format="%at|%aN" | npx ts-node --skip-project --compiler-options '{"module":"commonjs"}' ./calculate_time.ts > time_report.html
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

function getThailandDayStartMs(unixSeconds: number) {
  const dt = new Date(unixSeconds * 1000);
  const thailand = new Date(dt.getTime() + 7 * 60 * 60 * 1000);
  thailand.setUTCHours(0, 0, 0, 0);
  return thailand.getTime() - 7 * 60 * 60 * 1000;
}

async function main() {
  const input = await readStdin();
  const lines = input.split('\n').filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    console.log('No commits found.');
    return;
  }

  // Parse and group by author
  const authorCommits: Record<string, number[]> = {};
  for (const line of lines) {
    const parts = line.split('|');
    const tsStr = parts[0];
    const author = parts.length > 1 ? parts[1].trim() : 'Unknown';
    const ts = Number(tsStr);
    if (!isNaN(ts)) {
      if (!authorCommits[author]) authorCommits[author] = [];
      authorCommits[author].push(ts);
    }
  }

  const allAuthors = Object.keys(authorCommits).sort();
  
  if (allAuthors.length === 0) {
    console.log('No valid commits found.');
    return;
  }

  // author -> accumulated line data [{x,y}]
  const accumulatedHoursDataByAuthor: Record<string, {x: number, y: string}[]> = {};
  // array of all sessions across all authors (for histogram)
  const allSessions: { start: number; durationMinutes: number }[] = [];
  // dayStartMs -> { authorName -> hours }
  const dayMap: Record<number, Record<string, number>> = {};

  for (const author of allAuthors) {
    const timestamps = authorCommits[author].sort((a, b) => a - b);
    
    let totalSeconds = 0;
    let previousTimestamp = 0;
    const accumulatedData = [];
    
    // session tracking for this author
    let sessionStartTime = timestamps[0];
    let lastCommitTime = timestamps[0];

    for (let i = 0; i < timestamps.length; i++) {
      const currentTimestamp = timestamps[i];
      
      // Calculate accumulated time
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
      accumulatedData.push({ x: commitDate.getTime(), y: accumulatedHours.toFixed(2) });
      previousTimestamp = currentTimestamp;

      // Session logic
      if (i > 0) {
        const diffSeconds = currentTimestamp - lastCommitTime;
        if (diffSeconds > SESSION_TIMEOUT_SECONDS) {
          const sessionDurationSeconds = lastCommitTime - sessionStartTime;
          const durationMinutes = (sessionDurationSeconds + DEFAULT_COMMIT_SECONDS) / 60;
          allSessions.push({ start: sessionStartTime, durationMinutes });
          
          // Add to daily total for this author
          const dayStart = getThailandDayStartMs(sessionStartTime);
          if (!dayMap[dayStart]) dayMap[dayStart] = {};
          if (!dayMap[dayStart][author]) dayMap[dayStart][author] = 0;
          dayMap[dayStart][author] += durationMinutes / 60;

          sessionStartTime = currentTimestamp;
        }
      }
      lastCommitTime = currentTimestamp;
    }
    
    totalSeconds += POST_LAST_COMMIT_BUFFER_SECONDS;
    
    // Add final session for this author
    const lastSessionDurationSeconds = lastCommitTime - sessionStartTime;
    const lastDurationMinutes = (lastSessionDurationSeconds + DEFAULT_COMMIT_SECONDS) / 60;
    allSessions.push({ start: sessionStartTime, durationMinutes: lastDurationMinutes });
    
    const dayStart = getThailandDayStartMs(sessionStartTime);
    if (!dayMap[dayStart]) dayMap[dayStart] = {};
    if (!dayMap[dayStart][author]) dayMap[dayStart][author] = 0;
    dayMap[dayStart][author] += lastDurationMinutes / 60;
    
    accumulatedHoursDataByAuthor[author] = accumulatedData;
  }

  // --- Histogram Calculation ---
  const bins = { '<30m': 0, '30-60m': 0, '1-2h': 0, '2-3h': 0, '3-4h': 0, '4-5h': 0, '5h+': 0 };
  for (const s of allSessions) {
    const duration = s.durationMinutes;
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

  // --- Stacked Bar by Author ---
  const dayStarts = Object.keys(dayMap)
    .map(Number)
    .sort((a, b) => a - b);

  const stackedDataByAuthor: Record<string, Array<{ x: number; y: number }>> = {};
  for (const author of allAuthors) stackedDataByAuthor[author] = [];

  for (const day of dayStarts) {
    for (const author of allAuthors) {
      const val = Math.round((dayMap[day][author] || 0) * 100) / 100;
      stackedDataByAuthor[author].push({ x: day, y: val });
    }
  }

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
    const accumulatedHoursDataByAuthor = ${JSON.stringify(accumulatedHoursDataByAuthor)};
    const dayIndexMap = ${JSON.stringify(dayIndexMap)};
    const histogramData = ${JSON.stringify(histogramData)};
    const histogramLabels = ${JSON.stringify(histogramLabels)};
    const stackedDataByAuthor = ${JSON.stringify(stackedDataByAuthor)};
    const allAuthors = ${JSON.stringify(allAuthors)};
        
    // Chart 1: Combo Chart with stacked bars for authors (left axis)
    const ctx1 = document.getElementById('commitChart').getContext('2d');
    const colorPalette = [
      'rgba(54, 162, 235, 0.9)',
      'rgba(255, 99, 132, 0.9)',
      'rgba(75, 192, 192, 0.9)',
      'rgba(153, 102, 255, 0.9)',
      'rgba(255, 159, 64, 0.9)',
      'rgba(255, 205, 86, 0.9)',
      'rgba(201, 203, 207, 0.9)'
    ];
    
    // Make line colors slightly more opaque
    const linePalette = colorPalette.map(c => c.replace('0.9)', '1)'));

    const datasets = [];

    // Stacked bars (one for each author)
    allAuthors.forEach((author, idx) => {
      datasets.push({
        type: 'bar',
        label: author + ' (Daily)',
        data: stackedDataByAuthor[author],
        backgroundColor: colorPalette[idx % colorPalette.length],
        yAxisID: 'y-stacked',
        stack: 'sessions'
      });
    });

    // Accumulated lines (one for each author)
    allAuthors.forEach((author, idx) => {
      datasets.push({
        type: 'line',
        label: author + ' (Accumulated)',
        data: accumulatedHoursDataByAuthor[author],
        borderColor: linePalette[idx % linePalette.length],
        backgroundColor: colorPalette[idx % colorPalette.length],
        tension: 0.4,
        pointRadius: 0,
        yAxisID: 'y-accumulated'
      });
    });

    new Chart(ctx1, {
      data: { datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            type: 'time',
            title: { display: true, text: 'Workday' },
            time: { unit: 'day', stepSize: 1, displayFormats: { day: 'yyyy-MM-dd' }, tooltipFormat: 'PP' },
            ticks: {
              callback: function(value) {
                try {
                  let ms = typeof value === 'number' ? value : (this.getLabelForValue ? this.getLabelForValue(value) : value);
                  ms = Number(ms);
                  if (dayIndexMap[ms]) return 'Day ' + dayIndexMap[ms];
                  const d = new Date(ms);
                  return d.toISOString().slice(0,10);
                } catch (e) { return value; }
              }
            }
          },
          'y-stacked': { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: 'Total Work Hours per Day (stacked by Author)' }, stacked: true },
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
