import type { Editor, Rect, SelectionChangeEvent } from "block-kit-core";
import { EDITOR_EVENT, Point, Range } from "block-kit-core";
import { Delta, deltaToText } from "block-kit-delta";
import { Bind, KEY_CODE } from "block-kit-utils";
import ReactDOM from "react-dom";

import { getMountDOM } from "../../shared/utils/dom";
import { isKeyCode } from "../../shared/utils/is";
import { Suggest } from "../view/suggest";

export class SuggestModule {
  protected point: Point;
  protected rect: Rect | null;
  protected isMountSuggest: boolean;
  protected mountSuggestNode: HTMLElement | null;

  constructor(protected editor: Editor) {
    this.rect = null;
    this.isMountSuggest = false;
    this.mountSuggestNode = null;
    this.point = new Point(0, 0);
    editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeydown, 101);
  }

  public destroy(): void {
    this.mountSuggestNode && this.mountSuggestNode.remove();
    this.mountSuggestNode = null;
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  @Bind
  protected onKeydown(event: KeyboardEvent): void {
    if (!isKeyCode(event, KEY_CODE.D2) || !event.shiftKey) return void 0;
    const sel = this.editor.selection.get();
    const rect = sel && this.editor.rect.getCaretRect();
    if (!rect || !sel) return void 0;
    this.rect = rect;
    this.point = sel.start.clone();
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  @Bind
  protected onSelectionChange(event: SelectionChangeEvent): void {
    const { current } = event;
    if (
      !current ||
      !current.isCollapsed ||
      current.start.line !== this.point.line ||
      current.start.offset <= this.point.offset
    ) {
      this.unmountSuggestPanel();
      this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
      return void 0;
    }
    const ops = this.editor.collect.getFragment(new Range(this.point, current.start));
    if (!ops) return void 0;
    const text = deltaToText(new Delta(ops));
    this.mountSuggestPanel(text.slice(1));
  }

  protected mountSuggestPanel(text: string = "") {
    if (!this.rect) return void 0;
    if (!this.mountSuggestNode) {
      this.mountSuggestNode = document.createElement("div");
      this.mountSuggestNode.dataset.type = "mention";
      getMountDOM(this.editor).appendChild(this.mountSuggestNode);
    }
    const top = this.rect.top;
    const left = this.rect.left;
    const dom = this.mountSuggestNode!;
    this.isMountSuggest = true;
    ReactDOM.render(<Suggest top={top} left={left} text={text} editor={this.editor} />, dom);
  }

  protected unmountSuggestPanel() {
    if (this.isMountSuggest && this.mountSuggestNode) {
      ReactDOM.unmountComponentAtNode(this.mountSuggestNode);
    }
    this.mountSuggestNode && this.mountSuggestNode.remove();
    this.mountSuggestNode = null;
    this.isMountSuggest = false;
  }
}
