<template>
    <div class="admin page container">
        <AuthHeader />
        <NuxtChild />
    </div>
</template>

<script>
import AuthHeader from '@/components/AuthHeader'
export default {
    layout: 'auth',
    components: {
        AuthHeader
    }
}
</script>

<style lang="scss" scoped>

</style>