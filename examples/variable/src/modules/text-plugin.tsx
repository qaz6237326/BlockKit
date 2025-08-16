import type { LeafState } from "@block-kit/core";
import type { Editor } from "@block-kit/core";
import {
  EDITOR_EVENT,
  getLeafNode,
  isArrowRight,
  isEmbedZeroNode,
  RawRange,
} from "@block-kit/core";
import type { AttributeMap } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import type { ReactLeafContext } from "@block-kit/react";
import { EditorPlugin, Embed } from "@block-kit/react";
import type { EventContext } from "@block-kit/utils";
import { Bind, DEFAULT_PRIORITY, isDOMText } from "@block-kit/utils";

import { EditableText } from "../components/editable-text";
import {
  DATA_EDITABLE_KEY,
  VARIABLE_KEY,
  VARS_PLACEHOLDER_KEY,
  VARS_VALUE_KEY,
} from "../utils/constant";
import type { EmbedTextOptions } from "../utils/types";

export class EmbedTextPlugin extends EditorPlugin {
  public key = VARIABLE_KEY;
  public options: EmbedTextOptions;

  constructor(protected editor: Editor, options?: EmbedTextOptions) {
    super();
    this.options = options || {};
    editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown, DEFAULT_PRIORITY - 10);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[VARIABLE_KEY];
  }

  @Bind
  public onKeyDown(event: KeyboardEvent, context: EventContext) {
    let sel: Selection | null = null;
    if (
      isArrowRight(event) &&
      (sel = getSelection()) &&
      sel.isCollapsed &&
      isEmbedZeroNode(sel.focusNode)
    ) {
      const leafNode = getLeafNode(sel.focusNode);
      const editableNode = leafNode && leafNode.querySelector(`[${DATA_EDITABLE_KEY}]`);
      if (!editableNode) return void 0;
      const targetNode = isDOMText(editableNode.firstChild)
        ? editableNode.firstChild
        : editableNode;
      sel.setBaseAndExtent(targetNode, 0, targetNode, 0);
      context.stop();
      event.preventDefault();
    }
  }

  public onTextChange(leaf: LeafState, v: string) {
    const range = leaf.toRange();
    const rawRange = RawRange.fromRange(this.editor, range);
    if (!rawRange) return void 0;
    const delta = new Delta().retain(rawRange.start).retain(rawRange.len, {
      [VARS_VALUE_KEY]: v,
    });
    this.editor.state.apply(delta, { autoCaret: false });
  }

  public renderLeaf(context: ReactLeafContext): React.ReactNode {
    const { attributes: attrs = {} } = context;
    return (
      <Embed context={context}>
        <EditableText
          className="editable-vars"
          value={attrs[VARS_VALUE_KEY] || ""}
          placeholder={attrs[VARS_PLACEHOLDER_KEY]}
          onChange={v => this.onTextChange(context.leafState, v)}
        ></EditableText>
      </Embed>
    );
  }
}
