import type { LeafState } from "@block-kit/core";
import { EDITOR_EVENT, isArrowRight } from "@block-kit/core";
import { isArrowLeft } from "@block-kit/core";
import type { AttributeMap } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import type { ReactLeafContext } from "@block-kit/react";
import { EditorPlugin, Embed } from "@block-kit/react";
import type { EventContext } from "@block-kit/utils";
import { cs } from "@block-kit/utils";
import { Bind, isDOMText } from "@block-kit/utils";

import { EditableTextInput } from "../components/editable-input";
import { DATA_EDITABLE_KEY, VARS_CLS_PREFIX, VARS_KEY, VARS_VALUE_KEY } from "../utils/constant";
import type { EditablePluginOptions as EditableInputOptions } from "../utils/types";

export class EditableInputPlugin extends EditorPlugin {
  public key = VARS_KEY;
  public options: EditableInputOptions;

  constructor(options?: EditableInputOptions) {
    super();
    this.options = options || {};
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown, 10);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[VARS_KEY];
  }

  @Bind
  public onKeyDown(event: KeyboardEvent, context: EventContext) {
    const sel = this.editor.selection.get();
    const selection = window.getSelection();
    if (!sel || !sel.isCollapsed || !selection) {
      return void 0;
    }
    if (!isArrowRight(event) && !isArrowLeft(event)) {
      return void 0;
    }
    const leaf = this.editor.lookup.getLeafAtPoint(sel.start);
    const nextLeaf = leaf && leaf.next();
    if (
      isArrowRight(event) &&
      nextLeaf &&
      nextLeaf.embed &&
      leaf &&
      sel.start.offset === leaf.offset + leaf.length &&
      nextLeaf.op.attributes &&
      nextLeaf.op.attributes[VARS_KEY]
    ) {
      const leafNode = this.editor.model.getLeafNode(nextLeaf);
      const node = leafNode && leafNode.querySelector(`[${DATA_EDITABLE_KEY}]`);
      if (!node) return void 0;
      const targetNode = isDOMText(node.firstChild) ? node.firstChild : node;
      selection.setBaseAndExtent(targetNode, 0, targetNode, 0);
      context.stop();
      event.preventDefault();
    }
    if (
      isArrowLeft(event) &&
      leaf &&
      leaf.embed &&
      leaf &&
      sel.start.offset === leaf.offset + leaf.length &&
      leaf.op.attributes &&
      leaf.op.attributes[VARS_KEY]
    ) {
      const leafNode = this.editor.model.getLeafNode(leaf);
      const node = leafNode && leafNode.querySelector(`[${DATA_EDITABLE_KEY}]`);
      if (!node) return void 0;
      const targetNode = isDOMText(node.firstChild) ? node.firstChild : node;
      const offset = isDOMText(node.firstChild) ? node.firstChild.length : 0;
      selection.setBaseAndExtent(targetNode, offset, targetNode, offset);
      context.stop();
      event.preventDefault();
    }
  }

  public onTextChange(leaf: LeafState, v: string) {
    const rawRange = leaf.toRawRange();
    if (!rawRange) return void 0;
    const delta = new Delta().retain(rawRange.start).retain(rawRange.len, {
      [VARS_VALUE_KEY]: v,
    });
    this.editor.state.apply(delta, { autoCaret: false });
  }

  public renderLeaf(context: ReactLeafContext): React.ReactNode {
    const { attributes: attrs = {} } = context;
    const varKey = attrs[VARS_KEY];
    const placeholders = this.options.placeholders || {};
    return (
      <Embed context={context}>
        <EditableTextInput
          className={cs(VARS_CLS_PREFIX, `${VARS_CLS_PREFIX}-${varKey}`)}
          value={attrs[VARS_VALUE_KEY] || ""}
          placeholder={placeholders[varKey]}
          onChange={v => this.onTextChange(context.leafState, v)}
        ></EditableTextInput>
      </Embed>
    );
  }
}
