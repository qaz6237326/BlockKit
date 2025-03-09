import type { Editor } from "../../editor";
import { getLeafNode, getLineNode } from "../../model/utils/dom";
import { Point } from "../modules/point";
import { Range } from "../modules/range";
import type { DOMPoint } from "../types";
import { isEmbedZeroNode, isEnterZeroNode, isVoidZeroNode } from "./dom";
import { normalizeDOMPoint } from "./native";

/**
 * 将 DOMPoint 转换为 ModelPoint
 * @param editor
 * @param domPoint
 */
export const toModelPoint = (
  editor: Editor,
  domPoint: DOMPoint,
  isCollapsed?: boolean,
  isEndNode?: boolean
) => {
  const { offset, node } = domPoint;

  const leafNode = getLeafNode(node);
  let lineIndex = 0;
  let leafOffset = 0;

  const lineNode = getLineNode(leafNode);
  const lineModel = editor.model.getLineState(lineNode);
  // COMPAT: 在没有 LineModel 的情况, 选区会置于 BlockState 最前
  if (lineModel) {
    lineIndex = lineModel.index;
  }

  const leafModel = editor.model.getLeafState(leafNode);
  // COMPAT: 在没有 LeafModel 的情况, 选区会置于 Line 最前
  if (leafModel) {
    leafOffset = leafModel.offset + offset;
  }

  // COMPAT: 此处开始根据 case 修正 zero/void offset [节点级别]
  // Case 1: 当前节点为 data-zero-enter 时, 需要将其修正为前节点末尾
  // content\n[caret] => content[caret]\n
  const isEnterZero = isEnterZeroNode(node);
  if (isEnterZero && offset) {
    leafOffset = Math.max(leafOffset - 1, 0);
    return new Point(lineIndex, leafOffset);
  }
  // Case 2: 光标位于 data-zero-void 节点前时, 需要将其修正为节点末
  // 若不修正则会导致选区位置问题, 一些诸如删除之类的操作会失效
  // [[caret]void]\n => [void[caret]]\n
  // Case 3: 光标位于 data-zero-void 节点后其他位置时, 修正为节点末
  // 唤起 IME 输入时会导致原本零宽字符出现过多文本, 导致选区映射问题
  // [ xxx[caret]]\n => [ [caret]xxx]\n
  const isVoidZero = isVoidZeroNode(node);
  if (isVoidZero && offset !== 1) {
    return new Point(lineIndex, 1);
  }
  // Case 4: 光标位于 data-zero-embed 节点后时, 需要将其修正为节点前
  // 若不校正会携带 DOM-Point CASE1 的零选区位置, 按下左键无法正常移动光标
  // [embed[caret]]\n => [[caret]embed]\n
  const isEmbedZero = isEmbedZeroNode(node);
  if (isEmbedZero && offset) {
    // 非折叠选区时会在减少 1 的偏移的问题, 需要判断折叠与末尾节点
    // 这里必须在 offset 存在值再判断, 否则会导致连续的 Embed 选区向后扩展
    if (!isCollapsed && isEndNode) {
      return new Point(lineIndex, leafOffset);
    }
    return new Point(lineIndex, leafOffset - 1);
  }
  // Case 5: 光标在 Embed 节点内时, 光标可能会在其内部文本上
  // 若不校正会导致选区越界, 会导致拖拽选区时出现偏移问题
  // [embed[caret > 1]] => [embed[caret = 1]]
  if (leafModel && leafModel.embed && offset > 1) {
    return new Point(lineIndex, leafOffset - offset);
  }
  return new Point(lineIndex, leafOffset);
};

/**
 * 将 DOMStaticRange 转换为 ModelRange
 * @param editor
 * @param staticSel
 * @param isBackward
 */
export const toModelRange = (editor: Editor, staticSel: StaticRange, isBackward: boolean) => {
  const { startContainer, endContainer, collapsed, startOffset, endOffset } = staticSel;
  let startRangePoint: Point;
  let endRangePoint: Point;
  // ModelRange 必然是 Start -> End, 无需根据 Backward 修正
  if (!collapsed) {
    const startPoint = { node: startContainer, offset: startOffset };
    const endPoint = { node: endContainer, offset: endOffset };
    const startDOMPoint = normalizeDOMPoint(startPoint);
    const endDOMPoint = normalizeDOMPoint(endPoint, false, true);
    startRangePoint = toModelPoint(editor, startDOMPoint);
    endRangePoint = toModelPoint(editor, endDOMPoint, false, true);
  } else {
    const anchorDOMPoint = normalizeDOMPoint({
      node: startContainer,
      offset: startOffset,
    });
    startRangePoint = toModelPoint(editor, anchorDOMPoint);
    endRangePoint = startRangePoint.clone();
  }
  // FIX: 修正选区折叠状态, 以 Range 的值计算为准
  return new Range(startRangePoint, endRangePoint, isBackward);
};
