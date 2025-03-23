export const PLUGIN_EVENTS = {
  SHORTCUT_MARKS_CHANGE: "SHORTCUT_MARKS_CHANGE",
} as const;

declare module "block-kit-utils/dist/es/event-bus" {
  interface EventBusType {
    [PLUGIN_EVENTS.SHORTCUT_MARKS_CHANGE]: null;
  }
}
