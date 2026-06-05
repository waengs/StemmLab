export function formatSlowMoLogData(videoUrl: string, notes: string): string {
  const lines = [`Video: ${videoUrl}`];
  if (notes.trim()) {
    lines.push(`Notes: ${notes.trim()}`);
  }
  return lines.join('\n');
}

export function parseSlowMoLogData(data: string): { videoUrl: string | null; notes: string } {
  if (!data) {
    return { videoUrl: null, notes: '' };
  }

  const videoLine = data.match(/^Video:\s*(.+)$/m);
  if (videoLine) {
    const notesLine = data.match(/^Notes:\s*([\s\S]*)$/m);
    return {
      videoUrl: videoLine[1].trim(),
      notes: notesLine?.[1]?.trim() ?? '',
    };
  }

  if (/^(https?|file):\/\//.test(data.trim())) {
    return { videoUrl: data.trim(), notes: '' };
  }

  const notesOnly = data.match(/^Notes:\s*([\s\S]*)$/);
  if (notesOnly) {
    return { videoUrl: null, notes: notesOnly[1].trim() };
  }

  return { videoUrl: null, notes: data };
}

export function parseVibrationLogData(data: string): { stats: string[]; notes: string } {
  const str = String(data);
  const splitIdx = str.indexOf('\nNotes: ');
  const main = splitIdx >= 0 ? str.substring(0, splitIdx) : str;
  const notes = splitIdx >= 0 ? str.substring(splitIdx + '\nNotes: '.length).trim() : '';
  const stats = main
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
  return { stats, notes };
}

