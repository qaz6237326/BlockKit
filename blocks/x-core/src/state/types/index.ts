import type { APPLY_SOURCE } from "@block-kit/core";
import type { O } from "@block-kit/utils/dist/es/types";

export type ApplyOptions = {
  /** 操作源 */
  source?: O.Values<typeof APPLY_SOURCE>;
  /** 自动变换光标 */
  autoCaret?: boolean;
  /** 自动记录到 History */
  undoable?: boolean;
  /** 额外携带的信息 */
  extra?: unknown;
};

export type ApplyResult = {
  /** 操作 id */
  id: string;
};
