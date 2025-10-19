import type { Block, BlocksChange } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import type { EditorState } from "../index";
import { BlockState } from "../modules/block-state";

export class Mutate {
  /** 插入的 Block */
  public inserts: string[];
  /** 更新的 Block */
  public updates: string[];
  /** 删除的 Block */
  public deletes: string[];
  /** 编辑器实例 */
  protected editor: BlockEditor;

  /**
   * 构造函数
   * @param state
   */
  public constructor(protected state: EditorState) {
    this.inserts = [];
    this.updates = [];
    this.deletes = [];
    this.editor = state.editor;
  }

  /**
   * 更新状态
   * @param changes
   */
  public update(changes: BlocksChange) {
    for (const change of Object.values(changes)) {
      const block = this.state.getBlock(change.id);
      // 如果不存在节点, 则需要检查是否需要新增 Block
      if (!block && change.ops.length === 1 && !change.ops[0].p.length && change.ops[0].oi) {
        const op = change.ops[0]!;
        this.inserts.push(change.id);
        const newBlockState = new BlockState(op.oi as unknown as Block, this.state);
        this.state.blocks[change.id] = newBlockState;
      }
    }
    return {
      inserts: this.inserts,
      updates: this.updates,
      deletes: this.deletes,
    };
  }
}
