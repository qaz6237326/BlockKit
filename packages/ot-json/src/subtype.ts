import type { O, P } from "@block-kit/utils/dist/es/types";

import type { Path, Side, Snapshot } from "./types";

export type Subtype = {
  name: string;
  uri: string;
  invert: (o: P.Any) => O.Any;
  compose: (a: P.Any, b: P.Any) => P.Any;
  apply: (elem: Snapshot, op: P.Any) => void;
  transform: (a: P.Any, b: P.Any, side?: Side) => P.Any;
};

export interface SubtypeOpMap {
  text: { p: number; i?: string; d?: string };
}

/**
 * applies the subtype op o of type t(registered subtype) to the object at [path]
 */
export type SubtypeOp<T extends keyof SubtypeOpMap> = {
  p: Path;
  t: T;
  o: SubtypeOpMap[T];
};

export const subtypes: Record<string, Subtype> = {};
