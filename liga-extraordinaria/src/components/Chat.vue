<template>
  <div id="container">    
    <div id="output" class="q-pa-md q-gutter-y-md overflow-auto" style="display: flex; height: 85vh;max-height: 85vh; flex-direction: column-reverse; margin-top:4vh">       
      <q-infinite-scroll @load="onLoad" :offset="0" class="scr">                
        <template v-slot:loading>
            <div class="row justify-center q-my-md">
              
            </div>
          </template>           
        <q-item v-for="(text, index) in textOutput" :key="index" class="q-py-sm">            
          <q-item-section>                
            {{text}}
          </q-item-section>
        </q-item>
      </q-infinite-scroll>            
    </div>    
    <div id="input" class="q-pa-md">      
      <q-separator style="height: 2px" />
      <q-input bottom-slots v-model="textInput" label="Mensaje" :dense="dense" autofocus @keyup.enter="submitText">        
        <template v-slot:append>
          <q-icon v-if="textInput !== ''" name="close" @click="textInput = ''" class="cursor-pointer" />          
        </template>
        <template v-slot:hint>
          Para la lista de comandos: !help
        </template>
        <template v-slot:after>
          <q-btn round dense flat icon="send" @click="submitText" />
        </template>
      </q-input>      
    </div>
  </div>
</template>

<script>        
import { ref } from 'vue'
import {game} from './game.js'
export default {
  name: 'Chat',
  setup () {  
    const textOutput = ref([])
      return {
        textOutput,
        onLoad (index, done) {
          setTimeout(() => { 
            
            done()
          }, 1000)
      }
    }
  },
  data() {
    return {
      textInput: null,    
      game
    }    
  },
  methods: {
  joinGame(startup){      
    this.$socket.emit('joinGame', startup)                
  },
  //call to join as referee
  refGame(){
    this.$socket.emit('refGame')
  },  
  //roll dice and send owner
  rollDice(){
    this.$socket.emit('rollDice')
  },
  pieceChoice(){
    this.$socket.emit('pieceChoice')
  },
  requestCommandList(){
    this.$socket.emit('requestCommandList')
  },
  choice(n){
    this.$socket.emit('choice', n)
  },
    submitText: function (event) {
      let commands = {
        1: "!help",
        2: "!referee",
        3: "!cuidamed",
        4: "!heymexico",
        5: "!madrehadisima",
        6: "!murlota",
        7: "!natuveg",
        8: "!wheelyscafe",
        9: "!a",
        10: "!roll",
        11: "!1",
        12: "!2",
        13: "!3",
        14: "!4",
        15: "!5",
        16: "!6",
        17: "!7",
        18: "!8",
        19: "!9",
        20: "!10",
        21: "!11",
        22: "!Pcuidamed",
        23: "!Pheymexico",
        24: "!Pmadrehadisima",
        25: "!Pmurlota",
        26: "!Pnatuveg",
        27: "!Pwheelyscafe",
        28: "!yes",
        29: "!no",
        30: "!xpill",
        31: "!b",
        32: "!fempower",
        33: "!0",
        34: "!start"
      }
      event.preventDefault();      
      switch(this.textInput){
        case commands[1]:
          this.requestCommandList()
          break
        
        case commands[2]:
          this.refGame()
          break

        case commands[3]:
          this.joinGame("CuidaMED")
          break

        case commands[4]:
          this.joinGame("HeyMexico")
          break

        case commands[5]:
          this.joinGame("MadreHadisima")
          break

        case commands[6]:
          this.joinGame("Murlota")
          break

        case commands[7]:
          this.joinGame("NatuVeg")
          break

        case commands[8]:
          this.joinGame("Wheelys Cafe")
          break

        case commands[9]:
          this.choice("a")
          break

        case commands[10]:
          this.rollDice()
          break

        case commands[11]:
          this.choice(1)
          break

        case commands[12]:
          this.choice(2)
          break

        case commands[13]:
          this.choice(3)
          break

        case commands[14]:
          this.choice(4)
          break

        case commands[15]:
          this.choice(5)
          break

        case commands[16]:
          this.choice(6)
          break

        case commands[17]:
          this.choice(7)
          break

        case commands[18]:
          this.choice(8)
          break

        case commands[19]:
          this.choice(9)
          break

        case commands[20]:
          this.choice(10)
          break

        case commands[21]:
          this.choice(11)
          break

        case commands[22]:
          this.choice("cuidamed")
          break

        case commands[23]:
          this.choice("heymexico")
          break

        case commands[24]:
          this.choice("madrehadisima")
          break

        case commands[25]:
          this.choice("murlota")
          break

        case commands[26]:
          this.choice("natuveg")
          break

        case commands[27]:
          this.choice("wheelyscafe")
          break

        case commands[28]:
          this.choice("y")
          break

        case commands[29]:
          this.choice("n")
          break

        case commands[30]:
          this.choice("xpill")
          break

        case commands[31]:
          this.choice("b")
          break

        case commands[32]:
          this.choice("fempower")
          break

        case commands[33]:
          this.choice("end")
          break

        case commands[34]:
          this.$socket.emit('startGame')
          break

        default:
          this.$socket.emit('send', this.textInput);
          break
      }            
    },
  },
  sockets:{
    connect: function() {
      console.log('Connected!');      
    },
    receive: function(text) {
      this.textOutput.push(text);
      this.textInput = null
    }
  },
  beforeUnmount(){
    this.$socket.emit('disconnect')
    $socket.disconnect()
  }
}
</script>

<style scoped>
#container{overflow: hidden; height:100%;}
#output::-webkit-scrollbar {
    display: none;
}
.scr{    
  position: fixed
}

h2 {    text-align: center;  }

</style>