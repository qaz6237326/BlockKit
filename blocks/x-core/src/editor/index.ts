import { EDITOR_STATE } from "@block-kit/core";

import { EditorState } from "../state";
import type { EditorOptions } from "./types";

export class BlockEditor {
  /** 编辑容器 */
  protected container: HTMLDivElement | null;
  /** 状态模块 */
  public state: EditorState;

  /**
   * 构造函数
   * @param options
   */
  public constructor(options: EditorOptions = {}) {
    const { initial = {} } = options;
    this.container = null;
    this.state = new EditorState(this, initial);
  }

  /**
   * 挂载编辑器 DOM
   * @param container
   */
  public onMount(this: BlockEditor, container: HTMLDivElement) {
    if (this.state.get(EDITOR_STATE.MOUNTED)) {
      console.warn("Editor has been mounted, please destroy it before mount again.");
    }
    this.container = container;
    this.state.set(EDITOR_STATE.MOUNTED, true);
  }

  /**
   * 卸载编辑器 DOM
   */
  public onUnmount(this: BlockEditor) {
    this.container = null;
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }

  /**
   * 获取编辑器容器
   * @returns
   */
  public getContainer(this: BlockEditor) {
    if (!this.container) {
      const div = document.createElement("div");
      div.setAttribute("data-type", "mock");
      return div;
    }
    return this.container;
  }

  /**
   * 销毁编辑器
   */
  public destroy(this: BlockEditor) {
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }
}
