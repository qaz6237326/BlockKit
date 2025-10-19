import { Editor } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import type { Block, BlockDataField } from "@block-kit/x-json";
import { cloneSnapshot } from "@block-kit/x-json";

import type { EditorState } from "../index";

export class BlockState {
  /** Block ID */
  public readonly id: string;
  /** Block 可变数据 */
  public readonly data: BlockDataField;
  /** Block 版本 */
  public version: number;
  /** 标记是否删除 */
  public deleted: boolean;
  /** Block 父节点索引 */
  public index: number;
  /** 编辑器实例 */
  public text: Editor | null;

  /** 构造函数 */
  public constructor(block: Block, protected state: EditorState) {
    this.index = -1;
    this.text = null;
    this.id = block.id;
    this.deleted = false;
    this.version = block.version;
    this.data = { ...block.data };
    this.restore();
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

  /**
   * 标记块挂载
   */
  public restore() {
    this.deleted = false;
    if (this.text && process.env.NODE_ENV === "development") {
      console.warn("Text editor already exists.");
      return void 0;
    }
    if (this.data.delta && !this.text) {
      const options = this.state.editor.texts;
      const initial = new Delta(this.data.delta);
      const text = new Editor({ ...options.config, delta: initial });
      options.plugin && text.plugin.register(options.plugin);
      this.text = text;
    }
  }

  /**
   * 标记块删除
   */
  public remove() {
    this.deleted = true;
    this.text = null;
  }

  /**
   * 转化为 Block 数据
   * @param deep [?=undef] 深拷贝
   */
  public toBlock(deep?: boolean): Block {
    const data = deep ? cloneSnapshot(this.data) : { ...this.data };
    if (data.children) {
      data.children = [...data.children];
    }
    return {
      id: this.id,
      data: data,
      version: this.version,
    };
  }
}
