<template>
	<template v-for="tip, uuid of $tips" :key="uuid">
		<app-tip-box ref="tip-boxes" :uuid="uuid"
			:style="{
				positionAnchor: `--uuid-${tip.uuid}`,
				positionArea: tip.state.areaAdjust || tip.area,
				transform: `translateX(0px) translateY(0px)`,
				padding: tip.state.padding,
				visibility: tip.pinned ? 'visible' : undefined,
			}"
			:intangible="brop(tip.state.intangible == 'box')"
		>
			<app-tip
				v-if="!tip.teleport"
				:theme="tip.state.theme || 'base'"
				:intangible="brop(tip.state.intangible == 'tip')"
			>{{ tip.content }}</app-tip>
		</app-tip-box>
		<app-tip-shadow ref="tip-shadows" :uuid="uuid"
			:style="{
				positionAnchor: `--uuid-${tip.uuid}`,
				positionArea: tip.area,
				transform: `translateX(0px) translateY(0px)`,
				padding: tip.state.padding,
				width: `${tip.widthTip}px`,
				height: `${tip.heightTip}px`,
			}"
		/>
	</template>

	<!-- eslint-disable-next-line vue/require-component-is -->
	<component is="style">
		<template v-for="tip of $tipsHoverable" :key="tip.uuid">
			app:has([app-tip-id="{{ tip.uuid }}"]:hover) app-tip-box[uuid="{{ tip.uuid }}"] { visibility: visible; }
		</template>
	</component>
</template>

<script>
const $$ = { insertTip() { }, updateTip() { }, deleteTip() { } };


/**
 * 指令初始化
 * @param {import('vue').App} app
 * @returns {import('vue').App}
 */
export const install = app => app.directive('tip', {
	beforeMount(el, bind) { $$.insertTip(el, bind); },
	updated(el, bind) { $$.updateTip(el, bind); },
	unmounted(el, bind) { $$.deleteTip(el, bind); }
});


/** 全局配置 */
export const $config = ref({
	/**
	 * 当tip超出屏幕时，优先调整位置的模式
	 * @type {'opposite'|'around'}
	 */
	modeBleeding: 'opposite'
});


/** 生成一个没有横杠`-`的UUID */
export const makeUUID = () =>
	globalThis.window.crypto.randomUUID().replaceAll('-', '');
</script>

<script setup>
import { computed, nextTick, ref, shallowReactive, useTemplateRef, watch } from 'vue';


/** @typedef {import('vue').DirectiveBinding<any, import('../bases.d.ts').TipModifiers, import('../bases.d.ts').TipArg>} DirectiveBinding */
/** @typedef {import('../bases.d.ts').Tip} Tip */



/** @type {import('vue').Ref<Object<string,Tip>>} */
const $tips = ref({});
const $tipsHoverable = computed(() => Object.values($tips.value).filter(tip => tip.state.show$hover || tip.misc.showTemp$click));


/** @type {import('vue').ShallowRef<HTMLElement[]|null>} */
const $boxesTip = useTemplateRef('tip-boxes');
/** @type {import('vue').ShallowRef<HTMLElement[]|null>} */
const $shadowsTip = useTemplateRef('tip-shadows');



/** @param {Tip} tip */
const listenUnpin = tip => {
	document.addEventListener('mousedown', tip.misc.mousedownUnpin = event => {
		const target = event.target;
		if(target == tip.el) { return; }
		if(target == tip.elBox || target.parentNode == tip.elBox) { return; }

		const style = window.getComputedStyle(target);


		let onScrollbar = false;
		let scrolled = false;

		// 检查目标元素是否有滚动条
		const hasScrollbarVertical = target.scrollHeight > target.clientHeight && ['auto', 'scroll'].includes(style.overflowY);
		const hasScrollbarHorizontal = target.scrollWidth > target.clientWidth && ['auto', 'scroll'].includes(style.overflowX);

		// 检查是否点击在滚动条上
		if(hasScrollbarVertical) {
			const scrollbarWidth = target.offsetWidth - target.clientWidth;

			if(scrollbarWidth > 0 && event.offsetX > target.clientWidth) {
				onScrollbar = true;
			}
		}
		if(hasScrollbarHorizontal && !onScrollbar) {
			const scrollbarHeight = target.offsetHeight - target.clientHeight;
			if(scrollbarHeight > 0 && event.offsetY > target.clientHeight) {
				onScrollbar = true;
			}
		}


		// 如果在滚动条上，监听滚动事件
		if(onScrollbar) {
			target.addEventListener('scroll', () => scrolled = true, { once: true });
		}

		// 监听鼠标抬起事件
		target.addEventListener('mouseup', () => {
			// 没在滚动条上或没有滚动过 ==> 点击
			if(!onScrollbar || !scrolled) {
				tip.pinned = false;

				document.removeEventListener('mousedown', tip.misc.mousedownUnpin);
			}
		}, { once: true });
	});
};

/**
 * @param {Tip} tip
 * @param {DirectiveBinding} bind
 */
const applyTipBind = (tip, bind) => {
	const { arg } = bind;
	const { value } = bind;
	const { modifiers } = bind;


	const isObjectArg = arg && typeof arg == 'object';


	// 功能：内容
	const content = isObjectArg && 'value' in arg ? arg.value : value;
	if(content === false || content === null || content === undefined || content === '') { tip.content = false; }
	else { tip.content = content; }



	// 功能：位置
	tip.area = isObjectArg && 'area' in arg ? arg.area : parseModifierArea(modifiers);



	// 功能：全局解除固定
	// unpin$clickGlobal ==> （默认：true）点击全局可以取消Tip的固定状态
	const unpin$clickGlobal = tip.state.unpin$clickGlobal =
		arg?.unpin$clickGlobal === false || arg?.unpin$clickGlobal == 'false' || modifiers.noUnpinGlobal ? false : true;


	// 功能：悬停行为
	// show$hover ==> （默认：true）鼠标悬停目标时显示Tip
	tip.state.show$hover =
		arg?.hover === false || arg?.hover == 'false' || modifiers.noHoverShow ? false
			: arg?.hover == 'show' ? true
				: arg?.hover == 'pin' ? false : true;


	// pinFlip$click ==> （默认：false）点击主体可以切换Tip的固定状态
	const pinFlipOld$click = tip.state.pinFlip$click;
	const pinFlip$click = tip.state.pinFlip$click =
		arg?.click == 'pin-flip' || modifiers.clickPinFlip ? true : false;

	if(!pinFlipOld$click && pinFlip$click) {
		tip.el.addEventListener('click', tip.misc.clickPinFlip = () => {
			tip.pinned = !tip.pinned;

			if(tip.pinned && unpin$clickGlobal) {
				listenUnpin(tip);
			}
		});
	}
	else if(!pinFlip$click) {
		tip.el.removeEventListener('click', tip.misc.clickPinFlip);
	}


	// pin$click ==> （默认：false）点击主体可以切换Tip的固定状态
	const pinOld$click = tip.state.pin$click;
	const pin$click = tip.state.pin$click =
		arg?.click == 'pin' || modifiers.clickPin ? true : false;

	if(!pinOld$click && pin$click) {
		tip.el.addEventListener('click', tip.misc.clickPin = () => {
			const pinnedOld = tip.pinned;
			tip.pinned = true;

			if(!pinnedOld && unpin$clickGlobal) {
				listenUnpin(tip);
			}
		});
	}
	else if(!pin$click) {
		tip.el.removeEventListener('click', tip.misc.clickPin);
	}


	// 功能：单击行为
	// showFlip$click ==> （默认：false）点击主体可以切换Tip显示隐藏
	const showFlipOld$click = tip.state.showFlip$click;
	const showFlip$click = tip.state.showFlip$click =
		arg?.click == 'show-flip' || modifiers.clickShowFlip ? true : false;

	if(!showFlipOld$click && showFlip$click) {
		tip.el.addEventListener('click', tip.misc.clickShowFlip = () => {
			tip.misc.showTemp$click = !tip.misc.showTemp$click;

			if(tip.misc.showTemp$click) {
				tip.el.addEventListener('mouseleave',
					() => tip.misc.showTemp$click = false,
					{ once: true }
				);
			}
		});
	}
	else if(!showFlip$click) {
		tip.el.removeEventListener('click', tip.misc.clickShowFlip);
	}


	// show$click ==> （默认：false）点击主体可以显示Tip
	const showOld$click = tip.state.show$click;
	const show$click = tip.state.show$click =
		arg?.click == 'show' || modifiers.clickShow ? true : false;

	if(!showOld$click && show$click) {
		tip.el.addEventListener('click', tip.misc.clickShow = () => {
			const showTemp$click = tip.misc.showTemp$click;
			tip.misc.showTemp$click = true;

			if(!showTemp$click && tip.misc.showTemp$click) {
				tip.el.addEventListener('mouseleave',
					() => tip.misc.showTemp$click = false,
					{ once: true });
			}
		});
	}
	else if(!show$click) {
		tip.el.removeEventListener('click', tip.misc.clickShow);
	}



	// 功能：侦听arg参数
	// watchArg ==> 侦听arg参数变化
	const watchArgOld = tip.state.watchArg;
	const watchArg = arg?.watchArg === true || modifiers.watchArg ? true : false;

	if(isObjectArg && !watchArgOld && watchArg) {
		tip.misc.stopWatchArg = watch(() => arg,
			() => applyTipBind(tip, {
				arg,
				value: tip.content,
				modifiers: tip.modifiers,
			}),
			{ deep: true }
		).stop;
	}
	else if(!watchArg) {
		tip.misc.stopWatchArg?.();
	}



	// 功能：主题
	tip.state.theme = arg?.theme ? arg?.theme?.trim() : 'base';



	// 递归等待元素
	let depthWait = 0;
	const waitElement = async () => {
		await nextTick();

		const elBox = $boxesTip.value?.find(box => box.getAttribute('uuid') == tip.uuid);
		const elShadow = $shadowsTip.value?.find(shadow => shadow.getAttribute('uuid') == tip.uuid);

		if(!elBox || !elShadow) {
			if(depthWait > 500) { throw Error('等待元素超时'); }

			return waitElement(depthWait++);
		}


		tip.elBox = elBox;
		tip.elShadow = elShadow;


		if(tip.teleport) { tip.arg.teleportTo = elBox; }


		elBox.addEventListener('transitionend', () => {
			tip.showed = getComputedStyle(elBox).visibility != 'hidden';

			if(!tip.state.autoArea) { return; }

			const [rectTip] = elBox.getClientRects();
			if(!rectTip) { return; }

			tip.widthTip = rectTip.width;
			tip.heightTip = rectTip.height;
		});



		// 功能：禁止交互
		tip.state.intangible =
			arg?.intangible === true || arg?.intangible == 'true'
				|| arg?.intangible == 'tip' || modifiers.intang ? 'tip'
				: arg?.intangible == 'box' || modifiers.intangBox ? 'box'
					: false;



		// 功能：自动位置
		// autoArea ==> （默认：true）离开视口时自动调整位置
		const autoAreaOld = tip.state.autoArea;
		const autoArea = tip.state.autoArea =
			arg?.autoArea === false || arg?.autoArea == 'false' || modifiers.noAutoArea ? false : true;


		if(!autoAreaOld && autoArea) {
			const [rectTip] = elBox.getClientRects();

			tip.widthTip = rectTip.width;
			tip.heightTip = rectTip.height;

			const intersectionObserver = tip.misc.intersectionObserver = new IntersectionObserver(([entry]) => {
				const bleedTop = Math.round((entry.intersectionRect.top - entry.boundingClientRect.top) * 1000) / 1000;
				const bleedLeft = Math.round((entry.intersectionRect.left - entry.boundingClientRect.left) * 1000) / 1000;
				const bleedBottom = Math.round((entry.intersectionRect.bottom - entry.boundingClientRect.bottom) * 1000) / 1000;
				const bleedRight = Math.round((entry.intersectionRect.right - entry.boundingClientRect.right) * 1000) / 1000;

				const bleedingTop = bleedTop > 0;
				const bleedingLeft = bleedLeft > 0;
				const bleedingBottom = bleedBottom < 0;
				const bleedingRight = bleedRight < 0;

				// console.table([
				// 	{ T: bleedingTop ? '✔' : '-', L: bleedingLeft ? '✔' : '-', B: bleedingBottom ? '✔' : '-', R: bleedingRight ? '✔' : '-' },
				// 	{ T: bleedTop, L: bleedLeft, B: bleedBottom, R: bleedRight }
				// ]);



				if(bleedingTop || bleedingLeft || bleedingBottom || bleedingRight) {
					/** @type {string[]} */
					let areasFallback = $config.value.modeBleeding == 'opposite'
						? [...(areasFallbackOpposite$area[tip.area] || []), ...areasAround]
						: areasAround;
					areasFallback = [tip.area, ...areasFallback].filter(areaFallback => {
						if(bleedingTop) {
							if(areaFallback.includes('top')) {
								return false;
							}

							if(!tip.area.includes('top') && (areaFallback == 'left center' || areaFallback == 'right center')) { return false; }
						}
						if(bleedingLeft) {
							if(areaFallback.includes('left')) {
								return false;
							}

							if(!tip.area.includes('left') && (areaFallback == 'top center' || areaFallback == 'bottom center')) { return false; }
						}
						if(bleedingBottom) {
							if(areaFallback.includes('bottom')) {
								return false;
							}

							if(!tip.area.includes('bottom') && (areaFallback == 'left center' || areaFallback == 'right center')) { return false; }
						}
						if(bleedingRight) {
							if(areaFallback.includes('right')) {
								return false;
							}

							if(!tip.area.includes('right') && (areaFallback == 'top center' || areaFallback == 'bottom center')) { return false; }
						}

						return true;
					});

					if(areasFallback[0] && areasFallback[0] != tip.area) {
						tip.state.areaAdjust = areasFallback[0];

						tip.state.padding = parsePadding(tip);
					}
				}
				else {
					tip.state.areaAdjust = '';

					tip.state.padding = parsePadding(tip);
				}
			}, {
				threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
			});

			intersectionObserver.observe(elShadow);
		}
		else if(!autoArea) {
			tip.misc.intersectionObserver?.disconnect?.();
		}
	};
	waitElement();
};


/**
 * @param {HTMLElement} el
 * @param {DirectiveBinding} bind
 * @return {Tip|undefined}
 */
const cerateTip = (el, bind) => {
	const { arg, value, modifiers } = bind;


	const teleport = arg?.teleport === true ? true : false;
	const content = arg && typeof arg == 'object' && 'value' in arg ? arg.value : value;
	// content是假值时直接返回不显示
	if(
		(content === false || content === null || content === undefined || content === '') &&
		teleport == false
	) { return; }


	const uuid = arg?.uuid ?? globalThis.window.crypto.randomUUID().replaceAll('-', '');


	if(teleport) { arg.uuid = uuid; }


	return shallowReactive({
		uuid,

		content,
		teleport,

		arg,
		modifiers,

		el,
		elBox: null,
		elShadow: null,

		area: '',

		showed: false,
		pinned: false,

		state: shallowReactive({}),
		misc: shallowReactive({}),
	});
};



/**
 * @param {HTMLElement} el
 * @param {DirectiveBinding} bind
 */
const insertTip = (el, bind) => {
	if(!bind) { return; }


	const tip = cerateTip(el, bind);
	if(!tip) { return; }

	el.setAttribute('app-tip-id', tip.uuid);
	el.style.anchorName = `--uuid-${tip.uuid}`;

	$tips.value[tip.uuid] = tip;


	applyTipBind(tip, bind);
};
$$.insertTip = insertTip;

/**
 * @param {Element} el
 * @param {DirectiveBinding} bind
 */
const updateTip = (el, bind) => {
	const uuid = el.getAttribute('app-tip-id');
	if(!uuid) { return insertTip(el, bind); }

	const tip = $tips.value[uuid];
	if(!tip) { return insertTip(el, bind); }


	applyTipBind(tip, bind);
};
$$.updateTip = updateTip;

/** @param {Element} el */
const deleteTip = el => {
	const uuid = el.getAttribute('app-tip-id');
	if(!uuid) { return; }

	el.removeAttribute('app-tip-id');
	delete el.style.anchorName;

	const tip = $tips.value[uuid];

	el.removeEventListener('click', tip.clicker);

	delete $tips.value[uuid];
};
$$.deleteTip = deleteTip;


const areasAround = [
	'top left',
	'top center',
	'top right',
	'right center',
	'bottom right',
	'bottom center',
	'bottom left',
	'left center',
];
const areasFallbackOpposite$area = {
	'top left': ['bottom right', 'top right', 'bottom left'],
	'top right': ['bottom left', 'top left', 'bottom left'],
	'bottom right': ['top left', 'bottom left', 'top right'],
	'bottom left': ['top right', 'bottom right', 'top left'],
	'top center': ['bottom center', 'right center', 'left center'],
	'right center': ['left center', 'top center', 'bottom center'],
	'bottom center': ['top center', 'right center', 'left center'],
	'left center': ['right center', 'top center', 'bottom center'],
};
const valuesAreaPosition$modifier = {
	center: 'center',
	top: 'top',
	bottom: 'bottom',
	left: 'left',
	right: 'right',
	// spanTop: 'span-top',
	// spanBottom: 'span-bottom',
	// spanLeft: 'span-left',
	// spanRight: 'span-right',
};
const orderModifier = ['top', 'bottom', 'center', 'left', 'right'];

/** @param {DirectiveBinding['modifiers']} modifiers @returns {string} */
const parseModifierArea = modifiers => {
	const areas = [];
	for(const modifier in modifiers) {
		if(modifier in valuesAreaPosition$modifier) {
			areas.push(valuesAreaPosition$modifier[modifier]);
		}
	}

	return areas.length == 1
		? `${areas[0]} center`
		: areas.length
			? areas.sort((a, b) => orderModifier.indexOf(a) - orderModifier.indexOf(b)).join(' ')
			: `top center`;
};

/** @param {Tip} tip */
const parsePadding = tip => {
	const offset = tip.arg?.offset;
	const areas = (tip.state.areaAdjust || tip.area).split(' ');

	const paddings = [
		// top
		areas.includes('bottom') ? offset : 0,
		// right
		areas.includes('left') ? offset : 0,
		// bottom
		areas.includes('top') ? offset : 0,
		// left
		areas.includes('right') ? offset : 0,
	];

	return paddings.map(padding => typeof padding == 'number' ? `${padding}px` : padding).join(' ');
};
</script>

<style lang="sass">
app-tip-box
	@apply block absolute bg-transparent
	@apply invisible duration-25
	&:hover
		@apply visible
	&[intangible]
		@apply pointer-events-none select-none

app-tip
	@apply relative block
	--app-tip-back: var(--contrast)
	&[intangible]
		@apply pointer-events-none select-none
	&[theme=base]
		@apply p-2 py-1.5 rounded-lg shadow-d1-md ws-pre
		background-color: var(--app-tip-back)
	&[theme=base-nowrap]
		@apply p-2 py-1.5 rounded-lg shadow-d1-md ws-nowrap
		background-color: var(--app-tip-back)

app-tip-shadow
	@apply block absolute invisible pointer-events-none select-none
	// debug style:
	// @apply visible bg-amber-1 opacity-40 border-1 border-red-6
</style>
