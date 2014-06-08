function SliderView(_class, options){
	if (_class) this.init(_class, options);
};

SliderView.prototype = new SliderEvents();
SliderView.prototype.constructor = SliderView;

SliderView.prototype.init = function(_class, options){
	this.options = {
		transforms:true
	}
	$.extend(this.options, options);
	this._view = $('<div class="'+_class+'"></div>');

	this._position = {
		left:0,
		top:0
	}
	
	this.setPosition(this._position);
};

SliderView.prototype.css = function(css){
	this._view.css(css);
};

SliderView.prototype.getCenterOffset = function(){
	var position = this._position,
		centerOffset = this.getCenter();
	return {left:position.left + centerOffset.left, top: position.top + centerOffset.top};
};

SliderView.prototype.getCenter = function(){
	return {top: this._view.height()/2 , left: this._view.width()/2};
};

SliderView.prototype.addChild = function(child){
	this._view.append(child._view);
};

SliderView.prototype.scale = function(size){
	this._view.css({
		width:size.width,
		height:size.height
	});
};

SliderView.prototype.applyPrefix = function(prop, value){
	var prefixes = 'webkit,moz,o,ms'.split(',');

	this._view.css(prop,value);
	for (var i in prefixes){
		this._view.css('-'+prefixes[i]+'-'+prop,value);
	}
};

SliderView.prototype._transitionEnd = function(){
	if (this._transitionTimer){
		clearTimeout(this._transitionTimer);
	}
	this.applyPrefix('transition-duration','0');
	this._animating = false;
	this._onTransitionEnd();
};

SliderView.prototype._onTransitionEnd = function(){

};

SliderView.prototype.getWidth = function(){
	return this._view.width();
};

SliderView.prototype.getHeight = function(){
	return this._view.height();
};

SliderView.prototype.getSize = function(){
	return {width: this._view.width(), height:this._view.height()};
};

SliderView.prototype.setPosition = function(position, duration){		
	if (!position) return;		
	if (position.left === undefined) position.left = 0;
	if (position.top === undefined) position.top = 0;
	if (duration === undefined) duration = 0;

	if (this.options.transforms){			
		
		this._animating = true;			
		this.applyPrefix('transition-duration',duration+'ms');
		this.applyPrefix('transition-timing-function',this.options.easing || 'cubic-bezier(.49,.17,.07,1)');

		var me = this;
		if (duration){		
			this._transitionTimer = setTimeout(function(){
				me._transitionEnd();
			}, duration+10);
		} else {
			me._transitionEnd();
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

			me._transitionEnd();
		}
	}
	this._position = position;
};

SliderView.prototype.move = function(offset, duration){
	if (!offset) return;
	if (offset.top === undefined) offset.top = 0;
	if (offset.left === undefined) offset.left = 0;

	this.setPosition({left: this._position.left + offset.left,top:this._position.top + offset.top}, duration);
};

SliderView.prototype.getPosition = function(){
	if (this.options.transforms){

		var matrix = this._view.css("-webkit-transform").replace(/[\(\)]/g, '').split(', ');			
		return { top: parseInt( matrix[5] ) , left: parseInt( matrix[5] ) };

	} else {
		return this._view.position();
	}
};

SliderView.prototype.getView = function(){
	return this._view;
};

SliderView.prototype.getContainer = function(){
	return this._view.parent();
};

SliderView.prototype.fitView = function(view){
	if (! view ) view = this.getContainer();
	this.scale({width: view.innerWidth(), height: view.innerHeight()});
	this.fire('resize', this);
};

SliderView.prototype.render = function(view){
	if (typeof view === 'string') view = $(view);
	if (view){
		if ($.contains(view, this._view)) return;
		view.append(this._view);
		this.fire('render', this);
	}
};