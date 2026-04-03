# CHANGELOG

## v2.2.0 - 2026.04.03 15
* feat: new `TipArg.mount` to mount the entire Tip under any element
  * e.g.: when a dialog element is displayed as a modal, elements outside the dialog will be suspended, which may prevent the Tip from showing properly. In this case, `TipArg.mount` can be used to mount the entire Tip inside the dialog to resolve the issue.
* feat: new `TipArg.teleport='in-tip'` to teleport the vue-template content into the `<app-tip>` element. This allows better use of built-in themes
* feat: support specifying a theme via camelCase modifiers like `v-tip.theme*`
  * e.g.: `v-tip.themeBaseNowrap` is equivalent to using the `base-nowrap` theme
* refactor: rename the original `base` theme to `solid`
* feat: based on the common color system of `web-app`, add three new themes: `base`, `prev`, and `next`
* refactor: improve the timing of observing `<app-tip-shadow>` to better trigger observation under special cases
* regular: update enviroment
* regular: bump up dependencies


## v2.1.2 - 2025.12.03 17
* fix: incorrect determination of whether target is a descendant of a elBox when handling global hiding
* regular: bump up dependencies


## v2.1.1 - 2025.11.28 16
* regular: bump up dependencies


## v2.1.0 - 2025.11.28 16
* refactor!: medium-scale refactoring of all related mouse hover/click logic to unify display behavior
  * the concept of `pinned` code is now fully integrated into the `showed` feature
  * new `Tip.show()` and `Tip.hide()` to control display behavior via script
  * new `Tip.showed$script` and `Tip.showed$hover`, instead `Tip.showed` and `Tip.pinned`
  * rename `TipArg.hide$clickGlobal` from `unpin$clickGlobal`
* feat: new `TipArg.refInstance` to access **Tip** instance via **TipArg**
* feat: new `TipArg.arrow`
  * now a triangular arrow points from tips to target elements by default
  * the default `TipArg.offset` arg value is now `4`, to fit the new `arrow` feature
* feat: enable `span-*` position modifier mapping
  * e.g.: `v-tip.spanTop` is equivalent to `area = span-top`
* refactor: improve `base` theme to fix incorrect display of Tips in dark mode
  * new CSS variable `--app-tip-text` with default value `var(--main-back)`
  * change CSS variable `--app-tip-back` default value to `var(--main-solid)`
* adjust: rename all instances of `brop()` to `bttr()`, based on the latest Nuogz Web App environment
* adjust: experimentally supplemented `span-*` position related around areas
* adjust: experimentally supplemented `span-*` position related fallback areas
* docs: update to latest
* regular: bump up dependencies


## v2.0.1 - 2025.09.28 09
* docs: remove unused import
* docs: fix typos
* regular: bump up dependencies
* regular: update develop enviroment


## v2.0.0 - 2025.08.22 14
* refactor!: completely refactored!
  * use the newest CSS Anchor Positioning Module
    * The core positioning behavior is implemented entirely with CSS, without any JavaScript
  * use Teleport component from Vue 3
  * more rational exports
  * eliminated unnecessary third-party dependencies
  * first-time includes comprehensive documentation
* regular: renew all enviroment
* regular: renew all dependencies
