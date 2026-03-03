const fs = require('fs')
const toolbar = fs.readFileSync('greenway-vue/src/components/MapToolbar.vue', 'utf8')
const navbar = fs.readFileSync('greenway-vue/src/components/TopNavbar.vue', 'utf8')

const checks = [
  ['MapToolbar: reactive import', toolbar.includes('import { ref, reactive,')],
  ['MapToolbar: drawStyles is reactive()', toolbar.includes('const drawStyles = reactive(')],
  ['MapToolbar: no drawStyles.value anywhere', !toolbar.includes('drawStyles.value')],
  ['MapToolbar: exportMapImage setTimeout 300ms', toolbar.includes('  }, 300)')],
  ['MapToolbar: drawStyles exposed', toolbar.includes('  drawStyles,')],
  ['TopNavbar: drawStyles computed no .value', navbar.includes('return props.toolbarRef.drawStyles;')],
  ['TopNavbar: localDrawType toggle', navbar.includes('localDrawType.value = localDrawType.value === type ? null : type')],
  ['TopNavbar: v-if drawStyles check', navbar.includes('v-if="drawStyles && (localDrawType')],
]

let allOk = true
checks.forEach(([name, ok]) => {
  console.log((ok ? 'OK  ' : 'FAIL') + ': ' + name)
  if (!ok) allOk = false
})
console.log(allOk ? '\nAll checks passed!' : '\nSome checks FAILED!')
