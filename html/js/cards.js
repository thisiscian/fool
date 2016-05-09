var CardGame=function CardGame() {
	this.mode=undefined;
	this.socket=io();
	this.layout={};
}

CardGame.prototype=Object.create(Object.prototype, {
	join:{value:function(mode) {
		this.mode=mode;
	}},
	
	becomeOwner:{value:function(mode) {
		var this_=this;
		this.add_layout_element('start','text','start')
		this.draw_layout_element.apply(this,this.layout.start);
		document.getElementById('start').addEventListener('click', function() {
			this_.socket.emit('start');	
		});
	}},

	draw_layout_element:{value:function(id,content_type,content,parent_element) {
		var element=document.getElementById(id)
		if(element==null) {
			var element=document.createElement('div')
			element.id=id;
			if(typeof(parent_element)!=='undefined' && document.getElementById(parent_element))
				document.getElementById(parent_element).appendChild(element)
			else
				document.body.appendChild(element)
		}
		if(content_type=='text') {
			element.innerHTML=content;
		} else if(content_type=='cards') {
			for(var card in content) {
				var e=document.createElement('div')
				e.className='card'
				e.innerHTML=content[card];
				element.appendChild(e);
			}
		}

	}},

	start:{value:function() {
		var this_=this;
		this.socket.on('join',function(){ this_.join.apply(this_,arguments); });
		this.socket.on('owner',function(){ this_.becomeOwner.apply(this_,arguments); });
		this.socket.on('add layout element',function() { this_.add_layout_element.apply(this_,arguments); });
		this.socket.on('add layout elements',function() { this_.add_layout_elements.apply(this_,arguments); });
		this.socket.on('update layout element',function(){this_.update_layout_element.apply(this_,arguments); });
		this.socket.on('update layout elements',function(){this_.update_layout_elements.apply(this_,arguments); });
		this.socket.on('remove layout element',function(){this_.remove_layout_element.apply(this_,arguments); });
		this.socket.on('remove layout elements',function(){this_.remove_layout_elements.apply(this_,arguments); });
		this.socket.emit('join',window.location.pathname);
	}},

	add_layout_element:{value:function(id,content_type,content,parent_element) {
		this.layout[id]=[id,content_type,content,parent_element];
		this.draw_layout_element.apply(this,this.layout[id]);
	}},
	
	update_layout_element:{value:function(id,content) {
		console.log(id,content)
		this.layout[id][2]=content;
		this.draw_layout_element.apply(this,this.layout[id]);
	}},

	remove_layout_element:{value:function(id) {
		var element=document.getElementById(id);
		element.parentNode.removeChild(element);
		delete this.layout[id]
	}},

	add_layout_elements:{value:function(elements) {
		for(var element in elements)
			this.add_layout_element.apply(this,elements[element])
	}},

	update_layout_elements:{value:function(elements) {
		for(var element in elements) 
			this.update_layout_element.apply(this,elements[element])
	}},

	remove_layout_elements:{value:function(elements) {
		for(var element in elements) 
			this.remove_layout_element.apply(this,elements[element])
	}},

});
