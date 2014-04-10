function Slider(options){	
	this.options = {
		direction:'horizontal',
		animationDuration:500,
		tolerance: 20,
		tension: 100

	}

	this.extend( this.options, options);
	this.init('Slider',this.options);
}

Slider.prototype = new View();

Slider.prototype.init = function(_class, options){
	var me = this;
	this.options = {
		transforms:true
	}

	this._position = {
		left:0,
		top:0
	}

	this.extend(this.options, options);
	this._view = $('<div class="'+_class+'"></div>');
	this._centerContainer = false;

	this.setPosition(this._position);
	
	this._container = new View('slider-container');	
	this._container.css({'overflow':'hidden'});
	this._container.addChild(this);

	this._pageContainers = [new View('pageContainer pg-1'), new View('pageContainer pg-2'), new View('pageContainer pg-3')];
	
	$.each(this._pageContainers,function(){
		this.render(me._view);
	});
	
	var me = this;

	this._view.hammer().on('dragstart dragend drag release',function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		me['_'+evt.type](evt);
	});
}

Slider.prototype._dragstart = function(evt){
	if (this._animating) return;
	this.__lastEvent = evt;
}

Slider.prototype._dragend = function(evt){
	this.__lastEvent = false;
}

Slider.prototype._drag = function(evt){
	if (!this.__lastEvent || this._animating) return;

	if (this.options.direction === 'horizontal'){
		
		if (Math.abs(evt.gesture.distance) > this.options.tolerance){
			var dx = evt.gesture.deltaX - this.__lastEvent.gesture.deltaX;			
			this.move({top:0,left:dx},0);
		}
	} else {
		if (Math.abs(evt.gesture.deltaY) > this.options.tolerance){
			var dy = evt.gesture.deltaY - this.__lastEvent.gesture.deltaY;
			this.move({top:dy,left:0},0);
		}
	}
	this.__lastEvent = evt;
}

Slider.prototype._release = function(evt){
	if (this._animating) return;
	this.__lastEvent = false;

	if (evt.gesture){
		if (this.options.direction === 'horizontal'){
			if (evt.gesture.deltaX > this.options.tension){
				///this.prev();
				this.center(0);
				return;
			} else if (evt.gesture.deltaX < -this.options.tension){
				this.center(2);
				return;
				//this.next();
			}
		} else {
			if (evt.gesture.deltaY > this.options.tension){

				return;
			} else if (evt.gesture.deltaY < -this.options.tension){

				return;
			}
		}
	}

	this.center();
}


Slider.prototype.center = function(index){
	if (index === undefined) index = 1;
	if (index > this._pageContainers.length-1) index = this._pageContainers.length-1;
	this.centerOnView(this._pageContainers[index], this.options.animationDuration || 300);
}


Slider.prototype._onTransitionEnd = function(){
	var index = this._pageContainers.indexOf(this._centerContainer);

	if (index !== 1 && index !== -1){		
		if (index === 0){
			this._pageContainers.unshift(this._pageContainers.pop());
		} else if (index ===2){
			this._pageContainers.push(this._pageContainers.shift());
		}

		this.arrageContainers();
		this.centerOnView(this._pageContainers[1],false);
	}
}


Slider.prototype.centerOnView = function(view, duration){
	var viewCenter = view.getCenterOffset();
	this._centerContainer = view;
	this.setCenter(viewCenter, duration);
}

Slider.prototype.setCenter = function(position, duration){
	meCenter = this._container.getCenter();

	if (position.left === undefined) position.left = 0;
	if (position.top === undefined) position.top = 0;

	var diffX = meCenter.left - position.left,
		diffY = meCenter.top - position.top;

	this.setPosition({left:diffX,top:diffY}, duration);	
}

Slider.prototype.arrageContainers = function(){
	var offset = 0;
	for (var i in this._pageContainers){
		if (this.options.direction === 'horizontal'){
			this._pageContainers[i].setPosition({left:offset, top:0});
			offset += this._pageContainers[i].getWidth();
		} else {
			this._pageContainers[i].setPosition({left:0, top:offset});
			offset += this._pageContainers[i].getHeight();			
		}
	}	
}

Slider.prototype.reset = function(){
	this.scale();
	this.arrageContainers();
	this.centerOnView(this._pageContainers[1]);
}

Slider.prototype.scale = function(){
	this._container.fitView();

	var containerSize = this._container.getSize(),
		w = this.options.direction === 'horizontal' ? (containerSize.width*3) : containerSize.width;
		h = this.options.direction === 'horizontal' ? containerSize.height : (containerSize.height*3);

	$.each(this._pageContainers,function(){
		this.scale(containerSize);
	});

	this._view.css({width: w, height: h });
}

Slider.prototype.render = function(view){
	if (typeof view === 'string') view = $(view);
	if (view) this._container.render(view);
/*
	if (this.page) {
		this.page.render(this._container);
	
		if (this.page.next) this.page.next.render(this._container);
		if (this.page.prev) this.page.prev.render(this._container);
	}
*/	
	
	this.reset();
}