function Slidecontainer(_class, options){
	this.init(_class, options);

	this.slide = false;
	this.css({'position':'absolute','top':'0px','left':'0px'});
}

Slidecontainer.prototype = new View();

Slidecontainer.prototype.renderSlide = function(slide){
	if (this.slide === slide) return;	
	this.slide = slide;
	if (slide){
		console.log('render')
		slide.render(this._view);
	} else {
		this._view.empty();
	}
}