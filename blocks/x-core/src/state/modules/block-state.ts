import type { Block } from "@block-kit/x-json";

export class BlockState {
  /** Block id */
  public readonly id: string;

  /** 构造函数 */
  constructor(block: Block) {
    this.id = block.id;
  }
}
