module.exports=function(io) {
	const cards=require('./cards.js')(io);

	var FoolGame=function FoolGame(name) {
		cards.CardGame.call(this,name);

		this.nSuits=4;
		this.nRanks=8;

		this.areas['trump']=new cards.CardArea({
			name:'trump',
			readableBy:'all',
			writableBy:[],
			cardLimit:1,
		});

		for(var i=1; i<=6; i++)
			this.areas['attack#'+i]=new cards.CardArea({
				name:'attack#'+i,
				readableBy:'all',
				writableBy:[],
				cardLimit:2,
			});
	}

	FoolGame.prototype=Object.create(cards.CardGame.prototype,{
		newRound:{value:function() {
			this.areas.deck.empty();
			for(var suit=0;suit<this.nSuits;++suit)
				for(var rank=0; rank<this.nRanks; ++rank)
					this.areas.deck.contents.splice(Math.floor(Math.random()*(this.areas.deck.length+1)),0,[suit,rank])

			for(var p in this.players) {
				var hand=this.areas[this.players[p].hand];
				this.areas.deck.giveCardsTo(p,hand,Array(6).fill('random'));
				io.to(p).emit('update hand',hand.contents);
			}
		}},
	});

	return {
		FoolGame:FoolGame,
	}
}
