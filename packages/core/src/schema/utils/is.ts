import { isEOLOp } from "@block-kit/delta";

import type { LineState } from "../../state/modules/line-state";

/**
 * 判断 Block 行状态
 * - block + void: 独占一行的 Void 节点
 * @param op
 */
export const isBlockLine = (line: LineState | null): boolean => {
  if (!line) return false;
  const firstLeaf = line.getFirstLeaf();
  return !!firstLeaf && firstLeaf.void && !firstLeaf.inline;
};

/**
 * 判断行是否为空行
 * @param line
 */
export const isEmptyLine = (line: LineState) => {
  const lastLeaf = line.getLastLeaf();
  const leaves = line.getLeaves();
  // 没有最后的叶子结点, 或者仅单个节点且最后的叶子结点是换行符
  return !lastLeaf || (leaves.length === 1 && isEOLOp(lastLeaf.op));
};
