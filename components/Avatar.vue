<template>
  <div class="sv-avatar-login" v-if="!isAuthenticated" @click="navigateTo('/login')">
    <div class="sv-avatar-title">登录</div>
  </div>
  <div v-else>
    <v-menu
      min-width="200px"
      rounded
    >
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          v-bind="props"
          size="44"
        >
          <v-avatar
            color="blue"
            size="44"
          >
          {{ userInfo?.nickname.at(0) }}
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-card-text>
          <div class="mx-auto text-center">
            <v-avatar
              color="blue"
              size="44"
            >
              {{ userInfo?.nickname.at(0) }}
            </v-avatar>
            <h3 style="margin-top: 5px">Logos</h3>
            <p class="text-caption mt-1">
              {{ userInfo?.email }}
            </p>
            <v-divider class="my-3"></v-divider>
            <v-btn
              rounded
              variant="text"
            >
              <v-icon :icon="mdiAccountEdit" />
              编辑资料
            </v-btn>
            <v-divider class="my-3"></v-divider>
            <v-btn
              rounded
              variant="text"
              @click="logout"
            >
              <v-icon :icon="mdiLogout" />
              登出
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { mdiAccountEdit, mdiLogout } from '@mdi/js';

const message = useMessage();
const auth = useAuth();
const { isAuthenticated } = auth.value;
const userInfo = isAuthenticated ? (await useGetUserInfo()).data : undefined;

const logout = async () => {
  await useLogout();
  const token = useCookie('access_token');
  token.value = null;
  const isAdmin = useCookie('is_admin');
  isAdmin.value = null;
  const auth = useAuth();
  auth.value.isAuthenticated = false;
  auth.value.isAuthorized = false;

  message({
    type: 'success',
    message: '登出成功'
  });
  await navigateTo('/login');
};
</script>

<style lang="scss">
@use '@/assets/style/components/avatar' as *;
</style>