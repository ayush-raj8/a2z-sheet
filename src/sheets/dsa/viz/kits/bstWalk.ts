import { layoutBinaryTree, treeEdges, type BinNode } from '../layout';
import type { BstWalkMode, VizFrame, VizSpec } from '../types';

function bstFrom(vals: number[]): BinNode {
  let root: BinNode | null = null;
  function ins(n: BinNode | null, v: number): BinNode {
    if (!n) return { id: String(v), val: v };
    if (v < n.val) n.left = ins(n.left ?? null, v);
    else if (v > n.val) n.right = ins(n.right ?? null, v);
    return n;
  }
  for (const v of vals) root = ins(root, v);
  return root!;
}

function snap(root: BinNode, caption: string, active: string[], extra?: Partial<VizFrame>): VizFrame {
  return {
    caption,
    nodes: layoutBinaryTree(root, 420, 58),
    edges: treeEdges(root),
    active,
    ...extra,
  };
}

export function buildBstWalk(mode: BstWalkMode = 'ceil'): VizSpec {
  const vals = [8, 3, 10, 1, 6, 14, 4, 7, 13];
  const root = bstFrom(vals);
  const frames: VizFrame[] = [];

  if (mode === 'ceil' || mode === 'floor') {
    const key = 5;
    let cur: BinNode | null = root;
    let ans: number | null = null;
    frames.push(snap(root, `${mode === 'ceil' ? 'Ceil' : 'Floor'} of ${key}`, [], { aux: { key: String(key) } }));
    while (cur) {
      frames.push(
        snap(root, `At ${cur.val}`, [String(cur.val)], {
          aux: { key: String(key), ans: ans == null ? '—' : String(ans) },
        }),
      );
      if (mode === 'ceil') {
        if (cur.val === key) {
          ans = cur.val;
          break;
        }
        if (cur.val > key) {
          ans = cur.val;
          cur = cur.left ?? null;
        } else cur = cur.right ?? null;
      } else {
        if (cur.val === key) {
          ans = cur.val;
          break;
        }
        if (cur.val < key) {
          ans = cur.val;
          cur = cur.right ?? null;
        } else cur = cur.left ?? null;
      }
    }
    frames.push(
      snap(root, `${mode}(${key}) = ${ans}`, ans != null ? [String(ans)] : [], {
        output: [String(ans)],
      }),
    );
    return {
      kit: 'bstWalk',
      title: mode === 'ceil' ? 'BST ceil' : 'BST floor',
      inputSummary: `BST ${JSON.stringify(vals)}, key=${key}`,
      expectedOutput: String(ans),
      frames,
    };
  }

  if (mode === 'kth') {
    const k = 3;
    const stack: BinNode[] = [];
    let cur: BinNode | null = root;
    let count = 0;
    let ans = -1;
    frames.push(snap(root, `Kth smallest, k=${k} (inorder)`, [], { aux: { k: String(k) } }));
    while (cur || stack.length) {
      while (cur) {
        stack.push(cur);
        frames.push(
          snap(root, `Go left via ${cur.val}`, [String(cur.val)], {
            stack: stack.map((n) => String(n.val)),
            aux: { count: String(count) },
          }),
        );
        cur = cur.left ?? null;
      }
      cur = stack.pop()!;
      count++;
      frames.push(
        snap(root, `Visit ${cur.val} (#${count})`, [String(cur.val)], {
          stack: stack.map((n) => String(n.val)),
          output: [String(cur.val)],
          aux: { count: String(count), k: String(k) },
        }),
      );
      if (count === k) {
        ans = cur.val;
        break;
      }
      cur = cur.right ?? null;
    }
    frames.push(snap(root, `kth=${ans}`, [String(ans)], { output: [String(ans)] }));
    return {
      kit: 'bstWalk',
      title: 'Kth smallest in BST',
      inputSummary: `BST ${JSON.stringify(vals)}, k=${k}`,
      expectedOutput: String(ans),
      frames,
    };
  }

  if (mode === 'validate') {
    // use same BST — should be valid; show range narrowing
    type St = { n: BinNode; lo: string; hi: string };
    const stack: St[] = [{ n: root, lo: '-∞', hi: '+∞' }];
    frames.push(snap(root, 'Validate BST with (lo, hi) bounds', [root.id]));
    let ok = true;
    while (stack.length) {
      const { n, lo, hi } = stack.pop()!;
      const bad =
        (lo !== '-∞' && n.val <= Number(lo)) || (hi !== '+∞' && n.val >= Number(hi));
      frames.push(
        snap(root, `Check ${n.val} ∈ (${lo}, ${hi})`, [String(n.val)], {
          aux: { lo, hi, ok: String(!bad) },
        }),
      );
      if (bad) {
        ok = false;
        break;
      }
      if (n.right) stack.push({ n: n.right, lo: String(n.val), hi });
      if (n.left) stack.push({ n: n.left, lo, hi: String(n.val) });
    }
    frames.push(snap(root, ok ? 'Valid BST' : 'Not a BST', [], { output: [String(ok)] }));
    return {
      kit: 'bstWalk',
      title: 'Validate BST',
      inputSummary: `tree from ${JSON.stringify(vals)}`,
      expectedOutput: String(ok),
      frames,
    };
  }

  if (mode === 'lca') {
    const p = 4;
    const q = 7;
    let cur: BinNode | null = root;
    frames.push(snap(root, `BST LCA(${p}, ${q})`, [], { aux: { p: String(p), q: String(q) } }));
    while (cur) {
      frames.push(snap(root, `At ${cur.val}`, [String(cur.val)]));
      if (p < cur.val && q < cur.val) cur = cur.left ?? null;
      else if (p > cur.val && q > cur.val) cur = cur.right ?? null;
      else break;
    }
    const ans = cur!.val;
    frames.push(snap(root, `LCA = ${ans}`, [String(ans)], { output: [String(ans)] }));
    return {
      kit: 'bstWalk',
      title: 'LCA in BST',
      inputSummary: `p=${p}, q=${q}`,
      expectedOutput: String(ans),
      frames,
    };
  }

  // successor of 6
  const key = 6;
  let cur: BinNode | null = root;
  let succ: number | null = null;
  frames.push(snap(root, `Inorder successor of ${key}`, [], { aux: { key: String(key) } }));
  while (cur) {
    frames.push(snap(root, `At ${cur.val}`, [String(cur.val)], { aux: { succ: succ == null ? '—' : String(succ) } }));
    if (cur.val > key) {
      succ = cur.val;
      cur = cur.left ?? null;
    } else cur = cur.right ?? null;
  }
  frames.push(snap(root, `Successor = ${succ}`, succ != null ? [String(succ)] : [], { output: [String(succ)] }));
  return {
    kit: 'bstWalk',
    title: 'Inorder successor',
    inputSummary: `BST ${JSON.stringify(vals)}, key=${key}`,
    expectedOutput: String(succ),
    frames,
  };
}
