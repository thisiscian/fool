function render_card(card) {
	var cards=['&hearts;','&spades;','&diams;','&clubs;']
	var ranks=['7','8','9','10','J','Q','K','A']
	var c=document.createElement('div')
	c.innerHTML=ranks[card[1]]+cards[card[0]];
	return c;
}

function toggle_select_card(card_index) {
	if(selected_cards[card_index])
		selected_cards.splice(card_index,1)
	else
		selected_cards[card_index]=true;
	update_hand();
}

function play_selected_cards() {
	socket.emit('play',selected_cards,defend_against)
}

function update_players(players) {
	players_div.innerHTML='';
	for(var p in players)
		players_div.innerHTML+='<div>'+players[p].name+'</div>'	
}
function update_hand(h) {
	hand=h;
	hand_div.innerHTML='hand:'
	for(var card in hand) {
		var c=render_card(hand[card])
		c.onclick=(function(card){return function(){toggle_select_card(card)};})(card);
		if(selected_cards[card])
			c.innerHTML+='*'
		hand_div.appendChild(c)
	}
}

function update_trump() {
	trump_div.appendChild(render_card(trump))
}

function update_status() {
	status_div.innerHTML='<div>status:'+(defender=='/#'+socket.id?'defender':'attacker')+'</div>'
}

function FoolGame() {
	CardGame.apply(this)
}

FoolGame.prototype=Object.create(CardGame.prototype,{
});
