function View(_class, options){
	if (_class) this.init(_class, options);
}

View.prototype = {
	init:function(_class, options){
		this.options = {
			transforms:true
		}
		this.extend(this.options, options);
		this._view = $('<div class="'+_class+'"></div>');

		this._position = {
			left:0,
			top:0
		}
		
		this.setPosition(this._position);
	},
	css:function(css){
		this._view.css(css);
	},
	getCenterOffset:function(){
		var position = this._position,
			centerOffset = this.getCenter();

		return {left:position.left + centerOffset.left, top: position.top + centerOffset.top};
	},
	getCenter:function(){
		return {top: this._view.height()/2 , left: this._view.width()/2};
	},
	addChild:function(child){
		this._view.append(child._view);
	},
	centerOnView:function(parent, duration){
		var parentCenter = parent.getCenterOffset();
		this.setCenter(parentCenter, duration);
	},
	setCenter:function(position, duration){
		var meCenter = this.getCenter();
		if (position.left === undefined) position.left = 0;
		if (position.top === undefined) position.top = 0;

		var diffX = position.left - meCenter.left,
			diffY = position.top - meCenter.top;

		this.setPosition({left:diffX,top:diffY}, duration);
	},
	scale:function(size){
		this._view.css({
			width:size.width,
			height:size.height
		});
	},
	applyPrefix:function(prop, value){
		var prefixes = 'webkit,moz,o,ms'.split(',');

		for (var i in prefixes){
			this._view.css('-'+prefixes[i]+'-'+prop,value);
		}
	},
	_transitionEnd:function(){
		if (this._transitionTimer){
			clearTimeout(this._transitionTimer);
		}
		this.applyPrefix('transition-duration','0');
		this._animating = false;
		this._onTransitionEnd();
	},
	_onTransitionEnd:function(){

	},
	getWidth:function(){
		return this._view.width();
	},
	getHeight:function(){
		return this._view.height();
	},
	getSize:function(){
		return {width: this._view.width(), height:this._view.height()};
	},
	setPosition:function(position, duration){		
		if (!position) return;
		if (position.left === undefined) position.left = 0;
		if (position.top === undefined) position.top = 0;

		if (this.options.transforms){			
			if (duration){
				this._animating = true;			
				this.applyPrefix('transition-duration',duration+'ms');			

				var me = this;
				this._transitionTimer = setTimeout(function(){
					me._transitionEnd();
				}, duration+10);
			}
			this.applyPrefix('transform','translate3d('+position.left+'px ,'+position.top+'px ,0px)');
		} else {
			if (duration){
				this._animating = true;
				var me = this;

				this._view.animate({
					left:position.left,
					top:position.top
				},duration,function(){
					me._transitionEnd();
				});
			} else {			
				this._view.css({
					left:position.left,
					top:position.top
				});
			}
		}
		this._position = position;
	},
	move:function(offset, duration){
		if (!offset) return;
		if (offset.top === undefined) offset.top = 0;
		if (offset.left === undefined) offset.left = 0;

		this.setPosition({left: this._position.left + offset.left,top:this._position.top + offset.top}, duration);
	},
	getPosition:function(){
		if (this.options.transforms){

			var matrix = this._view.css("-webkit-transform").replace(/[\(\)]/g, '').split(', ');			
			return { top: parseInt( matrix[5] ) , left: parseInt( matrix[5] ) };

		} else {
			return this._view.position();
		}
	},
	getView:function(){
		return this._view;
	},
	getContainer:function(){
		return this._view.parent();
	},
	fitView:function(view){
		if (! view ) view = this.getContainer();
		this.scale({width: view.innerWidth(), height: view.innerHeight()});		
	},
	render:function(view){
		if (typeof view === 'string') view = $(view);
		if (view){
			if ($.contains(view, this._view)) return;
			view.append(this._view);
		}
	},
    on: function(type, method, scope, context) { 
        var listeners, handlers, scope;
        if (!(listeners = this.__listeners)) {
            listeners = this.__listeners = {};
        }
        if (!(handlers = listeners[type])){
            handlers = listeners[type] = [];
        }
        scope = (scope ? scope : window);
        handlers.push({
            method: method,
            scope: scope,
            context: (context ? context : scope)
        });
    },
    fire: function(type, data, context) {
        var listeners, handlers, i, n, handler, scope;
        if (!(listeners = this.__listeners)) {
            return;
        }
       
        handlers = listeners[type];

        if (!handlers){
            return;
        }

        for (i = 0, n = handlers.length; i < n; i++){
            handler = handlers[i];

            if (typeof(context)!=="undefined"){
                if (handler.method.call(
                    context, this, type, data
                )===false) {
                    return false;
                }
            }
        }
        return true;
    },
	extend:function(obj, obj2, ignore){
		for (var i in obj2){
			if (i!==ignore){
				obj[i] = obj2[i];
			}
		}
	}    
}