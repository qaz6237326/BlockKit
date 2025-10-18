import type { Block } from "@block-kit/x-json";

import type { EditorState } from "../index";

export class BlockState {
  /** Block ID */
  public readonly id: string;
  /** Block 可变数据 */
  public data: Block["data"];
  /** Block 版本 */
  public version: number;
  /** 标记是否删除 */
  public deleted: boolean;
  /** Block 父节点索引 */
  public index: number;

  /** 构造函数 */
  public constructor(block: Block, protected state: EditorState) {
    this.index = -1;
    this.id = block.id;
    this.data = block.data;
    this.version = block.version;
    this.deleted = false;
  }

  /**
   * 获取父节点
   */
  public getParent(): BlockState | null {
    const parentId = this.data.parent;
    return parentId ? this.state.getBlock(parentId) : null;
  }

  /**
   * 获取子节点
   */
  public getChildren(): Array<BlockState | null> {
    const childrenIds = this.data.children || [];
    return childrenIds.map(id => this.state.getBlock(id));
  }

  /**
   * 获取上一个相邻节点
   */
  public prev(): BlockState | null {
    const parent = this.getParent();
    if (!parent || !parent.data.children) return null;
    const prevId = parent.data.children[this.index - 1];
    return prevId ? this.state.getBlock(prevId) : null;
  }

  /**
   * 获取下一个相邻节点
   */
  public next(): BlockState | null {
    const parent = this.getParent();
    if (!parent || !parent.data.children) return null;
    const nextId = parent.data.children[this.index + 1];
    return nextId ? this.state.getBlock(nextId) : null;
  }
}
