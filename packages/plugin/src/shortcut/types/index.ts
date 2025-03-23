import type { Editor } from "block-kit-core";
import type { O } from "block-kit-utils/dist/es/types";

export const SHORTCUT_KEY = "SHORTCUT_KEY";

export type ShortcutFunc = (
  event: KeyboardEvent,
  payload: {
    editor: Editor;
    keys: O.Map<string>;
  }
) => true | void;

export type ShortcutFuncMap = O.Map<ShortcutFunc>;
