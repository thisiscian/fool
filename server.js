const port=8001;

const app =require('express')();
const http=require('http').Server(app);
const io=require('socket.io')(http);
const fool=require('./fool.js')(io)

var games={}

app.get('/' ,function(req,res){res.sendFile('index.html',{root:__dirname+'/html/'})});
app.get('/js/:file' ,function(req,res){res.sendFile(req.params.file,{root:__dirname+'/html/js/'});});
app.get('/css/:file' ,function(req,res){res.sendFile(req.params.file,{root:__dirname+'/html/css/'});});
app.get('/*',function(req,res){res.sendFile('game.html' ,{root:__dirname+'/html/'})});

io.on('connection',Connection);

http.listen(port,function(){console.log('listening on *:'+port);});

function Connection(socket) {
	var game=undefined;
	function play_cards(cards,defend_against){
		game.play(socket.id,cards,defend_against)
	}
	function join_game(room){
		if(room in games)
			game=games[room]
		else
			game=games[room]=new fool.FoolGame(room)
		game.join(socket.id);
	}
	function leave_game(){
		console.log('Leaving...',socket.id)
		if(typeof(game)!=='undefined')
			game.leave(socket.id);
	}
	function start_game(){
		var player_ids=Object.keys(game.players)
		game.defender=player_ids[Math.random()*player_ids.length];
		game.newRound();
	}

	console.log('Connection made',socket.id)
//	socket.on('play cards',play_cards);
	socket.on('join' ,join_game);
	socket.on('disconnect',leave_game);
	socket.on('start',start_game);
}

