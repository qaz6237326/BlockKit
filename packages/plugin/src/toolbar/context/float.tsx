import "../styles/float.scss";

import type { SelectionChangeEvent } from "@block-kit/core";
import { EDITOR_EVENT } from "@block-kit/core";
import { useEditorStatic, useReadonly } from "@block-kit/react";
import { cs } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { MountNode } from "../../shared/utils/dom";
import { Toolbar } from "./basic";

export const FloatToolbar: FC<{
  /**
   * 样式类名
   */
  className?: string;
  /**
   * Top 偏移
   */
  offsetTop?: number;
  /**
   * Left 偏移
   */
  offsetLeft?: number;
  /**
   * 挂载的 DOM
   */
  mountDOM?: HTMLElement;
  /**
   * 重载工具栏位置
   */
  overridePosition?: () => { left: number; top: number };
}> = props => {
  const { editor } = useEditorStatic();
  const { readonly } = useReadonly();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const onWeakUp = useMemoFn((wakeUp: boolean) => {
    if (editor.state.isFocused() && wakeUp) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  useEffect(() => {
    if (readonly) return void 0;
    const onMouseUp = () => {
      setIsMouseDown(false);
    };
    const onMouseDown = () => {
      setIsMouseDown(true);
    };
    const onSelectionChange = (e: SelectionChangeEvent) => {
      const { current } = e;
      const isWakeUp = current ? !current.isCollapsed : false;
      onWeakUp(isWakeUp);
    };
    document.addEventListener(EDITOR_EVENT.MOUSE_UP, onMouseUp);
    document.addEventListener(EDITOR_EVENT.MOUSE_DOWN, onMouseDown);
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    return () => {
      document.removeEventListener(EDITOR_EVENT.MOUSE_UP, onMouseUp);
      document.removeEventListener(EDITOR_EVENT.MOUSE_DOWN, onMouseDown);
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    };
  }, [editor, onWeakUp, readonly]);

  const overridePosition = useRef(props.overridePosition);
  const { left, top } = useMemo(() => {
    if (!readonly && visible && !isMouseDown) {
      if (overridePosition.current) {
        return overridePosition.current(); // overlay
      }
      const rect = editor.rect.getSelectionRect();
      if (rect) {
        const topOffset = props.offsetTop || 0;
        const leftOffset = props.offsetLeft || 0;
        const t = rect.top + topOffset;
        const l = rect.left + rect.width / 2 + leftOffset;
        return { top: t, left: l };
      }
    }
    return { top: -999999, left: -999999 };
  }, [editor.rect, readonly, visible, isMouseDown, props.offsetLeft, props.offsetTop]);

  // 只读状态 / 不可见 / 鼠标按下 时隐藏
  return readonly || !visible || isMouseDown
    ? null
    : ReactDOM.createPortal(
        <Toolbar
          ref={ref}
          className={cs("block-kit-float-toolbar", props.className)}
          styles={{ top: top, left: left }}
        >
          {props.children}
        </Toolbar>,
        props.mountDOM || MountNode.get(editor)
      );
};
