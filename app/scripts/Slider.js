function Slider(container, options){	
	this.options = {
		direction:'horizontal',
		animationDuration:400,
		tolerance: 20,
		tension: 100,
		stiffness: 0.3,
		locked : false
	}

	this.templates = {};
	this.slides = [];
	this.slide = false;
	this.extend( this.options, options);
	this.init('Slider',this.options);
	this.render(container);
}

Slider.prototype = new View();
Slider.prototype.constructor = Slider;

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
	this._container = new View('slider-container');
	this._container.css({'overflow':'hidden'});
	this._container.addChild(this);
	
	this._slideContainers = [new Slidecontainer('Slidecontainer pg-1'),
							 new Slidecontainer('Slidecontainer pg-2'),
							 new Slidecontainer('Slidecontainer pg-3')];

	$.each(this._slideContainers,function(){
		this.render(me._view);
	});
	
	this._centerContainer = false;
	this.setPosition(this._position);

	this._view.hammer().on('dragstart dragend drag release',function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		me['_'+evt.type](evt);
	});

	var resize = false;
	$(window).resize(function(){
		if (resize) clearTimeout(resize);
		resize = setTimeout(function(){
			me.scale();
		},100)
	});

	this._view.hammer().on('tap','[data-link]',function(evt){
		evt.stopPropagation();
		var id = $(this).attr('data-link');
		if ($.isNumeric(id)) id = parseInt(id);
		var slide = me.getSlide(id);
		if (slide) me.show(slide);
	});
}

Slider.prototype.getTemplate = function(name){
	return this.templates[name];
}

Slider.prototype.addTemplate = function(data){
	this.templates[data.name] = Handlebars.compile(data.html);
}

Slider.prototype.load = function(data){
	var me = this;
	$.each(data.templates, function(){
		me.addTemplate(this);
	});

	$.each(data.slides,function(){
		if (this.template) this.template = me.getTemplate(this.template);
		me.addSlide(this);
	});

	$.each(this.slides, function(){
		if (this.next !== false && !(this.next instanceof Slide) ) this.next = me.getSlide(this.next);
		if (this.prev !== false && !(this.prev instanceof Slide) ) this.prev = me.getSlide(this.prev);		
	});

	this.renderSlides();
}

Slider.prototype.getSlide = function(id){
	for (var i in this.slides){
		if (this.slides[i].id === id){
			return this.slides[i];
		}
	}
	return false;
}

Slider.prototype.addSlide = function(data){
	var slide = new Slide(data, this);
	this.slides.push( slide );
	if (!this.slide) this.slide = slide;
	return slide;
}

Slider.prototype._dragstart = function(evt){
	if (this._animating || this.options.locked) return;
	this.__lastEvent = evt;
}

Slider.prototype._dragend = function(evt){
	if (this._animating || this.options.locked) return;
	this.__lastEvent = false;
}

Slider.prototype._drag = function(evt){
	if (!this.__lastEvent || this._animating || this.options.locked) return;
	
	if (this.options.direction === 'horizontal'){
		if (Math.abs(evt.gesture.distance) > this.options.tolerance){
			var dx = evt.gesture.deltaX - this.__lastEvent.gesture.deltaX;
			
			if (evt.gesture.deltaX < 0 && !this.hasNext()) dx = dx*this.options.stiffness;			
			if (evt.gesture.deltaX > 0 && !this.hasPrev()) dx = dx*this.options.stiffness;

			this.move({top:0,left:dx},0);
		}
	} else {
		if (Math.abs(evt.gesture.deltaY) > this.options.tolerance){
			var dy = evt.gesture.deltaY - this.__lastEvent.gesture.deltaY;
			
			if (evt.gesture.deltaY < 0 && !this.hasNext()) dy = dy*this.options.stiffness;			
			if (evt.gesture.deltaY > 0 && !this.hasPrev()) dy = dy*this.options.stiffness;			
			
			this.move({top:dy,left:0},0);		
		}
	}
	this.__lastEvent = evt;
}

Slider.prototype._release = function(evt){
	if (this._animating || this.options.locked) return;
	this.__lastEvent = false;
	this.center(null, evt);
}

Slider.prototype.hasNext = function(){
	if (!this.slide) return false;
	return this.slide.next !== false;
}

Slider.prototype.hasPrev = function(){
	if (!this.slide) return false;
	return this.slide.prev !== false;
}


Slider.prototype._onTransitionEnd = function(){
	var index = this._slideContainers.indexOf(this._centerContainer);

	if (index !== 1 && index !== -1){		
		if (index === 0 && this.hasPrev()){
			this._slideContainers.unshift(this._slideContainers.pop());
			this.slide = this.slide.prev;
			this.renderSlides();
		} else if (index ===2 && this.hasNext()){
			this._slideContainers.push(this._slideContainers.shift());
			this.slide = this.slide.next;
			this.renderSlides();
		}

		this.arrageContainers();
		this.centerOnView(this._slideContainers[1],false);
	}
	this.fire('transitionEnd', this.slide, this);
}

Slider.prototype.arrageContainers = function(){
	var offset = 0;
	for (var i in this._slideContainers){
		if (this.options.direction === 'horizontal'){
			this._slideContainers[i].setPosition({left:offset, top:0});
			offset += this._slideContainers[i].getWidth();
		} else {
			this._slideContainers[i].setPosition({left:0, top:offset});
			offset += this._slideContainers[i].getHeight();			
		}
	}	
}

Slider.prototype.center = function(index, evt){
	if (evt){
		index = 1;
		if (this.options.direction === 'horizontal'){
			if (evt.gesture.deltaX > this.options.tension) index = 0;
			if (evt.gesture.deltaX < -this.options.tension) index = 2;
		} else {
			if (evt.gesture.deltaY > this.options.tension) index = 2;
			if (evt.gesture.deltaY < -this.options.tension) index = 0;
		}
	}
	if (index === undefined || index === null || index === false ) index = 1;
	if (!this.hasPrev() && index === 0) index = 1;
	if (!this.hasNext() && index === 2) index = 1;
	if (index > this._slideContainers.length-1) index = this._slideContainers.length-1;

	if (index === 2) this.fire('changeStart', this.slide.next, this);
	if (index === 0) this.fire('changeStart', this.slide.prev, this);
	this.centerOnView(this._slideContainers[index], this.options.animationDuration || 300);
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


Slider.prototype.scale = function(){
	this._container.fitView();

	var containerSize = this._container.getSize(),
		w = this.options.direction === 'horizontal' ? (containerSize.width*3) : containerSize.width;
		h = this.options.direction === 'horizontal' ? containerSize.height : (containerSize.height*3);

	$.each(this._slideContainers,function(){
		this.scale(containerSize);
	});

	this._view.css({width: w, height: h });
	this.arrageContainers();
	this.center(1,0);
}

Slider.prototype.reset = function(){
	this.scale();
	this.arrageContainers();
	this.centerOnView(this._slideContainers[1]);
}

Slider.prototype.render = function(view){
	if (typeof view === 'string') view = $(view);
	if (view) this._container.render(view);

	if (this.slide){	
		this.renderSlides();
	}

	this.reset();
}

Slider.prototype.prev = function(){
	if (this._animating) return;
	if (!this.slide.prev) return;
	this.centerOnView(this._slideContainers[0], this.options.animationDuration || 300);
	this.arrageContainers();
}

Slider.prototype.next = function(){
	if (!this.slide.next) return;
	if (this._animating) return;
	this.centerOnView(this._slideContainers[2], this.options.animationDuration || 300);
	this.arrageContainers();
}

Slider.prototype.show = function(slide){
	if (!(slide instanceof Slide)) slide = this.getSlide(slide);
	if (!slide) return;
	
	if (slide === this.slide.next){
		this.next();
		return;
	}

	if (slide === this.slide.prev){
		this.prev();
		return;
	}

	if (slide instanceof Slide){
		this.renderSlides(slide);
	}
}

Slider.prototype.renderSlides = function(slide){
	if (slide) this.slide = slide;
	this._slideContainers[0].renderSlide(this.slide.prev);
	this._slideContainers[1].renderSlide(this.slide);
	this._slideContainers[2].renderSlide(this.slide.next);	
}