import "../styles/suggest.scss";

import type { Editor } from "block-kit-core";
import { preventNativeEvent } from "block-kit-utils";
import type { FC } from "react";

export const Suggest: FC<{
  top: number;
  left: number;
  text: string;
  editor: Editor;
}> = props => {
  return (
    <div
      className="block-kit-suggest-panel"
      style={{ top: props.top, left: props.left }}
      onMouseDown={preventNativeEvent}
    >
      {props.text}
    </div>
  );
};
