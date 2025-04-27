import type { Editor, LeafState } from "@block-kit/core";
import { LEAF_KEY } from "@block-kit/core";
import { defineComponent, h } from "vue";

import { ZeroSpace } from "../preset/zero";

export type EOLModelProps = {
  editor: Editor;
  leafState: LeafState;
};

/**
 * EOL Model
 * @param props
 */
export const EOLModel = /*#__PURE__*/ defineComponent<EOLModelProps>(props => {
  const { editor, leafState } = props;

  const setModel = (dom: HTMLSpanElement | null) => {
    if (dom) {
      editor.model.setLeafModel(dom, leafState);
    }
  };

  return () =>
    h(
      "span",
      {
        ref: el => setModel(el as HTMLSpanElement),
        [LEAF_KEY]: true,
      },
      [h(ZeroSpace, { enter: true })]
    );
});
