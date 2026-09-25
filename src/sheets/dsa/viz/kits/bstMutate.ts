import { layoutBinaryTree, treeEdges, type BinNode } from '../layout';
import type { BstMode, VizFrame, VizSpec } from '../types';

function bstFromValues(vals: number[]): BinNode | null {
  let root: BinNode | null = null;
  for (const v of vals) root = insertNode(root, v);
  return root;
}

function insertNode(root: BinNode | null, val: number): BinNode {
  if (!root) return { id: String(val), val };
  if (val < root.val) root.left = insertNode(root.left ?? null, val);
  else if (val > root.val) root.right = insertNode(root.right ?? null, val);
  return root;
}

function deleteNode(root: BinNode | null, val: number): BinNode | null {
  if (!root) return null;
  if (val < root.val) {
    root.left = deleteNode(root.left ?? null, val);
    return root;
  }
  if (val > root.val) {
    root.right = deleteNode(root.right ?? null, val);
    return root;
  }
  if (!root.left) return root.right ?? null;
  if (!root.right) return root.left ?? null;
  let suc = root.right;
  while (suc.left) suc = suc.left;
  root.val = suc.val;
  root.id = String(suc.val);
  root.right = deleteNode(root.right, suc.val);
  return root;
}

function snapshot(
  root: BinNode | null,
  caption: string,
  active: string[],
  extra?: Partial<VizFrame>,
): VizFrame {
  if (!root) {
    return { caption, nodes: [], edges: [], active, ...extra };
  }
  // re-id by value for stable layout after mutations
  function rekey(n: BinNode) {
    n.id = String(n.val);
    if (n.left) rekey(n.left);
    if (n.right) rekey(n.right);
  }
  rekey(root);
  return {
    caption,
    nodes: layoutBinaryTree(root, 420, 64),
    edges: treeEdges(root),
    active,
    ...extra,
  };
}

export function buildBstMutate(mode: BstMode = 'insert'): VizSpec {
  const baseVals = [8, 3, 10, 1, 6, 14, 4, 7, 13];
  const frames: VizFrame[] = [];

  if (mode === 'search') {
    const root = bstFromValues(baseVals)!;
    const target = 6;
    let cur: BinNode | null = root;
    frames.push(snapshot(root, `Search ${target} in BST`, [], { aux: { target: String(target) } }));
    while (cur) {
      frames.push(
        snapshot(root, `At ${cur.val}: compare with ${target}`, [String(cur.val)], {
          aux: { target: String(target) },
        }),
      );
      if (cur.val === target) {
        frames.push(
          snapshot(root, `Found ${target}`, [String(cur.val)], {
            output: [String(target)],
            aux: { found: 'true' },
          }),
        );
        break;
      }
      cur = target < cur.val ? cur.left ?? null : cur.right ?? null;
    }
    return {
      kit: 'bstMutate',
      title: 'BST search',
      inputSummary: `BST from insert order ${JSON.stringify(baseVals)}, search=${target}`,
      expectedOutput: String(target),
      frames,
    };
  }

  if (mode === 'delete') {
    let root = bstFromValues(baseVals)!;
    const del = 3;
    frames.push(snapshot(root, `Delete ${del} (node with two children)`, [String(del)]));
    // walk to node
    let cur: BinNode | null = root;
    while (cur && cur.val !== del) {
      frames.push(snapshot(root, `Walk toward ${del} via ${cur.val}`, [String(cur.val)]));
      cur = del < cur.val ? cur.left ?? null : cur.right ?? null;
    }
    frames.push(snapshot(root, `Replace ${del} with inorder successor`, [String(del)]));
    root = deleteNode(root, del)!;
    frames.push(snapshot(root, `After delete — tree rebalanced by successor copy`, []));
    return {
      kit: 'bstMutate',
      title: 'BST delete',
      inputSummary: `BST ${JSON.stringify(baseVals)}, delete=${del}`,
      expectedOutput: 'inorder without 3 → [1,4,6,7,8,10,13,14]',
      frames,
    };
  }

  // insert
  let root: BinNode | null = bstFromValues([8, 3, 10, 1, 6, 14])!;
  const insertVal = 4;
  frames.push(snapshot(root, `Insert ${insertVal}`, [], { aux: { insert: String(insertVal) } }));
  let cur: BinNode | null = root;
  let parent: BinNode | null = null;
  while (cur) {
    frames.push(
      snapshot(root, `Compare ${insertVal} with ${cur.val}`, [String(cur.val)], {
        aux: { insert: String(insertVal) },
      }),
    );
    parent = cur;
    cur = insertVal < cur.val ? cur.left ?? null : cur.right ?? null;
  }
  if (parent) {
    if (insertVal < parent.val) parent.left = { id: String(insertVal), val: insertVal };
    else parent.right = { id: String(insertVal), val: insertVal };
    frames.push(
      snapshot(root, `Link ${insertVal} under ${parent.val}`, [String(insertVal), String(parent.val)], {
        output: [String(insertVal)],
      }),
    );
  }

  return {
    kit: 'bstMutate',
    title: 'BST insert',
    inputSummary: `BST seeded with [8,3,10,1,6,14], insert=${insertVal}`,
    expectedOutput: `node ${insertVal} under 6.left`,
    frames,
  };
}
