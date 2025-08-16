import type { EditorSchema } from "@block-kit/variable";
import { Delta } from "@block-kit/variable";
import { VARIABLE_KEY, VARS_PLACEHOLDER_KEY, VARS_VALUE_KEY } from "@block-kit/variable";

export const schema: EditorSchema = {
  [VARIABLE_KEY]: { void: true, inline: true },
};

export const init = new Delta()
  .insert("帮我写一篇关于")
  .insert(" ", {
    [VARIABLE_KEY]: "theme",
    [VARS_VALUE_KEY]: "",
    [VARS_PLACEHOLDER_KEY]: "[主题]",
  })
  .insert("的")
  .insert(" ", {
    [VARIABLE_KEY]: "platform",
    [VARS_VALUE_KEY]: "",
    [VARS_PLACEHOLDER_KEY]: "[平台: 如公众号、知乎、头条等]",
  })
  .insert("文章，需要符合该平台写作风格。");
