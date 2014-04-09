function Page(options){

	this.next = false;
	this.prev = false;
	
	this.init('slider-page', options);
}

Page.prototype = new View();