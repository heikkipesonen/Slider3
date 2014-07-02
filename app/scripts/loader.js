function Loader(){
	this._queue = [];
	this._listeners = {};
}

Loader.prototype = {
	on:function(listeners){
		for (var i in listeners){
			if (!this._listeners[i]) this._listeners[i] = [];
			this._listeners[i].push( listeners[i] );
		}
	},
	fire:function(evt, data){
		if (this._listeners[evt]){
			for (var i in this._listeners[evt]){
				this._listeners[evt][i].call(this, data)
			}
		}
	},
	add:function(item){
		this._queue.push(item);

	},

	_load:function(item){
		var me = this;

		$.ajax({
			url:item.url,
			dataType:item.dataType,
			cache:true
		}).always(function(){
			me._ready(item);
		});
	},
	_ready:function(item){
		this._queue.splice(this._queue.indexOf(item), 1);
	},
	_checkQueue:function(){
		if (this._queue.length === 0){

		}
	}
}