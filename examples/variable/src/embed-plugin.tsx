import type { LeafState } from "@block-kit/core";
import type { Editor } from "@block-kit/core";
import { RawRange } from "@block-kit/core";
import type { AttributeMap } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import type { ReactLeafContext } from "@block-kit/react";
import { EditorPlugin, Embed } from "@block-kit/react";

import { VARIABLE_KEY, VARS_PLACEHOLDER_KEY, VARS_VALUE_KEY } from "./constant";
import { EditableText } from "./editable-text";

export class EmbedPlugin extends EditorPlugin {
  public key = VARIABLE_KEY;

  constructor(protected editor: Editor) {
    super();
  }

  public destroy(): void {
    // No operation needed for destroy
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[VARIABLE_KEY];
  }

  public onTextChange(leaf: LeafState, v: string) {
    const range = leaf.toRange();
    const rawRange = RawRange.fromRange(this.editor, range);
    if (!rawRange) return void 0;
    const delta = new Delta().retain(rawRange.start).retain(rawRange.len, {
      [VARIABLE_KEY]: v,
    });
    this.editor.state.apply(delta, { autoCaret: false });
  }

  public renderLeaf(context: ReactLeafContext): React.ReactNode {
    const { attributes: attrs = {} } = context;
    return (
      <Embed context={context}>
        <EditableText
          value={attrs[VARS_VALUE_KEY] || ""}
          placeholder={attrs[VARS_PLACEHOLDER_KEY]}
          onChange={v => this.onTextChange(context.leafState, v)}
        ></EditableText>
      </Embed>
    );
  }
}
