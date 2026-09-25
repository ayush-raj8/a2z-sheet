import type { GridMode, VizFrame, VizSpec } from '../types';

function cloneGrid(g: number[][]) {
  return g.map((row) => [...row]);
}

function gridToStrings(g: Array<Array<number | string>>) {
  return g.map((row) => row.map(String));
}

export function buildGridBfs(mode: GridMode = 'rotten'): VizSpec {
  if (mode === 'flood') {
    // flood_fill_bfs(image, sr, sc, color)
    const image = [
      [1, 1, 1],
      [1, 1, 0],
      [1, 0, 1],
    ];
    const sr = 1;
    const sc = 1;
    const color = 2;
    const src = image[sr][sc];
    const frames: VizFrame[] = [];
    const q: Array<[number, number]> = [[sr, sc]];
    image[sr][sc] = color;
    frames.push({
      caption: `Flood fill from (${sr},${sc}): ${src} → ${color}`,
      grid: gridToStrings(image),
      gridHighlight: [[sr, sc]],
      queue: [`(${sr},${sc})`],
    });
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    while (q.length) {
      const [r, c] = q.shift()!;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= image.length || nc >= image[0].length) continue;
        if (image[nr][nc] !== src) continue;
        image[nr][nc] = color;
        q.push([nr, nc]);
      }
      frames.push({
        caption: `Expand from (${r},${c})`,
        grid: gridToStrings(image),
        gridHighlight: [[r, c]],
        queue: q.map(([x, y]) => `(${x},${y})`),
      });
    }
    frames.push({
      caption: 'Fill complete',
      grid: gridToStrings(image),
      queue: [],
    });
    return {
      kit: 'gridBfs',
      title: 'Flood fill (BFS)',
      inputSummary: `image=${JSON.stringify([
        [1, 1, 1],
        [1, 1, 0],
        [1, 0, 1],
      ])}, sr=${sr}, sc=${sc}, color=${color}`,
      expectedOutput: JSON.stringify(image),
      frames,
    };
  }

  if (mode === 'zeroOne') {
    // 0/1 matrix — multi-source BFS from all 0s
    const mat = [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 1],
    ];
    const n = mat.length;
    const m = mat[0].length;
    const dist = mat.map((row) => row.map((v) => (v === 0 ? 0 : Infinity)));
    const q: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (mat[i][j] === 0) q.push([i, j]);
      }
    }
    const frames: VizFrame[] = [
      {
        caption: 'Multi-source BFS from every 0',
        grid: gridToStrings(dist.map((row) => row.map((v) => (v === Infinity ? '∞' : v)))),
        queue: q.map(([r, c]) => `(${r},${c})`),
      },
    ];
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    while (q.length) {
      const [r, c] = q.shift()!;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= n || nc >= m) continue;
        if (dist[nr][nc] <= dist[r][c] + 1) continue;
        dist[nr][nc] = dist[r][c] + 1;
        q.push([nr, nc]);
      }
      frames.push({
        caption: `Relax neighbors of (${r},${c})`,
        grid: gridToStrings(dist.map((row) => row.map((v) => (v === Infinity ? '∞' : v)))),
        gridHighlight: [[r, c]],
        queue: q.map(([x, y]) => `(${x},${y})`),
      });
    }
    const out = dist.map((row) => row.map((v) => (v === Infinity ? -1 : v)));
    frames.push({
      caption: `Distances to nearest 0 ready`,
      grid: gridToStrings(out),
      queue: [],
    });
    return {
      kit: 'gridBfs',
      title: '01 Matrix (multi-source BFS)',
      inputSummary: `mat=${JSON.stringify([
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 1],
      ])}`,
      expectedOutput: JSON.stringify(out),
      frames,
    };
  }

  // rotten oranges — matches oranges_rotting default demo
  const grid = [
    [2, 1, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  const start = cloneGrid(grid);
  const n = grid.length;
  const m = grid[0].length;
  const q: Array<[number, number]> = [];
  let fresh = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (grid[i][j] === 2) q.push([i, j]);
      if (grid[i][j] === 1) fresh++;
    }
  }
  const frames: VizFrame[] = [
    {
      caption: `Multi-source BFS from all rotten (2). fresh=${fresh}`,
      grid: gridToStrings(grid),
      queue: q.map(([r, c]) => `(${r},${c})`),
      aux: { minutes: '0', fresh: String(fresh) },
    },
  ];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  let minutes = 0;
  while (q.length && fresh > 0) {
    const size = q.length;
    for (let i = 0; i < size; i++) {
      const [r, c] = q.shift()!;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= n || nc >= m) continue;
        if (grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 2;
        fresh--;
        q.push([nr, nc]);
      }
    }
    minutes++;
    frames.push({
      caption: `After minute ${minutes}`,
      grid: gridToStrings(grid),
      queue: q.map(([r, c]) => `(${r},${c})`),
      aux: { minutes: String(minutes), fresh: String(fresh) },
    });
  }
  const ans = fresh === 0 ? minutes : -1;
  frames.push({
    caption: `Answer = ${ans}`,
    grid: gridToStrings(grid),
    queue: [],
    aux: { answer: String(ans) },
  });

  return {
    kit: 'gridBfs',
    title: 'Rotten oranges (multi-source BFS)',
    inputSummary: `grid=${JSON.stringify(start)}`,
    expectedOutput: String(ans),
    frames,
  };
}
