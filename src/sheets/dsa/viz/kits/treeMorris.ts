import { defaultBinaryTree, layoutBinaryTree, treeEdges, type BinNode } from '../layout';
import type { MorrisMode, VizEdge, VizFrame, VizSpec } from '../types';

function cloneTree(n: BinNode): BinNode {
  return {
    id: n.id,
    val: n.val,
    left: n.left ? cloneTree(n.left) : null,
    right: n.right ? cloneTree(n.right) : null,
  };
}

/** Thread edges are temporary right-child links (dashed via activeEdges). */
function snap(
  root: BinNode,
  caption: string,
  active: string[],
  output: string[],
  threadEdges: VizEdge[],
  visited: string[],
): VizFrame {
  const base = treeEdges(root);
  // filter out real edges that conflict? keep all structural + threads
  const edgeIds = new Set(base.map((e) => e.id));
  const extra = threadEdges.filter((e) => !edgeIds.has(e.id));
  return {
    caption,
    nodes: layoutBinaryTree(root),
    edges: [...base, ...extra],
    active,
    visited: [...visited],
    activeEdges: extra.map((e) => e.id),
    output: [...output],
    aux: { threads: String(extra.length), 'O(1) aux': 'yes' },
  };
}

export function buildTreeMorris(mode: MorrisMode = 'inorder'): VizSpec {
  const root = cloneTree(defaultBinaryTree());
  const frames: VizFrame[] = [];
  const output: string[] = [];
  const visited: string[] = [];
  let cur: BinNode | null = root;

  frames.push(
    snap(root, `Morris ${mode} — walk with temporary threads, no stack`, [], [], [], []),
  );

  while (cur) {
    if (!cur.left) {
      if (mode === 'preorder') {
        output.push(String(cur.val));
        visited.push(cur.id);
        frames.push(
          snap(root, `No left — visit ${cur.val} (preorder), go right`, [cur.id], output, [], visited),
        );
      } else {
        output.push(String(cur.val));
        visited.push(cur.id);
        frames.push(
          snap(root, `No left — visit ${cur.val} (inorder), go right`, [cur.id], output, [], visited),
        );
      }
      cur = cur.right ?? null;
      continue;
    }

    // find predecessor
    let pred = cur.left;
    while (pred.right && pred.right.id !== cur.id) pred = pred.right;

    if (!pred.right) {
      // create thread
      pred.right = cur;
      const thread: VizEdge = {
        id: `thread-${pred.id}-${cur.id}`,
        from: pred.id,
        to: cur.id,
        label: 'thread',
        directed: true,
      };
      if (mode === 'preorder') {
        output.push(String(cur.val));
        visited.push(cur.id);
        frames.push(
          snap(
            root,
            `Create thread ${pred.val}→${cur.val}; visit ${cur.val} (preorder); go left`,
            [cur.id, pred.id],
            output,
            [thread],
            visited,
          ),
        );
      } else {
        frames.push(
          snap(
            root,
            `Create thread ${pred.val}→${cur.val}; go left (visit later)`,
            [cur.id, pred.id],
            output,
            [thread],
            visited,
          ),
        );
      }
      cur = cur.left;
    } else {
      // break thread
      pred.right = null;
      if (mode === 'inorder') {
        output.push(String(cur.val));
        visited.push(cur.id);
        frames.push(
          snap(
            root,
            `Thread back to ${cur.val} — break thread, visit ${cur.val}, go right`,
            [cur.id, pred.id],
            output,
            [],
            visited,
          ),
        );
      } else {
        frames.push(
          snap(
            root,
            `Thread back to ${cur.val} — break thread, go right`,
            [cur.id, pred.id],
            output,
            [],
            visited,
          ),
        );
      }
      cur = cur.right ?? null;
    }
  }

  frames.push(
    snap(root, `Done. ${mode} = [${output.join(', ')}]`, [], output, [], visited),
  );

  return {
    kit: 'treeMorris',
    title: mode === 'inorder' ? 'Morris inorder' : 'Morris preorder',
    inputSummary: 'Tree: 1 → (2 → (4,5), 3)  // O(1) aux via threads',
    expectedOutput: `[${output.join(', ')}]`,
    frames,
  };
}
