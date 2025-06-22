import { JSONType } from "./json0";

export { JSONType } from "./json0";
export type { Subtype, SubtypeOp } from "./subtype";
export { subtypes } from "./subtype";
export type {
  ListDeleteOp,
  ListInsertOp,
  ListMoveOp,
  ListReplaceOp,
  NumberAddOp,
  ObjectDeleteOp,
  ObjectInsertOp,
  ObjectReplaceOp,
  Op,
  Ops,
  Side,
  Snapshot,
} from "./types";

export const json = new JSONType();
