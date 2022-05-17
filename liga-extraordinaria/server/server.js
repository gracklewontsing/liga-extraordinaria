const express = require("express");
const socket = require("socket.io");
const app = express();

var serveStatic = require('serve-static');
app.use(serveStatic(__dirname + "/dist"));

const server = app.listen((process.env.PORT || 3001), function () {
    console.log("server running on port 3001");
});

const io = socket(server, {
    allowEIO3: true,
    cors: {credentials: true, origin: 'http://localhost:3000'},
});
let playerlist = []
let referee = ''
io.on("connection", function (socket) {    
  if(playerlist.length == 0)  {
    startupList = utilitystartupList
  }
  //console.log("user connected: "+ user)    
  socket.on('name', function(name){
    socket.data.user = name;
    //console.log(socket.data.user)
    let text =  socket.data.user + " se ha conectado!"
    io.emit('receive',text)
    io.emit('user',socket.data.user)    
  })
  //send message on chat
  socket.on("send", function (text) {
    let newText = socket.data.user + ": " + text; 
    io.emit("receive", newText);
  })
  //Game Functions
  //on joining game
  socket.on('joinGame', function(startup){
    if(playerlist.length == 4){
      io.emit('receive', "La lista de jugadores ya esta llena.")
    }      
    if(!startupList.includes(startup)){
      io.emit('receive',"ERROR: El startup que se escogió ya no se encuentra disponible.")
      console.log(startupList)
    }
    if(gameRunning){
      io.emit('receive','El juego ya esta en transcurso. Para referirse a otros jugadores, usa el sufijo "P" (ej: "!Pmurlota")')
    }
    else {
      if (referee == socket.data.user) {
        io.emit('receive', "ERROR: El referee ya no se puede unir como jugador.")
      }
      else {        
        playerlist.push(new Player(socket.data.user, entrepreneur(startup),1,color()))     
        console.log(playerlist)     
        io.emit('receive', socket.data.user + " se unirá al juego como " + startup + ".")        
      }
    }
    io.emit('playerList',playerlist)
  })
  //on refereeing
  socket.on('refGame', function(){
    console.log(socket.data.user)
    if(referee != '') {
      io.emit ('receive', "ERROR: El usuario "+ referee +" ya se postuló como referee.")
    }
    else{      
      referee = socket.data.user      
      io.emit('receive', "El usuario " + socket.data.user + " se ha postulado como referee.")
    }
  })
  //report disconnection and remove player from playlist
  socket.on('disconnect', function () {               

    //remove players from playlist
    for(i in playerlist){      
      if(playerlist[i].name == socket.data.user){          
        startupList.push(playerlist[i].startup)
        
        //if player leaves, end game
        if(gameRunning == true){
          endGame()
        }                    
        playerlist.splice(playerlist[i],1)
        console.log("removed...",playerlist)              
        console.log(startupList)
      }
    }                      
    
    //remove referee from play and list
    if(referee == socket.data.user){
      referee = ''
      if(gameRunning == true){
        endGame()
      }
      playerlist = []
      startupList = utilitystartupList
    }
    //report disconnection
    let text = socket.data.user + ' se ha desconectado.'      
    io.emit("receive", text)
    console.log("A user has disconnected!", socket.data.user)
    io.emit('playerList',playerlist)
  })
  //on starting game
  socket.on('startGame', function(){
    console.log(playerlist)
    if(playerlist.length<2){
      io.emit('receive', "ERROR: No hay suficientes jugadores, intentelo nuevamente cuando más jugadores se hayan unido.")
    }
    else{
      io.emit('receive', "El juego ha comenzado.")
      startGame()
      io.emit('playerList',playerlist)
      io.emit('receive', "Es turno de " + playerlist[0].name + " con " + playerlist[0].startup + ". Lanza el dado. (!roll)")
    }
  });
  //command list
  socket.on('requestCommandList',function(){
    io.emit('receive',"Para unirse al juego como alguno de los siguientes startups:")
    io.emit('receive',"!murlota !cuidamed !natuveg !wheelyscafe !madrehadisima !heymexico")
    io.emit('receive','Para unirse al juego como referee/ampager: !referee')    
    io.emit('receive',"Para escoger piezas (solo hay 11 piezas) Fempower: !1  !2  [!n]...")    
    io.emit('receive',"Para escoger pildoras durante intercambios: !xpill")    
    io.emit('receive',"Para lanzar el dado: !roll")    
    io.emit('receive','Para ver informacion de otros jugadores durante el juego normal(solo funciona con startups presentes en el juego): ')
    io.emit('receive',"!Pmurlota !Pcuidamed !Pnatuveg !Pwheelyscafe !Pmadrehadisima !Pheymexico [!Pstartup]")
    io.emit('receive','Para escoger de donde robar piezas durante Angel Inversionista: ')
    io.emit('receive',"!fempower !Pmurlota !Pcuidamed !Pnatuveg !Pwheelyscafe !Pmadrehadisima !Pheymexico")
    io.emit('receive','Para responder preguntas de opción múltiple: !a !b ')    
    io.emit('receive','Para otorgar y castigar al jugador durante pitches y preguntas abiertas (solo referee/ampager): !yes !no')    
  })
  //game state while running
             
  //dice rolling   
  socket.on('rollDice', function(){            
    if(socket.data.user == playerlist[turn].name && !gamePaused && gameRunning){                
      Navigate()           
    }
    io.emit('playerList',playerlist)      
  })        
  //decision making and pause
  socket.on('choice', function(i){    
    if((socket.data.user != playerlist[turn].name && socket.data.user != referee) && (i != "murlota" || i != "cuidamed" || i != "heymexico" || i != "madrehadisima" || i != "natuveg" || i != "wheelyscafe")){      
      io.emit("receive","Es turno de la jugadora " + playerlist[turn].name + ". Esperando a la jugadora.")
    }    
    else {
      if(!choiceCoin){ 
        if(i == "murlota" || i == "cuidamed" || i == "heymexico" || i == "madrehadisima" || i == "natuveg" || i == "wheelyscafe"){
          for(n in playerlist.length){
            if(playerlist[n].startup == i){
              io.emit("receive", player.name + " de " + player.startup + " tiene las piezas: " +player.pieces)
            }     
          }
        }    
      }
      //if referee refs
      if(referee == socket.data.user && choiceCapsula){
        if(i == "y"){
          let adv = rollDice()
          io.emit('receive', "La referee acepta la respuesta de la jugadora. La jugadora avanza " + adv + " casillas.")
          playerlist[turn].position += adv
          advanceTurn()
          gamePaused = false
          choiceCapsula = false
        }
        else{
          io.emit('receive', "La referee no aceptó la respuesta de la jugadora. La jugadora regresa a su posición anterior.")
          playerlist[turn].position -= roll
          advanceTurn()
          gamePaused = false
          choiceCapsula = false
        }
      }
      if(referee == socket.data.user && choiceAngel){
        if(i == "y"){
          io.emit('receive', "El angel inversionista acepta el pitch de la jugadora y le otorga la moneda dorada.")
          io.emit('receive', "La jugadora debe escoger de donde consigue sus 3 piezas.")
          choiceCoin = true
          choiceAngel = false
          angelChoice = 3
        }
        else{
          io.emit('receive',"El angel inversionista rechaza el pitch de la jugadora.")
          choiceAngel = false
          gamePaused = false
          advanceTurn()
        }
      }

      //
      //
      //
      //CHECK THIS
      if(choiceCoin){    
        let playerChoice
        if(angelChoice != 0){
          io.emit('receive',"El centro de mesa tiene las piezas " + piecesPool)
          io.emit('receive',"Si deseas robar de jugadores, utiliza el comando correspondiente:")
          io.emit('receive',"!P" + playerlist[0].startup + "  !P" + playerlist[1].startup + "...")  
          io.emit('receive',"Utiliza !0 para dejar de recibir piezas.")               
          if(i == playerlist[turn].startup)
            io.emit('receive',"No debes escoger de tu propio startup. Vuelve a intentar con startups de otros jugadores o del centro de mesa.")
          else {
            for(n in playerlist.length){                            
              if(playerlist[n].startup == i){
                io.emit('receive', "Escogiste a " + i + ". " + i +" tiene las piezas " + playerlist[n].pieces)
                choicePool = playerlist[n].pieces
                playerChoice = playerlist[n]
                io.emit('receive', "Escoge la pieza que quieres.")
              }                            
              io.emit('receive',"Si deseas regresar al centro de mesa: !fempower")                         
            }            
            if(i == "fempower"){
              io.emit('receive',"Regresaste al centro de mesa.")
              choicePool = piecesPool
              playerChoice = "f"
              io.emit('receive',"El centro de mesa tiene las piezas " + piecesPool)
            }
          }
          if(i <= 11 && i > 0 && choicePool.length != 0){
            playerlist[turn].pieces.push(i)
            const index = choicePool.indexOf(i)
            choicePool.splice(index,1)
            if(playerChoice == "f"){
              piecesPool = choicePool
            }
            else {
              playerChoice.pieces = choicePool
            }
            angelChoice--            
          }
          else{
            if(i =="end"){
              angelChoice = 0
              gamePaused = false
              choiceCoin = false
              playerChoice = "f"
              advanceTurn()
            }
          }
        }
        else {
          gamePaused = false
          choiceCoin = false
          playerChoice = "f"
          advanceTurn()
        }
      }
      if(choiceFempower){
        playerlist[turn].pieces.push(i)
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[i] + ".")
        choiceFempower = false
        gamePaused = false
        advanceTurn()
      }
      if(choiceLazy){
        if(i == "y"){
          io.emit('receive', "La jugadora " + playerlist[turn].name + " usa una de sus píldoras extraordinarias para no procrastinar.")
          playerlist[turn].xpills--
          xpills++        
          advanceTurn()
          choiceLazy = false
          gamePaused = false
        }
        if(i=="n"){
          io.emit('receive', "La jugadora " + playerlist[turn].name + " comienza a procrastinar.")        
          playerlist[turn].isLazy = true
          advanceTurn()
          choiceLazy = false
          gamePaused = false
        }
      }      
      if(choiceZombie){
        if(i == "y"){
          io.emit('receive', "La jugadora " + playerlist[turn].name + " usa una de sus píldoras extraordinarias para no entrar en modo zombie.")
          playerlist[turn].xpills--  
          xpills++      
          advanceTurn()
          choiceZombie = false
          gamePaused = false
        }
        if(i == "n"){
          io.emit('receive', "La jugadora " + playerlist[turn].name + " entra a modo Zombie.")
          playerlist[turn].isZombie = true
          advanceTurn()
          choiceZombie = false
          gamePaused = false
        }
      }
      if(choiceTomadora){
        if(tomadoraR[question] == i){
          io.emit('receive', 'La jugadora responde correctamente y puede avanzar el número de casillas que avanzó o quedarse. ¿Avanzar? !yes | !no')
          choiceAdvance = true
          choiceTomadora = false
        }
        else{
          io.emit('receive', 'La jugadora responde incorrectamente y retrocede a su posición anterior.')
          playerlist[turn].position -= roll
          advanceTurn()
          choiceTomadora = false
          gamePaused = false
        }
      }
      if(choiceAdvance){
        if(i == 'y'){
          gamePaused = false
          choiceAdvance = false
          Navigate()
        }
        if(i == 'n') {
          io.emit('receive', 'La jugadora se queda en su casilla.')
          choiceAdvance = false
          gamePaused = false
          advanceTurn()
        }
      }     
    }
    io.emit('playerList',playerlist)   
  })
});

//
//game variables
let turn = 0
let roll = 0  
let question = 0
let angelChoice = 0
let gameRunning = false
let gamePaused = false
let choiceLazy = false
let choiceZombie = false
let choiceFempower = false
let choiceTomadora = false
let choiceAdvance = false
let choiceCapsula = false
let choiceAngel = false
let choiceCoin = false
let startupList = ["CuidaMED","HeyMexico","Madrehadisima","Murlota","NatuVeg","Wheelys Cafe"]
const utilitystartupList = ["CuidaMED","HeyMexico","Madrehadisima","Murlota","NatuVeg","Wheelys Cafe"]
let colorList = ["aqua","blueviolet","coral","fuchsia","gold","aquamarine","mediumturqouise","orchid","plum","peru","pink","powderblue","teal","red","khaki","bisque","lightpink","mediumslateblue","steelblue"]

let tomadora = {
  1: "Estás empezando tu startup y ya es momento de capacitarte. ¿Qué capacitación tomarías? !a: Estrategias de posicionamiento digital para startups.  !b: 'Exportación de producto'",
  2: "Hay problemas en la fábrica y necesitas invertir más dinero: !a: Te alteras y no sabes que hacer, piensas que vas a perder todo.  !b: Tomas el control de la situación, pues sabes que encontrarás una opción.",
  3: "Si la macroeconomía entra en crisis,  !a: No haces nada porque no afecta a tu empresa.  !b: Buscas estrategias lo más pronto posible para poder afrontar la crisis.",
  4: "Un cliente queda inconforme con el producto, pues no llenó sus expectativas, ¿Qué harías?  !a: Buscas la manera de arreglar el error y dejarlo contento.  !b: Solo le dices que devuelves el dinero.",
  5: "¡Oh no! Se desató una pandemia y mandaron a todos a cuarentena. ¿Qué haces con tu negocio?  !a: Lo cierras y lo reactivas cuando regrese todo a la normalidad.  !b: Adaptas tu negocio para vender en línea y perseverar.",
  6: "Acabas de lanzar tu primer producto pero al mercado no le agrada tu propuesta de valor.  !a: Reorientas el mercado al que te diriges.  !b: Validas y adaptas tu propuesta de valor.",
  7: "Se te acaba de ocurrir una idea de negocio y decides emprender, ¿Qué comienzas a validar?  !a: Tu producto o servicio.  !b: El problema que quieres resolver.",
  8: "Vas a emprender tu primer startup con tu amiga. ¿Como te debes constituir para que ambas sean socias de la empresa?  !a: Persona moral.  !b: Persona física.",
  9: "Acabas de ganar $50,000 MXN en un concurso de emprendimiento con tu idea de negocio. ¿Qué haces?  !a: Disfrutas el dinero por tu esfuerzo.  !b: Por fin emprendes tu startup.",
  10: "Acabas de perder un concurso de emprendimiento, pero se acerca una participante y dice que quiere invertir y asociarse contigo.  !a: Continúas sola.  !b: Aceptas la propuesta.",
  11: "Llega el momento de registrar la marca de tu startup, pero resulta que ya esta registrada. ¿Qué haces?  !a: Sigues adelante y comienzas a vender, luego lo solucionas.  !b: Buscas alternativas de nombres.",
  12: "Después de un año, una de tus socias se casa y decide salir, y quiere su inversión de vuelta. Aún no se recupera la inversión.  !a: Se van a juicio y entran en problemas legales.  !b: Tratas de llegar a un acuerdo entre todas.",
  13: "Tu socia y tú deciden constituir tu empresa y están platicando con quién tienen que acudir. ¿Qué dirías?  !a: Con un contador porque saben un poco de todo.  !b: Con un notario ya que serían una asociación mínima.",
  14: "Tu deber como CEO fundadora e imagen de una empresa de comida saludable es:  !a: Ser congruente y no comer chatarra.  !b: No es importante lo que hagas, nadie lo notará.",
  15: "No tienes dinero para emprender. Tus dos opciones para conseguir el dinero son: !a: Amigos, familiares, fans, ahorros y préstamos familiares.  !b: Crédito bancario e hipotecar tu casa.",
  16: "Tienes oportunidad de mostrarle tu producto a un posible inversionista, pero te piden que muestres tu PMV.  !a: Esperas a que esté al 100% para enseñarlo. !b: Muestras la primera version y recibes retroalimentación.",
  17: "Se acerca fin de mes y no has tenido muchas ventas. Tienes dos opciones:  !a: Pagas primero a tus empleados y cubres gastos. !b: Inviertes en más mercancía.",
  18: "Ha sido un día dificil, han salido cosas mal y tienes mucho trabajo.  !a: Sigues trabajando, debes corregir errores.  !b: Tomas media hora, respiras, comes algo que te guste, recuperas fuerzas.",
  19: "Te levantas temprano con el pie izquierdo, se te queman los huevos, el café está muy cargado, no encuentras tus zapatos. !a: Hoy será un pésimo día.  !b: Mantienes la calma, tratas de arreglar las cosas y te sientes lista.",
  20: "El plan estaba listo, ibas a lanzar tu campaña de fondeo el siguiente mes, pero la economía sufre una crisis y nadie está activo en campañas.  !a: Tendrás que esperar para lanzar tu marca.  !b: Cambias el plan, no la meta.",
  21: "Una de tus amigas emprendedoras tiene un mal dia y quieres acercarte para ver como está, pero tienes mucho trabajo y una reunión pronto.  !a: Mandas un mensaje y no te atrasas.  !b: Tomas media hora y la invitas a un café.",
  22: "Cumpliste un año de emprender formalmente y es momento de capacitarte nuevamente. ¿Cual capacitación tomas?  !a: Escoges 'Finanzas para emprendedores'  !b: Escoges 'Pitch de ventas'",
  23: "Has sido invitada a la noche de networking de Fempower Mexico. ¿Qué llevas para identificarte y darte a conocer?  !a: Tu CV.  !b: Tus tarjetas de presentación.",
  24: "Camino a tu reunion, te topas con ese inversionista que estabas buscando en el elevador. ¿Qué haces?  !a: Le das tu pitch de elevador y le das tu tarjeta antes de que salga.  !b: Hablas de tus experiencias y al final le pides su número.",
  25: "Qué necesita primero tu negocio para darse a conocer entre clientes?  !a: Tener página web y redes sociales.  !b: Estar presente en todos los periódicos y revistas posibles.",
  26: "Tu competencia bajó los precios de sus productos. Tu estrategia es:  !a: Bajar los tuyos, incluso un poco más.  !b: Mantener tus precios y buscar otra estrategia.",
  27: "Al momento de pensar en el contenido de publicaciones de tu fan page de FB o IG debes:  !a: Transmitir contenido de valor a tu mercado objetivo.  !b: Tratar de vender con todas las publicaciones.",
  28: "Tienes una idea de negocio. ¿Qué haces?  !a: No la compartes con nadie, te la pueden copiar.  !b: Tratas de compartirla con muchas personas para que te den opiniones.",
  29: "Al momento de decir tu pitch frente a una ronda de inversión debes tomar en cuenta primero:  !a: Saber qué problema estas resolviendo y a quién.  !b: Saber cómo vas a impresionar y cómo vas a vender tu producto o servicio.",
  30: "Tu startup está creciendo y es momento de capacitarte para expandirte. ¿Cual capacitación tomas?  !a: E-commerce para ventas nacionales  !b: Gestión de recursos humanos."
}

let tomadoraR = {
  1: 'a',
  2: 'b',
  3: 'b',
  4: 'a',
  5: 'b',
  6: 'b',
  7: 'b',
  8: 'a',
  9: 'b',
  10: 'b',
  11: 'b',
  12: 'b',
  13: 'b',
  14: 'a',
  15: 'a',
  16: 'b',
  17: 'a',
  18: 'b',
  19: 'b',
  20: 'b',
  21: 'b',
  22: 'a',
  23: 'b',
  24: 'a',
  25: 'a',
  26: 'b',
  27: 'a',
  28: 'b',
  29: 'a',
  30: 'a'
}

let capsula = {
  1: "¿Cómo se llaman las empresas de base tecnológica que llegan a ser evaluadas por más de 2000 millones de USD en los primeros 3 años, y se dirigen a un nicho de negocio casi infiniti y virtualmente sin competencia?",
  2: "¿Cómo se define a la empresa que genera utilidades y dividendos?",
  3: "¿Qué es lo primero que debes hacer cuando tienes un invento que es un producto o servicio revolucionario?",
  4: "Cómo comenzarás a validar tu propuesta de valor?",
  5: "Qué significan las abreviaturas de S.A. de C.V.?",
  6: "Cuándo es el día mundial de la emprendedora?",
  7: "Programas de Fempower México para impulsar el talento femenino en la tecnología.",
  8: "Programas de Fempower México para impulsar el talento femenino en emprendimiento.",
  9: "La tierra se conforma por ecosistemas, y este ecosistema facilita el surgimiento de empresas, proyectos empresariales y el desarrollo del accionar:",
  10: "Menciona 4 bloques de Fempower canvas:",
  11: "¿A qué le llamamos talento?",
  12: "Modelo de negocio para servicios que por medio de una aplicación móvil o plataforma web, enlaza a proveedores de un servicio con gente que necesita ese servicio.",
  13: "Son los activos necesarios para que una empresa funcione:",
  14: "Es la negociación de la capacidad que tenemos de desarrollar nuestro máximo potencial. Es el miedo y la ansiedad frenando la mayor versión de nosotros mismos:",
  15: "¿Cuáles son los 5 pilares del emprendimiento femenino?",
  16: "Este término fue usado por primera vez en la Conferencia Mundial de las Mujeres de Naciones Unidas de Beijing en 1995 para referirse al aumento de la participación de las mujeres en los procesos de toma de decisiones y acceso al poder por primera vez como estrategia para la igualdad y la equidad.",
  17: "Menciona dos recursos intelectuales de una empresa.",
  18: "Es el proceso innovador que cambia profundamente la forma en el que el sistema que se nos ha dado funciona; ocupándose de resolver problemas sociales en su origen, reduciendo la vulnerabilidad de las personas y del entorno.",
  19: "Si ellos cambian su compartiendo de consumo, causan inevitablemente una tendencia ¿Quiénes son?",
  20: "Ese tipo de marketing tiene como objetivo la humanización de las marcas para generar seguidores no clientes, para influenciar consumidores no venderles productos.",
  21: "Es un profundo movimiento social y cultural, expresa las necesidades y aspiraciones humanas primarias y predice cuáles serán sus necesidades los próximos 10 años.",
  22: "Modelo de negocio que consiste en que el usuario paga una cuota mensual o anual y a cambio recibe una propuesta de valor que compensa la cuota que paga.",
  23: "Es el costo que no varía ni en función de lo que produces y vendes",
  24: "Es la primera versión de tu producto o servicio que inclute la propuesta de valor con las características básicas suficientes.",
  25: "Son personas que aportan capital propio a empresas en etapa de formación y ofrecen su experiencia en los negocios.",
  26: "Es la persona que puede convertirse en determinado momento en consumidor, usuario o cliente.",
  27: "Son los primeros que te compran tu producto mínimo viable.",
  28: "¿Cuál es el orden del circulo dorado de Simon Sinek?",
  29: "Modelo de negocio que consiste en regalar servicios hasta cierto punto, cuando los clientes quieren más tienen que pagar.",
  30: "Consiste en saber qué tengo yo que no tienen lso demás y que la gente está dispuesta a pagar por ello.",
  31: "Significa repetir varias veces un proceso con la intención de alcanzar una meta deseada.",
  32: "Es una presentaión muy breve de un proyecto de emprendimiento para persuadir a cualquier posible cliente, accionista o inversor.",
  33: "Es un grupo reducido de personas dentro de un segmento de mercado, cuyas necesidades no están siendo atendidas.",
  34: "¿A qué se encuentra alineada la innovación social?",
  35: "Son modelos de 'personas' a quienes dirigimos nuestra propuesta de valor, que nos permiten conocer realmente qué quiere el cliente y cómo construir puentes de contacto hacia el.",
  36: "Modelo de negocio que consiste en vender códigos digitales para productos que tienen costos y mantenimento de inventario prácticamente cero.",
  37: "Es una empresa emergente de recién creación que crea productos o servicios de gran innovación o incluso de base tecnológica.",
  38: "Es todo aquel medio que te conecta con tus clientes comunicando y entregando tu propuesta de valor.",
  39: "¿Cuáles son las fases de desarrollo del ciclo de un producto mínimo viable?",
  40: "Iniciativa innovadora que lleva adelante una actividad económica con fines de lucro, donde su solución genera un impacto positivo resolviendo las grandes problemáticas sociales."
}

let talento = {
  1: "Di una grase de Fempower",
  2: "Di el pitch de tu modelo de negocio real en menos de 1 minuto",
  3: "Di el pitch del modelo de negocio que te tocó en menos de 1 minuto",
  4: "Menciona al menos 3 hashtags de empoderamiento femenino",
  5: "Menciona 3 películas de emprendedores que no deben de faltar en tu repertorio",
  6: "Nombra 3 empresas o startups fundadas por mujeres en menos de un minuto (locales o internacionales)",
  7: "Nombra 3 iniciativas que impulsen el emprendimiento femenino en menos de 2 minutos (locales o internacionales)",
  8: "Menciona 1 miedo o obstáculo por el cuál no haces lo que te apasiona",
  9: "Te acaban de confirmar que tienes una reunión con un ángel inversionista y te pide que lleves un prototipo sobre tu Startup de bicicletas solares ecológicas. Describe las características de tu PMV.",
  10: "Arma un pitch de ventas con 3 artículos u objetos que tus compañeras te nombren al momento",
  11: "Menciona cómo validaste el prototipo o PMV que estas creando para tu propio Startup",
  12: "Toma una selfie jugando el juego de la Liga Extraordinaria y súbelo a tu red social favorita con el #YOCEO",
  13: "Haz una llamada a un posible cliente (no jugadora) y trata de venderle tu producto/servicio en tiempo real, tienes 3 minutos y no puedes decir que estás jugando.",
  14: "Imagina que la jugadora que está enfrente tiene ganas de emprender pero no se anima, ¿Qué le dices para convencerla? ¡CONVÉNCELA!",
  15: "Ha ocurrido una pandemia mundial y nadie puede salir de casa, tu negocio de cocina económica esta a punto de quebrar. ¿Qué canales de distribución usas para seguir vendiendo?"
}

let ceo = {
  1: '“Dene el éxito bajo tus propios términos, alcánzalo en tus propios términos y vive una vida que te haga sentir orgullosa”. Anne Sweeny, CEO de Walt Disney || ¿Cuál es el propósito de tu idea o emprendimiento?',
  2: '“Siempre hice algo para lo que no me sentía completamente lista. Creo que así es como uno crece. Cuando llega ese momento de ‘Wow, no estoy segura de sí puedo hacerlo’ y consigues trascenderlo, entonces tienes un gran avance”. Marissa Mayer, CEO de Yahoo. || Compártenos una experiencia donde no te hayas sentido lista para hacer algo',
  3: '"Como líder, soy dura conmigo misma y mis estándares son muy altos. Sin embargo, soy muy cariñosa, porque quiero que la gente tenga éxito en lo que está haciendo, para que algún día puedan aspirar a ser yo en el futuro”.  Indra Nooyi, Presidenta y CEO de PepsiCo. || Si de una líder nace otra ¿Cómo inspiras y despiertas a otras mujeres y niñas?',
  4: '“Cuando haces un emprendimiento para transformar algo es mejor que si lo haces por un motivo económico”. Mariate Arnal, CEO de Stripe Fintech.|| ¿Cuál es el propósito de tu idea o emprendimiento?',
  5: '"Reinvent-arte debe de ser tantas veces como quieras, porque mereces vivir una vida plena y alineada con aquello que te emociona”. Gemma Fillol de CEO Fundadora de Extraordinaria España. || ¿En qué momento de tu vida has considerado  que necesitas reinventarte?',  
  6: '"Para ser irremplazable, uno debe siempre buscar ser diferente”. Coco Channel, CEO en Coco Channel. || ¿Qué es lo que te hace auténtica?',
  7: '«No hay un camino real lleno de ores hacia el éxito. Y si lo hay, no lo he encontrado, porque si he logrado algo en la vida, es porque he estado dispuesta a trabajar duro». Sarah Bredlove CEO en Madame C. J. Walker. || ¿Hasta el día de hoy que tan duro has trabajado para asegurar el éxito de tu emprendimiento?',
  8: '“He aprendido a arriesgarme a hacer cosas nuevas, el crecimiento y la comodidad no pueden coexistir”. Virgina Rometty, COO de IBM. || ¿A qué te arriesgarías hoy para que tu emprendimiento pudiera despegar?',
  9: '“He cambiado mis horas de sueño, por un sueño más grande” Judith Castellanos, CEO Fundadora de Fempower México. || ¿Qué has tenido que sacrificar para llegar hastadonde estas hoy? Compártenos tu experiencia.',
  10: '“La fuerza no proviene de la capacidad física, sino de la voluntad indomable”. Indira Gandhi, Política y Activista. || Describe cómo es tu fuerza de voluntad indomable.',
  11: '“Debemos aceptar que no siempre tomaremos las decisiones correctas. Qué a veces estropeamos las cosas”. Arianna Huffington, CEO Fundadora de Huffington post. || ¿Has tomado alguna decisión que creías correcta, pero no fue así? ¿Cuál fue tu aprendizaje?',
  12: 'Mi liderazgo es icónico: Porque la mujer que lidera a su estilo se vuelve imparable”. Gemma Fillol de CEO Fundadora de Extraordinaria España. || ¿Cuál es tu estilo de liderazgo que te permite ser tú misma?',
  13: '“Cada vez que una mujer se levanta por sí misma, sin saberlo, posiblemente sin clamarlo, se levanta por todas las mujeres”. Ana Victoria García, CEO Fundadora de Victoria 147. || ¿Para ti qué es la sororidad femenina? ¿Cómo la practicas entre las mujeres que te rodean?',
  14: '“La pregunta no es ¿Quién me va a permitir? sino, ¿Quién me va a detener?“. Ayn Rand, Filósofa y Escritora. || ¿Qué acciones tomarías si alguien intenta detener o sabotear tu emprendimiento?',
  15: '“El éxito no se mide en dinero, sino en la diferencia que marcas en las personas” Michelle Obama, Política. || ¿Cuál es el legado que te gustaría dejar al mundo?',
  16: '¿A quién acudes cuando fracasas en algo, tienes a una persona?',
  17: '¿Cuál es tu principal talento?',
  18: '¿Que paso temes dar para desarrollar tu Startup?',
  19: 'Si hoy tuvieras que elegir a tu próxima socia,  ¿A quien de las jugadoras eliges y por qué?',
  20: '¿A quién acudes cuando tienes un fracaso?',
  21: '¿Quién es tu role model a seguir?',
  22: '¿Qué emprenderías si te aseguran que no vas a fracasar?',
  23: '¿Cuál es tu mayor motivación en la vida?',
  24: '¿Qué consejo te darías a ti misma?',
  25: '¿Cuántas horas a la semana estás dispuesta a dedicarle a tu emprendimiento?',
  26: '¿Cuál es tu mayor sueño en la vida?',
  27: 'Consejo de la CEO: Usa esta Tarjeta cuando necesites ayuda para responder alguna pregunta o reto del juego.',
  28: 'Consejo de la CEO: Usa esta Tarjeta cuando necesites ayuda para responder alguna pregunta o reto del juego.',  
  29: 'Consejo de la CEO: Usa esta Tarjeta cuando necesites ayuda para responder alguna pregunta o reto del juego.',
  30: 'Consejo de la CEO: Usa esta Tarjeta cuando necesites ayuda para responder alguna pregunta o reto del juego.',
}

let piecesPool = []
let goalPool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
let choicePool = piecesPool
let xpills = 12
//let lazypills = 12
let goldKey = 1
let piecesDict = {
  1:"Talento y motivo para emprender",
  2:"Propuesta de valor",
  3:"Segmento de clientes",
  4:"Relación con los clientes",
  5:"Canales de distribución",
  6:"Fuentes de ingreso",
  7:"Actividades clave",
  8:"Recursos clave",
  9:"Socios clave",
  10:"Estructura de costos",
  11:"Producto mínimo viable"
}

let gameBoardSquares = {
  A:"Networking",//casilla networking
  B:"Procrastinar",//procrastinar
  C:"Impostor", //casilla de sindrome del impostor
  D:"Zombie",//casilla del modo zombie
  E:"Tomadora",//casilla de tomadora de decisiones
  F:"CEO",//Casilla de ceo extraordinaria
  G:"Capsula",//casilla de capsula extraordinaria
  H:"Talento",//casilla de talento
  I:"Pildora",//casilla de pildora extraordinaria
  J:"Angel",//casilla de angel inversionista
  0:"Fempower",//casilla de fempower canvas choice
  1: piecesDict[1],
  2: piecesDict[2],
  3: piecesDict[3],
  4: piecesDict[4],
  5: piecesDict[5],
  6: piecesDict[6],
  7: piecesDict[7],
  8: piecesDict[8],
  9: piecesDict[9],
  10: piecesDict[10],
  11: piecesDict[11],  
}

let gameBoard = {
  1:"Comfort Zone",
  2:gameBoardSquares[0],
  3:gameBoardSquares.G,
  4:gameBoardSquares[1],
  5:gameBoardSquares.I,
  6:gameBoardSquares.G,
  7:gameBoardSquares.C,
  8:gameBoardSquares[0],
  9:gameBoardSquares[1],
  10:gameBoardSquares[3],
  11:gameBoardSquares[2],
  12:gameBoardSquares[1],
  13:gameBoardSquares[3],
  14:gameBoardSquares[2],
  15:gameBoardSquares[0],
  16:gameBoardSquares.D,
  17:gameBoardSquares.A,
  18:gameBoardSquares.I,
  19:gameBoardSquares.E,
  20:gameBoardSquares[4],
  21:gameBoardSquares.F,
  22:gameBoardSquares[5],
  23:gameBoardSquares[4],
  24:gameBoardSquares.H,
  25:gameBoardSquares[5],
  26:gameBoardSquares.G,
  27:gameBoardSquares.B,
  28:gameBoardSquares.I,
  29:gameBoardSquares.H,
  30:gameBoardSquares[6],
  31:gameBoardSquares[8],
  32:gameBoardSquares.F,
  33:gameBoardSquares[6],
  34:gameBoardSquares[8],
  35:gameBoardSquares.E,
  36:gameBoardSquares[0],
  37:gameBoardSquares.A,
  38:gameBoardSquares.D,
  39:gameBoardSquares.I,
  40:gameBoardSquares[7],
  41:gameBoardSquares.H,
  42:gameBoardSquares[9],
  43:gameBoardSquares[7],
  44:gameBoardSquares.F,
  45:gameBoardSquares[9],
  46:gameBoardSquares.G,
  47:gameBoardSquares.A,
  48:gameBoardSquares.B,
  49:gameBoardSquares[10],
  50:gameBoardSquares.J,
  51:gameBoardSquares[11],
  52:gameBoardSquares[10],
  53:gameBoardSquares.J,
  54:gameBoardSquares[11],
  55:gameBoardSquares.F,
  56:gameBoardSquares.A,
  57:gameBoardSquares.E,
  58:gameBoardSquares.C,
  59:gameBoardSquares.G,
  60:gameBoardSquares.I,
  61:gameBoardSquares.H,
  62:gameBoardSquares.D,
  63:gameBoardSquares[0],
  64:gameBoardSquares.B,
  65:gameBoardSquares.G,
  66:gameBoardSquares.C,
  67:gameBoardSquares.E,
  68:gameBoardSquares.F,
  69:"Meta"
}

//
//game functions and constructors
function startGame() {
  //initialize player list.
  //send message to expect player movement  
  gameRunning = true  
}

function endGame() {
  startupList = utilitystartupList
  colorList = ["aqua","blueviolet","coral","fuchsia","gold","aquamarine","mediumturqouise","orchid","plum","peru","pink","powderblue","teal","red","khaki","bisque","lightpink","mediumslateblue","steelblue"]
  xpills = 12
  lazypills = 12
  goldKey = 1
  playerlist = []
  gameRunning = false
}

function Player(name, startup, position, color) {
  this.isZombie = false
  this.hasKey = false
  this.isLazy = false
  
  this.innovation = false
  this.prototyping = false 
  this.iteration = false 
  this.launch = false
  this.valley = false

  this.pieces = []
  this.extraPieces = []
  this.xpills = 0
  this.name = name
  this.startup = startup
  this.position = position
  this.color = color  
}

function Navigate(){
  roll = rollDice()
  //if player is lazy and rolls less than 4
  if(playerlist[turn].isLazy == true && roll < 4){
    io.emit('receive', 'La jugadora '+ playerlist[turn].name + " de " + playerlist[turn].startup + " sacó " + roll + ", por lo que se queda procrastinando.")
    advanceTurn()
  }
  //if player is not lazy or is lazy but rolls more than four
  else {        
    //deactivate lazy
    if(playerlist[turn].isLazy == true){
      io.emit('receive', 'La jugadora '+playerlist[turn].name + ' deja de procrastinar!')
      playerlist[turn].isLazy = false
    }
    playerlist[turn].position += roll
    io.emit('receive',"La jugadora " + playerlist[turn].name + " de " + playerlist[turn].startup + " saca " + roll + " y cae en la casilla " + playerlist[turn].position + ".")        
    if(playerlist[turn].position > 69 + roll){
      playerlist[turn].position = 69
    }
    if(playerlist[turn].position > 25 && !playerlist[turn].innovation){
      playerlist[turn].innovation = true
    }
    if(playerlist[turn].position > 34 && !playerlist[turn].prototyping){
      playerlist[turn].prototyping = true
    }
    if(playerlist[turn].position > 45 && !playerlist[turn].iteration){
      playerlist[turn].iteration = true
    }
    if(playerlist[turn].position > 54 && !playerlist[turn].launch){
      playerlist[turn].launch = true
    }
    //checks for if player suffered amogus syndrome
    if(playerlist[turn].innovation && (playerlist[turn].position >= 20) && (playerlist[turn].position < 26)){
      playerlist[turn].position += 6
    }
    if(playerlist[turn].prototyping && (playerlist[turn].position >= 29) && (playerlist[turn].position < 35)){
      playerlist[turn].position += 6
    }
    if(playerlist[turn].iteration && (playerlist[turn].position >= 40) && (playerlist[turn].position < 46)){
      playerlist[turn].position += 6
    }
    if(playerlist[turn].launch && (playerlist[turn].position >= 49) && (playerlist[turn].position < 55)){
      playerlist[turn].position += 6
    }
    //finally, the gameboard checks
    switch(gameBoard[playerlist[turn].position]){
      // A:Networking
      case gameBoardSquares.A:
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de Networking. Las jugadoras regresan sus piezas sobrantes al centro de mesa y toman las piezas que les falta.")
        let extrapool = []                
        for(i in playerlist.length){              
          if(piecesPool != 0){
            extrapool = piecesPool
          }
          let duplicates = toFindDuplicates(playerlist[i].pieces)
          if(duplicates.length == 0){
            io.emit('receive', playerlist[i].name + " no tiene piezas sobrantes.")
          }
          else {
            io.emit('receive', playerlist[i].name + " regresa sus piezas sobrantes.")
            extrapool.push(...duplicates)
            duplicates = []
          }                               
        }
        let count = playerlist.length
        let t = turn
        while(count != 0){
          if(!playerlist[t].isZombie){
            if(extrapool.filter(p => !playerlist[t].pieces.includes(p)).length != 0){
              playerlist[t].pieces.push(...extrapool.filter(p => !playerlist[t].pieces.includes(p)))
              io.emit('receive','La jugadora '+ playerlist[t].name+ ' de ' + playerlist[t].startup + ' toma piezas...')
            }
            else if(extrapool.filter(p => !playerlist[t].pieces.includes(p)).length == 0){
              io.emit('receive','No hay piezas para la jugadora '+ playerlist[t].name)
            }
            else if(extrapool.length ==0){
              io.emit('receive','No hay piezas extras para los jugadores.')
            }
          }
          else {
            io.emit('receive', 'La jugadora '+ playerlist[t].name+ ' se encuentra en modo zombie y no recibe piezas.')
          }
          t++
          if(t>playerlist.length-1){
            t-(playerlist.length-1)
          }
          count--
        }
        if (extrapool.length !=0) {
          piecesPool = extrapool
        }
        io.emit('receive', "La fase de Networking termina y el juego continúa.")          
        advanceTurn()    
        break
      
        // B: Procrastinio
      case gameBoardSquares.B:
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de Procrastinar.")
        //if player rolled 4
        if(roll == 4){
          io.emit('receive','El jugador no pierde su turno al haber lanzado un 4.')
          advanceTurn()    
        }
        //if player didnt roll 4
        else {
          if(playerlist[turn].xpills == 0){
            playerlist[turn].isLazy = true
            io.emit('receive',playerlist[turn].name + " procrastina y pierde su turno.")
            advanceTurn()    
          }
          else {
            io.emit('receive',playerlist[turn].name + " puede usar una de sus pildoras para no perder su turno. Usar una pildora? Sí (!yes), No (!no)")
            choiceLazy = true
            gamePaused = true
          }
        }
        break
      
        // C:"Impostor", //casilla de sindrome del impostor
      case gameBoardSquares.C:
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de Síndrome del impostor. Regresa al principio.")
        playerlist[turn].position = 1
        if(playerlist[turn].isZombie){
          playerlist[turn].isZombie = false
        }
        advanceTurn()
        break
      
        // D:"Zombie",//casilla del modo zombie
      case gameBoardSquares.D:
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de Zombie.")
        if(playerlist[turn].xpills == 0){
          playerlist[turn].isZombie = true
          io.emit('receive', "Sin píldoras, la jugadora " + playerlist[turn].name + " de " + playerlist[turn].startup + " entra en modo Zombie.")
          advanceTurn()
        }
        else {
          io.emit('receive', playerlist[turn].name + " puede usar una de sus pildoras para no entrar en modo zombie. Usar una pildora? Sí (!yes), No (!no)")
          choiceZombie = true
          gamePaused = true
        }
        break
      
        // E:"Tomadora",//casilla de tomadora de decisiones
      case gameBoardSquares.E:
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de Tomadora de decisiones.")
        if(!playerlist[turn].isZombie){          
          gamePaused = true            
          Tomadora()
        }
        else{
          advanceTurn()
        }
        break
      
        // F:"CEO",//Casilla de ceo extraordinaria
      case gameBoardSquares.F:
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de CEO Extraordinaria.")
        if(!playerlist[turn].isZombie){          
          CEO()
          advanceTurn()
        }
        else{
          advanceTurn()
        }
        break
      
        // G:"Capsula",//casilla de capsula extraordinaria

      case gameBoardSquares.G:        
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de Cápsula Extraordinaria.")
        Capsula()
        break
      
        // H:"Talento",//casilla de talento        
      case gameBoardSquares.H:
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de Talento Extraordinaria.")
        if(!playerlist[turn].isZombie){          
          Talento()
          advanceTurn()
        }
        else{
          advanceTurn()          
        }
        break
      
        // I:"Pildora",//casilla de pildora extraordinaria
      case gameBoardSquares.I:
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de Píldora Extraordinaria.")
        if(xpills == 0){
          io.emit('receive', "Se agotaron las píldoras extraordinarias. La jugadora no recibe píldora.")
        }
        if(playerlist[turn].isZombie){
          playerlist[turn].isZombie = false
          io.emit('receive',"La jugadora sale de modo zombie.")
        }
        else {
          playerlist[turn].xpills++
          xpills--
          io.emit('receive', "La jugadora recibe una píldora extraordinaria. La jugadora tiene " + playerlist[turn].xpills + " píldoras.")
        }
        advanceTurn()
        break
      
        // J:"Angel",//casilla de angel inversionista
      case gameBoardSquares.J:
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla del Ángel Inversionista.")
        if(!playerlist[turn].isZombie){          
          io.emit('receive', "Dale tu pitch al ángel inversionista. El referee debe usar los comandos '!yes' '!no' para aprobar el pitch.")
          gamePaused = true
          choiceAngel = true
        }
        else{
          advanceTurn()
        }
        break
      
        // 0:"Fempower",//casilla de fempower canvas choice
      case gameBoardSquares[0]:
        if(!playerlist[turn].isZombie){
          io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " cayó en la casilla de Fempower Canvas. Escoge la pieza que necesitas.")              
          gamePaused = true
          choiceFempower = true
        }
        else{
          advanceTurn()
        }
        break
      
      case gameBoardSquares[1]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[1] + ".")
        playerlist[turn].pieces.push(1)
        advanceTurn()
        }
        else{advanceTurn()}
        break
      
      case gameBoardSquares[2]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[2] + ".")
        playerlist[turn].pieces.push(2)
        advanceTurn()}
        else{advanceTurn()}
        break
  
      case gameBoardSquares[3]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[3] + ".")
        playerlist[turn].pieces.push(3)
        advanceTurn()}
        else{advanceTurn()}
        break

      case gameBoardSquares[4]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[4] + ".")
        playerlist[turn].pieces.push(4)
        advanceTurn()}
        else{advanceTurn()}
        break

      case gameBoardSquares[5]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[5] + ".")
        playerlist[turn].pieces.push(5)
        advanceTurn()}
        else{advanceTurn()}
        break

      case gameBoardSquares[6]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[6] + ".")
        playerlist[turn].pieces.push(6)
        advanceTurn()}
        else{advanceTurn()}
        break   

      case gameBoardSquares[7]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[7] + ".")
        playerlist[turn].pieces.push(7)
        advanceTurn()}
        else{advanceTurn()}
        break

      case gameBoardSquares[8]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[8] + ".")
        playerlist[turn].pieces.push(8)
        advanceTurn()}
        else{advanceTurn()}
        break

      case gameBoardSquares[9]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[9] + ".")
        playerlist[turn].pieces.push(9)
        advanceTurn()}
        else{advanceTurn()}
        break

      case gameBoardSquares[10]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[10] + ".")
        playerlist[turn].pieces.push(10)
        advanceTurn()}
        else{advanceTurn()}
        break

      case gameBoardSquares[11]:
        if(!playerlist[turn].isZombie){
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe una pieza de Fempower Canvas.")
        io.emit('receive', playerlist[turn].name + " de " + playerlist[turn].startup + " recibe " + piecesDict[11] + ".")
        playerlist[turn].pieces.push(11)        
        advanceTurn()}
        else{advanceTurn()}
        break

      case "Meta":
        if(playerlist[turn].pieces == goalPool || playerlist[turn].pieces.includes(goalPool)){
          io.emit("receive", "La jugadora " + playerlist[turn].name + " con " + playerlist[turn].startup + " obtiene la llave dorada y gana.")
          endGame()
        }
        else{
          io.emit('receive', "La jugadora "+ playerlist[turn].name + " ha llegado a la meta!")
          advanceTurn()
        }
    }
  }
}

function Tomadora(){
  question = getRandom(1,31)
  io.emit('receive', tomadora[question])
  choiceTomadora = true
}

function CEO(){
  question = getRandom(1,31)
  io.emit('receive', ceo[question])  
}

function Capsula(){
  question = getRandom(1,41)
  console.log(question)
  io.emit('receive', capsula[question])
  console.log(capsula[question])
  choiceCapsula = true
}

function Talento(){
  question = getRandom(1,16)
  io.emit('receive', "Comparte con las otras jugadoras la respuesta a la siguiente pregunta, en relación a tu propio emprendimiento (no el del juego).")
  io.emit('receive', talento[question])  
}

// function Pildora(){

// }

// function Angel(){

// }


//utility functions

function choiceEvent(){
  io.emit("receive","Es turno de la jugadora " + playerlist[turn].name + ". Esperando a la jugadora.")
}

function advanceTurn() {
  turn++;
  //if turn number goes over player count
  if(turn >= playerlist.length){
    turn = 0
  }
  io.emit('receive', "Es turno de " + playerlist[turn].name + " con " + playerlist[turn].startup + ". Lanza el dado. (!roll)")
}

function rollDice() {
  return Math.ceil(Math.random()*6)
}

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function entrepreneur(startup) {
  if (startupList.includes(startup)) {
    //startup list pop startup
    const index = startupList.indexOf(startup)
    startupList.splice(index,1)
    io.emit('receive',"Abre el tapete de tu startup para jugar el juego.")
    return startup
    //give player startup
    //send link to startup sheet
  }  
}

function color() {
  let colorarray = shuffle(colorList)
  let color = colorarray[0]
  //colorarray0 pop from color list
  return color
}

function toFindDuplicates(arry) {
  const uniqueElements = new Set(arry);
  const filteredElements = arry.filter(item => {
      if (uniqueElements.has(item)) {
          uniqueElements.delete(item);
      } else {
          return item;
      }
  });

  return [...new Set(uniqueElements)]
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}