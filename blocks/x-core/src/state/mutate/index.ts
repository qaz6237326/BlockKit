import { Delta } from "@block-kit/delta";
import { isString } from "@block-kit/utils";
import type { Block, BlocksChange, DeltaOp, JSONOp } from "@block-kit/x-json";
import { createBlockTreeWalkerBFS, json } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import type { EditorState } from "../index";
import { BlockState } from "../modules/block-state";

export class Mutate {
  /** 插入的 Block */
  public inserts: Set<string>;
  /** 更新的 Block */
  public updates: Set<string>;
  /** 删除的 Block */
  public deletes: Set<string>;
  /** 编辑器实例 */
  protected editor: BlockEditor;

  /**
   * 构造函数
   * @param state
   */
  public constructor(protected state: EditorState) {
    this.inserts = new Set();
    this.updates = new Set();
    this.deletes = new Set();
    this.editor = state.editor;
  }

  /**
   * 更新状态
   * @param changes
   */
  public apply(changes: BlocksChange) {
    for (const [changeId, ops] of Object.entries(changes)) {
      const pre = this.state.getBlock(changeId);
      // 更新 Block 版本号
      pre && pre.version++;
      // 如果不存在节点, 则需要检查是否需要新增 Block [Insert]
      let insert: JSONOp | undefined = void 0;
      if (!pre && (insert = ops.find(it => !it.p.length && it.oi))) {
        this.inserts.add(changeId);
        const data: Block = {
          id: changeId,
          version: 1,
          data: insert.oi as unknown as Block["data"],
        };
        const newBlockState = new BlockState(data, this.state);
        this.state.blocks[changeId] = newBlockState;
      }
      const block = this.state.getBlock(changeId);
      if (!block) continue;
      // 每个 Op 都必须要独立应用, 每个变更都需要根据类型独立处理
      for (const op of ops) {
        // 空路径情况应该由前面的 Insert 处理
        if (!op.p.length) continue;
        // 在块状态上直接应用变更
        json.apply(block.data, [op]);
        // 若是文本编辑器字段的变更, 则需要同步更新编辑器实例
        if (op.p[0] === "delta" && op.t === "delta" && block.text) {
          const deltaOps = op.o as DeltaOp[];
          block.text.state.apply(new Delta(deltaOps));
        }
        // 若是 children 的新增变更, 则需要同步相关的 Block 状态
        if (op.p[0] === "children" && isString(op.li)) {
          const walker = createBlockTreeWalkerBFS(this.state.blocks, op.li);
          const children = Array.from(walker);
          for (const child of children) {
            child.restore();
            this.inserts.add(child.id);
          }
        }
        // 若是 children 的删除变更, 同样需要同步相关的 Block 状态
        if (op.p[0] === "children" && isString(op.ld)) {
          const walker = createBlockTreeWalkerBFS(this.state.blocks, op.ld);
          const children = Array.from(walker);
          for (const child of children) {
            child.remove();
            this.deletes.add(child.id);
          }
        }
      }
    }
    return {
      inserts: Array.from(this.inserts),
      updates: Array.from(this.updates),
      deletes: Array.from(this.deletes),
    };
  }
}
