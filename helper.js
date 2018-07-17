function ticked(link, node){
	link
		.attr("x1", function(d){
			return d.source.x;
		})
		.attr("y1", function(d){
			return d.source.y;
		})
		.attr("x2", function(d){
			return d.target.x;
		})
		.attr("y2", function(d){
			return d.target.y;
		});
	
	node
		.attr("cx", function(d){
			//return d.x;
			return d.x = Math.max(cNodeRadius, Math.min(widthVis - cNodeRadius, d.x));
		})
		.attr("cy", function(d){
			//return d.y;
			return d.y = Math.max(cNodeRadius, Math.min(heightVis - cNodeRadius, d.y));
		});
}

function dragstarted(d, simulation) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended(d, simulation) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}

function packing(packFunction){
	var pack = d3.pack()
					.size([widthVis - 10, heightMid - 10])
					.padding(5)
					//.radius(function(d){return 2.5 * d.depth});
					
	var rootData = {name: "root", nodes: graph.c_nodes};
	
	var root = d3.hierarchy(rootData, function(d){
						return d.nodes;
					})
					.sum(packFunction)
					.sort(function(a,b){
						return b.mean_intensity - a.mean_intensity;
					});
					
	pack(root);
	
	return root;
}

function colorScaler(newScale, colorArray){
	var value = d3.scaleLinear().domain([0,255]).range([0,1]);
	var scale;
	
	if(newScale === "viridis"){
		scale = d3.scaleSequential(d3.interpolateViridis);
	}
	if(newScale === "inferno"){
		scale = d3.scaleSequential(d3.interpolateInferno);
	}
	if(newScale === "magma"){
		scale = d3.scaleSequential(d3.interpolateMagma);
	}
	if(newScale === "plasma"){
		scale = d3.scaleSequential(d3.interpolatePlasma);
	}
	if(newScale === "warm"){
		scale = d3.scaleSequential(d3.interpolateWarm);
	}
	if(newScale === "cool"){
		scale = d3.scaleSequential(d3.interpolateCool);
	}
	if(newScale === "rainbow"){
		scale = d3.scaleSequential(d3.interpolateRainbow);
	}
	if(newScale === "cubehelix"){
		scale = d3.scaleSequential(d3.interpolateCubehelixDefault);
	}
	
	if(newScale !== "none"){
		for(var i=0; i<colorArray.data.length; i+=4){
			colorArray.data[i] = d3.rgb(scale(value(colorArray.data[i]))).r
			colorArray.data[i+1] = d3.rgb(scale(value(colorArray.data[i+1]))).g
			colorArray.data[i+2] = d3.rgb(scale(value(colorArray.data[i+2]))).b
		}
	}
	
	/*if(newScale === "none" && d3.select("#pca_bg_checkbox").property("checked") === true){
		for(var i=0; i<colorArray.data.length; i+=4){
			if(colorArray.data[i] < threshold){
				colorArray.data[i] = 0
				colorArray.data[i+1] = 0
				colorArray.data[i+2] = 0
				colorArray.data[i+3] = 0
			}else{
				colorArray.data[i] = 255
				colorArray.data[i+1] = 255
				colorArray.data[i+2] = 255
				colorArray.data[i+3] = 255
			}
		}*/
		
		/*for(var i=3; i<colorArray.data.length; i+=4){
			colorArray.data[i] = (colorArray.data[i-1] + colorArray.data[i-2] + colorArray.data[i-3])/3
		}
	}*/
	
	/*if(newScale === "none" && d3.select("#pca_invert_checkbox").property("checked") === true){
		threshold = 255*0.7;
		for(var i=0; i<colorArray.data.length; i+=4){
			if(colorArray.data[i] < threshold){
				colorArray.data[i] = 0
				colorArray.data[i+1] = 0
				colorArray.data[i+2] = 0
				colorArray.data[i+3] = 255
			}else{
				colorArray.data[i] = 255
				colorArray.data[i+1] = 255
				colorArray.data[i+2] = 255
				colorArray.data[i+3] = 0
			}
		}
	}*/
	
	return colorArray;
}


/*
<div class="field" id="simulation_settings">
					<div class="field" id="settings_wrapper_1">
						<p class="textfield" id="iterations_text"> Iterarions </p>
						<select id="iterations_select">
							<option value="250">250</option>
							<option value="500">500</option>
							<option value="750">750</option>
							<option value="1000">1000</option>
						</select>
						<p class="textfield" id="collision_radius_text"> Collision Radius </p>
						<select id="collision_radius_select">
							<option value="x1">x 1</option>
							<option value="x2">x 2</option>
							<option value="x3">x 3</option>
						</select>
					</div>
					<div class="field" id="settings_wrapper_2">
						<p class="textfield" id="charge_c_node_text"> Community Charge </p>
						<select id="charge_c_node_select">
							<option value="x0.5">x 0.5</option>
							<option value="x0.75">x 0.75</option>
							<option value="x1">x 1</option>
							<option value="x2">x 2</option>
							<option value="x3">x 3</option>
						</select>
						<p class="textfield" id="charge_d_node_text"> Node Charge </p>
						<select id="charge_d_node_select">
							<option value="x0.5">x 0.5</option>
							<option value="x0.75">x 0.75</option>
							<option value="x1">x 1</option>
							<option value="x2">x 2</option>
							<option value="x3">x 3</option>
						</select>		
					</div>
				</div>
*/


/*
#simulation_settings{
	flex: 1;
	display: flex;
	flex-direction: column;
}

#settings_wrapper_1, #settings_wrapper_2{
	flex: 0 1 ;
	display: flex;
}

#charge_c_node_text, #charge_d_node_text{
	flex: 0 1 1;
	text-align: center;
	font-family: "Trebuchet MS", Helvetica, sans-serif;
	font-size: 0.8vw;
}

#charge_c_node_select, #charge_d_node_select{
	flex: 1;
	text-align: center;
	font-family: "Trebuchet MS", Helvetica, sans-serif;
	font-size: 0.8vw;
}

#iterations_text, #collision_radius_text, #circlepack_weighting_text{
	flex: 0 1 1;
	text-align: center;
	font-family: "Trebuchet MS", Helvetica, sans-serif;
	font-size: 0.8vw;
}

#iterations_select, #collision_radius_select, #circlepack_weighting_select{
	flex: 1;
	text-align: center;
	font-family: "Trebuchet MS", Helvetica, sans-serif;
	font-size: 0.8vw;
}
*/