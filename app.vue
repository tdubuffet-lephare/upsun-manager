<template>
  <div class="min-h-screen bg-bg text-text">
    <a href="#main-content" class="skip-link">Aller au contenu principal</a>
    <template v-if="showSidebar">
      <AppSidebar />
      <main
        id="main-content"
        class="min-h-screen transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        :style="{ marginLeft: collapsed ? '56px' : '240px' }"
      >
        <NuxtPage />
      </main>
    </template>
    <template v-else>
      <main id="main-content">
        <NuxtPage />
      </main>
    </template>
    <ToastContainer />
    <UpdateBanner />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { collapsed } = useSidebar()
useTheme()

const showSidebar = computed(() => route.path !== '/setup')
</script>
