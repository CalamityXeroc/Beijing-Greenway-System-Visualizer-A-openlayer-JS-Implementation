<template>
  <div class="search-bar" role="combobox" :aria-expanded="showSuggestions && suggestions.length > 0" aria-haspopup="listbox">
    <div class="search-input-group">
      <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        :value="modelValue"
        class="search-input"
        :placeholder="placeholder"
        type="search"
        aria-label="搜索绿道"
        role="searchbox"
        autocomplete="off"
        @input="handleInput"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
        @keyup.enter="$emit('search', modelValue)"
      />
      <button
        v-if="modelValue && clearable"
        class="clear-btn"
        @click="handleClear"
        aria-label="清除搜索"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </button>
    </div>

    <!-- 搜索建议 -->
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions" role="listbox" :id="suggestionsId">
      <button
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="suggestion-item"
        role="option"
        :aria-selected="false"
        @click="handleSelectSuggestion(suggestion)"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>{{ suggestion }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const suggestionsId = 'search-suggestions'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '搜索绿道、地点...'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  showSuggestions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'clear', 'select-suggestion', 'focus', 'blur', 'search'])

const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

const handleSelectSuggestion = (suggestion) => {
  emit('update:modelValue', suggestion)
  emit('select-suggestion', suggestion)
  emit('search', suggestion)
}
</script>

<style scoped>
.search-bar {
  padding: var(--space-md);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.search-input-group {
  display: flex;
  align-items: center;
  border-radius: var(--radius-lg);
  padding: 0 var(--space-md);
  height: 44px;
  transition: all var(--transition-base);
}

.theme-light .search-input-group {
  background: rgba(239, 237, 232, 0.7);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.theme-dark .search-input-group {
  background: rgba(40, 40, 43, 0.7);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.search-input-group:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(33, 122, 50, 0.12);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  margin-right: var(--space-sm);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.clear-btn {
  background: transparent;
  border: none;
  padding: 0;
  margin-left: var(--space-sm);
  color: var(--color-text-tertiary);
  font-size: 20px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.clear-btn:active {
  color: var(--color-text-secondary);
}

.suggestions {
  position: absolute;
  top: 100%;
  left: var(--space-md);
  right: var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-top: var(--space-sm);
  max-height: 200px;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
}

.suggestion-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--space-md);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border-light);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-base);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:active {
  background: var(--color-surface-secondary);
}

.clear-btn svg {
  display: block;
}

.suggestion-item svg {
  color: var(--color-text-tertiary);
  margin-right: var(--space-md);
  flex-shrink: 0;
}

.suggestion-item span {
  color: var(--color-text-primary);
  font-size: var(--text-base);
}
</style>
