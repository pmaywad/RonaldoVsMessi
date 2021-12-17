var margin = {top: 20, right: 30, bottom: 40, left: 300};
var width = 700 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
var labelArea = 160;
var messi_svg, ronaldo_svg, tooltip;

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

document.addEventListener('DOMContentLoaded', function() {

	messi_svg = d3.select("#wrapper")
				.append("svg")
				.attr("width", width + margin.left + labelArea)
    			.attr("height", height + margin.top + margin.bottom)
  				.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	ronaldo_svg = d3.select('#wrapper')
					.append("svg")
					.attr("width",  width - 20)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate( 0," + margin.top +")");

	tooltip = d3.select("body").append("div")   
                .attr('class', 'tooltip')              
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "white")
    			//.style("border", "solid")
    			//.style("border-width", "2px")
    			.style("border-radius", "5px")
    			.style("padding", "5px");

	Promise.all([d3.csv('data/ronaldo.csv'),
					d3.csv('data/messi.csv')]).then(function(values){

						messi_data = values[1];
						//console.log(values[0])
						ronaldo_data = values[0];

						drawCharts();

	})

})

function drawCharts() {

	messi_svg.selectAll("*").remove();
	ronaldo_svg.selectAll("*").remove();

	console.log(ronaldo_data);

	let league = d3.select('#league-select').property('value');
	let metric = d3.select('#metric-select').property('value');

	const key = league + '_' + metric;

	console.log(key)

	//Adding x axis
	var max = 0
	messi_data.forEach(row =>{
		//console.log(row[key])
		if (+row[key] > max){
			max = +row[key];
		}
	})
	//console.log("max is" + max)
	var x = d3.scaleLinear()
				.domain([max, 0])
				.range([ 0, width]);

	/*messi_svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end");*/

    //Adding y axis
    var y = d3.scaleBand()
    			.domain(messi_data.map(function (d) {
    				return d['Season'];
    			}))
    			.range([0, height])
    			.padding(0.2);

    //messi_svg.append("g")
    //.call(d3.axisRight(y))
    //.attr("transform", "translate(" + width + ", 0)"); // fix translation

    //drawing bars
    messi_svg.selectAll("mrect")
    .data(messi_data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d[key]); } )
    .attr("y", function(d) { return y(d['Season']); })
    .attr("width", function(d) { return width - x(d[key]); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#C80534 ")
    .style("opacity", 0.8)
    .on('mouseover', function(d, i) {
					d3.select(this).style('opacity', 1);
					messi_svg.selectAll('rect').filter(function(e, j) {
						return i != j;
					}).style('opacity', .2);
					ronaldo_svg.selectAll('rect').filter(function(e, j) {
						return i != j;
					}).style('opacity', .2);
					tooltip.transition()
					.duration(200)
					.style('opacity', 1)
        			.style("top", (event.pageY)+"px")
        			.style("left",(event.pageX + 10)+"px");

        			messi_svg.selectAll(".label")
        			.style("opacity", 0);

					tooltip.html(`<div>Messi in ${d['Season']} Season had ${d[key]} ${keys[metric]}</div>`);
				})
    .on('mousemove', function(d,i){

    				tooltip.style("top", (event.pageY)+"px")
        					.style("left",(event.pageX + 10)+"px");

    })
    .on('mouseout', function(d, i) {
					messi_svg.selectAll('rect').style('opacity', .8);
					ronaldo_svg.selectAll('rect').style('opacity', .8);
					messi_svg.selectAll("text")
        			.style("opacity", 1);
					tooltip.html(``).style('opacity', 0);
				});

    //console.log(messi_data);
    //Appending season labels in the middle
    messi_svg.selectAll("text.name")
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

    messi_svg.selectAll("text.label")
    		.data(messi_data)
    		.enter()
    		.append("text")
    		.attr("x", function(d) { return x(d[key]) + 20; } )
    		.attr("y", function(d) { return y(d['Season']) + y.bandwidth()/2; })
    		.attr("dy", ".20em")
    		.attr("class", "label")
    		.attr("text-anchor", "middle")
    		.style("fill", "white")
    		.text(function(d){ return d[key]});


    //ronaldo graph
    var rmax = 0
    ronaldo_data.forEach(row =>{
		//console.log(row[key])
		if (+row[key] > rmax){
			
			rmax = +row[key];
		}
	})

    var rx = d3.scaleLinear()
				.domain([0, rmax])
				.range([ 0, width - 20]);

	const rightOffset = width + labelArea
	//drawing bars on te right side of svg
	ronaldo_svg.selectAll("rrect")
    	.data(ronaldo_data)
    	.enter()
    	.append("rect")
    	.attr("x", rx(0) )
    	.attr("y", function(d) { return y(d['Season']); })
    	.attr("width", function(d) { return rx(d[key]); })
    	.attr("height", y.bandwidth() )
    	.attr("fill", "#0F076B")
    	.style("opacity", 0.8)
    	.on('mouseover', function(d, i) {
					d3.select(this).style('opacity', 1);
					ronaldo_svg.selectAll('rect').filter(function(e, j) {
						return i != j;
					}).style('opacity', .2);
					messi_svg.selectAll('rect').filter(function(e, j) {
						return i != j;
					}).style('opacity', .2);

					ronaldo_svg.selectAll(".label")
        			.style("opacity", 0);

					tooltip.transition()
					.duration(200)
					.style('opacity', 1)
        			.style("top", (event.pageY)+"px")
        			.style("left",(event.pageX + 10)+"px");

					tooltip.html(`<div>Ronaldo in ${d['Season']} Season had ${d[key]} ${keys[metric]}</div>`);
				})
    	.on('mousemove', function(d,i){
    		tooltip.style("top", (event.pageY)+"px")
        			.style("left",(event.pageX + 10)+"px");
    	})
    	.on('mouseout', function(d, i) {
					ronaldo_svg.selectAll('rect').style('opacity', .8);
					messi_svg.selectAll('rect').style('opacity', 0.8);
					tooltip.html(``).style("opacity", 0);
					ronaldo_svg.selectAll(".label")
        			.style("opacity", 1);
				});


    //Adding numbers on the bars

    ronaldo_svg.selectAll("text.label")
    		.data(ronaldo_data)
    		.enter()
    		.append("text")
    		.attr("x", function(d) { return  rx(d[key]) - 20; } )
    		.attr("y", function(d) { return y(d['Season']) + y.bandwidth()/2; })
    		.attr("dy", ".20em")
    		.attr("text-anchor", "middle")
    		.style("fill", "white")
    		.attr("class", "label")
    		.text(function(d){ return d[key]});

}