module.exports=function(io) {
	var Game=function Game(name) {
		this.name=name;
		this.nSuits=4;
		this.nRanks=8;
		this.room=io.to(name)

		this.deck=[]
		this.players={}
		this.trump=undefined;
		this.owner=undefined;
		this.shuffleDeck()
	}

	Game.prototype=Object.create(Object.prototype,{
		updateOwner:{value:function(id){
			this.owner=id
			if(typeof(this.owner)!=='undefined')
				io.to(id).emit('owner')
		}},
		shuffleDeck:{value:function() {
			for(var suit=0;suit<this.nSuits;++suit)
				for(var rank=0; rank<this.nRanks; ++rank)
					this.deck.splice(Math.floor(Math.random()*(this.deck.length+1)),0,[suit,rank])
		}},
		join:{value:function(s){
			s.join(this.name)
			s.broadcast.to(this.name).emit('join',s.id)
			for(var p in this.players)
				s.emit('join',p)
			s.broadcast
			this.players[s.id]={
				id:s.id,
				name  :'default',
				hand  :[],
			}
			if(typeof(this.owner)==='undefined') {
				this.updateOwner(s.id)
			}
		}},
		returnPlayerHandToDeck:{value:function(id){
			for(var i in this.players[id].hand)
				this.deck.splice(Math.floor(Math.random()*(this.deck.length+1)),0,this.players[id].hand[i])
		}},
		givePlayerHandFromDeck:{value:function(id){
			this.players[id].hand=this.players[id].hand.concat(this.deck.splice(0,6-this.players[id].hand.length))
			io.to(id).emit('hand',this.players[id].hand)
		}},

		leave:{value:function(s){
			s.broadcast.to(this.name).emit('leave',s.id)
			s.leave(this.name)
			this.returnPlayerHandToDeck(s.id);
			delete this.players[s.id];
			if(this.owner==s.id)
				this.updateOwner(Object.keys(this.players)[0])
		}},

		newRound:{value:function() {
			var player_ids=Object.keys(this.players);
			for(var p in this.players)
				this.givePlayerHandFromDeck(p)
			this.trump=this.deck[this.deck.length-1];
			this.room.emit('trump',this.trump)

			this.defender=player_ids[(player_ids.indexOf(this.defender)+1)%player_ids.length];
			io.to(this.defender).emit('defender')		
		}},



	});


	return {
		Game:Game,
	}
}

/*
rules:

start round:
	fill every hand to 6
	if no last_fool: 
		attacker=player with lowest trump
	else:
		defender=player after attacker

	start set:
		fill every hand to 6, starting with attacker, then non-attackers, then defender
		@any time
			all but one player have no cards:
			-> player gains a loss
				-> :start round	
		attacker plays any number of cards with the same rank
		-> defender forfeits
			-> defender picks up attacking card(s)
			  ->attacker is now player after defender
			    defender is now player after attacker
					-> :start set
		-> defender plays a card with the same suit but higher rank, or a trump
			@any time
				can't be more undefended attacks than cards in defender's hand
				any non-defenders can play a card with a rank that already appears on the board
				non-defenders cease:
				-> all non-defenders have ceased AND all attacks are defended
					-> cards on board are discarded
						-> defender is now attacker
							 defender is now player after attacker
				defender forfeits
				-> non-defenders can keep attacking
				  -> when done, defender picks up all cards on board
						-> attacker becomes player after defender
						   defender becomes player after attacker
							-> :start set
						
				
		
				-> when all non-defenders are done attacking, defender picks up all cards on board
			
		

*/
