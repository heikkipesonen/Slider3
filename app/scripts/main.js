var s = new Slider('#wrapper');


var data = {
	slides:[
		{
			id:1,
			name:'pena',
			content:['<h3>PSURDO</h3>'],
			next:2,
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
			content:['<h3>PSURDO</h3>'],
			next:false,
			prev:3
		},

	]
}

s.load(data);