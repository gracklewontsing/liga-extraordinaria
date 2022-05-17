<template>
  <div>
    <q-img src="/assets/board.png" style="max-width: 1000px">
      <template v-slot:error>
        <div class="absolute-full flex flex-center bg-negative text-white">
          Error al cargar el tablero.
        </div>
      </template>
    </q-img>
    <div class="row" :key="componentKey">
      <div class="col-6"> 
        <q-card class="my-card" v-if="player1">
          <q-item>
            <q-item-section avatar>
              <q-avatar>                
                <img :src="player1Img">
              </q-avatar>
            </q-item-section>

            <q-item-section >
              <q-item-label>Jugadora: {{player1Name}}</q-item-label>
              <q-item-label caption>Posición: {{player1Pos}}</q-item-label>
              <q-item-label caption>Piezas: {{player1Pieces}}</q-item-label>              
            </q-item-section>            
            <q-card-section horizontal>
              <q-icon name="mdi-emoticon-dead" :color="player1Z" size="2em" class="q-pa-md"></q-icon>
              <q-icon name="mdi-sleep" :color="player1L" size="2em" class="q-pa-md"></q-icon>
              <q-card-actions vertical class="justify-around">                
                <q-btn flat color="primary" :href="player1Board" target="_blank">
                  Tapete
                </q-btn>
              </q-card-actions>
            </q-card-section>
          </q-item>          
        </q-card>
        <q-card class="my-card" v-if="player2">
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img :src="player2Img">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>Jugadora: {{player2Name}}</q-item-label>
              <q-item-label caption>Posición: {{player2Pos}}</q-item-label>
              <q-item-label caption>Piezas: {{player2Pieces}}</q-item-label>
            </q-item-section>
            
            <q-card-section horizontal>
              <q-icon name="mdi-emoticon-dead" :color="player2Z" size="2em" class="q-pa-md"></q-icon>
              <q-icon name="mdi-sleep" :color="player2L" size="2em" class="q-pa-md"></q-icon>
              <q-card-actions vertical class="justify-around">
                <q-btn flat color="primary" :href="player2Board" target="_blank">
                  Tapete
                </q-btn>
              </q-card-actions>
            </q-card-section>
          </q-item>
        </q-card>
      </div>
      <div class="col-6">
        <q-card class="my-card" v-if="player3">
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img :src="player3Img">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>Jugadora: {{player3Name}}</q-item-label>
              <q-item-label caption>Posición: {{player3Pos}}</q-item-label>
              <q-item-label caption>Piezas: {{player3Pieces}}</q-item-label>
            </q-item-section>
            <q-card-section horizontal>
              <q-icon name="mdi-emoticon-dead" :color="player3Z" size="2em" class="q-pa-md"></q-icon>
              <q-icon name="mdi-sleep" :color="player3L" size="2em" class="q-pa-md"></q-icon>
              <q-card-actions vertical class="justify-around">
                <q-btn flat color="primary" :href="player3Board" target="_blank">
                  Tapete
                </q-btn>
              </q-card-actions>
            </q-card-section>
          </q-item>
        </q-card>
        <q-card class="my-card" v-if="player4">
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img :src="player4Img">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>Jugadora: {{player4Name}}</q-item-label>
              <q-item-label caption>Posición: {{player4Pos}}</q-item-label>
              <q-item-label caption>Piezas: {{player4Pieces}}</q-item-label>
            </q-item-section>
            <q-card-section horizontal>
              <q-icon name="mdi-emoticon-dead" :color="player4Z" size="2em" class="q-pa-md"></q-icon>
              <q-icon name="mdi-sleep" :color="player4L" size="2em" class="q-pa-md"></q-icon>
              <q-card-actions vertical class="justify-around">
                <q-btn flat color="primary" :href="player4Board" target="_blank">
                  Tapete
                </q-btn>
              </q-card-actions>
            </q-card-section>
          </q-item>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "game",
  data (){
    return {
      player1Img: "",
      player2Img: "",
      player3Img: "",
      player4Img: "",
      player1Name: "",
      player2Name: "",
      player3Name: "",
      player4Name: "",
      player1Pos: "",
      player2Pos: "",
      player3Pos: "",
      player4Pos: "",
      player1Pieces: "",
      player2Pieces: "",
      player3Pieces: "",
      player4Pieces: "",
      player1Board: "",
      player2Board: "",
      player3Board: "",
      player4Board: "",
      player1L:"grey-13",
      player2L:"grey-13",
      player3L:"grey-13",
      player4L:"grey-13",
      player1Z:"grey-13",
      player2Z:"grey-13",
      player3Z:"grey-13",
      player4Z:"grey-13",
      player1:false,
      player2:false,
      player3:false,
      player4:false,
      componentKey: 0,
    }
  },
  methods: {
    image(startup){
      if(startup == "Murlota") 
        return "/assets/murlota.png"
      if(startup == "HeyMexico")
        return "/assets/heymexico.png"
      if(startup == "CuidaMED")
        return "/assets/cuidamed.png"
      if(startup == "Madrehadisima")
        return "/assets/madrehadisima.png"
      if(startup == "NatuVeg")
        return "/assets/natuveg.png"
      if(startup == "Wheelys Cafe")
        return "/assets/wheelys.png"
    },
    board(startup){
      if(startup == "Murlota") 
        return "/assets/TAPETE MURLOTA.pdf"
      if(startup == "HeyMexico")
        return "/assets/TAPETE HEY MEXICO.pdf"
      if(startup == "CuidaMED")
        return "/assets/TAPETE CUIDAMED.pdf"
      if(startup == "Madrehadisima")
        return "/assets/TAPETE MADREHADISIMA.pdf"
      if(startup == "NatuVeg")
        return "/assets/TAPETE NATUVEG.pdf"
      if(startup == "Wheelys Cafe")
        return "/assets/TAPETE WHEELYS CAFE.pdf"
    },
    forceRerender() {
      this.componentKey +=1;
    }
  },
  sockets:{
    connect: function() {
      //console.log('Connected!');      
    },
    playerList: function(playerList) {    
      this.forceRerender()  
      if(playerList[0]){
        console.log(playerList[0])
        this.player1 = true
        this.player1Name = playerList[0].name
        console.log(this.player1Name)
        this.player1Pos = playerList[0].position
        this.player1Pieces = playerList[0].pieces
        this.player1Img = this.image(playerList[0].startup)
        this.player1Board = this.board(playerList[0].startup)
        if(playerList[0].isLazy)
          this.player1L = "negative"
        if(playerList[0].isZombie)        
          this.player1Z = "negative"
      }
      if(playerList[1]){
        this.player2 = true
        this.player2Name = playerList[1].name
        this.player2Pos = playerList[1].position
        this.player2Pieces = playerList[1].pieces
        this.player2Img = this.image(playerList[1].startup)
        this.player2Board = this.board(playerList[1].startup)
        if(playerList[1].isLazy)
          this.player1L = "negative"
        if(playerList[1].isZombie)        
          this.player1Z = "negative"
      }
      if(playerList[2]){
        this.player3 = true
        this.player3Name = playerList[2].name
        this.player3Pos = playerList[2].position
        this.player3Pieces = playerList[2].pieces
        this.player3Img = this.image(playerList[2].startup)
        this.player3Board = this.board(playerList[2].startup)
        if(playerList[1].isLazy)
          this.player1L = "negative"
        if(playerList[1].isZombie)        
          this.player1Z = "negative"
      }
      if(playerList[3]){
        this.player4 = true
        this.player4Name = playerList[3].name
        this.player4Pos = playerList[3].position
        this.player4Pieces = playerList[3].pieces
        this.player4Img = this.image(playerList[3].startup)
        this.player4Board = this.board(playerList[3].startup)
        if(playerList[1].isLazy)
          this.player1L = "negative"
        if(playerList[1].isZombie)        
          this.player1Z = "negative"
      }
    }
  },
}
</script>

<style>

</style>