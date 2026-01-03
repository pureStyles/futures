<template>
  <div id="app">
    <div class="title">期货数据跟踪</div>
    <div class="body">
      <div class="side-bar">
        <Sidebar />
      </div>
      <div class="main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>

import Sidebar from './components/Sidebar';

export default {
  name: 'App',
  components: {
    Sidebar
  }
}
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.title {
  margin: 0 40px;
  background-color: #eae7e7;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;

  color: #000000;
  font-size: 14px;
  font-weight: 400;
}
.body {
  margin-top: 40px;
  padding: 0 40px;
  display: flex;
  height: 100vh;
  background-color: #fdfdfd;

  gap: 30px;

  .main {
    flex: 1;
  }
}
</style>

<style>
  a {
    text-decoration: none;
    font-size: 16px;

    &:hover {
      text-decoration: underline dotted;
    }
  }
</style>
