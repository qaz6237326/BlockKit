import { EDITOR_STATE } from "@block-kit/core";
import type { Blocks } from "@block-kit/x-json";

import type { BlockEditor } from "../editor";

export class EditorState {
  /** 内建状态集合 */
  protected status: Record<string, boolean>;

  /**
   * 构造函数
   * @param editor
   * @param data
   */
  constructor(protected editor: BlockEditor, protected data: Blocks) {
    this.status = {};
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
}
