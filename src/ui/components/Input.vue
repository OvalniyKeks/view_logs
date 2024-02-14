<script lang="ts">
export default {
  name: 'InputBase'
}
</script>

<script setup lang="ts">

import { useDebounce } from '@/composables';

const emit = defineEmits(['update:model-value'])
defineProps({
  modelValue: String,
  type: {
    type: String,
    default: 'text'
  },
})

function updateModelValue(event: Event) {
  const target = event.target as HTMLSelectElement

  useDebounce(() => emit('update:model-value', target.value), 500)()
}

</script>

<template>
	<input :type="type"
		v-bind="$attrs"
		:value="modelValue"
		@input="updateModelValue">
</template>
