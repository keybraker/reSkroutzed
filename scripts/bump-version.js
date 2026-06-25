/**
 * bump-version.js — Bumps the version across package.json and both manifest files.
 *
 * Usage:
 *   node scripts/bump-version.js patch       # 2.2.1 → 2.2.2
 *   node scripts/bump-version.js minor       # 2.2.1 → 2.3.0
 *   node scripts/bump-version.js major       # 2.2.1 → 3.0.0
 *   node scripts/bump-version.js 4.5.6       # sets exactly 4.5.6
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const TARGETS = [
  path.join(ROOT, 'package.json'),
  path.join(ROOT, 'manifests', 'manifest_chrome.json'),
  path.join(ROOT, 'manifests', 'manifest_firefox.json'),
];

const POPUP_HTML = path.join(ROOT, 'popup', 'popup.html');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Update the version badge in popup/popup.html.
 * Looks for: <span ... id="versionBadge">vX.Y.Z</span>
 */
function updatePopupHtml(newVersion) {
  let html = fs.readFileSync(POPUP_HTML, 'utf-8');
  const regex = /(id="versionBadge"[^>]*>v?\d+\.\d+\.\d+<)/;
  const match = html.match(regex);
  if (!match) {
    console.warn(`  SKIP popup/popup.html — could not find version badge`);
    return;
  }
  const oldText = match[1];
  const oldVersionMatch = oldText.match(/v?(\d+\.\d+\.\d+)/);
  const oldVersion = oldVersionMatch ? oldVersionMatch[1] : '?';
  const newText = oldText.replace(/v?\d+\.\d+\.\d+/, 'v' + newVersion);
  html = html.replace(oldText, newText);
  fs.writeFileSync(POPUP_HTML, html, 'utf-8');
  console.log(`  popup/popup.html: ${oldVersion} → ${newVersion}`);
}

function parseSemver(version) {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid semver: "${version}". Expected X.Y.Z`);
  }
  return { major: parts[0], minor: parts[1], patch: parts[2] };
}

function computeNewVersion(current, bump) {
  // If bump looks like a version number (e.g. "4.5.6"), use it directly
  if (/^\d+\.\d+\.\d+$/.test(bump)) {
    return bump;
  }

  const { major, minor, patch } = parseSemver(current);

  switch (bump) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(
        `Unknown bump type: "${bump}". Use patch, minor, major, or an explicit version like 1.2.3.`,
      );
  }
}

const bump = process.argv[2];
if (!bump) {
  console.error('Usage: node scripts/bump-version.js <patch|minor|major|X.Y.Z>');
  process.exit(1);
}

// Read current version from package.json
const pkgPath = path.join(ROOT, 'package.json');
const current = readJSON(pkgPath).version;
if (!current) {
  console.error('No version field found in package.json');
  process.exit(1);
}

const newVersion = computeNewVersion(current, bump);

console.log(`Bumping version: ${current} → ${newVersion}\n`);

for (const filePath of TARGETS) {
  const data = readJSON(filePath);
  const oldVersion = data.version;
  if (!oldVersion) {
    console.warn(`  SKIP ${path.relative(ROOT, filePath)} — no "version" field`);
    continue;
  }
  data.version = newVersion;
  writeJSON(filePath, data);
  console.log(`  ${path.relative(ROOT, filePath)}: ${oldVersion} → ${newVersion}`);
}

updatePopupHtml(newVersion);

console.log('\nDone. Now commit, tag, and push:');
console.log(`  git add -A`);
console.log(`  git commit -m "chore: bump version to v${newVersion}"`);
console.log(`  git tag v${newVersion}`);
console.log(`  git push --follow-tags`);
