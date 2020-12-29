<template>
    <div class="login page">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-12 col-md-6 box">
                    <form @submit.prevent="send()">
                        <div class="row justify-content-center">
                            <div class="col-12">
                                <input v-model="login.username" placeholder="Username" type="text" class="form-control" />
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12">
                                <input v-model="login.password" placeholder="Password" type="password" class="form-control" />
                            </div>
                        </div>

                        <div class="row justify-content-center">
                            <div class="col-12">
                                <button class="btn btn-primary btn-block login-button" type="submit" :disabled="disableBtn">Login</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    middleware: ['auth'],
    data () {
        return {
            login: {
                username: null,
                password: null
            },
            disableBtn: false
        }
    },
    methods: {
        async send () {
            try {
                console.log('This:')
                console.log(this)
                this.disableBtn = true
                await this.$auth.loginWith('local', { data: this.login })
            } catch (err) {
                this.disableBtn = false
                console.log(err)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    .login {
        input {
            margin-bottom: 20px;
        }
    }
</style>
