import "@block-kit/variable/dist/style/index.css";

import { Editor, LOG_LEVEL } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { BlockKit, Editable } from "@block-kit/react";
import { EmbedTextPlugin } from "@block-kit/variable";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";

import { INIT_DELTA } from "./constant";
import { schema } from "./schema";

const App: FC = () => {
  const [readonly] = useState(false);
  const editor = useMemo(() => {
    const instance = new Editor({ schema, delta: INIT_DELTA, logLevel: LOG_LEVEL.DEBUG });
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
    <BlockKit editor={editor} readonly={readonly}>
      <Editable className="block-kit-editable"></Editable>
    </BlockKit>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
