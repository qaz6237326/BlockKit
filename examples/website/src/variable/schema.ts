import type { EditorSchema } from "@block-kit/core";
import { VARIABLE_KEY } from "@block-kit/variable";

export const schema: EditorSchema = {
  [VARIABLE_KEY]: { void: true, inline: true },
};
