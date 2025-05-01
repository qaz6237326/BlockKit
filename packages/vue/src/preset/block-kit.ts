import type { Editor } from "@block-kit/core";
import { EDITOR_STATE } from "@block-kit/core";
import type { VNode } from "vue";
import { defineComponent, provide, watchEffect } from "vue";

import { BlockKitContext } from "../hooks/use-editor";
import { ReadonlyContext } from "../hooks/use-readonly";

export type BlockKitProps = {
  editor: Editor;
  readonly?: boolean;
  children: VNode;
};

export const BlockKit = /*#__PURE__*/ defineComponent<BlockKitProps>({
  name: "BlockKit",
  props: ["editor", "readonly", "children"],
  setup: props => {
    watchEffect(() => {
      if (props.editor.state.get(EDITOR_STATE.READONLY) !== props.readonly) {
        props.editor.state.set(EDITOR_STATE.READONLY, props.readonly || false);
      }
    });

    provide(BlockKitContext, props.editor);
    provide(ReadonlyContext, !!props.readonly);

    return () => props.children;
  },
});
