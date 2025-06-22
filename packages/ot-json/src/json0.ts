import { isArray, isNil, isObject, isPlainObject } from "@block-kit/utils";
import type { O, P } from "@block-kit/utils/dist/es/types";

import type { Subtype } from "./subtype";
import { subtypes } from "./subtype";
import type { Op, Path, Side, Snapshot } from "./types";
import { clone, SIDE } from "./utils";

/**
 * OT JSON0
 * - https://github.com/ottypes/docs
 * - https://github.com/share/sharedb
 * - https://github.com/ottypes/json0
 */
export class JSONType {
  public readonly name = "json0";

  public registerSubtype(subtype: Subtype) {
    subtypes[subtype.name] = subtype;
  }

  public unregisterSubtype(subtype: Subtype) {
    delete subtypes[subtype.name];
  }

  public create(data: Snapshot): Snapshot {
    // Null instead of undefined if you don't pass an argument.
    return data === undefined ? null : clone(data);
  }

  public compose(ops1: Op[], ops2: Op[]) {
    const json0 = JSONType.prototype;
    json0.checkValidOps(ops1);
    json0.checkValidOps(ops2);
    const newOp = clone(ops1);
    for (let i = 0; i < ops2.length; i++) {
      json0.append(newOp, ops2[i]);
    }
    return newOp;
  }

  public invert(ops: Op[]) {
    const json0 = JSONType.prototype;
    const op_ = ops.slice().reverse();
    const iop = [];
    for (let i = 0; i < op_.length; i++) {
      iop.push(json0.invertComponent(op_[i]));
    }
    return iop;
  }

  public apply(snapshot: Snapshot, ops: Op[]) {
    const json0 = JSONType.prototype;
    json0.checkValidOps(ops);
    ops = clone(ops);

    const container = { data: snapshot };

    for (let i = 0; i < ops.length; i++) {
      const c = ops[i];
      // convert old string ops to use subtype for backwards compatibility
      if (!isNil(c.si) || !isNil(c.sd)) json0.convertFromText(c);

      let parent: Snapshot = null;
      let elem: O.Any = container;
      let key: string | number = "data";

      for (let j = 0; j < c.p.length; j++) {
        const p = c.p[j];

        parent = elem;
        elem = elem[key];
        key = p;

        if (isArray(elem) && typeof key !== "number") {
          throw new Error("List index must be a number");
        }
        if (isObject(elem) && typeof key !== "string") {
          throw new Error("Object key must be a string");
        }
        if (isNil(parent)) {
          throw new Error("Path invalid");
        }
      }

      if (c.t && c.o !== void 0 && subtypes[c.t]) {
        // handle subtype ops
        elem[key] = subtypes[c.t].apply(elem[key], c.o);
      } else if (c.na !== void 0) {
        // Number add
        if (typeof elem[key] != "number") throw new Error("Referenced element not a number");
        if (typeof c.na !== "number") throw new Error("Number addition is not a number");
        elem[key] += c.na;
      } else if (c.li !== void 0 && c.ld !== void 0) {
        // List replace
        json0.checkList(elem);
        // Should check the list element matches c.ld
        elem[key] = c.li;
      } else if (c.li !== void 0) {
        // List insert
        json0.checkList(elem);
        elem.splice(key, 0, c.li);
      } else if (c.ld !== void 0) {
        // List delete
        json0.checkList(elem);
        // Should check the list element matches c.ld here too.
        elem.splice(key, 1);
      } else if (c.lm !== void 0) {
        // List move
        if (typeof c.lm !== "number") {
          throw new Error("List move target index must be a number");
        }
        json0.checkList(elem);
        if (c.lm != key) {
          const e = elem[key];
          // Remove it...
          elem.splice(key, 1);
          // And insert it back.
          elem.splice(c.lm, 0, e);
        }
      } else if (c.oi !== void 0) {
        // Object insert / replace
        json0.checkObj(elem);
        // Should check that elem[key] == c.od
        elem[key] = c.oi;
      } else if (c.od !== void 0) {
        // Object delete
        json0.checkObj(elem);
        // Should check that elem[key] == c.od
        delete elem[key];
      } else {
        throw new Error("invalid / missing instruction in op");
      }
    }
    return container.data;
  }

  public transform(op: Op, otherOp: Op, side?: Side): Op | P.Undef;
  public transform(op: Op[], otherOp: Op[], side?: Side): Op[] | P.Undef;
  public transform(op: Op | Op[], otherOp: Op | Op[], side?: Side): Op | Op[] | P.Undef {
    const json0 = JSONType.prototype;
    if (isArray(op) && isArray(otherOp)) {
      if (otherOp.length === 0) return op;
      if (op.length === 1 && otherOp.length === 1)
        return json0.transformComponent([], op[0], otherOp[0], side);
      if (side === SIDE.LEFT) {
        return json0.transformX(op, otherOp)[0];
      } else {
        return json0.transformX(otherOp, op)[1];
      }
    }
    const dest = json0.transformComponent([], op as Op, otherOp as Op, side);
    return dest[0];
  }

  /**
   * Checks if two paths, p1 and p2 match.
   */
  private pathMatches(p1: Path, p2: Path, ignoreLast?: boolean) {
    if (p1.length != p2.length) return false;
    for (let i = 0; i < p1.length; i++) {
      if (p1[i] !== p2[i] && (!ignoreLast || i !== p1.length - 1)) return false;
    }
    return true;
  }

  /**
   * helper functions to convert old string ops to and from subtype ops
   */
  private convertFromText(c: Op) {
    c.t = "text0";
    // SubType Op
    const o: O.Any = { p: c.p.pop() };
    if (!isNil(c.si)) o.i = c.si;
    if (!isNil(c.sd)) o.d = c.sd;
    c.o = [o];
  }

  private convertToText(c: O.Any) {
    c.p.push(c.o[0].p);
    if (!isNil(c.o[0].i)) c.si = c.o[0].i;
    if (!isNil(c.o[0].d)) c.sd = c.o[0].d;
    delete c.t;
    delete c.o;
  }

  private checkValidOps(ops: Op[]) {
    for (let i = 0; i < ops.length; i++) {
      if (!isArray(ops[i].p)) throw new Error("Missing path");
    }
  }

  private checkList(elem: Snapshot) {
    if (!isArray(elem)) {
      throw new Error("Referenced element not a list");
    }
  }

  private checkObj(elem: Snapshot) {
    if (!isPlainObject(elem)) {
      throw new Error("Referenced element not an object (it was " + JSON.stringify(elem) + ")");
    }
  }

  private invertComponent(c: Op): Op {
    const c_: Op = { p: c.p };

    // handle subtype ops
    if (c.t && subtypes[c.t]) {
      c_.t = c.t;
      c_.o = subtypes[c.t].invert(c.o);
    }

    if (c.si !== void 0) c_.sd = c.si;
    if (c.sd !== void 0) c_.si = c.sd;
    if (c.oi !== void 0) c_.od = c.oi;
    if (c.od !== void 0) c_.oi = c.od;
    if (c.li !== void 0) c_.ld = c.li;
    if (c.ld !== void 0) c_.li = c.ld;
    if (c.na !== void 0) c_.na = -c.na;

    if (c.lm !== void 0) {
      c_.lm = <number>c.p[c.p.length - 1];
      c_.p = c.p.slice(0, c.p.length - 1).concat([c.lm]);
    }
    return c_;
  }

  /**
   * Helper to break an operation up into a bunch of small ops.
   */
  private shatter(ops: Op[]) {
    const results: Op[][] = [];
    for (let i = 0; i < ops.length; i++) {
      results.push([ops[i]]);
    }
    return results;
  }

  private append(dest: Op[], c: Op) {
    c = clone(c);

    if (dest.length === 0) {
      dest.push(c);
      return;
    }

    const last = dest[dest.length - 1];

    // convert old string ops to use subtype for backwards compatibility
    if ((!isNil(c.si) || !isNil(c.sd)) && (!isNil(last.si) || !isNil(last.sd))) {
      this.convertFromText(c);
      this.convertFromText(last);
    }

    if (this.pathMatches(c.p, last.p)) {
      // handle subtype ops
      if (c.t && last.t && c.t === last.t && subtypes[c.t]) {
        last.o = subtypes[c.t].compose(last.o, c.o);
        // convert back to old string ops
        if (!isNil(c.si) || !isNil(c.sd)) {
          const p = c.p;
          for (let i = 0; i < last.o!.length - 1; i++) {
            c.o = [last.o!.pop()];
            c.p = p.slice();
            this.convertToText(c);
            dest.push(c);
          }
          this.convertToText(last);
        }
      } else if (!isNil(last.na) && !isNil(c.na)) {
        dest[dest.length - 1] = { p: last.p, na: last.na + c.na };
      } else if (last.li !== void 0 && c.li === void 0 && c.ld === last.li) {
        // insert immediately followed by delete becomes a noop.
        if (last.ld !== void 0) {
          // leave the delete part of the replace
          delete last.li;
        } else {
          dest.pop();
        }
      } else if (last.od !== void 0 && last.oi === void 0 && c.oi !== void 0 && c.od === void 0) {
        last.oi = c.oi;
      } else if (last.oi !== void 0 && c.od !== void 0) {
        // The last path component inserted something that the new component deletes (or replaces).
        // Just merge them.
        if (c.oi !== void 0) {
          last.oi = c.oi;
        } else if (last.od !== void 0) {
          delete last.oi;
        } else {
          // An insert directly followed by a delete turns into a no-op and can be removed.
          dest.pop();
        }
      } else if (c.lm !== void 0 && c.p[c.p.length - 1] === c.lm) {
        // don't do anything
      } else {
        dest.push(c);
      }
    } else {
      // convert string ops back
      if ((!isNil(c.si) || !isNil(c.sd)) && (!isNil(last.si) || !isNil(last.sd))) {
        this.convertToText(c);
        this.convertToText(last);
      }
      dest.push(c);
    }
  }

  /**
   * Returns the common length of the paths of ops a and b
   */
  private commonLengthForOps(a: Op, b: Op) {
    let lenA = a.p.length;
    let lenB = b.p.length;
    if (!isNil(a.na) || a.t) lenA++;
    if (!isNil(b.na) || b.t) lenB++;
    if (lenA === 0) return -1;
    if (lenB === 0) return null;
    lenA--;
    lenB--;
    for (let i = 0; i < lenA; i++) {
      const p = a.p[i];
      if (i >= lenB || p !== b.p[i]) return null;
    }
    return lenA;
  }

  private transformComponent(dest: Op[], c: Op, otherC: Op, type: Side = SIDE.LEFT): Op[] {
    c = clone(c);
    const common = this.commonLengthForOps(otherC, c);
    const common2 = this.commonLengthForOps(c, otherC);
    let pLength = c.p.length;
    let otherPLength = otherC.p.length;
    if (!isNil(c.na) || c.t) pLength++;
    if (!isNil(otherC.na) || otherC.t) otherPLength++;

    // if c is deleting something, and that thing is changed by otherC, we need to
    // update c to reflect that change for invertibility.
    if (!isNil(common2) && otherPLength > pLength && c.p[common2] == otherC.p[common2]) {
      if (c.ld !== void 0) {
        const oc = clone(otherC);
        oc.p = oc.p.slice(pLength);
        c.ld = this.apply(clone(c.ld), [oc]);
      } else if (c.od !== void 0) {
        const oc = clone(otherC);
        oc.p = oc.p.slice(pLength);
        c.od = this.apply(clone(c.od), [oc]);
      }
    }

    if (!isNil(common)) {
      const commonOperand = pLength == otherPLength;
      // backward compatibility for old string ops
      let oc = otherC;
      if ((!isNil(c.si) || !isNil(c.sd)) && (!isNil(otherC.si) || !isNil(otherC.sd))) {
        this.convertFromText(c);
        oc = clone(otherC);
        this.convertFromText(oc);
      }

      // handle subtype ops
      if (oc.t && subtypes[oc.t]) {
        if (c.t && c.t === oc.t) {
          const res = subtypes[c.t].transform(c.o, oc.o, type);
          // convert back to old string ops
          if (!isNil(c.si) || !isNil(c.sd)) {
            const p = c.p;
            for (let i = 0; i < res.length; i++) {
              c.o = [res[i]];
              c.p = p.slice();
              this.convertToText(c);
              this.append(dest, c);
            }
          } else if (!isArray(res) || res.length > 0) {
            c.o = res;
            this.append(dest, c);
          }
          return dest;
        }
      } else if (otherC.na !== void 0) {
        // transform based on otherC
        // this case is handled below
      } else if (otherC.li !== void 0 && otherC.ld !== void 0) {
        if (otherC.p[common] === c.p[common]) {
          // noop
          if (!commonOperand) {
            return dest;
          } else if (c.ld !== void 0) {
            // we're trying to delete the same element, -> noop
            if (c.li !== void 0 && type === SIDE.LEFT) {
              // we're both replacing one element with another. only one can survive
              c.ld = clone(otherC.li);
            } else {
              return dest;
            }
          }
        }
      } else if (otherC.li !== void 0) {
        if (
          c.li !== void 0 &&
          c.ld === undefined &&
          commonOperand &&
          c.p[common] === otherC.p[common]
        ) {
          // in li vs. li, left wins.
          if (type === SIDE.RIGHT) (<number>c.p[common])++;
        } else if (otherC.p[common] <= c.p[common]) {
          (<number>c.p[common])++;
        }

        if (c.lm !== void 0) {
          if (commonOperand) {
            // otherC edits the same list we edit
            if (<number>otherC.p[common] <= c.lm) c.lm++;
            // changing c.from is handled above.
          }
        }
      } else if (otherC.ld !== void 0) {
        if (c.lm !== void 0) {
          if (commonOperand) {
            if (otherC.p[common] === c.p[common]) {
              // they deleted the thing we're trying to move
              return dest;
            }
            // otherC edits the same list we edit
            const p = <number>otherC.p[common];
            const from = <number>c.p[common];
            const to = c.lm;
            if (p < to || (p === to && from < to)) c.lm--;
          }
        }

        if (otherC.p[common] < c.p[common]) {
          (<number>c.p[common])--;
        } else if (otherC.p[common] === c.p[common]) {
          if (otherPLength < pLength) {
            // we're below the deleted element, so -> noop
            return dest;
          } else if (c.ld !== void 0) {
            if (c.li !== void 0) {
              // we're replacing, they're deleting. we become an insert.
              delete c.ld;
            } else {
              // we're trying to delete the same element, -> noop
              return dest;
            }
          }
        }
      } else if (otherC.lm !== void 0) {
        if (c.lm !== void 0 && pLength === otherPLength) {
          // lm vs lm, here we go!
          const from = <number>c.p[common];
          const to = c.lm;
          const otherFrom = <number>otherC.p[common];
          const otherTo = <number>otherC.lm;
          if (otherFrom !== otherTo) {
            // if otherFrom == otherTo, we don't need to change our op.

            // where did my thing go?
            if (from === otherFrom) {
              // they moved it! tie break.
              if (type === SIDE.LEFT) {
                c.p[common] = otherTo;
                // ugh
                if (from === to) c.lm = otherTo;
              } else {
                return dest;
              }
            } else {
              // they moved around it
              if (from > otherFrom) (<number>c.p[common])--;
              if (from > otherTo) (<number>c.p[common])++;
              else if (from === otherTo) {
                if (otherFrom > otherTo) {
                  (<number>c.p[common])++;
                  if (from === to)
                    // ugh, again
                    c.lm++;
                }
              }

              // step 2: where am i going to put it?
              if (to > otherFrom) {
                c.lm--;
              } else if (to === otherFrom) {
                if (to > from) c.lm--;
              }
              if (to > otherTo) {
                c.lm++;
              } else if (to === otherTo) {
                // if we're both moving in the same direction, tie break
                if ((otherTo > otherFrom && to > from) || (otherTo < otherFrom && to < from)) {
                  if (type === SIDE.RIGHT) c.lm++;
                } else {
                  if (to > from) c.lm++;
                  else if (to === otherFrom) c.lm--;
                }
              }
            }
          }
        } else if (c.li !== void 0 && c.ld === undefined && commonOperand) {
          // li
          const from = <number>otherC.p[common];
          const to = otherC.lm;
          const p = <number>c.p[common];
          if (p > from) (<number>c.p[common])--;
          if (p > to) (<number>c.p[common])++;
        } else {
          // ld, ld+li, si, sd, na, oi, od, oi+od, any li on an element beneath the lm
          // i.e. things care about where their item is after the move.
          const from = <number>otherC.p[common];
          const to = <number>otherC.lm;
          const p = <number>c.p[common];
          if (p === from) {
            c.p[common] = to;
          } else {
            if (p > from) (<number>c.p[common])--;
            if (p > to) (<number>c.p[common])++;
            else if (p === to && from > to) (<number>c.p[common])++;
          }
        }
      } else if (otherC.oi !== void 0 && otherC.od !== void 0) {
        if (c.p[common] === otherC.p[common]) {
          if (c.oi !== void 0 && commonOperand) {
            // we inserted where someone else replaced
            if (type === SIDE.RIGHT) {
              // left wins
              return dest;
            } else {
              // we win, make our op replace what they inserted
              c.od = otherC.oi;
            }
          } else {
            // -> noop if the other component is deleting the same object (or any parent)
            return dest;
          }
        }
      } else if (otherC.oi !== void 0) {
        if (c.oi !== void 0 && c.p[common] === otherC.p[common]) {
          // left wins if we try to insert at the same place
          if (type === SIDE.LEFT) {
            this.append(dest, { p: c.p, od: otherC.oi });
          } else {
            return dest;
          }
        }
      } else if (otherC.od !== void 0) {
        if (c.p[common] == otherC.p[common]) {
          if (!commonOperand) return dest;
          if (c.oi !== void 0) {
            delete c.od;
          } else {
            return dest;
          }
        }
      }
    }

    this.append(dest, c);
    return dest;
  }

  private transformComponentX(left: Op, right: Op, destLeft: Op[], destRight: Op[]) {
    this.transformComponent(destLeft, left, right, SIDE.LEFT);
    this.transformComponent(destRight, right, left, SIDE.RIGHT);
  }

  private transformX(leftOps: Op[], rightOps: Op[]) {
    this.checkValidOps(leftOps);
    this.checkValidOps(rightOps);
    const newRightOps: Op[] = [];

    for (let i = 0; i < rightOps.length; i++) {
      let rightComponent: Op | null = rightOps[i];

      // Generate newLeftOp by composing leftOp by rightComponent
      const newLeftOps: Op[] = [];
      let k = 0;
      while (k < leftOps.length) {
        const nextOps: Op[] = [];
        this.transformComponentX(leftOps[k], rightComponent, newLeftOps, nextOps);
        k++;

        if (nextOps.length === 1) {
          rightComponent = nextOps[0];
        } else if (nextOps.length === 0) {
          for (let j = k; j < leftOps.length; j++) {
            this.append(newLeftOps, leftOps[j]);
          }
          rightComponent = null;
          break;
        } else {
          // Recurse.
          const pair = this.transformX(leftOps.slice(k), nextOps);
          for (let l = 0; l < pair[0].length; l++) {
            this.append(newLeftOps, pair[0][l]);
          }
          for (let r = 0; r < pair[1].length; r++) {
            this.append(newRightOps, pair[1][r]);
          }
          rightComponent = null;
          break;
        }
      }

      if (!isNil(rightComponent)) {
        this.append(newRightOps, rightComponent);
      }
      leftOps = newLeftOps;
    }
    return [leftOps, newRightOps];
  }
}
