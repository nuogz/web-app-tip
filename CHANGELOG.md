# CHANGELOG

## v2.1.1 - 2025.11.28 16
* regular: bump up dependencies


## v2.1.0 - 2025.11.28 16
* refactor!: medium-scale refactoring of all related mouse hover/click logic to unify display behavior
  * the concept of `pinned` code is now fully integrated into the `showed` feature
  * new `Tip.show()` and `Tip.hide()` to control display behavior via script;
  * new `Tip.showed$script` and `Tip.showed$hover`, instead `Tip.showed` and `Tip.pinned`
  * rename `TipArg.hide$clickGlobal` from `unpin$clickGlobal`
* feat: new `TipArg.refInstance` to access **Tip** instance via **TipArg**
* feat: new `TipArg.arrow`
  * now a triangular arrow points from tips to target elements by default
  * the default `TipArg.offset` arg value is now `4`, to fit the new `arrow` feature
* feat: enable `span-*` position modifier mapping
  * eg: `v-tip.spanTop` equals to `area = span-top`
* refactor: improve `base` theme to fix incorrect display of Tips in dark mode
  * new CSS variable `--app-tip-text` with default value `var(--main-back)`
  * change CSS variable `--app-tip-back` default value to `var(--main-solid)`
* adjust: rename all instances of `brop()` to `bttr()`, based on the latest Nuogz Web App environment.
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
