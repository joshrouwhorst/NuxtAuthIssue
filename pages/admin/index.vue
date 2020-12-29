<template>
    <div class="admin-page">
        <div class="settings">
            <div class="row">
                <div class="col-12">
                    <label>
                        Candidate name
                        <input type="text" v-model="settings.name" />
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    layout: 'auth',
    data () {
        return {
            settings: {}
        }
    }
}
</script>