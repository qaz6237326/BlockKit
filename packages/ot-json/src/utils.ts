export const SIDE = {
  LEFT: "left",
  RIGHT: "right",
} as const;

export const clone = <T>(o: T): T => {
  return JSON.parse(JSON.stringify(o));
};
