function Slider(container, options){
	this.options = {
		direction:'horizontal',
		animationDuration:500,
		tolerance: 20,
		tension: 100,
		stiffness: 0.3,
		locked : false
	}

	this.templates = {};
	this.slides = [];
	this.slide = false;
	$.extend( this.options, options);
	this.init('Slider',this.options);
	this.render(container);
};

Slider.prototype = new SliderView();
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

	$.extend(this.options, options);

	this._view = $('<div class="'+_class+'"></div>');
	this._container = new SliderView('slider-container');
	this._container.css({'overflow':'hidden'});
	this._container.addChild(this);

	this._slideContainers = [new SlideContainer('Slidecontainer'),
							 new SlideContainer('Slidecontainer'),
							 new SlideContainer('Slidecontainer')];

	$.each(this._slideContainers,function(){
		this.render(me._view);
	});

	this._centerContainer = false;
	this.setPosition(this._position,0);

	this._view.hammer().on('dragstart dragend drag release',function(evt){
		if (me._animating) return;
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
};

Slider.prototype.getTemplate = function(name){
	return this.templates[name];
};

Slider.prototype.addTemplate = function(data){
	this.templates[data.name] = Handlebars.compile(data.html);
};

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

	this.renderSlides(this.slide);
};

Slider.prototype.getSlide = function(id){
	for (var i in this.slides){
		if (this.slides[i].id === id){
			return this.slides[i];
		}
	}
	return false;
};

Slider.prototype.addSlide = function(data){
	var slide = new Slide(data, this);
	this.slides.push( slide );
	if (!this.slide) this.slide = slide;
	return slide;
};

Slider.prototype._dragstart = function(evt){
	if (this._animating || this.options.locked) return;
	this.__lastEvent = evt;
};

Slider.prototype._dragend = function(evt){
	//if (this._animating || this.options.locked) return;
	this.__lastEvent = false;
};

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
};

Slider.prototype._release = function(evt){
	if (this._animating || this.options.locked) return;
	this.__lastEvent = false;

	if (evt){
		index = 1;
		if (this.options.direction === 'horizontal'){
			if (evt.gesture.deltaX > this.options.tension) index = 0;
			if (evt.gesture.deltaX < -this.options.tension) index = 2;
		} else {
			if (evt.gesture.deltaY > this.options.tension) index = 2;
			if (evt.gesture.deltaY < -this.options.tension) index = 0;
		}
	
		this.center(index);
	}	
};

Slider.prototype.hasNext = function(){
	if (!this.slide) return false;
	return this.slide.next !== false;
};

Slider.prototype.hasPrev = function(){
	if (!this.slide) return false;
	return this.slide.prev !== false;
};

Slider.prototype._onTransitionEnd = function(){
	var index = this._slideContainers.indexOf(this._centerContainer);

	if (index !== 1 && index !== -1){
		if (index === 0){

			this.slide = this._slideContainers[0].slide;	
			this._slideContainers.unshift(this._slideContainers.pop());
			this.renderSlides();

		} else if (index ===2){
		
			this.slide = this._slideContainers[2].slide;
			this._slideContainers.push(this._slideContainers.shift());
			this.renderSlides();
		}

		this.arrangeContainers();
		this.centerOnView(this._slideContainers[1],false);
	}

	this.fire('transitionEnd', this.slide, this);
};

Slider.prototype.arrangeContainers = function(){
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
};

Slider.prototype.scale = function(){
	this._container.fitView();

	var containerSize = this._container.getSize(),
		w = this.options.direction === 'horizontal' ? (containerSize.width*3) : containerSize.width;
		h = this.options.direction === 'horizontal' ? containerSize.height : (containerSize.height*3);

	$.each(this._slideContainers,function(){
		this.scale(containerSize);
	});

	this._view.css({width: w, height: h });
	this.arrangeContainers();
	this.center(1,false);
};

Slider.prototype.reset = function(){
	this.scale();
	this.arrangeContainers();
	this.centerOnView(this._slideContainers[1]);
};

Slider.prototype.render = function(view){
	if (typeof view === 'string') view = $(view);
	if (view) this._container.render(view);
	if (this.slide){
		this.renderSlides();
	}

	this.reset();
};

Slider.prototype.getSlideOffset = function(slide){
	var current = this.getCurrentSlide();
	return current.getOffset(slide);
};

Slider.prototype.center = function(index, animate){
	if (index === undefined || index === null || index === false ) index = 1;
	if (!this.hasPrev() && index === 0) index = 1;
	if (!this.hasNext() && index === 2) index = 1;
	if (index > this._slideContainers.length-1) index = this._slideContainers.length-1;
	
	this.centerOnView(this._slideContainers[index], animate);
};
Slider.prototype.centerOnView = function(view, duration){
	var position = view.getCenterOffset();
	this._centerContainer = view;
	meCenter = this._container.getCenter();
 	duration = duration === false ?  0 : this.options.animationDuration || 300;

	if (position.left === undefined) position.left = 0;
	if (position.top === undefined) position.top = 0;

	var diffX = meCenter.left - position.left,
		diffY = meCenter.top - position.top;

	this.setPosition({left:diffX,top:diffY}, duration);
};

Slider.prototype.prev = function(animate){
	if (this._animating) return;
	if (!this.slide.prev) return;
	this.centerOnView(this._slideContainers[0], animate);
	//this.arrangeContainers();
};

Slider.prototype.next = function(animate){
	if (!this.slide.next) return;
	if (this._animating) return;
	this.centerOnView(this._slideContainers[2], animate);
	//this.arrangeContainers();
};

Slider.prototype.show = function(slide, animate){
	if (!(slide instanceof Slide)) slide = this.getSlide(slide);
	if (!slide) return;


	if (slide === this.slide.next){
		this.next(animate);
		return;
	}

	if (slide === this.slide.prev){
		this.prev(animate);
		return;
	}

	if (slide instanceof Slide){
		var offset = this.getSlideOffset(slide);

		if (offset < 0){
			this._slideContainers[0].renderSlide(slide);
			this.centerOnView(this._slideContainers[0], animate === false ?  0 : this.options.animationDuration || 300);
			
			
		} else {//if (offset > 0){
			this._slideContainers[2].renderSlide(slide);
			this.centerOnView(this._slideContainers[2], animate === false ?  0 : this.options.animationDuration || 300);
			
			
		}
			//this.renderSlides(slide);
		//}
	}
};

Slider.prototype.getSlideView = function(index){
	return this._slideContainers[index].getView();
}

Slider.prototype.getCurrentSlide = function(){
	return this._slideContainers[1].slide;
};

Slider.prototype.renderSlides = function(slide){
	if (slide) this.slide = slide;
	var r = [];
	r.push( this._slideContainers[0].renderSlide(this.slide.prev) );
	r.push( this._slideContainers[1].renderSlide(this.slide) );
	r.push( this._slideContainers[2].renderSlide(this.slide.next) );

	for (var i in r){
		if (r[i] === true){
			this.fire('render',this._slideContainers[i].getView(), this._slideContainers[i].getView());
		}
	}

	if (r.indexOf(true) > -1){
		this.fire('change',this.slide, this._slideContainers[1].getView());
	}	
};
