const fs=require("fs");
const p="c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/components/MapToolbar.vue";
let c=fs.readFileSync(p,"utf8");
c = c.replace(/map\.once\("rendercomplete", \(\) => \{/, "setTimeout(() => {\n    map.once(\"rendercomplete\", () => {");
c = c.replace(/alert\(".*"\)\s*}\s*}\)\s*}/, "");
fs.writeFileSync(p, c);
