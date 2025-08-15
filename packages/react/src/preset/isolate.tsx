import { ISOLATED_KEY } from "@block-kit/core";
import { stopNativeEvent } from "@block-kit/utils";
import type { FC, PropsWithChildren } from "react";
import React from "react";

export type IsolateProps = PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
}>;

/**
 * 独立节点嵌入 HOC
 * - 独立区域 完全隔离所有事件
 * @param props
 */
export const Isolate: FC<IsolateProps> = props => {
  const onRef = (ref: HTMLSpanElement | null) => {
    if (!ref) return void 0;
    ref.onbeforeinput = stopNativeEvent;
    ref.onmousedown = stopNativeEvent;
    ref.oncopy = stopNativeEvent;
    ref.onkeydown = stopNativeEvent;
    ref.onpaste = stopNativeEvent;
  };

  return (
    <span
      ref={onRef}
      {...{ [ISOLATED_KEY]: true }}
      className={props.className}
      style={{ userSelect: "none", ...props.style }}
      contentEditable={false}
    >
      {props.children}
    </span>
  );
};
