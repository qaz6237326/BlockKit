import { getId } from "@block-kit/utils";
import type { BlockDataField } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import type { ApplyChange } from "../types";

/**
 * 创建新 Block 的变更
 * @param block
 */
export const createNewBlockChange = (editor: BlockEditor, data: BlockDataField): ApplyChange => {
  let id = getId(20);
  let max = 100;
  while (editor.state.blocks[id] && max-- > 0) {
    id = getId(10);
  }
  return { id: id, ops: [{ p: [], oi: data }] };
};

/**
 * 将 children 插入到指定 Block 位置的变更
 * @param id
 * @param index
 * @param child
 */
export const createInsertBlockChange = (id: string, index: number, child: string): ApplyChange => {
  return { id, ops: [{ p: ["children", index], li: child }] };
};

/**
 * 将 children 从指定 Block 位置删除的变更
 * @param editor
 * @param index
 * @param child
 */
export const createDeleteBlockChange = (
  editor: BlockEditor,
  id: string,
  index: number
): ApplyChange => {
  const block = editor.state.getBlock(id);
  const child = block && block.data.children && block.data.children[index];
  return { id, ops: [{ p: ["children", index], ld: child }] };
};
