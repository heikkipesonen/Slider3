var s = new Slider('#wrapper');


var data = {
	templates:[
		{	
			name:'col1',
			html:'<div class="col-1">{{#each content}}{{{this}}}{{/each}}</div>'
		}
	],
	slides:[
		{
			id:1,
			name:'pena',
			content:['<h3 data-link="4">aesf</h3>','asdfasdfasdfsadfasdf','asdfafsdsfad'],
			template:'col1',
			next:false,
			prev:false
		},
		{
			id:2,
			name:'pena',
			content:['<h3>PSURDO</h3>'],
			next:3,
			prev:1
		},
		{
			id:3,
			name:'pena',
			content:['<h3>PSURDO</h3>'],
			next:4,
			prev:2
		},
		{
			id:4,
			name:'pena',
			content:['<h3>PSURDO PENA</h3>'],
			next:1,
			prev:3
		},

	]
}

s.on({
	change:function(slide){
		console.log( this.getSlideView(1) );
		console.log(slide.id)
	}
})

s.load(data);