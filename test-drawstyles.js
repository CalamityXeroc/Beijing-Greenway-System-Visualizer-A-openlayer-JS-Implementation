const fs = require("fs");
const c = fs.readFileSync("c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/components/MapToolbar.vue", "utf8");
console.log(c.includes("const drawStyles = ref({") ? "drawStyles OK in MapToolbar" : "drawStyles MISSING in MapToolbar");
console.log(c.includes("drawStyles,") ? "drawStyles exposed OK" : "drawStyles NOT exposed");
const c2 = fs.readFileSync("c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/components/TopNavbar.vue", "utf8");
console.log(c2.includes("const drawStyles = computed") ? "drawStyles OK in TopNavbar" : "drawStyles MISSING in TopNavbar");
console.log(c2.includes("exportMapImage") ? "exportMapImage OK in TopNavbar" : "exportMapImage MISSING in TopNavbar");
