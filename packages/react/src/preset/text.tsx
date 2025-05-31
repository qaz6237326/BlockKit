import { LEAF_STRING } from "@block-kit/core";
import { isDOMText } from "@block-kit/utils";
import type { FC } from "react";

export type TextProps = {
  children: string;
  onRef?: (ref: HTMLSpanElement | null) => void;
};

/**
 * 文本节点
 * @param props
 */
export const Text: FC<TextProps> = props => {
  const onRef = (dom: HTMLSpanElement | null) => {
    // 处理外部引用的 ref
    props.onRef && props.onRef(dom);
    // COMPAT: 避免 React 非受控与 IME 造成的 DOM 内容问题
    if (!dom || props.children === dom.textContent) return void 0;
    const nodes = dom.childNodes;
    // If the text content is inconsistent due to the modification of the input
    // it needs to be corrected
    for (let i = 1; i < nodes.length; ++i) {
      const node = nodes[i];
      node && node.remove();
    }
    // Guaranteed to have only one text child
    if (isDOMText(dom.firstChild)) {
      dom.firstChild.nodeValue = props.children;
    }
  };

  return (
    <span ref={onRef} {...{ [LEAF_STRING]: true }}>
      {props.children}
    </span>
  );
};
