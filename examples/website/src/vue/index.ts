import "../react/styles/index.scss";

import { Editor, LOG_LEVEL } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { BlockKit, Editable } from "@block-kit/vue";
import { computed, createApp, defineComponent, h, onMounted, ref } from "vue";

import { INIT } from "../react/config/block";
import { SCHEMA } from "../react/config/schema";

const App = defineComponent({
  name: "App",
  setup() {
    const readonly = ref(false);
    const editor = computed(() => {
      const instance = new Editor({ schema: SCHEMA, delta: INIT, logLevel: LOG_LEVEL.DEBUG });
      return instance;
    });

    onMounted(() => {
      // @ts-expect-error 仅调试用
      window.editor = editor.value;
      // @ts-expect-error 仅调试用
      window.Delta = Delta;
    });

    return () =>
      h(
        BlockKit,
        {
          editor: editor.value,
          readonly: readonly.value,
        },
        {
          default: () => {
            return h("div", { class: "block-kit-editable-container" }, [
              h("div", { class: "block-kit-mount-dom" }),
              h(Editable, {
                placeholder: "Please Enter...",
                autoFocus: true,
                class: "block-kit-editable",
              }),
            ]);
          },
        }
      );
  },
});

createApp(App).mount("#root");
