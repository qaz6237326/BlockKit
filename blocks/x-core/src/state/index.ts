import { getId } from "@block-kit/utils";
import type { Blocks, BlocksChange } from "@block-kit/x-json";

import type { BlockEditor } from "../editor";
import type { ContentChangeEvent } from "../event/bus";
import { EDITOR_EVENT } from "../event/bus";
import { BlockState } from "./modules/block-state";
import type { ApplyOptions } from "./types";
import { APPLY_SOURCE, EDITOR_STATE } from "./types";

export class EditorState {
  /** 内建状态集合 */
  protected status: Record<string, boolean>;
  /** Block 集合 */
  public blocks: Record<string, BlockState>;
  /** Block 集合缓存 */
  protected _cache: Blocks | null;

  /**
   * 构造函数
   * @param editor
   * @param initial
   */
  constructor(protected editor: BlockEditor, protected initial: Blocks) {
    this._cache = {};
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

  /**
   * 转换为 Block 集合
   * - 以内建状态为主, Block 集合数据按需转换
   * @param deep [?=undef] 深拷贝
   */
  public toBlockSet(deep?: boolean): Blocks {
    if (!deep && this._cache) {
      return this._cache;
    }
    const result: Blocks = {};
    for (const block of Object.values(this.blocks)) {
      if (block.deleted) continue;
      result[block.id] = block.toBlock(deep);
    }
    this._cache = result;
    return result;
  }

  /**
   * 应用编辑器变更
   * @param changes
   * @param options
   */
  public apply(changes: BlocksChange, options: ApplyOptions) {
    const { source = APPLY_SOURCE.USER } = options;
    const previous = this.toBlockSet();
    this._cache = null;
    const normalized = changes;

    this.editor.event.trigger(EDITOR_EVENT.CONTENT_WILL_CHANGE, {
      options,
      current: previous,
      source: source,
      changes: normalized,
      extra: options.extra,
    });

    const id = getId(6);
    const current = this.toBlockSet();
    const payload: ContentChangeEvent = {
      id: id,
      options,
      previous: previous,
      current: current,
      source: source,
      changes: normalized,
      inserts: [],
      updates: [],
      deletes: [],
      extra: options.extra,
    };
    this.editor.logger.debug("Editor Content Change", payload);
    this.editor.event.trigger(EDITOR_EVENT.CONTENT_CHANGE, payload);
    return { id };
  }
}
