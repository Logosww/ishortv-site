<template>
  <div class="register-box-wrapper">
    <div class="register-box-container">
      <img src="@/assets/img/logo.png" alt="" class="register-box-logo" @click="navigateTo('/')">
      <div class="register-box-content">
        <span class="register-box-content__title">新用户注册</span>
        <form class="register-box-content__form">
          <input type="text" name="username" class="sv-input row" v-model="form.username" placeholder="请输入用户名">
          <input type="text" name="nickname" class="sv-input row" v-model="form.nickname" placeholder="请输入昵称">
          <input type="password" name="password" class="sv-input row" v-model="form.password" placeholder="请输入密码">
          <input type="password" name="repassword" class="sv-input row" v-model="repassword" placeholder="请再次输入密码">
          <input 
            type="text"
            name="email"
            class="sv-input row"
            v-model="form.email"
            placeholder="请输入Email"
            @submit.prevent
            @keypress.enter="handleRegister"
          >
        </form>
        <v-btn size="large" rounded="lg" color="light-blue" variant="flat" block @click="handleRegister">注册并登录</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegisterInfo } from '@/composables/use-api-types';

definePageMeta({ layout: false });
useHead({ title: '注册' });

const repassword = ref('');
const form = reactive<RegisterInfo>({
  username: '',
  password: '',
  nickname: '',
  email: ''
});

const message = useMessage();

const handleRegister = async () => {
  //validation
  if(form.password !== repassword.value) {
    message({ type: 'danger', message: '密码输入不一致' });
    return;
  };

  await useRegister(form);

  //manaully set cookies
  const isAdmin = useCookie<boolean>('is_admin');
  isAdmin.value = false;
  
  const auth = useAuth();
  auth.value.isAuthenticated = true;
  auth.value.isAuthorized = false;
  return navigateTo('/');
};
</script>
<style lang="scss">
@use '@/assets/style/register' as *;
</style>