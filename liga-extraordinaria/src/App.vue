<template>
  <div id="app">
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Nombre de usuario</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="name" autofocus @keyup.enter="rename()" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">          
          <q-btn flat label="Ingresar" @click="rename()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div id="game">
      <Game />
    </div>
    <div id="border" />
    <div id="input">
      <Chat v-if="prompt === false"/>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue'
import Chat from './components/Chat.vue';
import Game from './components/Game.vue';
import {game} from './components/game.js';
export default {
  name: 'App',
  components: {
    Chat,
    Game
  },
  data: function () {
    return {                
      prompt: ref(true),
      name: '',
      game
    }    
  },
  methods: {
    rename(){                  
      this.$socket.emit('name', this.name)      
      this.prompt = false                  
    }
  },
  sockets:{
    user: function(user){      
      this.game.username = user
      console.log(user)      
    }
  }
}
</script>

<style>
    #app {
        font-family: 'Trebuchet MS';
        text-align: left;                
        display: flex;
        overflow:hidden
    }
    #game {
        width: 47vw;
        height: 100vh;
    }
    #input {
        width: 50vw;
        height: 100vh;
    }
    #border {
        border-right: 2px solid black;
    }
    @media (max-width: 1000px) {
        #app {
            flex-direction: column;
        }
        #game {
            width: 100vw;
            height: 50vh;
        }
        #input {
            width: 100vw;
            height: 50vh;
        }
    }
</style>