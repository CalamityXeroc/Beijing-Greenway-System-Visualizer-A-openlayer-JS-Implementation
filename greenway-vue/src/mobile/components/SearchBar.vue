<template>
  <div class="search-bar">
    <div class="search-input-group">
      <i class="ion-magnify search-icon"></i>
      <input
        :value="modelValue"
        class="search-input"
        :placeholder="placeholder"
        type="text"
        @input="handleInput"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
        @keyup.enter="$emit('search', modelValue)"
      />
      <button
        v-if="modelValue && clearable"
        class="clear-btn"
        @click="handleClear"
      >
        <i class="ion-close-circle"></i>
      </button>
    </div>
    
    <!-- 搜索建议 -->
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions">
      <button
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="suggestion-item"
        @click="handleSelectSuggestion(suggestion)"
      >
        <i class="ion-history"></i>
        <span>{{ suggestion }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0 var(--space-md);
  height: 44px;
  transition: all var(--transition-base);
}

.search-input-group:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 92, 32, 0.1);
}

.search-icon {
  font-size: 20px;
  color: var(--color-text-tertiary);
  margin-right: var(--space-sm);
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

.suggestion-item i {
  color: var(--color-text-tertiary);
  margin-right: var(--space-md);
  font-size: 16px;
}

.suggestion-item span {
  color: var(--color-text-primary);
  font-size: var(--text-base);
}
</style>
