import { Isolate } from "@block-kit/react";
import { isKeyCode, isNil, KEY_CODE, NOOP, preventNativeEvent, TEXT_PLAIN } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { O } from "@block-kit/utils/dist/es/types";
import type { FC } from "react";
import React, { useEffect } from "react";

export const EditableText: FC<{
  value: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  onRef?: (ref: HTMLDivElement | null) => void;
}> = props => {
  const { onChange = NOOP, value } = props;
  const [refState, setRefState] = React.useState<HTMLDivElement | null>(null);

  const onEditableRef = (ref: HTMLDivElement | null) => {
    props.onRef && props.onRef(ref);
    setRefState(ref);
  };

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

  useEffect(() => {
    const el = refState;
    if (!el) return void 0;
    el.addEventListener("input", onInput);
    el.addEventListener("compositionend", onInput);
    el.addEventListener("paste", onPaste);
    el.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("input", onInput);
      el.removeEventListener("compositionend", onInput);
      el.removeEventListener("paste", onPaste);
      el.removeEventListener("keydown", onKeyDown);
    };
  }, [onInput, onKeyDown, onPaste, refState]);

  return (
    <Isolate className={props.className} style={props.style}>
      <div
        className="block-kit-editable-text"
        ref={onEditableRef}
        contentEditable
        suppressContentEditableWarning
      >
        {value}
      </div>
    </Isolate>
  );
};
