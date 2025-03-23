import { IconItalic } from "@arco-design/web-react/icon";
import { EDITOR_EVENT } from "block-kit-core";
import { cs, CTRL_KEY, KEY_CODE, NIL, preventNativeEvent, TRULY } from "block-kit-utils";
import { useMemoFn } from "block-kit-utils/dist/es/hooks";
import type { FC } from "react";
import { useEffect } from "react";

import { ITALIC_KEY } from "../../italic/types";
import { isKeyCode } from "../../shared/utils/is";
import { useToolbarContext } from "../context/provider";

export const Italic: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  const onExec = () => {
    editor.command.exec(ITALIC_KEY, { value: keys[ITALIC_KEY] ? NIL : TRULY });
    refreshMarks();
  };

  const onKeydown = useMemoFn((e: KeyboardEvent) => {
    if (e[CTRL_KEY] && isKeyCode(e, KEY_CODE.I)) {
      onExec();
      preventNativeEvent(e);
    }
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.KEY_DOWN, onKeydown);
    return () => {
      editor.event.off(EDITOR_EVENT.KEY_DOWN, onKeydown);
    };
  }, [editor.event, onKeydown]);

  return (
    <div className={cs("menu-toolbar-item", keys[ITALIC_KEY] && "active")} onClick={onExec}>
      <IconItalic />
    </div>
  );
};
