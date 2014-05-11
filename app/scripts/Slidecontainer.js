function SliderSlidecontainer(_class, options){
	this.init(_class, options);

	this.slide = false;
	this.css({'position':'absolute','top':'0px','left':'0px'});
};

SliderSlidecontainer.prototype = new SliderView();

SliderSlidecontainer.prototype.renderSlide = function(slide){
	if (this.slide === slide) return;	
	this.slide = slide;
	if (slide){
		slide.render(this._view);
	} else {
		this._view.empty();
	}
};