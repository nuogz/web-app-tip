<template>
	<template v-for="tip, uuid of $tips" :key="uuid">
		<template v-if="tip.mount">
			<Teleport :to="tip.mount" defer>
				<app-tip-box ref="tip-boxes" :uuid="uuid"
					:style="{
						positionAnchor: `--uuid-${tip.uuid}`,
						positionArea: tip.state.areaAdjust || tip.area,
						transform: `translateX(0px) translateY(0px)`,
						padding: tip.state.padding,
						visibility: tip.showed$script ? 'visible' : undefined,
					}"
					:intangible="bttr(tip.state.intangible == 'box')"
				>
					<app-tip
						v-if="!tip.teleport"
						:theme="tip.state.theme || 'base'"
						:intangible="bttr(tip.state.intangible == 'tip')"
						:arrow="bttr(tip.state.arrow)"
						:area="tip.state.areaAdjust || tip.area"
					>{{ tip.content }}</app-tip>
					<app-tip
						v-else-if="tip.teleport == 'in-tip'"
						:theme="tip.state.theme || 'base'"
						:intangible="bttr(tip.state.intangible == 'tip')"
						:arrow="bttr(tip.state.arrow)"
						:area="tip.state.areaAdjust || tip.area"
					/>
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
			</Teleport>
		</template>
		<template v-else>
			<app-tip-box ref="tip-boxes" :uuid="uuid"
				:style="{
					positionAnchor: `--uuid-${tip.uuid}`,
					positionArea: tip.state.areaAdjust || tip.area,
					transform: `translateX(0px) translateY(0px)`,
					padding: tip.state.padding,
					visibility: tip.showed$script ? 'visible' : undefined,
				}"
				:intangible="bttr(tip.state.intangible == 'box')"
			>
				<app-tip
					v-if="!tip.teleport"
					:theme="tip.state.theme || 'base'"
					:intangible="bttr(tip.state.intangible == 'tip')"
					:arrow="bttr(tip.state.arrow)"
					:area="tip.state.areaAdjust || tip.area"
				>{{ tip.content }}</app-tip>
				<app-tip
					v-else-if="tip.teleport == 'in-tip'"
					:theme="tip.state.theme || 'base'"
					:intangible="bttr(tip.state.intangible == 'tip')"
					:arrow="bttr(tip.state.arrow)"
					:area="tip.state.areaAdjust || tip.area"
				/>
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


/** @type {import('vue').ShallowRef<HTMLElement[]|null>} */
const $boxesTip = useTemplateRef('tip-boxes');
/** @type {import('vue').ShallowRef<HTMLElement[]|null>} */
const $shadowsTip = useTemplateRef('tip-shadows');



/** @type {import('vue').Ref<Object<string,Tip>>} */
const $tips = ref({});
const $tipsHoverable = computed(() => Object.values($tips.value).filter(tip => tip.state.show$hover));



/**
 * 鼠标离开后隐藏Tip
 * @param {Tip} tip
 */
const listenHide$mouseleave = tip => {
	if(tip.misc.hide$mouseleave) { return; }

	tip.el.addEventListener('mouseleave',
		tip.misc.hide$mouseleave = () => tip.hide(),
		{ once: true },
	);
};

/**
 * 全局鼠标按下后隐藏Tip
 * @param {Tip} tip
 */
const listenHide$mousedownGlobal = tip => {
	if(tip.misc.hide$mousedownGlobal) { return; }

	document.addEventListener('mousedown', tip.misc.hide$mousedownGlobal = event => {
		const target = event.target;
		if(target == tip.el) { return; }
		if(tip.elBox.contains(target)) { return; }

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
				tip.hide();
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



	// 功能：全局点击隐藏
	// hide$clickGlobal ==> （默认：true）点击全局隐藏Tip
	const hide$clickGlobal = tip.state.hide$clickGlobal =
		arg?.hide$clickGlobal === false || arg?.hide$clickGlobal == 'false' || modifiers.noUnpinGlobal ? false : true;



	// 功能：悬停行为
	// show$hover ==> （默认：true）悬停主体时显示Tip（离开隐藏）
	// 悬停显示功能不通过事件监听器实现，使用原生CSS即可实现
	tip.state.show$hover =
		arg?.hover === false || arg?.hover == 'false' || modifiers.noHoverShow ? false
			: arg?.hover == 'show' ? true
				: arg?.hover == 'pin' ? false : true;


	// pin$hover ==> （默认：false）悬停主体时显示Tip（离开不隐藏）
	const pinOld$hover = tip.state.pin$hover;
	const pin$hover = tip.state.pin$hover =
		arg?.hover == 'pin' || modifiers.hoverPin ? true : false;

	if(!pinOld$hover && pin$hover) {
		tip.el.addEventListener('mouseenter', tip.misc.hoverPin = () => {
			tip.show(false, hide$clickGlobal);
		});
	}
	else if(!pin$hover) {
		tip.el.removeEventListener('mouseenter', tip.misc.hoverPin);
	}



	// 功能：点击行为
	// pinFlip$click ==> （默认：false）点击主体切换Tip（离开不隐藏）
	const pinFlipOld$click = tip.state.pinFlip$click;
	const pinFlip$click = tip.state.pinFlip$click =
		arg?.click == 'pin-flip' || modifiers.clickPinFlip ? true : false;

	if(!pinFlipOld$click && pinFlip$click) {
		tip.el.addEventListener('click', tip.misc.clickPinFlip = () => {
			if(tip.showed$script) {
				tip.hide();
			}
			else {
				tip.show(false, hide$clickGlobal);
			}
		});
	}
	else if(!pinFlip$click) {
		tip.el.removeEventListener('click', tip.misc.clickPinFlip);
	}


	// pin$click ==> （默认：false）点击主体显示Tip（离开不隐藏）
	const pinOld$click = tip.state.pin$click;
	const pin$click = tip.state.pin$click =
		arg?.click == 'pin' || modifiers.clickPin ? true : false;

	if(!pinOld$click && pin$click) {
		tip.el.addEventListener('click', tip.misc.clickPin = () => {
			tip.show(false, hide$clickGlobal);
		});
	}
	else if(!pin$click) {
		tip.el.removeEventListener('click', tip.misc.clickPin);
	}


	// showFlip$click ==> （默认：false）点击主体切换Tip（离开隐藏）
	const showFlipOld$click = tip.state.showFlip$click;
	const showFlip$click = tip.state.showFlip$click =
		arg?.click == 'show-flip' || modifiers.clickShowFlip ? true : false;

	if(!showFlipOld$click && showFlip$click) {
		tip.el.addEventListener('click', tip.misc.clickShowFlip = () => {
			if(tip.showed$script) {
				tip.hide();
			}
			else {
				tip.show(true, hide$clickGlobal);
			}
		});
	}
	else if(!showFlip$click) {
		tip.el.removeEventListener('click', tip.misc.clickShowFlip);
	}


	// show$click ==> （默认：false）点击主体显示Tip（离开隐藏）
	const showOld$click = tip.state.show$click;
	const show$click = tip.state.show$click =
		arg?.click == 'show' || modifiers.clickShow ? true : false;

	if(!showOld$click && show$click) {
		tip.el.addEventListener('click', tip.misc.clickShow = () => {
			tip.show(true, hide$clickGlobal);
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
	const themeModifier = Object.keys(modifiers).find(key => key.startsWith('theme') && key != 'theme');
	if(themeModifier) {
		tip.state.theme = themeModifier.replace(/^theme/, '').replace(/([A-Z]+)/g, '-$1').toLowerCase().replace(/^-/, '');
	}


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


		if(tip.misc.intersectionObserver && tip.elShadow !== elShadow) {
			tip.misc.intersectionObserver.unobserve(tip.elShadow);
			tip.misc.intersectionObserver.observe(elShadow);
		}
		tip.elShadow = elShadow;


		if(tip.teleport == 'in-tip') { tip.arg.teleportTo = elBox.querySelector('app-tip'); }
		else if(tip.teleport) { tip.arg.teleportTo = elBox; }


		elBox.addEventListener('transitionend', () => {
			tip.showed$hover = getComputedStyle(elBox).visibility != 'hidden';

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


		// 功能：箭头
		// arrow ==> （默认：true）显示箭头
		tip.state.arrow =
			arg?.arrow === false || arg?.arrow == 'false' || modifiers.noArrow
				? false : true;


		// 功能：偏移
		// offset ==> 偏移距离，默认4px，偏移距离最终会反映在padding上
		tip.state.padding = parsePadding(tip);



		// 功能：反向传送
		tip.mount = arg?.mount || false;



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
					}
				}
				else {
					tip.state.areaAdjust = '';
				}

				tip.state.padding = parsePadding(tip);
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

	if(arg?.refInstance) {
		if(typeof arg.refInstance == 'function') {
			arg.refInstance(tip);
		}
		else if(arg.refInstance === true) {
			arg.instance = tip;
		}
	}
};


/**
 * @param {HTMLElement} el
 * @param {DirectiveBinding} bind
 * @return {Tip|undefined}
 */
const createTip = (el, bind) => {
	const { arg, value, modifiers } = bind;


	const teleport = arg?.teleport === true ? true : arg?.teleport == 'in-tip' ? 'in-tip' : false;
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

		showed$script: false,
		showed$hover: false,

		state: shallowReactive({}),
		misc: shallowReactive({}),

		show(hide$leave, hide$clickGlobal) {
			this.showed$script = true;

			if(hide$leave) { listenHide$mouseleave(this); }

			if(hide$clickGlobal) { listenHide$mousedownGlobal(this); }
		},

		hide() {
			this.showed$script = false;

			this.el.removeEventListener('mouseleave', this.misc.hide$mouseleave);
			this.misc.hide$mouseleave = null;

			document.removeEventListener('mousedown', this.misc.hide$mousedownGlobal);
			this.misc.hide$mousedownGlobal = null;
		},
	});
};



/**
 * @param {HTMLElement} el
 * @param {DirectiveBinding} bind
 */
const insertTip = (el, bind) => {
	if(!bind) { return; }

	const tip = createTip(el, bind);
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

const codes$area = {
	1: 'top left',
	2: 'top span-right',
	3: 'top center',
	4: 'top span-left',
	5: 'top right',
	6: 'right span-bottom',
	7: 'right center',
	8: 'right span-top',
	9: 'bottom right',
	10: 'bottom span-left',
	11: 'bottom center',
	12: 'bottom span-right',
	13: 'bottom left',
	14: 'left span-top',
	15: 'left center',
	16: 'left span-bottom',

	s1: 'top center',
	s2: 'right center',
	s3: 'bottom center',
	s4: 'left center',

	c1: 'top left',
	c2: 'top right',
	c3: 'bottom right',
	c4: 'bottom left',

	e1: 'top span-right',
	e2: 'top span-left',
	e3: 'right span-bottom',
	e4: 'right span-top',
	e5: 'bottom span-left',
	e6: 'bottom span-right',
	e7: 'left span-top',
	e8: 'left span-bottom',
};
const areasAround = [
	1, 2, 3, 4, 5,
	6, 7, 8,
	9, 10, 11, 12, 13,
	14, 15, 16
].map(code => codes$area[code]);
const areasFallbackOpposite$area = {
	'top center' /* s1 */: ['s3', 's4', 's2'].map(code => codes$area[code]),
	'right center' /* s2 */: ['s4', 's1', 's3'].map(code => codes$area[code]),
	'bottom center' /* s3 */: ['s1', 's2', 's4'].map(code => codes$area[code]),
	'left center' /* s4 */: ['s2', 's3', 's1'].map(code => codes$area[code]),

	'top left' /* c1 */: ['c3', 'c4', 'c2'].map(code => codes$area[code]),
	'top right' /* c2 */: ['c4', 'c1', 'c3'].map(code => codes$area[code]),
	'bottom right' /* c3 */: ['c1', 'c2', 'c4'].map(code => codes$area[code]),
	'bottom left' /* c4 */: ['c2', 'c3', 'c1'].map(code => codes$area[code]),

	'top span-right' /* e1 2 */: [
		3, 4,
		12, 11, 10,
		16, 15, 14,
		6, 7, 8,
	].map(code => codes$area[code]),
	'top span-left' /* e2 4 */: [
		3, 2,
		10, 11, 12,
		6, 7, 8,
		16, 15, 14,
	].map(code => codes$area[code]),
	'right span-bottom' /* e3 6 */: [
		7, 8,
		16, 15, 14,
		4, 3, 2,
		10, 11, 12,
	].map(code => codes$area[code]),
	'right span-top' /* e4 8 */: [
		7, 6,
		14, 15, 16,
		10, 11, 12,
		4, 3, 2,
	].map(code => codes$area[code]),
	'bottom span-left' /* e5 10 */: [
		11, 12,
		4, 3, 2,
		8, 7, 6,
		14, 15, 16,
	].map(code => codes$area[code]),
	'bottom span-right' /* e6 12 */: [
		11, 10,
		2, 3, 4,
		14, 15, 16,
		8, 7, 6,
	].map(code => codes$area[code]),
	'left span-top' /* e7 14 */: [
		15, 16,
		8, 7, 6,
		12, 11, 10,
		2, 3, 4,
	].map(code => codes$area[code]),
	'left span-bottom' /* e8 16 */: [
		15, 14,
		6, 7, 8,
		2, 3, 4,
		12, 11, 10,
	].map(code => codes$area[code]),
};
const valuesAreaPosition$modifier = {
	center: 'center',
	top: 'top',
	bottom: 'bottom',
	left: 'left',
	right: 'right',
	spanTop: 'span-top',
	spanBottom: 'span-bottom',
	spanLeft: 'span-left',
	spanRight: 'span-right',
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
	const offset = tip.arg?.offset ?? 4;
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
	&[intangible]
		@apply pointer-events-none select-none

app-tip
	@apply relative block


	&[intangible]
		@apply pointer-events-none select-none


	--app-tip-text: var(--gray-text1)
	--app-tip-back: var(--main-comp2)
	&[theme=base]
		@apply p-2 py-1.5 rounded-md ws-pre
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]
	&[theme=base-nowrap]
		@apply p-2 py-1.5 rounded-md ws-nowrap
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]
	&[theme=prev]
		--app-tip-back: var(--main-comp)
		@apply p-2 py-1.5 rounded-md ws-pre
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]
	&[theme=prev-nowrap]
		--app-tip-back: var(--main-comp)
		@apply p-2 py-1.5 rounded-md ws-nowrap
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]
	&[theme=next]
		--app-tip-back: var(--main-line1)
		@apply p-2 py-1.5 rounded-md ws-pre
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]
	&[theme=next-nowrap]
		--app-tip-back: var(--main-line1)
		@apply p-2 py-1.5 rounded-md ws-nowrap
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]
	&[theme=deep]
		--app-tip-back: var(--main-line1)
		@apply p-2 py-1.5 rounded-md ws-pre
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]
	&[theme=deep-nowrap]
		--app-tip-back: var(--main-line1)
		@apply p-2 py-1.5 rounded-md ws-nowrap
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]
	&[theme=solid]
		--app-tip-text: var(--contrast)
		--app-tip-back: var(--main-solid)
		@apply p-2 py-1.5 rounded-md ws-pre
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]
	&[theme=solid-nowrap]
		--app-tip-text: var(--contrast)
		--app-tip-back: var(--main-solid)
		@apply p-2 py-1.5 rounded-md ws-nowrap
		@apply color-[var(--app-tip-text)] bg-[--app-tip-back]


	&[arrow]::before
		content: ''
		--app-tip-arrow-size: 4px
		@apply block absolute w-0 h-0 border-transparent

	&[arrow][area~=top]::before
		@apply bottom--2
		left: calc(50% - var(--app-tip-arrow-size))
		border-left-width: var(--app-tip-arrow-size)
		border-right-width: var(--app-tip-arrow-size)
		border-top: calc(var(--app-tip-arrow-size) * 2) solid var(--app-tip-back)
	&[arrow][area~=bottom]::before
		@apply top--2
		left: calc(50% - var(--app-tip-arrow-size))
		border-left-width: var(--app-tip-arrow-size)
		border-right-width: var(--app-tip-arrow-size)
		border-bottom: calc(var(--app-tip-arrow-size) * 2) solid var(--app-tip-back)
	&[arrow][area~=left]::before
		@apply right--2
		top: calc(50% - var(--app-tip-arrow-size))
		border-top-width: var(--app-tip-arrow-size)
		border-bottom-width: var(--app-tip-arrow-size)
		border-left: calc(var(--app-tip-arrow-size) * 2) solid var(--app-tip-back)
	&[arrow][area~=right]::before
		@apply left--2
		top: calc(50% - var(--app-tip-arrow-size))
		border-top-width: var(--app-tip-arrow-size)
		border-bottom-width: var(--app-tip-arrow-size)
		border-right: calc(var(--app-tip-arrow-size) * 2) solid var(--app-tip-back)

	&[arrow][area~=top][area~=left]::before
		@apply top-unset left-unset
		@apply bottom--2 right--1
		border: unset
		border-top: calc(var(--app-tip-arrow-size) * 3) solid var(--app-tip-back)
		border-left: calc(var(--app-tip-arrow-size) * 3) solid transparent
		transform: rotate(-30deg)
	&[arrow][area~=top][area~=right]::before
		@apply top-unset right-unset
		@apply bottom--2 left--1
		border: unset
		border-top: calc(var(--app-tip-arrow-size) * 3) solid var(--app-tip-back)
		border-right: calc(var(--app-tip-arrow-size) * 3) solid transparent
		transform: rotate(30deg)
	&[arrow][area~=bottom][area~=left]::before
		@apply bottom-unset left-unset
		@apply top--2 right--1
		border: unset
		border-bottom: calc(var(--app-tip-arrow-size) * 3) solid var(--app-tip-back)
		border-left: calc(var(--app-tip-arrow-size) * 3) solid transparent
		transform: rotate(30deg)
	&[arrow][area~=bottom][area~=right]::before
		@apply bottom-unset right-unset
		@apply top--2 left--1
		border: unset
		border-bottom: calc(var(--app-tip-arrow-size) * 3) solid var(--app-tip-back)
		border-right: calc(var(--app-tip-arrow-size) * 3) solid transparent
		transform: rotate(-30deg)

app-tip-shadow
	@apply block absolute invisible pointer-events-none select-none
	// debug style:
	// @apply visible bg-amber-1 opacity-40 border-1 border-red-6
</style>
