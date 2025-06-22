import type { TextOp } from "../src/";
import { text } from "../src/";

describe("text", () => {
  describe("compose", () => {
    it("is sane", () => {
      expect(text.compose([], [])).toEqual([]);
      expect(text.compose([{ i: "x", p: 0 }], [])).toEqual([{ i: "x", p: 0 }]);
      expect(text.compose([], [{ i: "x", p: 0 }])).toEqual([{ i: "x", p: 0 }]);
      expect(text.compose([{ i: "y", p: 100 }], [{ i: "x", p: 0 }])).toEqual([
        { i: "y", p: 100 },
        { i: "x", p: 0 },
      ]);
    });
  });

  describe("transform", () => {
    it("is sane", () => {
      expect(text.transform([], [], "left")).toEqual([]);
      expect(text.transform([], [], "right")).toEqual([]);

      expect(
        text.transform(
          [
            { i: "y", p: 100 },
            { i: "x", p: 0 },
          ],
          [],
          "left"
        )
      ).toEqual([
        { i: "y", p: 100 },
        { i: "x", p: 0 },
      ]);
      expect(
        text.transform(
          [],
          [
            { i: "y", p: 100 },
            { i: "x", p: 0 },
          ],
          "right"
        )
      ).toEqual([]);
    });

    it("inserts", () => {
      // @ts-expect-error private
      expect(text.transformX([{ i: "x", p: 9 }], [{ i: "a", p: 1 }])).toEqual([
        [{ i: "x", p: 10 }],
        [{ i: "a", p: 1 }],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ i: "x", p: 10 }], [{ i: "a", p: 10 }])).toEqual([
        [{ i: "x", p: 10 }],
        [{ i: "a", p: 11 }],
      ]);

      // @ts-expect-error private
      expect(text.transformX([{ i: "x", p: 11 }], [{ d: "a", p: 9 }])).toEqual([
        [{ i: "x", p: 10 }],
        [{ d: "a", p: 9 }],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ i: "x", p: 11 }], [{ d: "a", p: 10 }])).toEqual([
        [{ i: "x", p: 10 }],
        [{ d: "a", p: 10 }],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ i: "x", p: 11 }], [{ d: "a", p: 11 }])).toEqual([
        [{ i: "x", p: 11 }],
        [{ d: "a", p: 12 }],
      ]);

      expect(text.transform([{ i: "x", p: 10 }], [{ d: "a", p: 11 }], "left")).toEqual([
        { i: "x", p: 10 },
      ]);
      expect(text.transform([{ i: "x", p: 10 }], [{ d: "a", p: 10 }], "left")).toEqual([
        { i: "x", p: 10 },
      ]);
      expect(text.transform([{ i: "x", p: 10 }], [{ d: "a", p: 10 }], "right")).toEqual([
        { i: "x", p: 10 },
      ]);
    });

    it("deletes", () => {
      // @ts-expect-error private
      expect(text.transformX([{ d: "abc", p: 10 }], [{ d: "xy", p: 4 }])).toEqual([
        [{ d: "abc", p: 8 }],
        [{ d: "xy", p: 4 }],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ d: "abc", p: 10 }], [{ d: "b", p: 11 }])).toEqual([
        [{ d: "ac", p: 10 }],
        [],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ d: "b", p: 11 }], [{ d: "abc", p: 10 }])).toEqual([
        [],
        [{ d: "ac", p: 10 }],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ d: "abc", p: 10 }], [{ d: "bc", p: 11 }])).toEqual([
        [{ d: "a", p: 10 }],
        [],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ d: "abc", p: 10 }], [{ d: "ab", p: 10 }])).toEqual([
        [{ d: "c", p: 10 }],
        [],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ d: "abc", p: 10 }], [{ d: "bcd", p: 11 }])).toEqual([
        [{ d: "a", p: 10 }],
        [{ d: "d", p: 10 }],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ d: "bcd", p: 11 }], [{ d: "abc", p: 10 }])).toEqual([
        [{ d: "d", p: 10 }],
        [{ d: "a", p: 10 }],
      ]);
      // @ts-expect-error private
      expect(text.transformX([{ d: "abc", p: 10 }], [{ d: "xy", p: 13 }])).toEqual([
        [{ d: "abc", p: 10 }],
        [{ d: "xy", p: 10 }],
      ]);
    });
  });

  describe("transformCursor", () => {
    it("is sane", () => {
      expect(text.transformCursor(0, [], "right")).toEqual(0);
      expect(text.transformCursor(0, [], "left")).toEqual(0);
      expect(text.transformCursor(100, [])).toEqual(100);
    });

    it("works vs insert", () => {
      expect(text.transformCursor(0, [{ i: "asdf", p: 100 }], "right")).toEqual(0);
      expect(text.transformCursor(0, [{ i: "asdf", p: 100 }], "left")).toEqual(0);

      expect(text.transformCursor(200, [{ i: "asdf", p: 100 }], "right")).toEqual(204);
      expect(text.transformCursor(200, [{ i: "asdf", p: 100 }], "left")).toEqual(204);

      expect(text.transformCursor(100, [{ i: "asdf", p: 100 }], "right")).toEqual(104);
      expect(text.transformCursor(100, [{ i: "asdf", p: 100 }], "left")).toEqual(100);
    });

    it("works vs delete", () => {
      expect(text.transformCursor(0, [{ d: "asdf", p: 100 }], "right")).toEqual(0);
      expect(text.transformCursor(0, [{ d: "asdf", p: 100 }], "left")).toEqual(0);
      expect(text.transformCursor(0, [{ d: "asdf", p: 100 }])).toEqual(0);

      expect(text.transformCursor(200, [{ d: "asdf", p: 100 }])).toEqual(196);

      expect(text.transformCursor(100, [{ d: "asdf", p: 100 }])).toEqual(100);
      expect(text.transformCursor(102, [{ d: "asdf", p: 100 }])).toEqual(100);
      expect(text.transformCursor(104, [{ d: "asdf", p: 100 }])).toEqual(100);
      expect(text.transformCursor(105, [{ d: "asdf", p: 100 }])).toEqual(101);
    });
  });

  describe("normalize", () => {
    it("is sane", () => {
      const testUnchanged = (op: TextOp[]) => expect(text.normalize(op)).toEqual(op);
      testUnchanged([]);
      testUnchanged([{ i: "asdf", p: 100 }]);
      testUnchanged([
        { i: "asdf", p: 100 },
        { d: "fdsa", p: 123 },
      ]);
    });

    it("adds missing p:0", () => {
      // @ts-expect-error non-p
      expect(text.normalize([{ i: "abc" }])).toEqual([{ i: "abc", p: 0 }]);
      // @ts-expect-error non-p
      expect(text.normalize([{ d: "abc" }])).toEqual([{ d: "abc", p: 0 }]);
      // @ts-expect-error non-p
      expect(text.normalize([{ i: "abc" }, { d: "abc" }])).toEqual([
        { i: "abc", p: 0 },
        { d: "abc", p: 0 },
      ]);
    });

    it("converts op to an array", () => {
      expect(text.normalize({ i: "abc", p: 0 })).toEqual([{ i: "abc", p: 0 }]);
      expect(text.normalize({ d: "abc", p: 0 })).toEqual([{ d: "abc", p: 0 }]);
    });

    it("works with a really simple op", () => {
      // @ts-expect-error non-p
      expect(text.normalize({ i: "abc" })).toEqual([{ i: "abc", p: 0 }]);
    });

    it("compress inserts", () => {
      expect(
        text.normalize([
          { i: "abc", p: 10 },
          { i: "xyz", p: 10 },
        ])
      ).toEqual([{ i: "xyzabc", p: 10 }]);
      expect(
        text.normalize([
          { i: "abc", p: 10 },
          { i: "xyz", p: 11 },
        ])
      ).toEqual([{ i: "axyzbc", p: 10 }]);
      expect(
        text.normalize([
          { i: "abc", p: 10 },
          { i: "xyz", p: 13 },
        ])
      ).toEqual([{ i: "abcxyz", p: 10 }]);
    });

    it("doesnt compress separate inserts", () => {
      const t = (op: TextOp[]) => expect(text.normalize(op)).toEqual(op);
      t([
        { i: "abc", p: 10 },
        { i: "xyz", p: 9 },
      ]);
      t([
        { i: "abc", p: 10 },
        { i: "xyz", p: 14 },
      ]);
    });

    it("compress deletes", () => {
      expect(
        text.normalize([
          { d: "abc", p: 10 },
          { d: "xy", p: 8 },
        ])
      ).toEqual([{ d: "xyabc", p: 8 }]);
      expect(
        text.normalize([
          { d: "abc", p: 10 },
          { d: "xy", p: 9 },
        ])
      ).toEqual([{ d: "xabcy", p: 9 }]);
      expect(
        text.normalize([
          { d: "abc", p: 10 },
          { d: "xy", p: 10 },
        ])
      ).toEqual([{ d: "abcxy", p: 10 }]);
    });

    it("doesnt compress separate deletes", () => {
      const t = (op: TextOp[]) => expect(text.normalize(op)).toEqual(op);
      t([
        { d: "abc", p: 10 },
        { d: "xyz", p: 6 },
      ]);
      t([
        { d: "abc", p: 10 },
        { d: "xyz", p: 11 },
      ]);
    });
  });
});
