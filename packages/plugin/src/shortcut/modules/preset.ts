import { CTRL_KEY, KEY_CODE, NIL, TRULY } from "block-kit-utils";

import { BOLD_KEY } from "../../bold/types";
import { ITALIC_KEY } from "../../italic/types";
import { isKeyCode } from "../../shared/utils/is";
import type { ShortcutFuncMap } from "../types";

export const PRESET_SHORTCUT: ShortcutFuncMap = {
  [BOLD_KEY]: (event, payload) => {
    if (event[CTRL_KEY] && isKeyCode(event, KEY_CODE.B) && payload.sel) {
      const { editor, keys, sel } = payload;
      editor.perform.applyMarks(sel, { [BOLD_KEY]: keys[BOLD_KEY] ? NIL : TRULY });
      return true;
    }
  },
  [ITALIC_KEY]: (event, payload) => {
    if (event[CTRL_KEY] && isKeyCode(event, KEY_CODE.I) && payload.sel) {
      const { editor, keys, sel } = payload;
      editor.perform.applyMarks(sel, { [ITALIC_KEY]: keys[ITALIC_KEY] ? NIL : TRULY });
      return true;
    }
  },
};
