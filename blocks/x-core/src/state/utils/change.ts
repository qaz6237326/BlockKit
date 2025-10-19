import type { Block, ObjectInsertOp } from "@block-kit/x-json";
import type { BlocksChange } from "@block-kit/x-json";

/**
 * 合并多个 BlocksChange
 * @param changes
 */
export const mergeBlockChanges = (...changes: BlocksChange[]): BlocksChange => {
  const mergedChange: BlocksChange = {};
  for (const change of changes) {
    for (const [blockId, blockChange] of Object.entries(change)) {
      if (!mergedChange[blockId]) {
        mergedChange[blockId] = { id: blockId, version: blockChange.version, ops: [] };
      }
      const currentChange = mergedChange[blockId];
      currentChange.version = Math.max(currentChange.version, blockChange.version);
      currentChange.ops.push(...blockChange.ops);
    }
  }
  return mergedChange;
};

/**
 * 创建新 Block 的变更
 * @param block
 */
export const createNewBlockChange = (block: Block): BlocksChange => {
  return {
    [block.id]: {
      id: block.id,
      version: block.version,
      ops: [{ p: [], oi: block.data } as unknown as ObjectInsertOp],
    },
  };
};
