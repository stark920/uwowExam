import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export interface VirtualScrollOptions<T> {
  items: Ref<T[]>;
  itemHeight: number;
  overscan?: number;
  containerRef: Ref<HTMLElement | null>;
  onReachBottom?: () => void;
  reachBottomThreshold?: number;
}

export function useVirtualScroll<T>(options: VirtualScrollOptions<T>) {
  const {
    items,
    itemHeight,
    overscan = 5,
    containerRef,
    onReachBottom,
    reachBottomThreshold = 400,
  } = options;

  const scrollTop = ref(0);
  const containerHeight = ref(600);
  let isThrottled = false;
  let resizeObserver: ResizeObserver | null = null;

  const totalCount = computed(() => items.value.length);
  const totalHeight = computed(() => totalCount.value * itemHeight);

  const startIndex = computed(() => {
    const rawStart = Math.floor(scrollTop.value / itemHeight) - overscan;
    return Math.max(0, rawStart);
  });

  const endIndex = computed(() => {
    const visibleCount = Math.ceil(containerHeight.value / itemHeight);
    const rawEnd = startIndex.value + visibleCount + overscan * 2;
    return Math.min(totalCount.value, rawEnd);
  });

  const visibleItems = computed(() => {
    const slice = items.value.slice(startIndex.value, endIndex.value);
    return slice.map((item, index) => ({
      item,
      index: startIndex.value + index,
      topOffset: (startIndex.value + index) * itemHeight,
    }));
  });

  const topPadding = computed(() => startIndex.value * itemHeight);
  const bottomPadding = computed(() => {
    const remaining = totalCount.value - endIndex.value;
    return Math.max(0, remaining * itemHeight);
  });

  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    if (!target) return;

    if (!isThrottled) {
      isThrottled = true;
      requestAnimationFrame(() => {
        scrollTop.value = target.scrollTop;

        const scrollBottom = target.scrollHeight - (target.scrollTop + target.clientHeight);
        if (scrollBottom < reachBottomThreshold && onReachBottom) {
          onReachBottom();
        }

        isThrottled = false;
      });
    }
  }

  function scrollToTop() {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0;
      scrollTop.value = 0;
    }
  }

  function scrollToIndex(index: number) {
    if (containerRef.value) {
      const targetScroll = Math.max(0, index * itemHeight);
      containerRef.value.scrollTop = targetScroll;
      scrollTop.value = targetScroll;
    }
  }

  onMounted(() => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight || 600;

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          containerHeight.value = entry.contentRect.height || 600;
        }
      });
      resizeObserver.observe(containerRef.value);
    }
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  return {
    scrollTop,
    containerHeight,
    totalHeight,
    startIndex,
    endIndex,
    visibleItems,
    topPadding,
    bottomPadding,
    handleScroll,
    scrollToTop,
    scrollToIndex,
  };
}
