<template>
  <div id="app">
    <h1>{{ message }}</h1>
    <h2>动态交互1234</h2>
    <input v-model="message" type="text" />
    <button @click="onClick">点击弹窗</button>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/about">about</router-link></li>
    </ul>
    ​<router-view /> 
  </div>
</template>
​
<script>
export default {
  name: "App",
  data() {
    return {
      message: "hello world",
    };
  },
  methods: {
    onClick() {
      alert(this.message);
    },
  },
};
</script>
​
<style scoped>
</style>
​
