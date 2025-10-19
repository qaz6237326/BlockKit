import type { EditorOptions as _TextEditorOptions, LOG_LEVEL } from "@block-kit/core";
import type { CorePlugin } from "@block-kit/core";
import type { O } from "@block-kit/utils/dist/es/types";
import type { Blocks } from "@block-kit/x-json";

export type TextEditorOptions = {
  config?: _TextEditorOptions;
  plugin?: CorePlugin[];
};

export type EditorOptions = {
  /** 初始渲染数据 */
  initial?: Blocks;
  /** 日志等级 */
  logLevel?: O.Values<typeof LOG_LEVEL>;
  /** 文本编辑器选项 */
  texts?: TextEditorOptions;
};
