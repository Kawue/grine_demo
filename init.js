function initSimulation(){
	//Initialize forceSimulation and add all relevant forces. Partially set their attributes
	var simulation = d3.forceSimulation()
						.force("c_link", d3.forceLink())
						.force("h_link", d3.forceLink())
						.force("d_link", d3.forceLink())
						.force("collide", d3.forceCollide(cNodeRadius))
						.force("center", d3.forceCenter(widthVis/2, heightVis/2))
						.force("charge", d3.forceManyBody().strength(function(d){
							if(d.nodes){
								return d_node_charge;
							}else{
								return c_node_charge;
							}
						}));
						//.force("xForce", d3.forceX(widthVis/2).strength(0.001))
						//.force("yForce", d3.forceY(heightVis/2).strength(0.001));
						
	//simulation.velocityDecay(0.2);
	simulation.alphaDecay(1-Math.pow(0.001,1/500));
	
	//Set charge properties
	simulation
		.force("charge")
		//.distanceMin(50)
		//.distanceMax(150);
	
	//Link forceLink's id selector with the data id for each c_link
	simulation
		.force("c_link")
		.id(function(d){
			return d.id;
		})
		.distance(50);
		//.strength(1/50);
	
	//Link forceLink's id selector with the data id for each h_link
	simulation
		.force("h_link")
		.id(function(d){
			return d.id;
		})
		.strength(1/500)
		.distance(150);
	
	//Link forceLink's id selector with the data id for each d_link
	simulation
		.force("d_link")
		.id(function(d){
			return d.id;
		})
		.distance(50)
		//.strength(1);
	
	return simulation;
}

function fillMzList(){
	var mzList = d3.select("#mzlist")
					.selectAll("option")
					.data(mzValues);
	mzList
		.enter()
		.append("option")
		.merge(mzList)
		.attr("value", function(d){
			return d;
		})
		.text(function(d){
			return d;
		});
}

function initMsiImages(){
	var imageContainer = d3.select("body").append("div").attr("id", "msi_images");
	for(var i=0; i < mzValues.length; i++){
		imageContainer
			.append("img")
			.attr("id", mzValues[i])
			.attr("class", "msi_image")
			.attr("src", msiImagePath + mzValues[i] + ".png")
			.style("display", "none");
	}
	imageContainer
		.append("img")
		.attr("id", "pca_rgb")
		.attr("class", "msi_image")
		.attr("src", msiImagePath + "pca_rgb.png")
		.style("display", "none");
}

function initMsiCanvas(){
	var borderBuffer = 5;
	var c_width = parseInt(d3.select("#image_1").style("width")) - borderBuffer;
	var c_height = parseInt(d3.select("#image_1").style("height")) - borderBuffer;
	var d_width = parseInt(d3.select("#image_2").style("width")) - borderBuffer;
	var d_height = parseInt(d3.select("#image_2").style("height")) - borderBuffer;
	
	var c_canvas = d3.select("#c_canvas")
					.attr("width", c_width)
					.attr("height", c_height);
	
	/*var c_ctx = c_canvas.node().getContext("2d");
	c_ctx.save();
	c_ctx.font = c_width/16 + "px Trebuchet MS, Helvetica, sans-serif";
	c_ctx.fillText("Community Image", c_width/4, c_height/3);
	c_ctx.restore();*/
		
	var d_canvas = d3.select("#d_canvas")
					.attr("width", d_width)
					.attr("height", d_height);

	/*var d_ctx = d_canvas.node().getContext("2d");
	d_ctx.save();
	d_ctx.font = d_width/16 + "px Trebuchet MS, Helvetica, sans-serif";
	d_ctx.fillText("m/z Image", d_width/2.75, d_height/2.5);
	d_ctx.restore();*/
}

function initGraphGroups(){
	//Edges between communities
	svgGraphVis.append("g")
		.attr("class", "edges")
		.attr("id", "c_edges");
	
	//Edges between data points	
	svgGraphVis.append("g")
		.attr("class", "edges")
		.attr("id", "d_edges");
	
	//Edges between communities and data points (hybrids)
	svgGraphVis.append("g")
		.attr("class", "edges")
		.attr("id", "h_edges");
		
	//Community nodes
	svgGraphVis.append("g")
		.attr("class", "nodes")
		.attr("id", "c_nodes");
	
	//Data point nodes
	svgGraphVis.append("g")
		.attr("class", "nodes")
		.attr("id", "d_nodes");
}

function initGraph(){				
	d3.select("#c_edges")
		.selectAll("new_c_edges")
		.data($.extend(true, [], graph.c_edges))
		.enter()
		.append("line")
		.attr("class", "c_edge");
	
	var cNodeList = [];
	var dNodeList = [];
	
	//Divide Communities into two groups, one group with just one child and one with more
	graph.c_nodes.forEach(function(item){
		if(item.nodes.length > 1){
			cNodeList.push($.extend(true, {}, item));
		}else{
			dNodeList.push($.extend(true, {}, item))
		}
	})
	
	//Create Communities with more than one child
	d3.select("#c_nodes")
		.selectAll("new_c_nodes")
		.data(cNodeList)
		.enter()
		.append("circle")
		.attr("class", "c_node")
		.attr("r", cNodeRadius)
		.on("click", function(){
			if(d3.event.ctrlKey || d3.event.metaKey){
				d3.select(this).call(expandCommunity);
			}else{
				d3.select(this).call(listMzValues);
				//d3.select(this).call(showMsiImage)
				d3.select(this).call(changeColorScale, false);
				d3.select(this).call(highlightElement)
			}
		})
		.append("title")
		.text(function(d){
			return "Community " + d.id.slice(1, d.id.length); 
		});
	
	//Create Communities with one child
	d3.select("#c_nodes")
		.selectAll("new_c_nodes")
		.data(dNodeList)
		.enter()
		.append("circle")
		.attr("class", "c_node")
		.attr("r", dNodeRadius)
		.on("click", function(){
			d3.select(this).call(listMzValues);
			d3.select(this).call(changeColorScale, false);
			d3.select(this).call(highlightElement)
		})
		.append("title")
		.text(function(d){
			return "m/z " + d.nodes[0].name + " (Community " + d.id.slice(1, d.id.length) + ")"; 
		});
		
	//Set attributes that apply all Communities, independent of number of childs
	d3.selectAll(".c_node, .d_node")	
		.attr("fill", function(d, i){
			return color(parseInt(d.id.substring(1)));
		})
		.attr("stroke", "rgb(100,100,100)")
		.attr("stroke-width", 4)
		.attr("stroke-opacity", 0)
		.attr("cursor", "pointer")
		.on("mouseover", function(){
			d3.select(this).call(showValueHoverNode);
		})
		.on("mouseout", function(){
			d3.select(this).call(eraseValueHoverNode);
		})
		
		.call(d3.drag()
			.on("start", function(d){
				dragstarted(d, forceSimulation);
			})
			.on("drag", function(d){
				dragged(d);
			})
			.on("end", function(d){
				dragended(d, forceSimulation);
			})
		)
		
		
	
		

	var link = d3.selectAll(".c_edge, .h_edge, .d_edge");				
	var node = d3.selectAll(".c_node, .d_node");	
	
	//Add all nodes (c_node's and d_node's) to the simulation
	forceSimulation
		.nodes(node.data())
		.on("tick", function(){
			ticked(link, node);
		});
	
	//Add all c_edge's to the simulation
	forceSimulation
		.force("c_link")
		.links(d3.selectAll(".c_edge").data());
	
	//Add all h_edge's to the simulation, quantity should be zero at this point.	
	forceSimulation
		.force("h_link")
		.links(d3.selectAll(".h_edge").data());	
	
	//Add all d_edge's to the simulation, quantity should be zero at this point.
	forceSimulation
		.force("d_link")
		.links(d3.selectAll(".d_edge").data());	
}

function initExpandContainer(nC){
	for(var i = 0; i < nC; i++){
		d3.select("#expanded_c")
			.append("div")
			.attr("class", "exp_c_node_div");
	}
	
	var height = d3.select(".exp_c_node_div").style("height");
	var width = d3.select(".exp_c_node_div").style("width");
	
	d3.selectAll(".exp_c_node_div")
		.append("svg")
		.attr("class", "exp_c_node_svg")
		.attr("height", height)
		.attr("width", width)
		.attr("data-filled", false);
}

function initCirclePacking(){
	var intensities = [].concat.apply([], graph.c_nodes.map(function(x){
							return x.nodes.map(function(y){
								return y.mean_intensity;
							});
						}));
	var min_intensity = Math.min.apply(null, intensities);
	var max_intensity = Math.max.apply(null, intensities);
	var new_min = 5;
	var new_max = 50;
	//((x-xmin)/(xmax-xmin))*(newmax-newmin)+newmin
	//((d.mean_intensity-min_intensity)/(max_intensity-min_intensity)) * (new_max-new_min) + new_min
	
	var root = packing(function(d){return d.mean_intensity + circlePackingMinRadius;});
	
	svgCirclePackVis.selectAll("new_circles")
		.data(root.descendants())
		.enter()
		.append("circle")
		.attr("id", function(d){
			return "id_" + d.data.id;
		})
		.attr("class", function(d){
			return !d.children ? "leaf_node" : d.depth ? "capsule_node" : "root"
		})
		.attr("transform", "translate(0,5)")
		.attr("cx", function(d){
			return d.x;
		})
		.attr("cy", function(d){
			return d.y;
		})
		.attr("r", function(d){
			return d.r
		})
		/*.attr("fill-opacity", function(d){
			if(d.depth === 0){
				return 0.6;
			}else if(d.depth === 1){
				return 0.8;
			}else if(d.depth === 2){
				return 1;
			}
		})*/		
		.attr("cursor", "pointer");
		/*.on("click", function(d){
			if(d3.select(this).attr("class") === "root"){
				mzListClear();
				clearCanvas(clearCanvasFlags.BOTH);
			}else if(d3.select(this).attr("class") === "capsule_node"){
				d3.select(this).call(listMzValues);
				//d3.select(this).call(showMsiImage);
				d3.select(this).call(changeColorScale, false);
			}else if(d3.select(this).attr("class") === "leaf_node"){
				//d3.select(this).call(showMsiImage);
				d3.select(this).call(changeColorScale, false);
			}
		});*/
		
		d3.select(".root")
			.attr("fill", "rgba(255,255,255,0)")
			.attr("stroke", "rgb(100,100,100)")
			.attr("stroke-width", 2)
			.attr("stroke-opacity", 0.8)
			.on("click", function(d){
				mzListClear();
				clearCanvas(clearCanvasFlags.BOTH);
			})
			.on("mouseover", function(){
				d3.select(this).call(showValueHoverNode);
				//d3.select(this).attr("stroke-width", 3);
			})
			.on("mouseout", function(){
				d3.select(this).call(eraseValueHoverNode);
				//d3.select(this).attr("stroke-width", 1);
			});
	
		d3.selectAll(".capsule_node")
			.attr("fill", function(d){
				return color(parseInt(d.data.id.substring(1)));
			})
			.on("click", function(d){
				d3.select(this).call(listMzValues);
				d3.select(this).call(changeColorScale, false);
				d3.select(this).call(highlightElement)
			});
			
		d3.selectAll(".leaf_node")
			.attr("fill", "rgba(255,255,255,0.45)")
			.on("click", function(d){
				d3.select(this).call(listMzValues);
				d3.select("#mzlist").property("value", d.data.name);
				d3.select(this).call(changeColorScale, false);
				d3.select(this).call(highlightElement)
			});
			
		d3.selectAll(".capsule_node, .leaf_node")
			.attr("stroke", "rgb(100,100,100)")
			.attr("stroke-width", 3)
			.attr("stroke-opacity", 0)
			.on("mouseover", function(){
				d3.select(this).call(showValueHoverNode);
				//d3.select(this).call(highlightElement);
			})
			.on("mouseout", function(){
				d3.select(this).call(eraseValueHoverNode);
				//deHighlightElements();
			});
}

function initImageCompositions(){
	var finished = $.Deferred();
	meanImageDataObject = {};
	maximumImageDataObject = {};
	var imageBuffer = 15;
	var c_height = parseInt(d3.select("#image_1").style("height")) - borderBuffer;
	var c_width = parseInt(d3.select("#image_1").style("width")) - borderBuffer;
	
	var canvas = d3.select("#c_canvas");	
	var ctx = canvas.node().getContext("2d");
	
	ctx.save()
	ctx.fillStyle = "rgba(0,0,0,1)";
	ctx.save();
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	ctx.save();
	ctx.translate(borderBuffer, borderBuffer);
	
	for(var i=0; i<graph.c_nodes.length; i++){
		var c_imgs = graph.c_nodes[i].nodes.map(function(x){
						return x.name.toString();
					});	

		//Store average composition imageData in object
		var meanImageDataArray = Array((c_width * c_height) * 4).fill(0);
		c_imgs.forEach(function(x){
			ctx.fillRect(0, 0, c_width, c_height);
			ctx.drawImage(document.getElementById(x), 0, 0, c_width - imageBuffer, c_height - imageBuffer);
			var imageData = ctx.getImageData(0,0, c_width, c_height).data;
			for(var j=0; j<meanImageDataArray.length; j+=4){
				meanImageDataArray[j] += imageData[j];
			}
		});
		for(var j=0; j<meanImageDataArray.length; j+=4){
			meanImageDataArray[j] = meanImageDataArray[j]/c_imgs.length;
		}
		var meanImageData = ctx.createImageData(c_width, c_height);
		var data = meanImageData.data;
		for(var j=0; j<data.length; j+= 4){
			data[j] = meanImageDataArray[j];
			data[j+1] = meanImageDataArray[j];
			data[j+2] = meanImageDataArray[j];
			data[j+3] = 255;
		}
		ctx.putImageData(meanImageData, 0, 0);
		ctx.clearRect(-borderBuffer, -borderBuffer, c_width, borderBuffer);
		ctx.clearRect(-borderBuffer, -borderBuffer, borderBuffer, c_height);
		meanImageDataObject[graph.c_nodes[i].id] = ctx.getImageData(0, 0, c_width, c_height);
		
		//Store maximum composition imageData in object
		ctx.fillRect(0, 0, c_width, c_height);
		ctx.save();
		ctx.globalCompositeOperation = "lighten";
		c_imgs.forEach(function(x){
			ctx.drawImage(document.getElementById(x), 0, 0, c_width - imageBuffer, c_height - imageBuffer);
		});
		ctx.restore();
		ctx.clearRect(-borderBuffer, -borderBuffer, c_width, borderBuffer);
		ctx.clearRect(-borderBuffer, -borderBuffer, borderBuffer, c_height);			
		maximumImageDataObject[graph.c_nodes[i].id] = ctx.getImageData(0, 0, c_width, c_height);	
	}
		
	ctx.clearRect(0, 0, c_width, c_height);
	ctx.restore();
	ctx.restore();
	ctx.restore();
	
	//Store imageData for each single image in respective DOM element
	var d_height = parseInt(d3.select("#image_2").style("height")) - borderBuffer;
	var d_width = parseInt(d3.select("#image_2").style("width")) - borderBuffer;
	canvas = d3.select("#d_canvas");	
	ctx = canvas.node().getContext("2d");
	ctx.save()
	ctx.fillStyle = "rgba(0,0,0,1)";
	ctx.save();
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	d3.select("#msi_images")
		.selectAll(".msi_image")
		.each(function(){
			ctx.fillRect(0, 0, d_width, d_height);
			ctx.drawImage(document.getElementById(this.id), 0, 0, d_width - imageBuffer, d_height - imageBuffer);
			ctx.clearRect(0, 0, d_width, borderBuffer);
			ctx.clearRect(0, 0, borderBuffer, d_height);
			d3.select(this).datum(ctx.getImageData(0, 0, d_width, d_height));
		});
	
	ctx.clearRect(0, 0, d_width, d_height);
	ctx.restore();
	ctx.restore();
	
	clearCanvas(clearCanvasFlags.BOTH);
	
	return finished.resolve();
}

function initColorMap(){
	var widthBuffer = 4;
	var width = parseInt(parseInt(d3.select("#colormap_wrapper").style("width")));
	var height = parseInt(parseInt(d3.select("#colormap_wrapper").style("height"))/2);
	var lineWidth = 2;
	var canvas = d3.select("#colormap_canvas")
					.attr("width", width)
					.attr("height", height);
					
	width = width - 2*widthBuffer;
					
	var ctx = canvas.node().getContext("2d");
	
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = "rgb(0,0,0)"
	ctx.strokeRect(widthBuffer+lineWidth/2, lineWidth/2, width-lineWidth, height-lineWidth);
	
	var lingrad = ctx.createLinearGradient(widthBuffer+lineWidth, height-2*lineWidth, width-2*lineWidth, height-2*lineWidth);
	lingrad.addColorStop(0, "rgb(0,0,0)");
	lingrad.addColorStop(1, "rgb(255,255,255)");
	
	ctx.save();
	ctx.fillStyle = lingrad;
	ctx.fillRect(widthBuffer+lineWidth, lineWidth, width-2*lineWidth, height-2*lineWidth);
	ctx.restore();
}



			
		/*	c_ctx.fillRect(0, 0, c_width, c_height);
			if(colorScaleValue === "none"){
				c_unscaledImageData = c_ctx.getImageData(0,0, c_width, c_height);
				c_ctx.putImageData(meanImageData, 0, 0);
			}else{
				var scaledImageData = colorScaler(colorScaleValue, meanImageData);
				c_ctx.putImageData(scaledImageData,0,0)
			}
			c_ctx.restore();
			c_ctx.clearRect(0, 0, c_width, borderBuffer);
			c_ctx.clearRect(0, 0, borderBuffer, c_height);*/





















