import { Editor, LOG_LEVEL } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { BlockKit, Editable } from "@block-kit/react";
import { EmbedPlugin } from "@block-kit/variable";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";

import { INIT_DELTA } from "./constant";
import { schema } from "./schema";

const App: FC = () => {
  const [readonly] = useState(false);
  const editor = useMemo(() => {
    const instance = new Editor({ delta: INIT_DELTA, logLevel: LOG_LEVEL.DEBUG, schema });
    instance.plugin.register(new EmbedPlugin(instance));
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
