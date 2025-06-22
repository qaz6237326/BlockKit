import type { O } from "@block-kit/utils/dist/es/types";

export type Ops = Op[];
export type Side = "left" | "right";
export type Path = Array<string | number>;

export type Snapshot =
  | null
  | boolean
  | number
  | string
  | Array<Snapshot>
  | { [key: string]: Snapshot };

/**
 * adds x to the number at [path].
 */
export type NumberAddOp = {
  p: Path;
  na: number;
};

/**
 * inserts the object obj before the item at idx in the list at [path].
 */
export type ListInsertOp = {
  p: Path;
  li: Snapshot;
};

/**
 * deletes the object obj from the index idx in the list at [path].
 */
export type ListDeleteOp = {
  p: Path;
  ld: Snapshot;
};

/**
 * replaces the object before at the index idx in the list at [path] with the object after.
 */
export type ListReplaceOp = {
  p: Path;
  ld: Snapshot;
  li: Snapshot;
};

/**
 * moves the object at idx1 such that the object will be at index idx2 in the list at [path].
 * - idx1 => [Array<string | number>, idx1: number] idx2 => lm: number
 */
export type ListMoveOp = {
  p: Path;
  lm: number;
};

/**
 * inserts the object obj into the object at [path] with key key.
 */
export type ObjectInsertOp = {
  p: Path;
  oi: Snapshot;
};

/**
 * deletes the object obj with key key from the object at [path].
 */
export type ObjectDeleteOp = {
  p: Path;
  od: Snapshot;
};

/**
 * replaces the object before with the object after at key key in the object at [path].
 */
export type ObjectReplaceOp = {
  p: Path;
  od: Snapshot;
  oi: Snapshot;
};

/**
 * internal subtype text operation
 */
export type TextOp = {
  p: number;
  i?: string;
  d?: string;
};

export type Op = {
  p: Path;
  /** - adds x to the number at [path]. */
  na?: number;
  /** - inserts the object obj before the item at idx in the list at [path]. */
  li?: Snapshot;
  /** - deletes the object obj from the index idx in the list at [path]. */
  ld?: Snapshot;
  /** - replaces the object before at the index idx in the list at [path] with the object after. */
  // ld?: Snapshot;
  // li?: Snapshot;
  /** - moves the object at idx1 such that the object will be at index idx2 in the list at [path]. */
  lm?: number;
  /** - inserts the object obj into the object at [path] with key key. */
  oi?: Snapshot;
  /** - deletes the object obj with key key from the object at [path]. */
  od?: Snapshot;
  /** - replaces the object before with the object after at key key in the object at [path]. */
  // od?: Snapshot;
  // oi?: Snapshot;
  /** - applies the subtype op o of type t to the object at [path] */
  t?: string;
  o?: O.Any;
  /** - inserts the string s at offset offset into the string at [path] (uses subtypes internally). */
  si?: string;
  /** - deletes the string s at offset offset from the string at [path] (uses subtypes internally). */
  sd?: string;
};
