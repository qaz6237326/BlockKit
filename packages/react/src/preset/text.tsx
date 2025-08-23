import { LEAF_STRING } from "@block-kit/core";
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
  };

  return (
    <span ref={onRef} {...{ [LEAF_STRING]: true }}>
      {props.children}
    </span>
  );
};
