import { createApp } from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-3-socket.io'
import SocketIO from 'socket.io-client'
import { Quasar } from 'quasar'
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v6/mdi-v6.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

const myApp = createApp(App) 
myApp.use(new VueSocketIO({
    debug: true,
    connection: SocketIO('https://liga-extraordinaria.herokuapp.com')
}))
myApp.use(Quasar)
myApp.mount('#app')
