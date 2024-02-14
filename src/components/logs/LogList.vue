<script lang="ts">
export default {
  name: 'LogList'
}
</script>

<script setup lang="ts">
import { computed, shallowRef, ref, type ShallowRef, type Ref } from 'vue'
import { ListBase } from '@ui/components'
import { ApiController, type LogItem } from '@/controllers/ApiController';
import LogSearch from '@/components/logs/LogSearch.vue';

const ws = new ApiController('ws://test.enter-systems.ru/')

const scrollContainer = ref<HTMLElement | null>(null)
function updateScrollContainer (val: HTMLElement) {
  if (!val) {
    return
  }

  scrollContainer.value = val
}

const filtersLevel = ref<string>('')
const searchText = ref<string>('')

interface LogItemWithIndex extends LogItem {
  index: number
}
const foundElements = ref<LogItemWithIndex[]>([])

function onSearch(items: LogItem[]): ShallowRef<LogItem[]> {
  foundElements.value = []

  items = items.map((item, index) => {
    if (item.Message.toLowerCase().includes(searchText.value.toLowerCase())) {
      foundElements.value.push({...item, index})
      return { ...item, Message: item.Message.replace(new RegExp(searchText.value, 'gi'), '<span class="highlight">$&</span>') }
    }
    return item
  })

  return shallowRef(items)
}

const logs = computed(() => {
  let newArr = shallowRef<LogItem[]>(ws.logs.value)
  if (filtersLevel.value) {
    newArr = shallowRef(ws.logs.value.filter((item: LogItem) => item.Level === filtersLevel.value))
  }

  if (searchText.value) {
    newArr = onSearch(newArr.value)
  }

  return newArr
})

const headerHeight = 90

</script>

<template>
	<LogSearch 
		v-model:level="filtersLevel"
		v-model:search="searchText"
		:found-elements="foundElements"
		:scroll-container="(scrollContainer as Ref<HTMLElement> | undefined | null)"
		:style="`height: ${headerHeight}px;`" 
	/>
	<ListBase 
		:items="logs"
		@update:scroll-container="updateScrollContainer"
		:style="`height: calc(100vh - ${headerHeight}px)`" 
	/>
</template>


<style>
.highlight {
  background-color: #f6e902;
}
</style>
