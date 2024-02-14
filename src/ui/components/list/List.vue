<script lang="ts">
export default {
	name: 'ListBase'
}
</script>

<script setup lang="ts">
import { ref, type Ref, watch, type ShallowRef, computed } from 'vue'

import { useVirtualScroll, scrollToBottom } from '@/composables';
import { type VirtualScrollProps } from '@/composables/useVirtualScroll/interface'
import type { LogItem } from '@/controllers/ApiController';

interface ListProps {
	items: ShallowRef<LogItem[]>
}
const props = defineProps<ListProps>()
const emit = defineEmits(['update:scroll-container'])

interface IScrollData {
	viewportHeight: number,
	visibleItems: LogItem[],
	startIndex: number,
}

const scrollData: Ref<IScrollData> = ref({
	viewportHeight: 0,
	visibleItems: [],
	startIndex: 0
})
const scrollContainer: Ref<HTMLElement | null> = ref(null)
const itemHeight = 50

watch(() => props.items, () => {
	onScroll().then(() => {
		scrollToBottom(scrollContainer as Ref<HTMLElement>, scrollData.value.viewportHeight)
	})
})

function onScroll(): Promise<void> {
	return new Promise((resolve) => {
		const { totalHeightContainer, visibleItems, startIndex } = useVirtualScroll({
			container: scrollContainer.value,
			items: props.items,
			itemHeight
		} as VirtualScrollProps)

		scrollData.value.viewportHeight = totalHeightContainer
		scrollData.value.visibleItems = visibleItems
		scrollData.value.startIndex = startIndex

		resolve()
	})
}

watch(() => scrollContainer.value, () => {
	emit('update:scroll-container', scrollContainer)
})

const offsetY = computed(() => {
	return scrollData.value.startIndex * itemHeight
})
</script>

<template>
	<div ref="scrollContainer"
		class="scroll-container"
		@scroll="onScroll">
		<!-- Использую v-html чтобы иметь возможность выделять найденные подстроки -->
		<!-- В перспективе лучше написать свою директиву v-html-safe, где использовать библиотеку sanitize-html -->
		<div :style="`min-height: ${scrollData.viewportHeight}px`"></div>
		<div class="scroll-content"
			:style="`transform: translateY(${offsetY}px)`">
			<div class="scroll-item"
				v-for="(item, index) in scrollData.visibleItems"
				:key="index">
				{{ item.Timestamp }} {{ item.Level }} <span v-html="item.Message"></span>
			</div>
		</div>
	</div>
</template>


<style scoped>
.scroll-container {
	position: relative;
	overflow-y: auto;
}

.scroll-content {
	position: absolute;
	top: 0;
}

.scroll-item {
	min-height: 50px;
	padding-left: 16px;
	white-space: nowrap;
	overflow-x: auto;
}
</style>

