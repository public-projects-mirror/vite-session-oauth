<script setup lang="ts">
import { ref } from 'vue';
import axios from "axios";
import router from "../../routes.ts";

const username = ref('');
const sessionId = ref('');
const state = ref('');

const redirectUriFromUrl = localStorage.getItem('redirectUriFromUrl');
console.log("uri: "+ redirectUriFromUrl);
const redirectUri = decodeURI(redirectUriFromUrl);
console.log("redirectUri", redirectUri);

username.value = localStorage.getItem('serverUsername') || '';
state.value = localStorage.getItem('oAuthState') || '';
sessionId.value = localStorage.getItem('serverSessionId') || '';

const handleAuthorize = () => {
  if(state.value == ''){
    window.location.href = 'http://localhost:8081/oauth/authorize?redirect_uri='
        + redirectUri + '&session_id=' + sessionId.value;
  } else {
    window.location.href = 'http://localhost:8081/oauth/authorize?redirect_uri='
        + redirectUri + '&session_id=' + sessionId.value + '&state=' + state.value;
  }
};

const handleLogout = async () => {
  try {
    const response = await axios.get('http://localhost:8081/auth/logout', {
      params: {sessionId: sessionId.value}
    });
    localStorage.removeItem('serverSessionId');
    sessionId.value = '';
    await router.push('/server/login');
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
};


</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-2">
    <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-center text-gray-800">
        使用Oauth服务端登录成功
      </h2>
      <p class="text-center text-gray-600">
        欢迎回来, {{ username }}
      </p>
      <div class="flex justify-end">
        <button
            class="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="handleAuthorize">
          授权
        </button>
      </div>
      <div class="flex justify-end">
        <button
            class="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="handleLogout">
          退出
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped></style>
