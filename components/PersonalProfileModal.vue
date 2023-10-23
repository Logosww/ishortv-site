<template>
  <v-dialog v-model="modalVisible" scroll-strategy="none">
    <div class="sv-modal-personal-profile">
      <div class="sv-modal-personal-profile__header">
        <div class="sv-modal-personal-profile__title">个人资料</div>
        <v-btn
          class="sv-modal-personal-profile__action"
          :icon="mdiClose"
          variant="text"
          color="white"
          size="32"
          @click="modalVisible = false"
        />
      </div>
      <div class="sv-modal-personal-profile__content">
        <div class="sv-modal-personal-profile__avatar">
          <v-avatar
            color="blue"
            size="81"
            :image="profile?.avatar"
          >
            {{ profile?.nickname.slice(0, 6) }}
          </v-avatar>
          <div class="sv-modal-personal-profile__avatar-mask">
            <v-btn
              width="100%"
              height="100%"
              variant="plain"
              color="white"
              :icon="mdiImageEditOutline"
              @click="handleUploadAvatar"
            />
          </div>
        </div>
        <div class="sv-modal-personal-profile__info">
          <div class="sv-modal-personal-profile__info-item">
            <span class="sv-modal-personal-profile__info-item__label">昵称</span>
            <span class="sv-modal-personal-profile__info-item__value">{{ profile?.nickname }}</span>
          </div>
          <div class="sv-modal-personal-profile__info-item" v-if="profile?.sex">
            <span class="sv-modal-personal-profile__info-item__label">性别</span>
            <span class="sv-modal-personal-profile__info-item__value">{{ profile.sex }}</span>
          </div>
          <div class="sv-modal-personal-profile__info-item">
            <span class="sv-modal-personal-profile__info-item__label">邮箱</span>
            <span class="sv-modal-personal-profile__info-item__value">{{ profile?.email }}</span>
          </div>
          <div class="sv-modal-personal-profile__info-item" v-if="profile?.signature">
            <span class="sv-modal-personal-profile__info-item__label">个性签名</span>
            <span class="sv-modal-personal-profile__info-item__value">{{ profile.signature }}</span>
          </div>
        </div>
      </div>
      <div class="sv-modal-personal-profile__footer">
        <v-btn 
          rounded="lg"
          color="blue-lighten-1"
          :prepend-icon="mdiAccountEdit"
          @click="handleToModify"
        >
          编辑资料
          <v-dialog
            activator="parent"
            v-model="modifyModalVisible"
            @update:model-value="val => !val && formRef?.resetValidation()"
          >
            <div class="sv-modal-modify-profile">
              <div class="sv-modal-modify-profile__header">
                <div class="sv-modal-modify-profile__title">编辑资料</div>
                <v-btn
                  class="sv-modal-modify-profile__action"
                  :icon="mdiClose"
                  variant="text"
                  color="white"
                  size="32"
                  @click="modifyModalVisible = false"
                />
              </div>
              <div class="sv-modal-modify-profile__content">
                <v-form class="sv-modal-modify-profile__form" ref="formRef" @submit.prevent>
                  <v-text-field
                    label="昵称"
                    variant="solo-filled"
                    theme="dark"
                    bg-color="#595858"
                    v-model="form.nickname"
                    :rules="[val => !!val || '请输入昵称']"
                  />
                  <v-select
                    label="性别"
                    variant="solo-filled"
                    theme="dark"
                    bg-color="#595858"
                    v-model="form.sex"
                    :items="['男', '女']"
                    :rules="[val => !!val || '请选择性别']"
                  />
                  <v-text-field
                    label="邮箱"
                    variant="solo-filled"
                    theme="dark"
                    bg-color="#595858"
                    v-model="form.email"
                    :rules="[val => /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/.test(val) || '请输入正确邮箱']"
                  />
                  <v-textarea
                    label="个性签名"
                    variant="solo-filled"
                    theme="dark"
                    bg-color="#595858"
                    rows="3"
                    v-model="form.signature"
                    clearable 
                  />
                </v-form>
              </div>
              <div class="sv-modal-modify-profile__footer">
                <v-btn
                  type="submit"
                  rounded="lg"
                  color="blue-lighten-1"
                  :loading="isSubmitting"
                  :prepend-icon="mdiCheck"
                  @click="handleSubmit"
                >
                  确认
                </v-btn>
              </div>
            </div>
          </v-dialog>
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts" setup>
import { mdiAccountEdit, mdiClose, mdiCheck, mdiImageEditOutline } from '@mdi/js';
import type { VForm } from 'vuetify/lib/components/index.mjs';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

const modifyModalVisible = ref(false);
const isSubmitting = ref(false);
const formRef = ref<InstanceType<typeof VForm>>();

const modalVisible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
    return val;
  }
});

const form = reactive<{
  nickname?: string;
  sex?: string;
  email?: string;
  signature?: string;
}>({});

const { data: profile, refresh: refreshProfile } = await useGetUserInfo();
const { upload } = await useCOSUpload();
const message = useMessage();

const handleToModify = () => {
  const { nickname, sex, email, signature } = profile.value!;
  form.nickname = nickname;
  form.sex = sex;
  form.email = email;
  form.signature = signature;
};

const handleUploadAvatar = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.png,.jpg,.jpeg,.webp';
  input.onchange = () => {
    const [image] = input.files!;
    upload(image).then(async (key) => {
      await useModifyUserInfo({ avatar: key });
      await refreshProfile();
      message({ type:'success', message: '头像更新成功'});
    });
  };
  input.click();
};

const handleSubmit = () => {
  formRef.value?.validate().then(({ valid }) => {
    if(!valid) return;

    isSubmitting.value = true;
    useModifyUserInfo(form).then(() => {
      refreshProfile();
      message({ type: 'success', message: '资料更新成功'});
      modifyModalVisible.value = false;
    }).finally(() => isSubmitting.value = false);
  });
};
</script>

<style lang="scss">
@use '@/assets/style/components/personal-profile-modal' as *;
</style>