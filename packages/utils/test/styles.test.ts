import { cs, cx, Styles } from "../src/styles";

describe("styles", () => {
  it("cs", () => {
    expect(cs("a", "b", "c")).toBe("a b c");
    expect(cs("a", undefined, "c")).toBe("a c");
    expect(cs("a", { b: true }, "c")).toBe("a c");
  });

  it("cx", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
    expect(cx("a", null, "c")).toBe("a c");
    expect(cx("a", undefined, "c")).toBe("a c");
    expect(cx("a", { b: true, c: false })).toBe("a b");
    expect(cx("a", { b: true, c: true })).toBe("a b c");
    expect(cx("a", { b: false, c: false })).toBe("a");
  });

  it("pixelate", () => {
    expect(Styles.pixelate("0px")).toBe("0px");
    expect(Styles.pixelate("1px")).toBe("1px");
    expect(Styles.pixelate("1%")).toBe(null);
    expect(Styles.pixelate("1")).toBe("1px");
    expect(Styles.pixelate("a")).toBe(null);
    expect(Styles.pixelate("")).toBe(null);
    expect(Styles.pixelate(0)).toBe("0px");
    expect(Styles.pixelate(null)).toBe(null);
  });

  it("digitize", () => {
    expect(Styles.digitize("0px")).toBe(0);
    expect(Styles.digitize("1px")).toBe(1);
    expect(Styles.digitize("1%")).toBe(0.01);
    expect(Styles.digitize("1")).toBe(1);
    expect(Styles.digitize("a")).toBe(null);
    expect(Styles.digitize("")).toBe(null);
    expect(Styles.digitize(null)).toBe(null);
  });
});
