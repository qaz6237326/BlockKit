import { Isolate } from "@block-kit/react";
import { NOOP, preventNativeEvent, TEXT_PLAIN } from "@block-kit/utils";
import type { FC } from "react";
import React from "react";

export const EditableText: FC<{
  value: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  onRef?: (ref: HTMLDivElement | null) => void;
}> = props => {
  const { onChange = NOOP, value } = props;

  const onEditableRef = (ref: HTMLDivElement | null) => {
    props.onRef && props.onRef(ref);
    if (!ref) return void 0;
    const onInput = (e: InputEvent) => {
      if (e.isComposing) return void 0;
      const newValue = ref.textContent || "";
      newValue !== value && onChange(newValue);
    };
    ref.oninput = onInput as typeof ref.oninput;
    const onPaste = (e: ClipboardEvent) => {
      preventNativeEvent(e);
      const clipboardData = e.clipboardData;
      if (!clipboardData) return void 0;
      const text = clipboardData.getData(TEXT_PLAIN) || "";
      document.execCommand("insertText", false, text.replace(/\n/g, " "));
    };
    ref.onpaste = onPaste as typeof ref.onpaste;
  };

  return (
    <Isolate className={props.className} style={props.style}>
      <div
        style={{ display: "inline-block" }}
        ref={onEditableRef}
        contentEditable
        suppressContentEditableWarning
      >
        {value}
      </div>
    </Isolate>
  );
};
