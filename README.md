# BlockKit

<p>
<a href="https://github.com/WindRunnerMax/BlockKit">GitHub</a>
<span>｜</span>
<a href="https://windrunnermax.github.io/BlockKit/">DEMO</a>
<span>｜</span>
<a href="./NOTE.md">NOTE</a>
<span>｜</span>
<a href="https://github.com/WindRunnerMax/BlockKit/issues/1">BLOG</a>
</p>

从零实现的富文本编辑器 `WYSIWYG Editor` 

## Why?

纸上得来终觉浅，绝知此事要躬行。

最初，希望基于 [Quill](https://github.com/slab/quill) 实现块结构组织的编辑器，却被跨行的选区问题所困扰。

后来，希望基于 [Embed Blot](https://github.com/slab/parchment) 设计插件实现块结构的嵌套，却被复杂交互所需要的视图层实现掣肘。

最终，希望能以 [Quill](https://github.com/slab/quill)、[Slate](https://github.com/ianstormtaylor/slate)、[EtherPad](https://github.com/ether/etherpad-lite) 的核心理念为参考，从零实现富文本编辑器，以便能够解决相关的问题，并且将一些想法付诸实现：

- 现有编辑器引擎通常具有完整的`API`文档，却鲜有开发过程中的问题记录。因此希望能够将开发过程中的问题都记录下来，用以解决两个问题：为什么要这么设计、这种设计方案有什么优劣。

- 嵌套的数据结构能够更好地对齐`DOM`表达，然而这样对于数据的操作却变得更加复杂。扁平的数据结构且独立分包设计，无论是在编辑器中操作，还是在服务端数据解析，都可以更加方便地处理。

- 多数编辑器实现了自己的视图层，而重新设计视图层需要面临渲染问题，无法复用组件生态且存在新的学习成本。因此需要实现可扩展视图层的核心模式，在编辑器的设计上可以支持多种视图层的接入实现。

- 无论是`OT`还是`CRDT`协同调度都不是简单的问题，编辑器内部的数据设计可能无法用于实时协同编辑。因此协同设计必须要从底层数据结构出发，在编辑器模块实现细节设计，整体方案上都需要考虑数据一致性。

- 编辑器的模块可能是硬编码的，不容易对格式进行自定义。因此明确核心界限与插件优先架构的架构非常重要，核心实现和自定义模块之间的界限需要更加清晰，这就意味着任何富文本格式都应该通过插件的方式来实现。

## Npm
可以直接引入相关包来实现快速构建富文本编辑器，编辑器本身也实现了插件化设计以支持扩展，参考如下示例:

- [Website](./examples/website): 编辑器部署的在线演示项目。
- [Scenario](./examples/common): 常见的编辑应用场景与解决方案。
- [Variables](./examples/variable/): 基于可编辑变量实现的模板输入框。
- [Streaming](./examples/stream/): 流式`Md`增量富文本解析算法实现。
- [CanvasEditor](https://github.com/WindRunnerMax/CanvasEditor): 基于`Canvas`实现的简历编辑器。

```bash
npm install -g pnpm
pnpm add -E @block-kit/core @block-kit/delta @block-kit/utils # 控制器 / 数据结构 / 工具库 
pnpm add -E @block-kit/react @block-kit/plugin # React 适配器 / 插件集合
```

# 注意
可能提示需要添加 -w 参数
```bash
npm install -g pnpm   
pnpm add -E @block-kit/core @block-kit/delta @block-kit/utils -w
pnpm add -E @block-kit/react @block-kit/plugin -w

pnpm run dev
```
## 运行可能报错

/examples/website/rspack.config.ts
该文件可能会提示__dirname is undefined

添加代码
```javascript
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```
再次 pnpm run dev

## 安装和运行过程
```bash
PS F:\work_product\gits\BlockKit> npm install -g pnpm

changed 1 package in 4s

1 package is looking for funding
  run `npm fund` for details
PS F:\work_product\gits\BlockKit> pnpm add -E @block-kit/core @block-kit/delta @block-kit/utils
 ERR_PNPM_ADDING_TO_ROOT  Running this command will add the dependency to the workspace root, which might not be what you want - if you really meant it, make it explicit by running this command again with the -w flag (or --workspace-root). 
PS F:\work_product\gits\BlockKit> pnpm add -E @block-kit/core @block-kit/delta @block-kit/utils -w
 WARN  deprecated eslint@7.11.0: This version is no longer supported. Please see https://eslint.org/version-support for 
other options.
 WARN  deprecated @rspack/plugin-html@0.5.8: deprecated
 WARN  32 deprecated subdependencies found: @babel/plugin-proposal-async-generator-functions@7.20.7, @babel/plugin-proposal-class-properties@7.18.6, @babel/plugin-proposal-class-static-block@7.21.0, @babel/plugin-proposal-dynamic-import@7.18.6, @babel/plugin-proposal-export-namespace-from@7.18.9, @babel/plugin-proposal-json-strings@7.18.6, @babel/plugin-proposal-logical-assignment-operators@7.20.7, @babel/plugin-proposal-nullish-coalescing-operator@7.18.6, @babel/plugin-proposal-numeric-separator@7.18.6, @babel/plugin-proposal-object-rest-spread@7.20.7, @babel/plugin-proposal-optional-catch-binding@7.18.6, @babel/plugin-proposal-optional-chaining@7.21.0, @babel/plugin-proposal-private-methods@7.18.6, @babel/plugin-proposal-private-property-in-object@7.21.11, @babel/plugin-proposal-unicode-property-regex@7.18.6, abab@2.0.6, acorn-import-assertions@1.9.0, copy-concurrently@1.0.5, domexception@4.0.0, figgy-pudding@3.5.2, fs-write-stream-atomic@1.0.10, glob@7.2.3, inflight@1.0.6, lodash.isequal@4.5.0, lodash.template@4.5.0, move-concurrently@1.0.1, rimraf@2.6.3, rimraf@2.7.1, rimraf@3.0.2, sourcemap-codec@1.4.8, stable@0.1.8, uuid@3.4.0
Progress: resolved 1397, reused 0, downloaded 0, added 0, done
 WARN  Issues with peer dependencies found
.
└─┬ stylelint-config-sass-guidelines 9.0.1
  └─┬ postcss-scss 4.0.9
    └── ✕ unmet peer postcss@^8.4.29: found 8.3.3

dependencies:
+ @block-kit/core 1.0.16
+ @block-kit/delta 1.0.16
+ @block-kit/utils 1.0.16

Packages: +527
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
Done in 13.5s using pnpm v10.19.0
PS F:\work_product\gits\BlockKit> pnpm add -E @block-kit/react @block-kit/plugin
 ERR_PNPM_ADDING_TO_ROOT  Running this command will add the dependency to the workspace root, which might not be what yoIf you don't want to see this warning anymore, you may set the ignore-workspace-root-check setting to true.
PS F:\work_product\gits\BlockKit> pnpm add -E @block-kit/react @block-kit/plugin -w
 WARN  deprecated eslint@7.11.0: This version is no longer supported. Please see https://eslint.org/version-support for 
other options.
examples/website                         |  WARN  deprecated @rspack/plugin-html@0.2.5
 WARN  deprecated @rspack/plugin-html@0.5.8: deprecated
 WARN  32 deprecated subdependencies found: @babel/plugin-proposal-async-generator-functions@7.20.7, @babel/plugin-proposal-class-properties@7.18.6, @babel/plugin-proposal-class-static-block@7.21.0, @babel/plugin-proposal-dynamic-import@7.18.6, @babel/plugin-proposal-export-namespace-from@7.18.9, @babel/plugin-proposal-json-strings@7.18.6, @babel/plugin-proposal-logical-assignment-operators@7.20.7, @babel/plugin-proposal-nullish-coalescing-operator@7.18.6, @babel/plugin-proposal-numeric-separator@7.18.6, @babel/plugin-proposal-object-rest-spread@7.20.7, @babel/plugin-proposal-optional-catch-binding@7.18.6, @babel/plugin-proposal-optional-chaining@7.21.0, @babel/plugin-proposal-private-methods@7.18.6, @babel/plugin-proposal-private-property-in-object@7.21.11, @babel/plugin-proposal-unicode-property-regex@7.18.6, abab@2.0.6, acorn-import-assertions@1.9.0, copy-concurrently@1.0.5, domexception@4.0.0, figgy-pudding@3.5.2, fs-write-stream-atomic@1.0.10, glob@7.2.3, inflight@1.0.6, lodash.isequal@4.5.0, lodash.template@4.5.0, move-concurrently@1.0.1, rimraf@2.6.3, rimraf@2.7.1, rimraf@3.0.2, sourcemap-codec@1.4.8, stable@0.1.8, uuid@3.4.0
Progress: resolved 1399, reused 0, downloaded 0, added 0, done
 WARN  Issues with peer dependencies found
.
└─┬ stylelint-config-sass-guidelines 9.0.1
  └─┬ postcss-scss 4.0.9
    └── ✕ unmet peer postcss@^8.4.29: found 8.3.3

dependencies:
+ @block-kit/plugin 1.0.16
+ @block-kit/react 1.0.16

Packages: +35
+++++++++++++++++++++++++++++++++++
PS F:\work_product\gits\BlockKit> npm run dev

> blocks-kit@1.0.16 dev
> pnpm run --filter ./examples/website dev


> @block-kit/website@0.0.0 dev F:\work_product\gits\BlockKit\examples\website
> rspack serve --config ./rspack.config.ts

node:internal/modules/cjs/loader:1408
  throw err;
  ^

Error: Cannot find module 'F:\work_product\gits\BlockKit\examples\website\node_modules\@rspack\cli\bin\rspack'
    at Function._resolveFilename (node:internal/modules/cjs/loader:1405:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1061:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1066:22)
    at Function._load (node:internal/modules/cjs/loader:1215:37)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:151:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v23.11.1
F:\work_product\gits\BlockKit\examples\website:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @block-kit/website@0.0.0 dev: `rspack serve --config ./rspack.config.ts`
Exit status 1
PS F:\work_product\gits\BlockKit> pnpm i      
Scope: all 16 workspace projects
 WARN  deprecated eslint@7.11.0: This version is no longer supported. Please see https://eslint.org/version-support for 
other options.
 WARN  deprecated @rspack/plugin-html@0.5.8: deprecated
 WARN  32 deprecated subdependencies found: @babel/plugin-proposal-async-generator-functions@7.20.7, @babel/plugin-proposal-class-properties@7.18.6, @babel/plugin-proposal-class-static-block@7.21.0, @babel/plugin-proposal-dynamic-import@7.18.6, @babel/plugin-proposal-export-namespace-from@7.18.9, @babel/plugin-proposal-json-strings@7.18.6, @babel/plugin-proposal-logical-assignment-operators@7.20.7, @babel/plugin-proposal-nullish-coalescing-operator@7.18.6, @babel/plugin-proposal-numeric-separator@7.18.6, @babel/plugin-proposal-object-rest-spread@7.20.7, @babel/plugin-proposal-optional-catch-binding@7.18.6, @babel/plugin-proposal-optional-chaining@7.21.0, @babel/plugin-proposal-private-methods@7.18.6, @babel/plugin-proposal-private-property-in-object@7.21.11, @babel/plugin-proposal-unicode-property-regex@7.18.6, abab@2.0.6, acorn-import-assertions@1.9.0, copy-concurrently@1.0.5, domexception@4.0.0, figgy-pudding@3.5.2, fs-write-stream-atomic@1.0.10, glob@7.2.3, inflight@1.0.6, lodash.isequal@4.5.0, lodash.template@4.5.0, move-concurrently@1.0.1, rimraf@2.6.3, rimraf@2.7.1, rimraf@3.0.2, sourcemap-codec@1.4.8, stable@0.1.8, uuid@3.4.0
Packages: +829
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
Progress: resolved 1399, reused 1390, downloaded 0, added 829, done
 WARN  Issues with peer dependencies found
.
└─┬ stylelint-config-sass-guidelines 9.0.1
  └─┬ postcss-scss 4.0.9
    └── ✕ unmet peer postcss@^8.4.29: found 8.3.3

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: core-js-pure.                                                     │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯

Done in 16.3s using pnpm v10.19.0
PS F:\work_product\gits\BlockKit> pnpm run dev

> blocks-kit@1.0.16 dev F:\work_product\gits\BlockKit
> pnpm run --filter ./examples/website dev


> @block-kit/website@0.0.0 dev F:\work_product\gits\BlockKit\examples\website
> rspack serve --config ./rspack.config.ts

(node:107184) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
rspack serve

run the rspack dev server.

Options:
      --help        Show help                                          [boolean]
      --version     Show version number                                [boolean]
  -c, --config      config file                                         [string]
      --entry       entry file                                           [array]
      --mode        mode                                                [string]
      --watch       watch                             [boolean] [default: false]
      --env         env passed to config function                        [array]
      --node-env    sets process.env.NODE_ENV to be specified value     [string]
      --devtool     devtool                           [boolean] [default: false]
      --configName  Name of the configuration to use.                    [array]

ReferenceError: __dirname is not defined
    at file:///F:/work_product/gits/BlockKit/examples/website/rspack.config.ts:8:27
    at ModuleJobSync.runSync (node:internal/modules/esm/module_job:400:35)
    at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:427:47)
    at loadESMFromCJS (node:internal/modules/cjs/loader:1565:24)
      --env         env passed to config function                        [array]
      --node-env    sets process.env.NODE_ENV to be specified value     [string]
      --devtool     devtool                           [boolean] [default: false]
      --configName  Name of the configuration to use.                    [array]

ReferenceError: __dirname is not defined
    at file:///F:/work_product/gits/BlockKit/examples/website/rspack.config.ts:8:27
    at ModuleJobSync.runSync (node:internal/modules/esm/module_job:400:35)
    at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:427:47)
    at loadESMFromCJS (node:internal/modules/cjs/loader:1565:24)
      --node-env    sets process.env.NODE_ENV to be specified value     [string]
      --devtool     devtool                           [boolean] [default: false]
      --configName  Name of the configuration to use.                    [array]

ReferenceError: __dirname is not defined
    at file:///F:/work_product/gits/BlockKit/examples/website/rspack.config.ts:8:27
    at ModuleJobSync.runSync (node:internal/modules/esm/module_job:400:35)
    at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:427:47)
    at loadESMFromCJS (node:internal/modules/cjs/loader:1565:24)
      --devtool     devtool                           [boolean] [default: false]
      --configName  Name of the configuration to use.                    [array]

ReferenceError: __dirname is not defined
    at file:///F:/work_product/gits/BlockKit/examples/website/rspack.config.ts:8:27
    at ModuleJobSync.runSync (node:internal/modules/esm/module_job:400:35)
    at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:427:47)
    at loadESMFromCJS (node:internal/modules/cjs/loader:1565:24)
      --configName  Name of the configuration to use.                    [array]

ReferenceError: __dirname is not defined
    at file:///F:/work_product/gits/BlockKit/examples/website/rspack.config.ts:8:27
    at ModuleJobSync.runSync (node:internal/modules/esm/module_job:400:35)
    at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:427:47)
    at loadESMFromCJS (node:internal/modules/cjs/loader:1565:24)
    at Module._compile (node:internal/modules/cjs/loader:1716:5)
ReferenceError: __dirname is not defined
    at file:///F:/work_product/gits/BlockKit/examples/website/rspack.config.ts:8:27
    at ModuleJobSync.runSync (node:internal/modules/esm/module_job:400:35)
    at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:427:47)
    at loadESMFromCJS (node:internal/modules/cjs/loader:1565:24)
    at Module._compile (node:internal/modules/cjs/loader:1716:5)
    at Object.loadTS [as .ts] (node:internal/modules/cjs/loader:1826:10)
    at Module.load (node:internal/modules/cjs/loader:1469:32)
    at Function._load (node:internal/modules/cjs/loader:1286:12)
    at ModuleJobSync.runSync (node:internal/modules/esm/module_job:400:35)
    at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:427:47)
    at loadESMFromCJS (node:internal/modules/cjs/loader:1565:24)
    at Module._compile (node:internal/modules/cjs/loader:1716:5)
    at Object.loadTS [as .ts] (node:internal/modules/cjs/loader:1826:10)
    at Module.load (node:internal/modules/cjs/loader:1469:32)
    at Function._load (node:internal/modules/cjs/loader:1286:12)
    at Module._compile (node:internal/modules/cjs/loader:1716:5)
    at Object.loadTS [as .ts] (node:internal/modules/cjs/loader:1826:10)
    at Module.load (node:internal/modules/cjs/loader:1469:32)
    at Function._load (node:internal/modules/cjs/loader:1286:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at Object.loadTS [as .ts] (node:internal/modules/cjs/loader:1826:10)
    at Module.load (node:internal/modules/cjs/loader:1469:32)
    at Function._load (node:internal/modules/cjs/loader:1286:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Module.require (node:internal/modules/cjs/loader:1491:12)
    at require (node:internal/modules/helpers:135:16)
    at crossImport (F:\work_product\gits\BlockKit\node_modules\.pnpm\@rspack+cli@0.2.5_@types+ex_0a7306bcbfafd9b0e988f91efd05332a\node_modules\@rspack\cli\src\utils\crossImport.ts:18:16)
    at loadRspackConfig (F:\work_product\gits\BlockKit\node_modules\.pnpm\@rspack+cli@0.2.5_@types+ex_0a7306bcbfafd9b0e988f91efd05332a\node_modules\@rspack\cli\src\utils\loadConfig.ts:65:21)
    at RspackCLI.loadConfig (F:\work_product\gits\BlockKit\node_modules\.pnpm\@rspack+cli@0.2.5_@types+ex_0a7306bcbfafd9b0e988f91efd05332a\node_modules\@rspack\cli\src\rspack-cli.ts:225:44)
    at RspackCLI.createCompiler (F:\work_product\gits\BlockKit\node_modules\.pnpm\@rspack+cli@0.2.5_@types+ex_0a7306bcbfafd9b0e988f91efd05332a\node_modules\@rspack\cli\src\rspack-cli.ts:54:27)
F:\work_product\gits\BlockKit\examples\website:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @block-kit/website@0.0.0 dev: `rspack serve --config ./rspack.config.ts`
Exit status 1
 ELIFECYCLE  Command failed with exit code 1.
PS F:\work_product\gits\BlockKit> pnpm run dev

> blocks-kit@1.0.16 dev F:\work_product\gits\BlockKit
> pnpm run --filter ./examples/website dev


> @block-kit/website@0.0.0 dev F:\work_product\gits\BlockKit\examples\website
> rspack serve --config ./rspack.config.ts

(node:119244) ExperimentalWarning: Type Stripping is an experimental feature and might change at any timeme
(Use `node --trace-warnings ...` to show where the warning was created)
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:8080/
<i> [webpack-dev-server] On Your Network (IPv4): http://192.168.1.14:8080/
<i> [webpack-dev-server] On Your Network (IPv6): http://[fe80::7bb8:b850:138c:2cc1]:8080/
<i> [webpack-dev-server] Content not from webpack is served from 'F:\work_product\gits\BlockKit\examples\website\public' directory
Rspack ████████████████████████████████████████ 100% done                                                               Time: 3654ms

```

