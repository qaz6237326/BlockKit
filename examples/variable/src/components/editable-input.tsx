import { EDITOR_EVENT, LEAF_KEY, LEAF_STRING, ZERO_SPACE_KEY } from "@block-kit/core";
import { Isolate, useReadonly } from "@block-kit/react";
import {
  isDOMElement,
  isDOMText,
  isKeyCode,
  isNil,
  KEY_CODE,
  NOOP,
  preventNativeEvent,
  TEXT_PLAIN,
} from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { O } from "@block-kit/utils/dist/es/types";
import type { FC } from "react";
import React, { useEffect } from "react";

import { DATA_EDITABLE_KEY } from "../utils/constant";

export const EditableTextInput: FC<{
  value: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  onRef?: (ref: HTMLDivElement | null) => void;
}> = props => {
  const { onChange = NOOP, value, placeholder } = props;
  const { readonly } = useReadonly();
  const [isComposing, setIsComposing] = React.useState(false);
  const [nodeState, setNodeState] = React.useState<HTMLDivElement | null>(null);

  const onEditableRef = (ref: HTMLDivElement | null) => {
    props.onRef && props.onRef(ref);
    setNodeState(ref);
  };

  useEffect(() => {
    if (!nodeState) return void 0;
    if (isDOMText(nodeState.firstChild)) {
      if (nodeState.firstChild.nodeValue !== props.value) {
        nodeState.firstChild.nodeValue = props.value;
      }
    } else {
      nodeState.innerText = props.value;
    }
  }, [props.value, nodeState]);

  const onInput = useMemoFn((e: Event) => {
    if ((e as unknown as O.Map<unknown>).isComposing || isNil(nodeState)) {
      return void 0;
    }
    const newValue = nodeState.textContent || "";
    newValue !== value && onChange(newValue);
  });

  const onMouseDown = useMemoFn((e: MouseEvent) => {
    if (!props.value && e.detail > 1) {
      preventNativeEvent(e);
    }
  });

  const onKeyDown = useMemoFn((e: KeyboardEvent) => {
    if (readonly) {
      return void 0;
    }
    if (isKeyCode(e, KEY_CODE.ENTER) || isKeyCode(e, KEY_CODE.TAB)) {
      preventNativeEvent(e);
    }
    const sel = window.getSelection();
    LEFT_ARROW: if (
      isKeyCode(e, KEY_CODE.LEFT) &&
      sel &&
      sel.isCollapsed &&
      sel.anchorOffset === 0 &&
      sel.anchorNode &&
      sel.anchorNode.parentElement &&
      sel.anchorNode.parentElement.closest(`[${LEAF_KEY}]`)
    ) {
      const leafNode = sel.anchorNode.parentElement.closest(`[${LEAF_KEY}]`)!;
      const prevNode = leafNode.previousSibling;
      if (!isDOMElement(prevNode) || !prevNode.hasAttribute(LEAF_KEY)) {
        break LEFT_ARROW;
      }
      const selector = `span[${LEAF_STRING}], span[${ZERO_SPACE_KEY}]`;
      const focusNode = prevNode.querySelector(selector);
      if (!focusNode || !isDOMText(focusNode.firstChild)) {
        break LEFT_ARROW;
      }
      const text = focusNode.firstChild;
      sel.setBaseAndExtent(text, text.length, text, text.length);
      preventNativeEvent(e);
    }
    RIGHT_ARROW: if (
      isKeyCode(e, KEY_CODE.RIGHT) &&
      sel &&
      sel.isCollapsed &&
      sel.anchorOffset === props.value.length &&
      sel.anchorNode &&
      sel.anchorNode.parentElement &&
      sel.anchorNode.parentElement.closest(`[${LEAF_KEY}]`)
    ) {
      const leafNode = sel.anchorNode.parentElement.closest(`[${LEAF_KEY}]`)!;
      const prevNode = leafNode.nextSibling;
      if (!isDOMElement(prevNode) || !prevNode.hasAttribute(LEAF_KEY)) {
        break RIGHT_ARROW;
      }
      const selector = `span[${LEAF_STRING}], span[${ZERO_SPACE_KEY}]`;
      const focusNode = prevNode.querySelector(selector);
      if (!focusNode || !isDOMText(focusNode.firstChild)) {
        break RIGHT_ARROW;
      }
      const text = focusNode.firstChild;
      sel.setBaseAndExtent(text, 0, text, 0);
      preventNativeEvent(e);
    }
  });

  useEffect(() => {
    const el = nodeState;
    if (!el) return void 0;
    const onCompositionStart = () => {
      setIsComposing(true);
    };
    const onCompositionEnd = (e: CompositionEvent) => {
      setIsComposing(false);
      onInput(e);
    };
    const onPaste = (e: ClipboardEvent) => {
      preventNativeEvent(e);
      const clipboardData = e.clipboardData;
      if (!clipboardData) return void 0;
      const text = clipboardData.getData(TEXT_PLAIN) || "";
      document.execCommand("insertText", false, text.replace(/\n/g, " "));
    };
    const { INPUT, COMPOSITION_END, PASTE, KEY_DOWN, MOUSE_DOWN, COMPOSITION_START } = EDITOR_EVENT;
    el.addEventListener(INPUT, onInput);
    el.addEventListener(PASTE, onPaste);
    el.addEventListener(KEY_DOWN, onKeyDown);
    el.addEventListener(MOUSE_DOWN, onMouseDown);
    el.addEventListener(COMPOSITION_START, onCompositionStart);
    el.addEventListener(COMPOSITION_END, onCompositionEnd);
    return () => {
      el.removeEventListener(INPUT, onInput);
      el.removeEventListener(PASTE, onPaste);
      el.removeEventListener(KEY_DOWN, onKeyDown);
      el.removeEventListener(MOUSE_DOWN, onMouseDown);
      el.removeEventListener(COMPOSITION_START, onCompositionStart);
      el.removeEventListener(COMPOSITION_END, onCompositionEnd);
    };
  }, [onInput, onKeyDown, onMouseDown, nodeState]);

  const showPlaceholder = !value && placeholder && !isComposing;

  return (
    <Isolate className={props.className} style={props.style}>
      <div
        {...{ [DATA_EDITABLE_KEY]: true }}
        className="block-kit-editable-text"
        ref={onEditableRef}
        data-vars-placeholder={showPlaceholder ? placeholder : void 0}
        contentEditable
        suppressContentEditableWarning
      ></div>
    </Isolate>
  );
};
