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
	/** 自动调整后的位置 */
	areaAdjust?: string;
	/** 鼠标悬停目标时显示Tip */
	show$hover?: boolean;
	/** 点击全局可以取消Tip的固定状态 */
	unpin$clickGlobal?: boolean;
	/** 点击主体可以切换Tip的固定状态 */
	pinFlip$click?: boolean;
	/** 点击主体可以切换Tip的固定状态 */
	pin$click?: boolean;
	/** 点击主体可以切换Tip显示隐藏 */
	showFlip$click?: boolean;
	/** 点击主体可以显示Tip */
	show$click?: boolean;
	/** 对arg对象进行侦听 */
	watchArg?: boolean;
	/** 离开视口时自动调整位置 */
	autoArea?: boolean;
	/** 禁止交互 */
	intangible?: boolean | 'tip' | 'box';
	/** 主题 */
	theme?: 'base' | 'base-nowrap' | string;
	/** 偏移 */
	padding?: string;
}

export type TipMisc = {
	clickPinFlip?: Function;
	clickPin?: Function;
	clickShowFlip?: Function;
	clickShow?: Function;
	mousedownUnpin?: Function;
	showTemp$click?: boolean;
	stopWatchArg?: Function;
	intersectionObserver?: IntersectionObserver;
}

export type Tip = {
	uuid: string;

	content: DirectiveBinding['value'];
	teleport?: boolean;

	arg: DirectiveBinding['arg'];
	modifiers: DirectiveBinding['modifiers'];

	el: HTMLElement;
	elBox: HTMLElement;
	elShadow: HTMLElement;

	area: string;

	showed: boolean;
	pinned: boolean;

	state: TipState;
	misc: TipMisc;
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
	teleport?: boolean;
	/**
	 * 鼠标悬停目标时显示Tip
	 *
	 * 默认值：`top center`
	 */
	area?: 'top' | 'bottom' | 'center' | 'left' | 'right' | string;
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
	 * 单击行为
	 *
	 * 默认值：`false`
	 */
	click?: false | 'false' | 'pin-flip' | 'pin' | 'show-flip' | 'show';
	/**
	 * 全局解除固定
	 *
	 * 默认值：`true`
	 */
	unpin$clickGlobal?: boolean;
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
	theme?: 'base' | 'base-nowrap' | string;
	/**
	 * 偏移
	 *
	 * 默认值：`base`
	 */
	offset?: number |string;
}
