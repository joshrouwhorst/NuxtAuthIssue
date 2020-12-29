<template>
    <div class="header-nav">
        <b-navbar toggleable="md" type="light">
            <b-navbar-brand href="/">Site Name</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse">
                <template #default="{ expanded }">
                    <b-icon v-if="expanded" icon="chevron-bar-up"></b-icon>
                    <b-icon v-else icon="chevron-bar-down"></b-icon>
                </template>
            </b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav class="ml-auto">
                    <b-nav-item to="/about">About</b-nav-item>
                    <b-nav-item to="/test">Test</b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script>
import { BNavbar, BNavbarBrand, BCollapse, BNavbarToggle, BIcon } from 'bootstrap-vue'

export default {
    components: {
        BNavbar,
        BNavbarBrand,
        BCollapse,
        BNavbarToggle,
        BIcon
    }
}
</script>

<style lang="scss" scoped>

</style>