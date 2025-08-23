import type { LeafState, LineState } from "@block-kit/core";

/**
 * LeafState 与 Text 节点的映射
 * - 该 WeakMap 仅处理文本类型的节点
 */
export const LEAF_TO_TEXT = new WeakMap<LeafState, HTMLElement | null>();

/**
 * LeafState 与 ZeroText 节点的映射
 * - 该 WeakMap 仅处理零宽字符文本类型的节点
 */
export const LEAF_TO_ZERO_TEXT = new WeakMap<LeafState, HTMLElement | null>();

/**
 * LeafState 与节点渲染方法的映射
 * - 结构性的脏节点问题, 需要重建 Leaf DOM, ReMount 节点
 */
export const LEAF_TO_REMOUNT = new WeakMap<LeafState, () => void>();

/**
 * JSX.Element 与 State 的映射
 * - 渲染时即刻加入映射, wrap 时即刻消费映射
 */
export const JSX_TO_STATE = new WeakMap<JSX.Element, LeafState | LineState>();

/**
 * State 与 Wrapper Symbol 的映射
 * - 主要是取得已经处理过的节点, 避免重复处理
 */
export const STATE_TO_SYMBOL = new WeakMap<LeafState | LineState, string>();
