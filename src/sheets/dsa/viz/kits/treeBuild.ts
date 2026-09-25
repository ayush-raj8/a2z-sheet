import { layoutBinaryTree, treeEdges, type BinNode } from '../layout';
import type { TreeBuildMode, VizFrame, VizSpec } from '../types';

function buildFromInPre(inorder: number[], preorder: number[], frames: VizFrame[]): BinNode | null {
  if (!preorder.length) return null;
  const rootVal = preorder[0];
  const mid = inorder.indexOf(rootVal);
  const root: BinNode = { id: String(rootVal), val: rootVal };

  frames.push({
    caption: `Pick preorder[0]=${rootVal} as root; split inorder at index ${mid}`,
    nodes: layoutBinaryTree(root, 420, 60),
    edges: [],
    active: [root.id],
    aux: {
      inorder: JSON.stringify(inorder),
      preorder: JSON.stringify(preorder),
      leftIn: JSON.stringify(inorder.slice(0, mid)),
      rightIn: JSON.stringify(inorder.slice(mid + 1)),
    },
  });

  root.left = buildFromInPre(inorder.slice(0, mid), preorder.slice(1, mid + 1), frames);
  root.right = buildFromInPre(inorder.slice(mid + 1), preorder.slice(mid + 1), frames);

  if (root.left || root.right) {
    frames.push({
      caption: `Subtree rooted at ${rootVal} complete`,
      nodes: layoutBinaryTree(root, 420, 60),
      edges: treeEdges(root),
      active: [root.id],
      visited: [root.id, root.left?.id, root.right?.id].filter(Boolean) as string[],
    });
  }
  return root;
}

function buildFromInPost(inorder: number[], postorder: number[], frames: VizFrame[]): BinNode | null {
  if (!postorder.length) return null;
  const rootVal = postorder[postorder.length - 1];
  const mid = inorder.indexOf(rootVal);
  const root: BinNode = { id: String(rootVal), val: rootVal };

  frames.push({
    caption: `Pick postorder[-1]=${rootVal} as root; split inorder at ${mid}`,
    nodes: layoutBinaryTree(root, 420, 60),
    edges: [],
    active: [root.id],
    aux: {
      inorder: JSON.stringify(inorder),
      postorder: JSON.stringify(postorder),
    },
  });

  root.left = buildFromInPost(inorder.slice(0, mid), postorder.slice(0, mid), frames);
  root.right = buildFromInPost(inorder.slice(mid + 1), postorder.slice(mid, postorder.length - 1), frames);

  if (root.left || root.right) {
    frames.push({
      caption: `Subtree rooted at ${rootVal} complete`,
      nodes: layoutBinaryTree(root, 420, 60),
      edges: treeEdges(root),
      active: [root.id],
    });
  }
  return root;
}

export function buildTreeBuild(mode: TreeBuildMode = 'inPre'): VizSpec {
  const frames: VizFrame[] = [];

  if (mode === 'inPre') {
    const inorder = [4, 2, 5, 1, 3];
    const preorder = [1, 2, 4, 5, 3];
    frames.push({
      caption: 'Construct from inorder + preorder',
      aux: { inorder: JSON.stringify(inorder), preorder: JSON.stringify(preorder) },
    });
    const root = buildFromInPre(inorder, preorder, frames)!;
    frames.push({
      caption: 'Unique tree reconstructed',
      nodes: layoutBinaryTree(root, 420, 60),
      edges: treeEdges(root),
      visited: [root.id],
      output: preorder.map(String),
    });
    return {
      kit: 'treeBuild',
      title: 'Construct tree (inorder + preorder)',
      inputSummary: `inorder=${JSON.stringify(inorder)}, preorder=${JSON.stringify(preorder)}`,
      expectedOutput: 'tree 1→(2→(4,5), 3)',
      frames,
    };
  }

  const inorder = [4, 2, 5, 1, 3];
  const postorder = [4, 5, 2, 3, 1];
  frames.push({
    caption: 'Construct from inorder + postorder',
    aux: { inorder: JSON.stringify(inorder), postorder: JSON.stringify(postorder) },
  });
  const root = buildFromInPost(inorder, postorder, frames)!;
  frames.push({
    caption: 'Unique tree reconstructed',
    nodes: layoutBinaryTree(root, 420, 60),
    edges: treeEdges(root),
    visited: [root.id],
  });
  return {
    kit: 'treeBuild',
    title: 'Construct tree (inorder + postorder)',
    inputSummary: `inorder=${JSON.stringify(inorder)}, postorder=${JSON.stringify(postorder)}`,
    expectedOutput: 'tree 1→(2→(4,5), 3)',
    frames,
  };
}
