import type { BlockState, Editor } from "@block-kit/core";
import type { LineState } from "@block-kit/core";
import {
  BLOCK_ID_KEY,
  BLOCK_KEY,
  EDITOR_EVENT,
  EDITOR_STATE,
  isEmptyLine,
  PLACEHOLDER_KEY,
} from "@block-kit/core";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { FC } from "react";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { EDITOR_TO_WRAP_LINE_KEYS, EDITOR_TO_WRAP_LINE_PLUGINS } from "../plugin/modules/wrap";
import type { ReactWrapLineContext } from "../plugin/types";
import { JSX_TO_STATE } from "../utils/weak-map";
import { getWrapSymbol } from "../utils/wrapper-node";
import { LineModel } from "./line";

/**
 * Block Model
 * @param props
 */
const BlockView: FC<{
  editor: Editor;
  state: BlockState;
  placeholder?: React.ReactNode;
}> = props => {
  const { editor, state } = props;
  const flushing = useRef(false);
  const [lines, setLines] = useState(() => state.getLines());

  /**
   * 设置行 DOM 节点
   */
  const setModel = (ref: HTMLDivElement | null) => {
    if (ref) {
      editor.model.setBlockModel(ref, state);
    }
  };

  /**
   * 数据同步变更, 异步批量绘制变更
   */
  const onContentChange = useMemoFn(() => {
    // 举个例子: 同步等待刷新的队列 => ||||||||
    // 进入更新行为后, 异步行为等待, 同步的队列由于 !flushing 全部被守卫
    // 主线程执行完毕后, 异步队列开始执行, 此时拿到的是最新数据, 以此批量重新渲染
    if (flushing.current) return void 0;
    flushing.current = true;
    Promise.resolve().then(() => {
      flushing.current = false;
      setLines(state.getLines());
      editor.state.set(EDITOR_STATE.PAINTING, true);
    });
  });

  /**
   * 监听内容变更事件, 更新当前块视图
   */
  useLayoutEffect(() => {
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [editor.event, onContentChange]);

  /**
   * 视图更新需要重新设置选区 无依赖数组
   */
  useLayoutEffect(() => {
    const selection = editor.selection.get();
    if (
      !editor.state.get(EDITOR_STATE.COMPOSING) &&
      editor.state.get(EDITOR_STATE.FOCUS) &&
      selection
    ) {
      // 更新浏览器选区
      editor.logger.debug("UpdateDOMSelection");
      editor.selection.updateDOMSelection(true);
    }
  });

  /**
   * 视图更新需要触发视图绘制完成事件 无依赖数组
   * state  -> parent -> node -> child ->|
   * effect <- parent <- node <- child <-|
   */
  useEffect(() => {
    editor.logger.debug("OnPaint");
    editor.state.set(EDITOR_STATE.PAINTING, false);
    Promise.resolve().then(() => {
      editor.event.trigger(EDITOR_EVENT.PAINT, {});
    });
  });

  /**
   * 处理行节点
   */
  const elements = useMemo(() => {
    // 开发模式严格检查数据准确性
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      for (const line of lines) {
        if (line.length < 0 || line.size < 0 || line.index < 0 || line.start < 0 || !line.key) {
          throw new Error("LineState index, size, start or length is not set");
        }
      }
    }
    return lines.map((line, index) => {
      const node = (
        <LineModel key={line.key} editor={editor} lineState={line} index={index}></LineModel>
      );
      JSX_TO_STATE.set(node, line);
      return node;
    });
  }, [editor, lines]);

  /**
   * 将行节点包装组合 O(N)
   */
  const children = useMemo(() => {
    const wrapped: JSX.Element[] = [];
    const keys = EDITOR_TO_WRAP_LINE_KEYS.get(editor);
    const plugins = EDITOR_TO_WRAP_LINE_PLUGINS.get(editor);
    if (!keys || !plugins) return elements;
    const len = elements.length;
    for (let i = 0; i < len; ++i) {
      const element = elements[i];
      const symbol = getWrapSymbol(keys, element);
      const line = JSX_TO_STATE.get(element) as LineState;
      if (!element || !line || !symbol) {
        wrapped.push(element);
        continue;
      }
      // 执行到此处说明需要包装相关节点(即使仅单个节点)
      const nodes: JSX.Element[] = [element];
      for (let k = i + 1; k < len; ++k) {
        const next = elements[k];
        const nextSymbol = getWrapSymbol(keys, next);
        if (!next || !nextSymbol || nextSymbol !== symbol) {
          // 回退到上一个值, 以便下次循环时重新检查
          i = k - 1;
          break;
        }
        nodes.push(next);
        i = k;
      }
      // 通过插件渲染包装节点
      let wrapper: React.ReactNode = nodes;
      const op = line.op;
      for (const plugin of plugins) {
        // 这里的状态以首个节点为准
        const context: ReactWrapLineContext = {
          lineState: line,
          children: wrapper,
        };
        if (plugin.match(line.op.attributes || {}, op) && plugin.wrapLine) {
          wrapper = plugin.wrapLine(context);
        }
      }
      const key = `${i - nodes.length + 1}-${i}`;
      wrapped.push(<React.Fragment key={key}>{wrapper}</React.Fragment>);
    }
    return wrapped;
  }, [editor, elements]);

  return (
    <div {...{ [BLOCK_KEY]: true, [BLOCK_ID_KEY]: state.key }} ref={setModel}>
      {props.placeholder && lines.length === 1 && isEmptyLine(lines[0], true) && (
        <div
          {...{ [PLACEHOLDER_KEY]: true }}
          style={{
            position: "absolute",
            opacity: "0.3",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {props.placeholder}
        </div>
      )}
      {children}
    </div>
  );
};

export const BlockModel = React.memo(BlockView);
