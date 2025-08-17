import type { O } from "@block-kit/utils/dist/es/types";
import type { EditorSchema } from "@block-kit/variable";
import { Delta } from "@block-kit/variable";
import { VARS_KEY, VARS_VALUE_KEY } from "@block-kit/variable";

export const SCHEMA: EditorSchema = {
  [VARS_KEY]: { void: true, inline: true },
};

export const PLACEHOLDERS: O.Map<string> = {
  role: "[职业]",
  theme: "[主题]",
  platform: "[平台: 如公众号、知乎、头条等]",
};

export const DELTA = new Delta()
  .insert("我是一位")
  .insert(" ", {
    [VARS_KEY]: "role",
    [VARS_VALUE_KEY]: "博主",
  })
  .insert("，帮我写一篇关于")
  .insert(" ", {
    [VARS_KEY]: "theme",
  })
  .insert("的")
  .insert(" ", {
    [VARS_KEY]: "platform",
  })
  .insert("文章，需要符合该平台写作风格。");
