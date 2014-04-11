function Slide(data, options){

	this._template = false;
	this.content = [];
	this._view = false;
	
	this.next = false;
	this.prev = false;

	this.load(data);
}

Slide.prototype.load = function(data){
	if (!data.template) data.template = 'page';
	
	this._template = Handlebars.compile( $('[data-template-name="'+data.template+'"]').html() );
	this.id = data.id;
	this.content = data.content;
	this.next= data.next;
	this.prev = data.prev;
}

Slide.prototype.prepend = function(content){
	this.content.unshift(content);
}

Slide.prototype.append = function(content){
	this.content.push(content);
}

Slide.prototype.render = function(view){
	if (view) this._view = view;
	if (this._view){
		this._view.html(this._template(this));
	}
}