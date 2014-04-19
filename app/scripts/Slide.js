function Slide(data, options){

	this._template = false;
	this.content = [];
	this._view = false;
	
	this.next = false;
	this.prev = false;

	this.load(data);
}

Slide.prototype.setTemplate = function(template){
	if (typeof (template) === 'string'){
		this._template = Handlebars.compile(template);
	} else if (typeof(template) === 'function'){
		this._template = template;
	}
}

Slide.prototype.load = function(data){
	if (!data.template) data.template = '<div class="page">{{#each content}}{{{this}}}{{/each}}</div>';
	this.setTemplate(data.template);
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