import "./index.scss";
import "@block-kit/variable/dist/style/index.css";
import "@arco-design/web-react/es/style/index.less";

import { IconArrowUp } from "@arco-design/web-react/icon";
import { Editor, LOG_LEVEL } from "@block-kit/variable";
import { Delta } from "@block-kit/variable";
import { BlockKit, Editable } from "@block-kit/variable";
import { EmbedTextPlugin } from "@block-kit/variable";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";

import { init, schema } from "./constant";

const App: FC = () => {
  const [readonly] = useState(false);
  const editor = useMemo(() => {
    const instance = new Editor({ schema, delta: init, logLevel: LOG_LEVEL.DEBUG });
    instance.plugin.register(new EmbedTextPlugin(instance));
    return instance;
  }, []);

  useEffect(() => {
    // @ts-expect-error editor
    window.editor = editor;
    // @ts-expect-error BlockDelta
    window.Delta = Delta;
  }, [editor]);

  return (
    <div className="vars-input-container-wrapper">
      <div className="vars-input-title">变量模版输入框</div>
      <div className="vars-input-container">
        <BlockKit editor={editor} readonly={readonly}>
          <Editable className="block-kit-editable" placeholder="描述你要创作的内容..."></Editable>
        </BlockKit>
        <div className="vars-input-footer">
          <div className="vars-input-send">
            <IconArrowUp />
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
