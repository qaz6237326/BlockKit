import type { LeafState } from "@block-kit/core";
import type { Editor } from "@block-kit/core";
import { isDOMText } from "@block-kit/utils";

/**
 * 纯文本节点的检查更新
 * @param dom DOM 节点
 * @param text 目标文本
 */
export const updateDirtyText = (dom: HTMLElement, text: string) => {
  if (text === dom.textContent) return false;
  const nodes = dom.childNodes;
  // 文本节点内部仅应该存在一个文本节点, 需要移除额外节点
  for (let i = 1; i < nodes.length; ++i) {
    const node = nodes[i];
    node && node.remove();
  }
  // 如果文本内容不一致, 则是由于输入的脏 DOM, 需要纠正内容
  // Case1: [inline-code][caret][text] IME 会导致模型/文本差异
  if (isDOMText(dom.firstChild)) {
    dom.firstChild.nodeValue = text;
  }
  if (process.env.NODE_ENV === "development") {
    console.log("Correct Text Node", dom);
  }
  return true;
};

/**
 * Leaf 节点的检查更新
 * @param editor
 * @param leaf
 */
export const updateDirtyLeaf = (editor: Editor, leaf: LeafState) => {
  const dom = editor.model.getLeafNode(leaf);
  const nodes = dom && dom.childNodes;
  if (!nodes || nodes.length <= 1) return false;
  // data-leaf 节点内部仅应该存在非文本节点, 文本类型单节点, 嵌入类型双节点
  // Case1: a 标签内的 IME 输入会导致同级的额外文本节点类型插入
  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];
    isDOMText(node) && node.remove();
    if (process.env.NODE_ENV === "development" && isDOMText(node)) {
      console.log("Remove Leaf Child", dom, node);
    }
  }
  return true;
};
