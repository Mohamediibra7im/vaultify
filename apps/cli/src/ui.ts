import chalk from 'chalk';
import ora, { type Ora } from 'ora';

// ─── Brand Colors ────────────────────────────────────────────

export const brand = {
  primary: chalk.hex('#A78BFA'),     // soft violet
  secondary: chalk.hex('#818CF8'),   // indigo
  accent: chalk.hex('#34D399'),      // emerald
  warn: chalk.hex('#FBBF24'),        // amber
  error: chalk.hex('#F87171'),       // red
  dim: chalk.hex('#6B7280'),         // gray
  muted: chalk.hex('#9CA3AF'),       // lighter gray
  white: chalk.hex('#F9FAFB'),       // near-white
};

// ─── Icons ───────────────────────────────────────────────────
// Using Unicode symbols instead of emojis for consistent
// rendering across all terminals (Windows, SSH, macOS, Linux).

export const icon = {
  success: brand.accent('✓'),
  error: brand.error('✗'),
  warn: brand.warn('⚠'),
  arrow: brand.primary('❯'),
  dot: brand.dim('·'),
  key: brand.warn('◆'),
  lock: brand.primary('●'),
  run: brand.accent('▸'),
  folder: brand.secondary('◇'),
  globe: brand.secondary('◎'),
  user: brand.primary('○'),
  team: brand.primary('◈'),
  shield: brand.accent('△'),
  link: brand.primary('◆'),
  diff: brand.warn('⇄'),
  logout: brand.dim('←'),
};

// ─── Header ──────────────────────────────────────────────────

export function printHeader(): void {
  console.log();
  console.log(
    brand.primary('  ╭─────────────────────────────╮'),
  );
  console.log(
    brand.primary('  │') +
    '  ' + brand.primary.bold('vlt-cli') + brand.dim(' · Vaultify CLI') +
    '   ' + brand.primary('│'),
  );
  console.log(
    brand.primary('  ╰─────────────────────────────╯'),
  );
  console.log();
}

// ─── Spinner ─────────────────────────────────────────────────

export function spinner(text: string): Ora {
  return ora({
    text: brand.dim(text),
    spinner: 'dots',
    color: 'magenta',
  }).start();
}

// ─── Messages ────────────────────────────────────────────────

export function success(msg: string): void {
  console.log(`  ${icon.success} ${brand.white(msg)}`);
}

export function error(msg: string): void {
  console.log(`  ${icon.error} ${brand.error(msg)}`);
}

export function warn(msg: string): void {
  console.log(`  ${icon.warn} ${brand.warn(msg)}`);
}

export function info(label: string, value: string): void {
  console.log(`  ${brand.dim(label.padEnd(12))} ${brand.white(value)}`);
}

export function hint(msg: string): void {
  console.log(`  ${brand.dim(msg)}`);
}

export function divider(): void {
  console.log(brand.dim('  ─────────────────────────────────'));
}

export function blank(): void {
  console.log();
}

// ─── Table ───────────────────────────────────────────────────

export function printTable(
  headers: string[],
  rows: string[][],
): void {
  // Calculate column widths
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => stripAnsi(r[i] || '').length)),
  );

  // Header
  const headerLine = headers
    .map((h, i) => brand.dim(h.padEnd(widths[i])))
    .join('   ');
  console.log(`  ${headerLine}`);
  console.log(`  ${widths.map((w) => brand.dim('─'.repeat(w))).join('   ')}`);

  // Rows
  for (const row of rows) {
    const line = row
      .map((cell, i) => {
        const pad = widths[i] - stripAnsi(cell).length;
        return cell + ' '.repeat(Math.max(0, pad));
      })
      .join('   ');
    console.log(`  ${line}`);
  }
}

// Simple ANSI strip for padding calculations
function stripAnsi(str: string): string {
  return str.replace(
    // eslint-disable-next-line no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    '',
  );
}
