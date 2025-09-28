> [!IMPORTANT]\
> 本库使用了2025最新的CSS特性，不适合用于生产环境。\
> This library uses the latest 2025 CSS features and is not suitable for production environments.
>
> 本库功能仍有部分功能未完成文档尚未完成。\
> This library has some features that are not finished yet.
>
> 后续将提供机器翻译的英文版。\
> A machine-translated English version will be provided later.

# @nuogz/web-app-tip 贴士
![Version](https://img.shields.io/github/package-json/v/nuogz/web-app-tip?style=flat-square)
![License](https://img.shields.io/github/license/nuogz/web-app-tip?style=flat-square)

Tips component for displaying extra info on the interface in Nuogz Web App, based on [CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning) and [Vue 3](https://vuejs.org/)\
贴士用于在界面中显示额外的信息，提供即时的指引或补充说明，以辅助用户理解和使用功能。用于Nuogz Web App，基于CSS Anchor Positioning、Vue3、UnoCSS

经过一系列的迭代，从原来的提示组件`vue-tip`升级重构为全新的`web-app-tip`

`web-app-tip`已弃用`tippy.js`，改为使用最新的CSS锚点定位（CSS Anchor Positioning）语法作为核心实现。\
额外功能与Vue内置的功能进行结合，最大程度地不影响Vue的渲染逻辑

基础示例：
````html
<!-- index.vue -->
<template>
  <AppOrbit>...</AppOrbit>

  <AppTip />
</template>
<script setup>
  import AppTip, { install as installAppTip } from '@nuogz/web-app-tip';

  // 需要createApp后通过provide()提供app实例
  // 在createApp后立即install也是可以的
  const app = inject('app');
  installAppTip(app);
</script>
````

贴士分为两部分，自定义指令`v-tip`与组件`<AppTip>`。
`v-tip`指令通过install函数安装。
`<AppTip>`组件用于动态渲染展示贴士所需要的HTML元素。

**请将`<AppTip>`置于app的根元素下**

## DOM结构
- body
  - app (index.vue)
    - (module.vue)
    - app-tip-box
      - app-tip (或teleport模板内容)
      - app-tip-shadow (用于自动位置功能的相交检测)

如果app使用天轨Orbit组件，那么DOM结构如下：
- body
  - app (index.vue)
    - app-moon
    - app-main
      - (module.vue)
    - app-moon
    - app-tip-box
      - app-tip (或teleport模板内容)
    - app-tip-shadow (用于自动位置功能的相交检测)

注意：相关元素会根据实际调用次数增多，一个指令对应一套元素。并不是单例模式

## 配置方法
根据Vue指令的语法设计，我们可以通过三种途径配置`app-tip`
````html
<button v-tip:[arg].modifier="value">Im a button</button>
````
### value
指定Tip的显示内容。传入的内容最终会在模板中以`{{ value }}`的形式展示
### modifiers 修饰符
修饰符用于指定启用/禁用某个特性。具体修饰符的功能请继续查看下面各项功能的说明
### arg 动态参数
利用Vue指令中的动态参数语法，我们可以传入一个TipArg对象来更详细地配置各项tip特性

> 在Vue的文档和types中，arg的类型一直是string。但经过实测向arg传递object是有效。\
> 不排除以后此途径会失效。届时需要迁移到其他路径

## 功能与参数说明
### 0、显示内容
显示额外内容是贴士的核心基础功能，支持多种来源
#### value
基础用法
````html
<button v-tip="'Im a tip'">Im a button</button>
````
#### arg.value
通过`TipArg.value`传入
````html
<template>
  <button v-tip:[arg]>Im a button</button>
</template>
<script setup>
  const arg = ref({ value: 'Im a tip' });
</script>
````
#### 模板内容
此功能用于显示实时渲染的Vue模板

为了避免入侵Vue的渲染逻辑，其核心功能将使用Vue内置的[`<Teleport>`](https://cn.vuejs.org/guide/built-ins/teleport.html)组件实现

由于`<Teleport>`的[目标元素必须与`<Teleport>`在同一个挂载/更新周期内渲染](https://cn.vuejs.org/guide/built-ins/teleport.html#deferred-teleport)。\
要使用该功能，必须向`v-tip`传递一个`TipArg`，且`TipArg.teleport`设置为`true`。\
当对应的`<app-tip-box>`渲染后，贴士会将`<app-tip-box>`传递到`TipArg.teleportTo`中。\
在渲染前，仍需向`<Teleport>`的`to`属性提供有效值以过渡，如`body`

最佳实践：
````html
<template>
  <button v-tip:[arg]>Im a button</button>

  <Teleport :to="$tip.teleportTo || 'body'">
    <span>Im a template tip</span>
  </Teleport>
</template>
<script setup>
  const arg = ref({ teleport: true });
</script>
````

在一般情况下，将`<Teleport>`的`to`属性短暂地设置为其他过渡用元素（如`body`）并不会造成闪烁。\
但在极端情况下，渲染效率低，待传送的内容仍可能会因为停留在过渡用元素太久，\
导致传送内容被渲染到视口中，最后造成产生闪烁。

若过渡用元素本身是隐藏的，则不受影响

此时可以通过对`<Teleport>`追加`disabled`和`defer`属性来避免闪烁：
````html
<Teleport :to="..."
  defer :disabled="$tip.teleportTo ? false : true"
>...</Teleport>
````

### 1、位置
`area` 默认值：`top center`
| 值       | 作用 | 修饰符  |
| -------- | ---- | ------- |
| `top`    | 居上 | .top    |
| `bottom` | 居下 | .bottom |
| `center` | 居中 | .center |
| `left`   | 居左 | .left   |
| `right`  | 居右 | .right  |

### 2、自动位置
`autoArea` 默认值：true

当检测到Tip开始离开视口时，会自动调整Tip位置到新的位置，以尝试完成显示Tip

| 特性    | 作用                   | 修饰符      |
| ------- | ---------------------- | ----------- |
| `true`  | 离开视口时自动调整位置 | -           |
| `false` | 什么都不做             | .noAutoArea |

> CSS anchor positioning有提供[`position-try`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-try)等属性用于自动调整位置。\
> 但目前相关属性的效果并不理想，因此没有将其纳入此次重构中，转为通过`IntersectionObserver`实现

### 3、悬停行为
`hover` 默认值：show
| 值      | 作用                  | 修饰符       |
| ------- | --------------------- | ------------ |
| `false` | 什么都不做            | .noHoverShow |
| `show`  | 显示Tip（离开隐藏）   | -            |
| `pin`   | 固定Tip（离开不隐藏） | .hoverPin    |

### 4、单击行为
`click` 默认值：false
| 特性        | 作用                      | 修饰符         |
| ----------- | ------------------------- | -------------- |
| `false`     | 什么都不做                | -              |
| `pin-flip`  | 切换固定Tip（离开不隐藏） | .clickPinFlip  |
| `pin`       | 固定Tip（离开不隐藏）     | .clickPin      |
| `show-flip` | 切换显隐Tip（离开隐藏）   | .clickShowFlip |
| `show`      | 显示Tip（离开隐藏）       | .clickShow     |

`click:show-flip|show`适用于`hover:false`的情况，否则行为会被`hover:show`覆盖

### 5、全局解除固定
`unpin$clickGlobal` 默认值：true

当Tip固定时，默认全局任意单击后解除固定，以模拟离开且失焦
  - 按下后触发滚动，不会导致解除
  - 当单击是目标元素或Tip元素时，不会导致解除

| 特性    | 作用                       | 修饰符         |
| ------- | -------------------------- | -------------- |
| `true`  | 固定后全局任意单击解除固定 | -              |
| `false` | 什么都不做                 | .noUnpinGlobal |

### 6、侦听arg参数
`watchArg` 默认值：false

当指令的arg部分传入一个对象，对象内部变化后，不会触发指令的update事件（即使传入的是一个reactive对象）。
在当前的Vue版本中，当指令的参数部分`v-tip:[arg]`是一个对象时，即使该对象是响应式的，其内部属性的变化也不会触发指令的update钩子函数。
此时可配置`watchArg:true`或修饰符`.watchArg`，对arg对象进行深度侦听。

| 特性    | 作用                  | 修饰符    |
| ------- | --------------------- | --------- |
| `true`  | 对arg对象进行深度侦听 | .watchArg |
| `false` | 什么都不做            | -         |

### 7、禁止交互
`intangible` 默认值：false

| 特性          | 作用                      | 修饰符     |
| ------------- | ------------------------- | ---------- |
| `false`       | 什么都不做                | -          |
| `true`或`tip` | 禁止app-tip进行交互       | .intang    |
| `box`         | 禁止与app-tip-box进行交互 | .intangBox |

可否与内在元素交互

### 8、主题
`theme` 默认值：`base`

支持自定义主题，通过`[theme=主题名]`定义

默认主题通过CSS变量`--app-tip-back: var(--contrast)`来定义背景，你随时可以覆盖这个变量

主题不适用于模板内容。

| 特性          | 作用               | 修饰符  |
| ------------- | ------------------ | ------- |
| `base`        | 默认主题           | -       |
| `base-nowarp` | 默认主题（不换行） | .nowrap |
````html
<template>
  <button v-tip:[arg]>Im a button</button>
</template>
<script setup>
  const arg = ref({ theme: 'test' });
</script>
<style lang="sass" scoped>
:global(app-tip[theme=test])
  @apply p-2 py-1.5 bg-green-4 rounded-lg shadow-d1-md ws-pre
</style>
````
因为贴士是`<app>`子元素，所以需要将主题提升到全局。\
建议将主题样式放置在全局位置，或者使用足够独特的名字。不要像演示这样在某个单文件组件中定义

### 9、偏移
`offset` 默认值：`0`

本事css长度单位。\
如果是number类型，会自动补全`px`单位。\
如果是string类型，则不会做任何修改
