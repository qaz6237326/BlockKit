import "../styles/float.scss";

import type { SelectionChangeEvent } from "block-kit-core";
import { EDITOR_EVENT } from "block-kit-core";
import { useEditorStatic, useReadonly } from "block-kit-react";
import { cs } from "block-kit-utils";
import { useMemoFn } from "block-kit-utils/dist/es/hooks";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { getMountDOM } from "../../shared/utils/dom";
import { Toolbar } from "./basic";

export const FloatToolbar: FC<{
  className?: string;
  /**
   * Top 偏移
   */
  offsetTop?: number;
  /**
   * Left 偏移
   */
  offsetLeft?: number;
}> = props => {
  const { editor } = useEditorStatic();
  const { readonly } = useReadonly();
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isInterim, setIsInterim] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = ref.current;
    if (!readonly && visible && !isMouseDown) {
      const rect = editor.rect.getSelectionRect();
      if (rect && el) {
        const topOffset = props.offsetTop || 0;
        const leftOffset = props.offsetLeft || 0;
        const t = rect.top - el.offsetHeight + topOffset;
        const l = rect.left - el.offsetWidth / 2 + rect.width / 2 + leftOffset;
        setTop(t);
        setLeft(l);
      }
      setIsInterim(false);
    } else {
      setTop(-999999);
      setLeft(-999999);
      setIsInterim(true);
    }
  }, [readonly, visible, isMouseDown, editor.rect, props.offsetLeft, props.offsetTop]);

  // 只读状态 / 不可见 / 鼠标按下 时隐藏
  return readonly || !visible || isMouseDown
    ? null
    : ReactDOM.createPortal(
        <Toolbar
          ref={ref}
          className={cs("block-kit-float-toolbar", props.className)}
          styles={{
            top: top,
            left: left,
            opacity: isInterim ? 0 : void 0,
            zIndex: isInterim ? -99999 : void 0,
            visibility: isInterim ? "hidden" : void 0,
            pointerEvents: isInterim ? "none" : void 0,
          }}
        >
          {props.children}
        </Toolbar>,
        getMountDOM(editor)
      );
};
