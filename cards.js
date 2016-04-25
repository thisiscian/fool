module.exports=function(io) {
	CardArea=function CardArea(properties){
		var name       ='name'       in properties?properties.name      :'defaultCardArea';
		var readableBy ='readableBy' in properties?properties.readableBy:'all';
		var writableBy ='writableBy' in properties?properties.writableBy:'all';
		var contents   ='contents'   in properties?properties.contents  :[];
		var cardLimit  ='cardLimit'  in properties?properties.cardLimit :-1;

		Object.defineProperty(this, 'name', {get: function(){ return name; }});

		Object.defineProperty(this, 'readable', {value:{}});
		Object.defineProperty(this.readable, 'setToAll', {value:function(){ readableBy='all'; }});
		Object.defineProperty(this.readable, 'add', {value:function(id){ if(readableBy=='all') readableBy=[]; if(!(id in readableBy)) readableBy.push(id); }});
		Object.defineProperty(this.readable, 'remove', {value:function(id){ if(readableBy=='all') readableBy=[]; if(id in readableBy) readableBy.slice(readableBy.indexOf(id),1); }});
		Object.defineProperty(this.readable, 'isAllowed', {value:function(id){ return id=='SERVER' || readableBy=='all' || readableBy.indexOf(id)>=0; }});

		Object.defineProperty(this, 'writable', {value:{}});
		Object.defineProperty(this.writable, 'setToAll', {value:function(){ writableBy='all'; }});
		Object.defineProperty(this.writable, 'add', {value:function(id){ if(writableBy=='all') writableBy=[]; if(!(id in writableBy)) writableBy.push(id); }});
		Object.defineProperty(this.writable, 'remove', {value:function(id){ if(writableBy=='all') writableBy=[]; if(id in writableBy) writableBy.slice(writableBy.indexOf(id),1); }});
		Object.defineProperty(this.writable, 'isAllowed', {value:function(id){ return id=='SERVER' || writableBy=='all' || writableBy.indexOf(id)>=0; }});

		Object.defineProperty(this, 'contents', {get: function(){ return contents; }});
		Object.defineProperty(this, 'length', {get: function(){ return contents.length; }});
		Object.defineProperty(this,'empty',{value:function(){contents=[]}});

		Object.defineProperty(this,'giveCardsTo', {value:function(id, cardArea, indexes){
			if(!    this.writable.isAllowed(id)) throw 'Cannot move cards from CardArea#'+this.name;
			if(!cardArea.writable.isAllowed(id)) throw 'Cannot move cards from CardArea#'+cardArea.name;
			if(indexes=='all') indexes=Object.keys(contents);
			var cards=[];
			for(var i in indexes) {
				if(i=='random') i=Math.floor(Math.random()*this.length)
				if(!(i in indexes)) throw 'Card with index '+i+' not contained in CardArea#'+this.name;
				cards.push(contents.splice(i,1)[0]);
			}
			cardArea.add(id, cards);
		}});

		Object.defineProperty(this,'takeCardsFrom', {value:function(id, cardArea, indexes){
			cardArea.giveCardsTo(id,this,indexes);
		}});


		Object.defineProperty(this, 'add', {value:function(id, cards){
			if(!this.writable.isAllowed(id)) throw 'User '+id+' not able to change contents';
			if(this.cardLimit>=0 && this.length>=this.cardLimit) throw 'CardArea is full';
			if(this.cardLimit>=0 && this.length+indexes.length>this.cardLimit) throw 'CardArea will be too full aftering adding cards';
			contents.push.apply(contents,cards);
		}});
	}

	var CardGame=function CardGame(name) {
		this.name=name;
		this.areas={
			deck: new CardArea({
				name:'deck',
				readableBy:[],
				writableBy:'all',
			}),
		};
		this.players={};
		this.owner=undefined;
	}

	CardGame.prototype=Object.create(Object.prototype,{
		join: {value:function(id){
			io.sockets.connected[id].join(this.name);
			io.to(this.name).emit('joining',id);
			var cardArea=new CardArea({
				name:'hand#'+id,
				readableBy:[id],
				writableBy:[id],
			})

			this.areas[cardArea.name]=cardArea;

			this.players[id]={
				id  :id,
				name:'player#'+id.slice(-4),
				hand:cardArea.name,
			}

			if(typeof(this.owner)==='undefined') {
				this.owner=id;
				io.to(id).emit('owner');
			}

			io.to(this.name).emit('update players',this.players);
		}},

		leave:{value:function(id){
			if(id in this.players) {
				var player=this.players[id];
				if(player.hand in this.areas)
					this.areas[player.hand].giveCardsTo(id,this.areas.deck,'all');
				delete this.players[id];
				if(this.owner==id) {
					this.owner=Object.keys(this.players)[0];
					io.to(this.owner).emit('owner');
				}
				io.to(this.name).emit('update players',this.players);
			}
		}},


	});

	return {
		CardArea:CardArea,
		CardGame:CardGame,
	}
}
