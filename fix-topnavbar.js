const fs = require("fs");
const p = "c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/components/TopNavbar.vue";
let c = fs.readFileSync(p, "utf8");

c = c.replace(/const drawStyles = computed\(\(\) => props\.toolbarRef\?\.drawStyles\?\.value \?\? null\)/g, 
`const drawStyles = computed(() => {
  if (props.toolbarRef && props.toolbarRef.drawStyles) {
    return props.toolbarRef.drawStyles;
  }
  return null;
})`);

fs.writeFileSync(p, c);
