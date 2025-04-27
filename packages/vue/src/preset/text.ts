import { LEAF_STRING } from "@block-kit/core";
import { isDOMText } from "@block-kit/utils";
import { defineComponent, h } from "vue";

export type TextProps = {
  text: string;
};

/**
 * 文本节点
 * @param props
 */
export const ZeroSpace = /*#__PURE__*/ defineComponent<TextProps>((props, { expose }) => {
  const onRef = (dom: HTMLSpanElement | null) => {
    // 处理外部引用的 ref
    expose({ el: dom });
    // COMPAT: 避免 React 非受控与 IME 造成的 DOM 内容问题
    if (!dom || props.text === dom.textContent) return void 0;
    const nodes = dom.childNodes;
    // If the text content is inconsistent due to the modification of the input
    // it needs to be corrected
    for (let i = 1; i < nodes.length; ++i) {
      const node = nodes[i];
      node && node.remove();
    }
    // Guaranteed to have only one text child
    if (isDOMText(dom.firstChild)) {
      dom.firstChild.nodeValue = props.text;
    }
  };

  return () =>
    h(
      "span",
      {
        ref: el => onRef(el as HTMLSpanElement),
        [LEAF_STRING]: true,
      },
      props.text
    );
});
