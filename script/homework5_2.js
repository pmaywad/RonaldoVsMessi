var margin = {top: 20, right: 30, bottom: 50, left: 300};
var width = 700 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
var labelArea = 160;
var Liga_svg, CL_svg, tooltip;
var messi_data, ronaldo_data;

var keys = {
	"GPM" : "Goals per Match",
	"Goals" : "Goals",
	"Aps" : "Appearances",
	"Asts" : "Assists",
	"APM" : "Assists per Match"
}

var summary_keys = {
	"GPM" : "Average Goals per Match",
	"Goals" : "Total Goals",
	"Aps" : "Total Appearances",
	"Asts" : "Total Assists",
	"APM" : "Average Assists per Match"
}

var colorMap = {
	'Messi' : '#C80534',
	'Ronaldo' : '#0F076B'
}

document.addEventListener('DOMContentLoaded', function() {

	Liga_svg = d3.select("#Liga_svg")
				.attr("width", width + margin.left + labelArea)
    			.attr("height", height + margin.top + margin.bottom)
  				.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	CL_svg = d3.select('#CL_svg')
					.attr("width",  width)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate( 0," + margin.top +")");

	tooltip = d3.select("body").append("div")   
                .attr('class', 'tooltip')              
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "snow")
    			//.style("border", "solid")
    			//.style("border-width", "2px")
    			.style("border-radius", "5px")
    			.style("padding", "5px");

	Promise.all([d3.csv('data/liga.csv'),
					d3.csv('data/cl.csv'),
					d3.csv('data/messi.csv'),
					d3.csv('data/ronaldo.csv')]).then(function(values){

						Liga_data = values[0];
						//console.log(values[0])
						CL_data = values[1];
						messi_data = values[2];
						ronaldo_data = values[3];

						drawCharts();

	})

})

function drawCharts() {

	Liga_svg.selectAll("*").remove();
	CL_svg.selectAll("*").remove();

	console.log(Liga_data);

	//let league = d3.select('#league-select').property('value');
	let metric = d3.select('#metric-select').property('value');

	const CLKey = 'CL_' + metric;
	const LigaKey = 'Liga_' + metric;

	console.log(LigaKey);

	//Adding x axis
	var LigaMax = 0;
	Liga_data.forEach(row =>{
		//console.log(row[key])
		if (+row[LigaKey] > LigaMax){
			LigaMax = +row[LigaKey];
		}
	})

	var LigaMin = Number.MAX_VALUE;
	Liga_data.forEach(row =>{
		//console.log(row[key])
		if (+row[LigaKey] < LigaMin){
			LigaMin = +row[LigaKey];
		}
	})

	console.log("Liga min is" + LigaMin);
	if( LigaKey != 'Liga_APM'){
	var x = d3.scaleLinear()
				.domain([LigaMin-0.5, LigaMax])
				.range([ 0, width]);
	}
	else{
		var x = d3.scaleLinear()
				.domain([0, LigaMax])
				.range([ 0, width]);
	}

	var xAxis = d3.axisBottom(x);

	Liga_svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);


    //Adding y axis
    var y = d3.scaleBand()
    			.domain(Liga_data.map(function (d) {
    				return d['Season'];
    			}))
    			.range([0, height])
    			.padding(0.2);


    //drawing bars
    Liga_svg.selectAll(".Liga_rect")
    .data(messi_data)					
    .enter()
    .append("rect")
    .attr("class", "Liga_rect")
    .attr("x", function(d) { return x(getmin(d['Season'], LigaKey));})
    .attr("y", function(d) { return y(d['Season']); })
    .attr("width", function(d) { return x(getmax(d['Season'], LigaKey)) - x(getmin(d['Season'], LigaKey));})
    .attr("height", y.bandwidth() )
    .attr("fill", function(d) { return getcolor(d['Season'], LigaKey)})
    .style("opacity", 0.2)
    .on('mouseover', function(d, i) {
    	d3.select(this).style("stroke", "black")
    		.style("stroke-width", "2px")
    		.style("opacity", 0.5);

    	tooltip.transition()
					.duration(200)
					.style('opacity', 1)
					.style('box-shadow', '5px 5px 5px rgba(0,0,0,0.2)')
        			.style("top", (event.pageY)+"px")
        			.style("left",(event.pageX + 10)+"px");

        player = getmaxPlayer(d['Season'], LigaKey);

        tooltip.html(`<div>${d['Season']} | ${player} has more ${keys[metric]}</div>`);
		})
    .on('mousemove', function(d,i){

    				tooltip.style("top", (event.pageY)+"px")
        					.style("left",(event.pageX + 10)+"px");

    })
    .on('mouseout', function(d, i) {
					//CL_svg.selectAll('circle').style('opacity', 1).style("stroke", "None");
					Liga_svg.selectAll('rect').style('stroke', "None").style("opacity", 0.2);
					tooltip.html(``).style('opacity', 0);
	});


    Liga_svg.selectAll(".Mcircle")
    .data(messi_data)
    .enter()
    .append("circle")
    .attr("class", "Mcircle")
    .attr("cx", function(d) { return x(d[LigaKey]);})
    .attr("cy", function(d) { return y(d['Season']) +y.bandwidth()/2; })
    //.attr("width", "5px")
    //.attr("height", y.bandwidth()+1)
    .attr('r', "15px")
    .attr("fill", colorMap['Messi'])
    .style("opacity", 1)
    	.on('mouseover', function(d, i) {

					d3.selectAll('circle').style('opacity', .5);
					d3.select(this).style('opacity', 1).style("stroke", "black").style("stroke-width", "2px");
					d3.selectAll('rect').style('opacity', 0.05)

					tooltip.transition()
					.duration(200)
					.style('opacity', 1)
        			.style("top", (event.pageY)+"px")
        			.style("left",(event.pageX + 10)+"px")
        			.style('box-shadow', '5px 5px 5px rgba(0,0,0,0.2)');

					tooltip.html(`<div>Messi <br/> Season : ${d['Season']} <br/> ${keys[metric]} : ${d[LigaKey]}</div>`);
				})
    .on('mousemove', function(d,i){

    				tooltip.style("top", (event.pageY)+"px")
        					.style("left",(event.pageX + 10)+"px");

    })
    .on('mouseout', function(d, i) {
					d3.selectAll('circle').style('opacity', 1).style("stroke", "None");
					d3.selectAll('rect').style('opacity', 0.2)
					tooltip.html(``).style('opacity', 0);
				});

    Liga_svg.selectAll(".Rcircle")
    .data(ronaldo_data)
    .enter()
    .append("circle")
    .attr("class", "Rcircle")
    .attr("cx", function(d) { console.log("in ronaldo_data"); return x(d[LigaKey]);})
    .attr("cy", function(d) { return y(d['Season']) + y.bandwidth()/2; })
    //.attr("width", "5px")
    //.attr("height", y.bandwidth()+1 )
    .attr('r', "15px")
    .attr("fill", colorMap['Ronaldo'])
    .style("opacity", 1)
	.on('mouseover', function(d, i) {

					d3.selectAll('circle').style('opacity', .5);
					d3.select(this).style('opacity', 1).style("stroke", "black").style("stroke-width", "2px");
					d3.selectAll('rect').style('opacity', 0.05)

					tooltip.transition()
					.duration(200)
					.style('opacity', 1)
					.style('box-shadow', '5px 5px 5px rgba(0,0,0,0.2)')
        			.style("top", (event.pageY)+"px")
        			.style("left",(event.pageX + 10)+"px");

					tooltip.html(`<div>Ronaldo <br/> Season : ${d['Season']} <br/> ${keys[metric]} : ${d[LigaKey]}</div>`);
				})
    .on('mousemove', function(d,i){

    				tooltip.style("top", (event.pageY)+"px")
        					.style("left",(event.pageX + 10)+"px");

    })
    .on('mouseout', function(d, i) {
					d3.selectAll('circle').style('opacity', 1).style("stroke", "None");
					d3.selectAll('rect').style('opacity', 0.2)
					tooltip.html(``).style('opacity', 0);
				});

    //console.log(messi_data);
    //Appending season labels in the middle
    Liga_svg.selectAll("text.name")
        .data(messi_data)
        .enter()
        .append("text")
        .attr("x", (labelArea / 2) + width)
        .attr("y", function(d){ return y(d['Season']) + y.bandwidth()/2; } )
        .attr("dy", ".20em")
        .attr("text-anchor", "middle")
        .attr("class", "name")
        .style("font-weight", "bold")
        .text(function(d){ return d['Season'] ;});



    //ronaldo graph
	var CLMax = 0;
	CL_data.forEach(row =>{
		//console.log(row[key])
		if (+row[CLKey] > CLMax){
			CLMax = +row[CLKey];
		}
	})

	var CLMin = Number.MAX_VALUE;
	CL_data.forEach(row =>{
		//console.log(row[key])
		if (+row[CLKey] < CLMin){
			CLMin = +row[CLKey];
		}
	})

	console.log("CL Min is" + CLMin);

	if(CLKey != 'CL_APM'){
    var rx = d3.scaleLinear()
				.domain([CLMin-0.5, CLMax+0.75])
				.range([ 0, width]);
	}
	else{
	var rx = d3.scaleLinear()
				.domain([-0.2, CLMax+0.75])
				.range([ 0, width]);
	}


	var rxAxis = d3.axisBottom(rx);

	CL_svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(rxAxis);

	const rightOffset = width + labelArea

	CL_svg.selectAll("CLrect")
    .data(messi_data)
    .enter()
    .append("rect")
    .attr("class", "CLrect")
    .attr("x", function(d) { return rx(getmin(d['Season'], CLKey));})
    .attr("y", function(d) { return y(d['Season']); })
    .attr("width", function(d) { return rx(getmax(d['Season'], CLKey)) - rx(getmin(d['Season'], CLKey));})
    .attr("height", y.bandwidth() )
    .attr("fill", function(d) { return getcolor(d['Season'], CLKey)})
    .style("opacity", 0.2)
    .on('mouseover', function(d, i) {
    	d3.select(this).style("stroke", "black")
    		.style("stroke-width", "2px")
    		.style("opacity", 0.5);

    	tooltip.transition()
					.duration(200)
					.style('opacity', 1)
					.style('box-shadow', '5px 5px 5px rgba(0,0,0,0.2)')
        			.style("top", (event.pageY)+"px")
        			.style("left",(event.pageX + 10)+"px");

        player = getmaxPlayer(d['Season'], CLKey);

        tooltip.html(`<div>${d['Season']} | ${player} has more ${keys[metric]}</div>`);
		})
    .on('mousemove', function(d,i){

    				tooltip.style("top", (event.pageY)+"px")
        					.style("left",(event.pageX + 10)+"px");

    })
    .on('mouseout', function(d, i) {
					//CL_svg.selectAll('circle').style('opacity', 1).style("stroke", "None");
					CL_svg.selectAll('rect').style('stroke', "None").style("opacity", 0.2);
					tooltip.html(``).style('opacity', 0);
	});
	

	CL_svg.selectAll(".CL_Mcircle")
    .data(messi_data)
    .enter()
    .append("circle")
    .attr("class", "CL_Mcircle")
    .attr("cx", function(d) { return rx(d[CLKey]);})
    .attr("cy", function(d) { return y(d['Season']) +y.bandwidth()/2; })
    //.attr("width", "5px")
    //.attr("height", y.bandwidth()+1)
    .attr('r', "15px")
    .attr("fill", colorMap['Messi'])
    .style("opacity", 1)
    .on('mouseover', function(d, i) {

					d3.selectAll('circle').style('opacity', .5);
					d3.select(this).style('opacity', 1).style("stroke", "black").style("stroke-width", "2px");
					d3.selectAll('rect').style('opacity', 0.05)

					tooltip.transition()
					.duration(200)
					.style('opacity', 1)
					.style('box-shadow', '5px 5px 5px rgba(0,0,0,0.2)')
        			.style("top", (event.pageY)+"px")
        			.style("left",(event.pageX + 10)+"px");

					tooltip.html(`<div>Messi <br/> Season : ${d['Season']} <br/> ${keys[metric]} : ${d[LigaKey]}</div>`);
				})
    .on('mousemove', function(d,i){

    				tooltip.style("top", (event.pageY)+"px")
        					.style("left",(event.pageX + 10)+"px");

    })
    .on('mouseout', function(d, i) {
					d3.selectAll('circle').style('opacity', 1).style("stroke", "None");
					d3.selectAll('rect').style('opacity', 0.2)
					tooltip.html(``).style('opacity', 0);
	});

    CL_svg.selectAll(".CL_Rcircle")
    .data(ronaldo_data)
    .enter()
    .append("circle")
    .attr("class", "CL_Rcircle")
    .attr("cx", function(d) { return rx(d[CLKey]);})
    .attr("cy", function(d) { return y(d['Season']) + y.bandwidth()/2; })
    //.attr("width", "5px")
    //.attr("height", y.bandwidth()+1 )
    .attr('r', "15px")
    .attr("fill", colorMap['Ronaldo'])
    .style("opacity", 1)
    .on('mouseover', function(d, i) {

					d3.selectAll('circle').style('opacity', .5);
					d3.select(this).style('opacity', 1).style("stroke", "black").style("stroke-width", "2px");
					d3.selectAll('rect').style('opacity', 0.05)

					tooltip.transition()
					.duration(200)
					.style('opacity', 1)
					.style('box-shadow', '5px 5px 5px rgba(0,0,0,0.2)')
        			.style("top", (event.pageY)+"px")
        			.style("left",(event.pageX + 10)+"px");

					tooltip.html(`<div>Ronaldo <br/> Season : ${d['Season']} <br/> ${keys[metric]} : ${d[LigaKey]}</div>`);
				})
    .on('mousemove', function(d,i){

    				tooltip.style("top", (event.pageY)+"px")
        					.style("left",(event.pageX + 10)+"px");

    })
    .on('mouseout', function(d, i) {
					d3.selectAll('circle').style('opacity', 1).style("stroke", "None");
					d3.selectAll('rect').style('opacity', 0.2)
					tooltip.html(``).style('opacity', 0);
				});
				


}

function getmin(season, key) {

	//console.log(season);
	var min_val;
	ronaldo_data.forEach( row =>{
		if(row['Season']==season){
			min_val = +row[key];
		}
	})

	messi_data.forEach( row =>{
		if(row['Season']==season && min_val>+row[key]){
			min_val = +row[key];
		}
	})

	console.log(min_val);
	return min_val;

}

function getmax(season, key){

	//console.log(season);
	var max_val;
	ronaldo_data.forEach( row =>{
		if(row['Season']==season){
			max_val = +row[key];
		}
	})

	messi_data.forEach( row =>{
		if(row['Season']==season && max_val<+row[key]){
			max_val = +row[key];
		}
	})

	console.log("max val is" +max_val);
	return max_val;

}

function getmaxPlayer(season, key){

	//console.log(season);
	var max_val, player;
	ronaldo_data.forEach( row =>{
		if(row['Season']==season){
			max_val = +row[key];
			player = "Ronaldo";
		}
	})

	messi_data.forEach( row =>{
		if(row['Season']==season && max_val<+row[key]){
			max_val = +row[key];
			player = "Messi";
		}
	})

	console.log("max val is" +max_val);
	return player;

}

function getcolor(season, key) {
	var max_val, color;

	ronaldo_data.forEach( row =>{
		if(row['Season']==season){
			max_val = +row[key];
			color = colorMap['Ronaldo'];
		}
	})

	messi_data.forEach( row =>{
		if(row['Season']==season && max_val<+row[key]){
			max_val = +row[key];
			color = colorMap['Messi'];
		}
	})

	return color;
}

 