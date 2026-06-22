#!/usr/bin/env node
/**
 * Build script: reads Intel-Briefing markdown files, generates content.json.
 */
const fs = require('fs');
const path = require('path');

const INTEL_DIR = 'C:\\Users\\xbyna\\iCloudDrive\\Intel-Briefing\\memory';
const OUTPUT_FILE = path.join(__dirname, 'content.json');

function extractDate(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : 'unknown';
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

function readMd(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8').trim();
  content = content.replace(/^# .+\n*/m, '');
  return content.trim();
}
function loadFiles(subdir) {
  const folder = path.join(INTEL_DIR, subdir);
  if (!fs.existsSync(folder)) return [];
  const files = fs.readdirSync(folder)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();
  return files.map(f => {
    const dateStr = extractDate(f);
    const suffix = f.toLowerCase().includes('-pm') ? ' (PM)' : '';
    return {
      date: formatDate(dateStr) + suffix,
      sort_date: dateStr,
      content: readMd(path.join(folder, f)),
    };
  });
}

function loadTracker() {
  const trackerPath = path.join(INTEL_DIR, 'trends', 'trend-tracker.md');
  if (!fs.existsSync(trackerPath)) return null;
  return fs.readFileSync(trackerPath, 'utf-8').trim();
}

const now = new Date();
const generated = now.toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
}) + ' at ' + now.toLocaleTimeString('en-US', {
  hour: 'numeric', minute: '2-digit'
});

console.log(`Reading from: ${INTEL_DIR}`);
const data = {
  generated,
  briefings: loadFiles('briefings'),
  monitors: loadFiles('source-monitor'),
  tracker: loadTracker(),
  digests: loadFiles('digests'),
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Generated ${OUTPUT_FILE}`);
console.log(`  ${data.briefings.length} briefings, ${data.monitors.length} monitors, ${data.digests.length} digests, tracker=${data.tracker ? 'yes' : 'no'}`);