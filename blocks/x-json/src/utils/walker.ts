import type { Block, Blocks } from "../types/block";

/**
 * 创建 Block 树遍历器 [DFS]
 * @param blocks Block 数据集合
 * @param rootId 根节点 ID
 */
export function createBlockTreeWalker(blocks: Blocks, rootId: string) {
  const visited = new Set<string>();
  function* traverse(nodeId: string): Generator<Block> {
    const node = blocks[nodeId];
    if (!node || visited.has(nodeId)) {
      return void 0;
    }
    visited.add(nodeId);
    yield node;
    const children = node.data.children || [];
    for (const childId of children) {
      yield* traverse(childId);
    }
  }
  const walker = traverse(rootId);
  return {
    nextNode: (): Block | null => walker.next().value || null,
    [Symbol.iterator]: () => walker[Symbol.iterator](),
  };
}

/**
 * 创建 Block 树遍历器 [BFS]
 * @param blocks Block 数据集合
 * @param rootId 根节点 ID
 */
export function createBlockTreeWalkerBFS(blocks: Blocks, rootId: string) {
  const visited = new Set<string>();
  const queue: string[] = [rootId];
  function* traverse(): Generator<Block> {
    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      const node = currentNodeId && blocks[currentNodeId];
      if (!currentNodeId || !node || visited.has(currentNodeId)) {
        continue;
      }
      visited.add(currentNodeId);
      yield node;
      const children = node.data.children || [];
      for (const childId of children) {
        queue.push(childId);
      }
    }
  }
  const walker = traverse();
  return {
    nextNode: (): Block | null => walker.next().value || null,
    [Symbol.iterator]: () => walker[Symbol.iterator](),
  };
}
