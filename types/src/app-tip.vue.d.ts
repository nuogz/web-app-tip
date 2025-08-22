import { App, DefineComponent, Ref, VNode } from 'vue';



/**
 * 组件初始化
 * @param {App} app
 */
export function install(app: App): App;


/** 全局配置 */
export const $config: Ref<{
	/**
	 * 当tip超出屏幕时，优先调整位置的模式
	 * - `opposite` 优先尝试调整对面的位置
	 * - `around` 优先逆时针尝试可能的位置
	 */
	modeBleeding: 'opposite' | 'around';
}>;


/** 生成一个没有横杠`-`的UUID */
export function makeUUID(): string;



/** 贴士指令：显示额外内容 */
declare const AppTip: DefineComponent<{}, {}>;


export default AppTip;
