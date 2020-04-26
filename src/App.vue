<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="less">
#app {
  overflow: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  color: #333;
}
.el-message {
  z-index:10000 !important;
}
</style>
