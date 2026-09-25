import { defaultBinaryTree, layoutBinaryTree, treeEdges } from '../layout';
import type { TreeMode, VizFrame, VizSpec } from '../types';

export function buildTreeDfs(mode: TreeMode = 'preorder'): VizSpec {
  const root = defaultBinaryTree();
  const nodes = layoutBinaryTree(root);
  const edges = treeEdges(root);
  const frames: VizFrame[] = [];
  const output: string[] = [];
  const visited: string[] = [];

  function snap(caption: string, active: string[], stack: string[]) {
    frames.push({
      caption,
      nodes,
      edges,
      active: [...active],
      visited: [...visited],
      stack: [...stack],
      output: [...output],
      aux: { order: mode, visited: visited.join(',') || '—' },
    });
  }

  function dfs(n: typeof root | null | undefined, stack: string[]) {
    if (!n) return;
    const st = [...stack, n.id];
    if (mode === 'preorder') {
      snap(`Visit ${n.val} (preorder: process before children)`, [n.id], st);
      output.push(String(n.val));
      visited.push(n.id);
    } else {
      snap(`Enter ${n.val}`, [n.id], st);
    }
    dfs(n.left, st);
    if (mode === 'inorder') {
      snap(`Visit ${n.val} (inorder: after left)`, [n.id], st);
      output.push(String(n.val));
      visited.push(n.id);
    }
    dfs(n.right, st);
    if (mode === 'postorder') {
      snap(`Visit ${n.val} (postorder: after both children)`, [n.id], st);
      output.push(String(n.val));
      visited.push(n.id);
    }
    if (mode !== 'postorder' || true) {
      snap(`Return from ${n.val}`, [n.id], stack);
    }
  }

  snap('Start DFS on default tree', [], []);
  dfs(root, []);
  snap(`Done. Order = [${output.join(', ')}]`, [], []);

  const titles: Record<TreeMode, string> = {
    preorder: 'Preorder DFS',
    inorder: 'Inorder DFS',
    postorder: 'Postorder DFS',
  };

  return {
    kit: 'treeDfs',
    title: titles[mode],
    inputSummary: 'Tree: 1 → (2 → (4,5), 3)   // same shape as optimal traversal demos',
    expectedOutput: `[${output.join(', ')}]`,
    frames,
  };
}
