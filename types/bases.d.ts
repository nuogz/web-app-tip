import type { Directive, DirectiveBinding } from 'vue'



type AreaModifiers = 'top' | 'bottom' | 'center' | 'left' | 'right';
type OperModifiers =
	'noAutoArea' |
	'noHoverShow' | 'hoverPin' |
	'clickPinFlip' | 'clickPin' | 'clickShowFlip' | 'clickShow' |
	'noUnpinGlobal' |
	'watchArg' |
	'intang' | 'intangBox';
type TipModifiers = AreaModifiers | OperModifiers;

declare module 'vue' {
	interface ComponentCustomProperties {
		vTip: Directive<any, any, TipModifiers, string>
	}
}



export type TipState = {
	/** 点击全局隐藏Tip */
	hide$clickGlobal?: boolean;
	/** 悬停主体时显示Tip（离开隐藏） */
	show$hover?: boolean;
	/** 悬停主体时显示Tip（离开不隐藏） */
	pin$hover?: boolean;
	/** 点击主体切换Tip（离开不隐藏） */
	pinFlip$click?: boolean;
	/** 点击主体显示Tip（离开不隐藏） */
	pin$click?: boolean;
	/** 点击主体切换Tip（离开隐藏） */
	showFlip$click?: boolean;
	/** 点击主体显示Tip（离开隐藏） */
	show$click?: boolean;
	/** 对arg对象进行侦听 */
	watchArg?: boolean;
	/** 主题 */
	theme?: 'base' | 'base-nowrap' | string;
	/** 禁止交互 */
	intangible?: boolean | 'tip' | 'box';
	/** 离开视口时自动调整位置 */
	autoArea?: boolean;
	/** 自动调整后的位置 */
	areaAdjust?: string;
	/** 位置偏移 */
	padding?: string;
}

export type TipMisc = {
	clickPinFlip?: Function;
	clickPin?: Function;
	clickShowFlip?: Function;
	clickShow?: Function;

	/** 全局鼠标按下时隐藏Tip的临时监听器 */
	hide$mousedownGlobal?: Function;
	/** 鼠标离开时隐藏Tip的临时监听器 */
	hide$mouseleave?: Function;

	showTemp$click?: boolean;
	stopWatchArg?: Function;
	intersectionObserver?: IntersectionObserver;
}

export type Tip = {
	/** 唯一标识符 */
	uuid: string;

	/** 贴纸挂载的元素 */
	mount: Element | false;

	/** 是否为传送内容 */
	teleport?: boolean | 'in-tip';
	content: DirectiveBinding['value'];

	arg: DirectiveBinding['arg'];
	modifiers: DirectiveBinding['modifiers'];

	el: HTMLElement;
	elBox: HTMLElement;
	elShadow: HTMLElement;

	area: string;

	/** 是否通过脚本显示Tip */
	showed$script: boolean;
	/** 是否通过悬停显示Tip */
	showed$hover: boolean;

	/** 状态 */
	state: TipState;
	/** 杂项数据 */
	misc: TipMisc;

	/**
	 * 显示Tip
	 * @param {boolean} hide$leave 是否离开后隐藏
	 * @param {boolean} hide$clickGlobal 是否点击全局后隐藏
	 */
	show: (hide$leave: boolean, hide$clickGlobal: boolean) => void;
	/** 隐藏Tip */
	hide: () => void;
}


export type TipArg = {
	/**
	 * 内容
	 *
	 * 默认值：`any`
	 */
	value?: any;

	/**
	 * 改为显示传送内容
	 *
	 * 默认值：`false`
	 */
	teleport?: boolean | 'in-tip';
	/**
	 * 传送内容
	 */
	teleportTo?: HTMLElement;


	/**
	 * 鼠标悬停目标时显示Tip
	 *
	 * 默认值：`top center`
	 */
	area?: 'top center' | 'right center' | 'bottom center' | 'left center' |
	'top left' | 'top right' | 'bottom right' | 'bottom left' |
	'top span-right' | 'top span-left' |
	'right span-bottom' | 'right span-top' |
	'bottom span-left' | 'bottom span-right' |
	'left span-top' | 'left span-bottom' |
	'top' | 'right' | 'bottom' | 'left' |
	'span-right?' | 'span-left?' | 'span-bottom?' | 'span-top?' | 'center?';
	/**
	 * 离开视口时自动调整位置
	 *
	 * 默认值：`true`
	 */
	autoArea?: boolean;
	/**
	 * 悬停行为
	 *
	 * 默认值：`show`
	 */
	hover?: false | 'false' | 'show' | 'pin';
	/**
	 * 点击行为
	 *
	 * 默认值：`false`
	 */
	click?: false | 'false' | 'show' | 'pin' | 'show-flip' | 'pin-flip';
	/**
	 * 全局隐藏
	 *
	 * 默认值：`true`
	 */
	hide$clickGlobal?: boolean;
	/**
	 * 侦听arg参数
	 *
	 * 默认值：`false`
	 */
	watchArg?: boolean;
	/**
	 * 禁止交互
	 *
	 * 默认值：`false`
	 */
	intangible?: boolean | 'true' | 'false' | 'tip' | 'box';
	/**
	 * 主题
	 *
	 * 默认值：`base`
	 */
	theme?: 'base' | 'base-nowrap' | 'solid' | 'solid-nowrap' | 'prev' | 'prev-nowrap' | 'next' | 'next-nowrap' | string;
	/**
	 * 偏移
	 *
	 * 默认值：`base`
	 */
	offset?: number | string;
	/**
	 * 箭头
	 *
	 * 默认值：`true`
	 */
	arrow?: boolean;

	/**
	 * 获取Tip实例
	 *
	 * 默认值：`false`
	 */
	refInstance?: boolean | ((tip: Tip) => any);
	/**
	 * Tip实例
	 */
	instance?: Tip;

	/**
	 * 贴纸挂载的元素
	 */
	mount?: Element | false;
}
