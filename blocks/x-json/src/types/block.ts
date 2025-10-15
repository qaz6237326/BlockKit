import type { Op as JSONOp } from "@block-kit/ot-json";

import type { BasicBlock, BlockModule } from "./interface";

/** Block 数据扩展类型 */
export type BlockDataField = BlockModule[keyof BlockModule];

/** Block 类型 */
export type Block = {
  id: string;
  version: number;
  data: BasicBlock & BlockDataField;
};

/** Block 数据集合 */
export type Blocks = Record<string, Block>;

/** Block 变更 */
export type BlockChange = {
  id: string;
  version: number;
  change: JSONOp[];
};

/** Blocks 变更 */
export type BlocksChange = Record<string, BlockChange>;
