import { createApp, defineComponent, h } from "vue";

const App = defineComponent({
  name: "App",
  setup() {
    return () => h("div", undefined, "123");
  },
});

createApp(App).mount("#root");
