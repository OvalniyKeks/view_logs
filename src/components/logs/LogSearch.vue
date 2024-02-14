<script lang="ts">
export default {
  name: 'LogSearch'
}
</script>

<script setup lang="ts">
import type { LogItem } from '@/controllers/ApiController';
import { InputBase } from '@/ui/components';
import { scrollToIndex } from '@/composables';
import { ref, type Ref } from 'vue';

interface Ilevels {
  label: string
  value: string
}

const levels: Ilevels[] = [{
  label: 'ПОКАЗАТЬ ВСЕ',
  value: ''
},
{
  label: 'INFO',
  value: 'INFO'
},
{
  label: 'TRACE',
  value: 'TRACE'
},
{
  label: 'FATAL',
  value: 'FATAL'
},
{
  label: 'WARN',
  value: 'WARN'
},
{
  label: 'ERROR',
  value: 'ERROR'
},
{
  label: 'DEBUG',
  value: 'DEBUG'
}]

interface LogSearchProps {
  level?: string,
  search?: string,
  foundElements?: LogItem[],
  scrollContainer?: Ref<HTMLElement> | null
}

const emit = defineEmits(['update:level', 'update:search'])
const props = defineProps<LogSearchProps>()

function updateLevel(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:level', target.value)
}

function updateSearch(val: string) {
  emit('update:search', val)
}

interface LogItemWithIndex extends LogItem {
  index: number
}
const selectedItemIdx = ref(0)
function next() {
  if (!props.scrollContainer) {
    return
  }

  if (props.foundElements && props.foundElements?.length > 0) {

    if (selectedItemIdx.value + 1 < props.foundElements.length) {
      selectedItemIdx.value++
    } else {
      selectedItemIdx.value = 0
    }

    const currentIndexSearch = props.foundElements[selectedItemIdx.value] as LogItemWithIndex

    scrollToIndex(props.scrollContainer.value, currentIndexSearch.index, 50)    
  }
}
function prev() {
  if (!props.scrollContainer) {
    return
  }

  if (props.foundElements && props.foundElements?.length > 0) {

    if (selectedItemIdx.value - 1 < 0) {
      selectedItemIdx.value = props.foundElements.length - 1
    } else {
      selectedItemIdx.value--
    }

    const currentIndexSearch = props.foundElements[selectedItemIdx.value] as LogItemWithIndex

    scrollToIndex(props.scrollContainer.value, currentIndexSearch.index, 50)    
  }
}

</script>

<template>
	<div class="log-search">
		<div class="log-search__item">
			<label for="levels">Фильтр по уровню</label>
			<select id="levels"
				@change="updateLevel">
				<option v-for="(level, i) of levels"
					:key="i"
					:value="level.value">{{ level.label }}</option>
			</select>
		</div>
		<div class="log-search__item">
			<label for="input-search__log">Поиск по логам</label>
			<InputBase id="input-search__log"
				type="search"
				@update:model-value="updateSearch"
				:model-value="$props.search" />
		</div>
		<div class="log-search__item">
			<div>Найдено: {{ foundElements?.length }}</div>
			<div class="log-search__action">
				<button @click="prev">Назад</button>
				<button @click="next">Вперед</button>
			</div>
		</div>
	</div>
</template>


<style>
.log-search {
  border-bottom: 1px solid #a2a2a2;
  padding: 0 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.log-search__item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.log-search__action {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
}
</style>
