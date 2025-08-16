import { EDITOR_EVENT } from "@block-kit/core";
import { Isolate } from "@block-kit/react";
import { isKeyCode, isNil, KEY_CODE, NOOP, preventNativeEvent, TEXT_PLAIN } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { O } from "@block-kit/utils/dist/es/types";
import type { FC } from "react";
import React, { useEffect } from "react";

import { DATA_EDITABLE_KEY } from "../utils/constant";

export const EditableText: FC<{
  value: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  onRef?: (ref: HTMLDivElement | null) => void;
}> = props => {
  const { onChange = NOOP, value, placeholder } = props;
  const [isComposing, setIsComposing] = React.useState(false);
  const [refState, setRefState] = React.useState<HTMLDivElement | null>(null);

  const onEditableRef = (ref: HTMLDivElement | null) => {
    props.onRef && props.onRef(ref);
    setRefState(ref);
  };

  useEffect(() => {
    if (!refState) return void 0;
    const innerText = refState.textContent || "";
    if (innerText !== props.value) {
      refState.innerText = props.value;
    }
  }, [props.value, refState]);

  const onInput = useMemoFn((e: Event) => {
    if ((e as unknown as O.Map<unknown>).isComposing || isNil(refState)) {
      return void 0;
    }
    const newValue = refState.textContent || "";
    newValue !== value && onChange(newValue);
  });

  const onPaste = useMemoFn((e: ClipboardEvent) => {
    preventNativeEvent(e);
    const clipboardData = e.clipboardData;
    if (!clipboardData) return void 0;
    const text = clipboardData.getData(TEXT_PLAIN) || "";
    document.execCommand("insertText", false, text.replace(/\n/g, " "));
  });

  const onKeyDown = useMemoFn((e: KeyboardEvent) => {
    if (isKeyCode(e, KEY_CODE.ENTER) || isKeyCode(e, KEY_CODE.TAB)) {
      preventNativeEvent(e);
    }
  });

  const onMouseDown = useMemoFn((e: MouseEvent) => {
    if (!props.value && e.detail > 1) {
      preventNativeEvent(e);
    }
  });

  const onCompositionStart = useMemoFn(() => {
    setIsComposing(true);
  });

  const onCompositionEnd = useMemoFn((e: CompositionEvent) => {
    setIsComposing(false);
    onInput(e);
  });

  useEffect(() => {
    const el = refState;
    if (!el) return void 0;
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
  }, [onCompositionEnd, onCompositionStart, onInput, onKeyDown, onMouseDown, onPaste, refState]);

  return (
    <Isolate className={props.className} style={props.style}>
      <div
        {...{ [DATA_EDITABLE_KEY]: true }}
        className="block-kit-editable-text"
        ref={onEditableRef}
        data-placeholder={!value && placeholder && !isComposing ? placeholder : void 0}
        contentEditable
        suppressContentEditableWarning
      ></div>
    </Isolate>
  );
};
