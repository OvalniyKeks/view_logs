import type { Ref } from "vue";
import { type VirtualScrollProps } from "./interface";

function useVirtualScroll({ container, items, itemHeight }: VirtualScrollProps) {
  const totalHeightContainer: number = items.value.length * itemHeight;

  let visibleItems = []
  let startIndex = 0
  let endIndex = 0

  const scrollTop = container.scrollTop;
  const visibleHeight = container.clientHeight;

  const visibleItemCount = Math.ceil(visibleHeight / itemHeight);

  startIndex = Math.floor(scrollTop / itemHeight);

  endIndex = Math.min(startIndex + visibleItemCount, items.value.length);

  visibleItems = items.value.slice(startIndex, endIndex);

  return { totalHeightContainer, visibleItems, startIndex, endIndex }
}

function scrollToIndex(container: HTMLElement, index: number, itemHeight: number) {
  container.scrollTop = index * itemHeight
}

function scrollToBottom(container: Ref<HTMLElement>, height: number) {
  container.value.scrollTop = height
}


export { useVirtualScroll, scrollToIndex, scrollToBottom }
