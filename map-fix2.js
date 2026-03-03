const fs=require('fs');
const p='c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/components/MapToolbar.vue';
let c=fs.readFileSync(p,'utf8');
c = c.replace('setTimeout(() => {\\n    map.once(\\\'rendercomplete\\\', () => {', 'setTimeout(() => {\n    map.once(\'rendercomplete\', () => {');
fs.writeFileSync(p, c);
