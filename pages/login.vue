<template>
  <div class="login-box-wrapper">
    <div class="login-box-container">
      <div class="login-box-content">
        <img class="login-box-content__logo" :src="`${CDN_URL}/logo@2x.png`" @click="navigateTo('/')">
        <form class="login-box-content__form">
          <input class="sv-input row" type="text" name="username" v-model="form.username" placeholder="请输入用户名">
          <input 
            class="sv-input row"
            type="password"
            name="password"
            v-model="form.password"
            placeholder="请输入密码"
            @submit.prevent
            @keypress.enter="handleLogin"
          >
          <div class="row">
            <label class="sv-checkbox">
              <input type="checkbox" name="isAdmin" v-model="form.isAdmin">
              <span>管理员</span>
            </label>
            <a href="/register" class="sv-link">注册新用户</a>
          </div>
        </form>
        <v-btn size="large" rounded="lg" color="light-blue" variant="flat" block @click="handleLogin">登录</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CDN_URL } from '@/constants';

definePageMeta({ layout: false });
useHead({ title: '登录' });

interface FormData {
  username: string;
  password: string;
  isAdmin: boolean;
};

const form = reactive<FormData>({
  username: '',
  password: '',
  isAdmin: false
});

const message = useMessage();

const handleLogin = async () => {
  //validation


  await useLogin(form);

  const auth = useAuth();
  auth.value.isAuthenticated = true;
  auth.value.isAuthorized = form.isAdmin;
  useCookie('is_admin').value = `${form.isAdmin}`;

  message({
    type: 'success',
    message: '登录成功'
  });
  await navigateTo(form.isAdmin ? '/admin' : '/');
};


</script>

<style lang="scss">
@use '@/assets/style/login' as *;
</style>