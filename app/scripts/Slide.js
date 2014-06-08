function Slide(data, options){

	this._template = false;
	this.content = [];
	this._view = false;

	this.next = false;
	this.prev = false;

	this.load(data);
};

Slide.prototype.getOffset = function(slide, visited){
	if (!visited) visited = [];
	var offset = 0;

	if (visited.indexOf(this) === -1){
		visited.push(this);

		if (this.next === slide){
			offset++;
		} else if (this.prev === slide){
			offset--;
		} else {
			if (this.next && visited.indexOf(this.next) === -1){
				offset++;
				offset += this.next.getOffset(slide, visited);
			} 

			if (this.prev && visited.indexOf(this.prev) === -1){
				offset--;
				offset += this.prev.getOffset(slide, visited);
			}
		}
	}

	return offset;
}

Slide.prototype.setTemplate = function(template){
	if (typeof (template) === 'string'){
		this._template = Handlebars.compile(template);
	} else if (typeof(template) === 'function'){
		this._template = template;
	}
};

Slide.prototype.load = function(data){
	if (!data.template){
		this.setTemplate('{{#each content}}{{{this}}}{{/each}}');
	} else {
		this.setTemplate(data.template);
	}

	this.id = data.id;
	this.content = data.content;
	this.next= data.next;
	this.prev = data.prev;
};

Slide.prototype.prepend = function(content){
	this.content.unshift(content);
};

Slide.prototype.append = function(content){
	this.content.push(content);
};

Slide.prototype.render = function(view){
	if (view) this._view = view;
	if (this._view){
		this._view.html(this._template(this));
	}
};