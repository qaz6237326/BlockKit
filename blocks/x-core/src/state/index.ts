import { EDITOR_STATE } from "@block-kit/core";
import type { Blocks, BlocksChange } from "@block-kit/x-json";

import type { BlockEditor } from "../editor";
import { BlockState } from "./modules/block-state";
import type { ApplyOptions } from "./types";

export class EditorState {
  /** 内建状态集合 */
  protected status: Record<string, boolean>;
  /** Block 集合 */
  public blocks: Record<string, BlockState>;

  /**
   * 构造函数
   * @param editor
   * @param initial
   */
  constructor(protected editor: BlockEditor, protected initial: Blocks) {
    this.status = {};
    this.blocks = {};
    Object.values(initial).forEach(block => {
      this.blocks[block.id] = new BlockState(block, this);
    });
  }

  /**
   * 获取编辑器状态
   * @param key
   */
  public get(key: keyof typeof EDITOR_STATE) {
    return this.status[key];
  }

  /**
   * 设置编辑器状态
   * @param key
   * @param value
   */
  public set(key: keyof typeof EDITOR_STATE, value: boolean) {
    this.status[key] = value;
    return this;
  }

  /**
   * 判断焦点是否在编辑器内
   */
  public isFocused() {
    return !!this.get(EDITOR_STATE.FOCUS);
  }

  /**
   * 判断编辑器是否只读
   */
  public isReadonly() {
    return !!this.get(EDITOR_STATE.READONLY);
  }

  /**
   * 判断编辑器是否正在组合输入
   */
  public isComposing() {
    return !!this.get(EDITOR_STATE.COMPOSING);
  }

  /**
   * 获取 BlockState
   * @param id Block ID
   */
  public getBlock(id: string) {
    return this.blocks[id] || null;
  }

  public toBlockSet(): Blocks {
    return {};
  }

  /**
   * 应用编辑器变更
   * @param changes
   * @param options
   */
  public apply(changes: BlocksChange, options: ApplyOptions) {
    console.log("changes,options :>> ", changes, options);
  }
}
