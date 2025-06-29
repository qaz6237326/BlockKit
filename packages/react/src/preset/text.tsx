import { LEAF_STRING } from "@block-kit/core";
import type { FC } from "react";

import { updateDirtyText } from "../utils/dirty-dom";

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
    dom && updateDirtyText(dom, props.children);
  };

  return (
    <span ref={onRef} {...{ [LEAF_STRING]: true }}>
      {props.children}
    </span>
  );
};
