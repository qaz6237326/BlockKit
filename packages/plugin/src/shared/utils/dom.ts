import type { Editor } from "@block-kit/core";
import type { EventContext } from "@block-kit/utils";

const EDITOR_TO_DOM = new WeakMap<Editor, HTMLElement | null>();

/**
 * 设置挂载 DOM
 * @param editor
 * @param dom
 */
export const setMountDOM = (editor: Editor, dom: HTMLElement | null) => {
  EDITOR_TO_DOM.set(editor, dom);
};

/**
 * 获取挂载 DOM
 * @param editor
 * @param dom
 */
export const getMountDOM = (editor: Editor) => {
  return EDITOR_TO_DOM.get(editor) || document.body;
};

/**
 * 阻止所有编辑器分发的事件
 * @param event
 * @param context
 */
export const preventContextEvent = (event: Event, context: EventContext) => {
  context.stop();
  context.prevent();
  event.preventDefault();
  event.stopPropagation();
};

/**
 * 滚动到指定元素
 * @param container
 * @param child
 */
export const scrollIfNeeded = (container: HTMLDivElement, child: Element, buffer = 0) => {
  const rect = child.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  if (rect.bottom > containerRect.bottom) {
    container.scrollTop = container.scrollTop + rect.bottom - containerRect.bottom + buffer;
  } else if (rect.top < containerRect.top) {
    container.scrollTop = container.scrollTop - containerRect.top + rect.top - buffer;
  }
};
