var borderBuffer = 5;
var imageBuffer = 15;
var c_unscaledImageData;
var d_unscaledImageData;

function listMzValues(selection){
	var data = selection.datum().data ? selection.datum().data : selection.datum();

	if(selection.attr("class") === "c_node" || selection.attr("class") === "exp_c_node" || selection.attr("class") === "capsule_node"){
		var nodesArray = data.nodes;
	}else if(selection.attr("class") === "d_node" || selection.attr("class") === "leaf_node"){
		var nodesArray = graph.c_nodes.filter(function(x){
							return x.id === data.membership;
						})[0].nodes
	}else{
		console.log("something weird in function listMzValues");
	}
	
	var mzList = d3.select("#mzlist")
				.selectAll("option")
				.data(nodesArray.map(
						function(x){ 
							return x.name; 
						}
					)
				);

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
	
	mzList
		.exit()
		.remove();
		
	deHighlightElements();	
}

function clearCanvas(clearFlag){
	var c_height = parseInt(d3.select("#image_1").style("height")) - borderBuffer;
	var c_width = parseInt(d3.select("#image_1").style("width")) - borderBuffer;					
	var c_canvas = d3.select("#c_canvas");		
	var c_ctx = c_canvas.node().getContext("2d");
	var d_width = parseInt(d3.select("#image_2").style("width")) - borderBuffer;
	var d_height = parseInt(d3.select("#image_2").style("height")) - borderBuffer;					
	var d_canvas = d3.select("#d_canvas");
	var d_ctx = d_canvas.node().getContext("2d");
	
	if(clearFlag === "c_canvas" || clearFlag === "both"){
		c_ctx.clearRect(0, 0, c_width, c_height);
		c_ctx.save();
		c_ctx.font = c_width/16 + "px Trebuchet MS, Helvetica, sans-serif";
		c_ctx.fillText("Community Image", c_width/4, c_height/3);
		c_ctx.restore();
		c_canvas.datum(null);
		paintedCommunity = undefined;
	}
	
	if(clearFlag === "d_canvas" || clearFlag === "both"){
		d_ctx.clearRect(0, 0, d_width, d_height);
		d_ctx.save();
		d_ctx.font = d_width/16 + "px Trebuchet MS, Helvetica, sans-serif";
		d_ctx.fillText("m/z Image", d_width/2.75, d_height/2.5);
		d_ctx.restore();
		d_canvas.datum(null);
		paintedValue = undefined;
	}
}

//CURRENTLY OBSOLETE! FUNCTIONALITY IS ADOPTED BY changeColorScale()
function showMsiImage(selection){
	var colorScaleValue = d3.select("#msi_image_colorscale_select").property("value");
	
	if(selection.datum().data){
		//Access data in circlePacking
		var dataValues = selection.datum().data;
	}else{
		//Access data in graph
		var dataValues = selection.datum();
	}
	var d_width = parseInt(d3.select("#image_2").style("width")) - borderBuffer;
	var d_height = parseInt(d3.select("#image_2").style("height")) - borderBuffer;
	/*var d_canvas = d3.select("#d_canvas").node() 
					? d3.select("#d_canvas") 
					: d3.select("#image_2")
						.append("canvas")
						.attr("id", "d_canvas")
						.attr("class", "msi_canvas")
						.attr("width", d_width)
						.attr("height", d_height);*/
						
	var d_canvas = d3.select("#d_canvas");
	var d_ctx = d_canvas.node().getContext("2d");
		
	if(selection.attr("class") === "d_node" || selection.attr("class") === "leaf_node"){
		d3.select("#d_canvas").datum(dataValues.name);
		d_ctx.save();
		d_ctx.mozImageSmoothingEnabled = false;
		d_ctx.webkitImageSmoothingEnabled = false;
		d_ctx.msImageSmoothingEnabled = false;
		d_ctx.imageSmoothingEnabled = false;
		d_ctx.save();
		d_ctx.translate(borderBuffer, borderBuffer);
		
		d_ctx.clearRect(0, 0, d_width, d_height);
		d_ctx.fillRect(0, 0, d_width, d_height);
		d_ctx.drawImage(document.getElementById(dataValues.name.toString()), 0, 0, d_width - imageBuffer, d_height - imageBuffer);
		if(colorScaleValue === "none"){
			d_unscaledImageData = d_ctx.getImageData(0,0, d_width, d_height);
		}else{
			var scaledImageData = colorScaler(colorScaleValue, d_ctx.getImageData(0,0, d_width, d_height));
			d_ctx.putImageData(scaledImageData,0,0)
		}
		d_ctx.restore();
		d_ctx.restore();
		
		var c_imgs = graph
						.c_nodes
						.filter(function(x){
							return x.id === dataValues.membership
						})[0]
						.nodes
						.map(function(x){
							return x.name.toString();
						});
		//Avoid repainting if members of the same community are clicked
		if(paintedCommunity !== dataValues.membership){
			paintedCommunity = dataValues.membership;
			communityImage(dataValues.membership);
		}
	}else{
		d3.select("#d_canvas").datum(null);
		d_ctx.clearRect(0, 0, d_width, d_height);
		d_ctx.save();
		d_ctx.font = d_width/16 + "px Trebuchet MS, Helvetica, sans-serif";
		d_ctx.fillText("m/z Image", d_width/2.75, d_height/2.5);
		d_ctx.restore();
		
		var c_imgs = dataValues
						.nodes
						.map(function(x){
							return x.name.toString();
						});
		
		if(paintedCommunity !== dataValues.id){
			paintedCommunity = dataValues.id;
			communityImage(dataValues.id);
		}
	}
	
	function communityImage(communityId){
		var c_height = parseInt(d3.select("#image_1").style("height")) - borderBuffer;
		var c_width = parseInt(d3.select("#image_1").style("width")) - borderBuffer;
		/*var c_canvas = d3.select("#c_canvas").node() 
						? d3.select("#c_canvas") 
						: d3.select("#image_1")
							.append("canvas")
							.attr("id", "c_canvas")
							.attr("class", "msi_canvas")
							.attr("width", c_width)
							.attr("height", c_height);*/
							
		var c_canvas = d3.select("#c_canvas");	
		var c_ctx = c_canvas.node().getContext("2d");
		d3.select("#c_canvas").datum(communityId);
		
		c_ctx.save()
		c_ctx.fillStyle = "rgba(0,0,0,1)";
		c_ctx.save();
		c_ctx.mozImageSmoothingEnabled = false;
		c_ctx.webkitImageSmoothingEnabled = false;
		c_ctx.msImageSmoothingEnabled = false;
		c_ctx.imageSmoothingEnabled = false;
		c_ctx.save();
		c_ctx.translate(borderBuffer, borderBuffer);
		//d3.select("#msi_image_composition_select").node().value works as well
		//IMPORTANT If performance breaks down, try to avoid upscaling, calculate the everything on the original image scale and scale up just the result!
		if(d3.select("#msi_image_composition_select").property("value") === "average"){
			c_ctx.fillRect(0, 0, c_width, c_height);
			if(colorScaleValue === "none"){
				c_unscaledImageData = c_ctx.getImageData(0,0, c_width, c_height);
				c_ctx.putImageData(meanImageDataObject[communityId], 0, 0);
			}else{
				var imageDataToScale = c_ctx.createImageData(meanImageDataObject[communityId]);
				imageDataToScale.data.set(meanImageDataObject[communityId].data);
				var scaledImageData = colorScaler(colorScaleValue, imageDataToScale);
				c_ctx.putImageData(scaledImageData,0,0)
			}

		}else{
			c_ctx.clearRect(0, 0, c_width, c_height);
			c_ctx.fillRect(0, 0, c_width, c_height);
			c_ctx.save();
			c_ctx.globalCompositeOperation = "lighten";	
			c_imgs.forEach(function(x){
				c_ctx.drawImage(document.getElementById(x), 0, 0, c_width - imageBuffer, c_height - imageBuffer);
			})
			if(colorScaleValue === "none"){
				c_unscaledImageData = c_ctx.getImageData(0,0, c_width, c_height);			
			}else{
				var scaledImageData = colorScaler(colorScaleValue, c_ctx.getImageData(0,0, c_width, c_height));
				c_ctx.putImageData(scaledImageData,0,0)
			}
			c_ctx.restore();
			c_ctx.restore();
			
		}	
		c_ctx.restore();
		c_ctx.restore();
	}
}

function mzListClear(){
	fillMzList(mzValues);
	d3.select("#mzlist").property("value", "");
	deHighlightElements();
}

function showValueHoverNode(selection){
	if(selection.attr("class") === "c_node" || selection.attr("class") === "exp_c_node"){
		if(selection.datum().nodes.length > 1){
			d3.select("#mzvalue_hover").text("Community " + selection.datum().id[1]);
		}else{
			d3.select("#mzvalue_hover")
				.text("m/z " + selection.datum().nodes[0].name + " (Community " + selection.datum().id.slice(1, selection.datum().id.length) + ")");
		}
	}else if(selection.attr("class") === "d_node"){
		d3.select("#mzvalue_hover").text("m/z " + selection.datum().name);
	}else if(selection.attr("class") === "root"){
		d3.select("#mzvalue_hover").text("Root");
	}else if(selection.attr("class") === "capsule_node"){
		d3.select("#mzvalue_hover").text("Community " + selection.datum().data.id[1]);		
	}else if(selection.attr("class") === "leaf_node"){
		d3.select("#mzvalue_hover").text("m/z " + selection.datum().data.name);
	}
}
	
function eraseValueHoverNode(){
	d3.select("#mzvalue_hover")
		.text("");
}

function expandCommunity(selection){
	var flag = false;
	d3.selectAll(".exp_c_node_svg")
		.each(function(){
			if(d3.select(this).attr("data-filled") === "false" && flag === false){
				flag = true;
				d3.select(this).attr("data-filled", "true")
				var cx = parseFloat(d3.select(this).style("width"))/2 + "px";
				var cy = parseFloat(d3.select(this).style("height"))/2 + "px";
				var r =  parseFloat(d3.select(this).style("height"))/2.2 + "px";
				
				d3.select(this)
					.selectAll("new_exp_c_node")
					.data(selection.data())
					.enter()
					.append("circle")
					.attr("class", "exp_c_node")
					.attr("cx", cx)
					.attr("cy", cy)
					.attr("r", r)
					.attr("fill", selection.attr("fill"))
					.attr("cursor", "pointer")
					.on("mouseover", function(){
						d3.select(this).call(showValueHoverNode);
					})
					.on("mouseout", function(){
						d3.select(this).call(eraseValueHoverNode)
					})
					.on("click", function(){
						//////////d3.select(this).call(listMzValues);
						//d3.select(this).call(showMsiImage);
						d3.select(this).call(changeColorScale, false);
						if(d3.event.ctrlKey || d3.event.metaKey){
							d3.select(this.parentNode).attr("data-filled", "false");
							d3.select(this).call(collapseCommunity);
						}
					})
					.append("title")
					.text(function(d){
						return "Community " + d.id;
					});				
			}
		})
		
	selection.remove();
	
	d3.selectAll(".c_edge, .h_edge")//Problem?
		.each(function(d){
			if(d.source.id === selection.datum().id
			|| d.target.id === selection.datum().id){
				d3.select(this).remove();
			}
			});

	var nodeIds = selection.datum().nodes.map(function(x){
						return x.id;
					});
					
	nodeIds.push.apply(nodeIds, d3.selectAll(".d_node").data().map(//Problem?
		function(x){
			return x.id;
		}
	));
					
	//Return edges that connect just nodes of the selected community	
	var dLinkData = [];
	var hLinkData = [];
	
	graph.edges.map(function(x,i){
		if(nodeIds.indexOf(graph.edges[i].source) !== -1){
			if(nodeIds.indexOf(graph.edges[i].target) !== -1){
				dLinkData.push($.extend(true, {}, x));
			}else{
//To make this easier in every edge source_membership and target_membership have to be defined!
				var community = graph.c_nodes.filter(function(y){
									if(y.nodes.map(function(z){
											return z.id;
										}).indexOf(graph.edges[i].target) !== -1){
											return y;
										}
								})
				xModified = $.extend(true, {}, x);
				xModified.target = community[0].id;
				hLinkData.push(xModified);
			}
		}else if(nodeIds.indexOf(graph.edges[i].target) !== -1){
//To make this easier in every edge source_membership and target_membership have to be defined!
			var community = graph.c_nodes.filter(function(y){
								if(y.nodes.map(function(z){
										return z.id;
									}).indexOf(graph.edges[i].source) !== -1){
										return y;
								}
							});
			xModified = $.extend(true, {}, x);
			xModified.source = community[0].id;
			hLinkData.push(xModified);
		}
	});
	
//Think about why not just new nodes
	d3.select("#h_edges")
		.selectAll(".h_edge")
		.data(hLinkData)
		.enter()
		.append("line")
		.attr("class", "h_edge")
		.attr("stroke-width", 1);
	
	d3.select("#d_edges")
		.selectAll(".d_edge")
		.data(dLinkData)
		.enter()
		.append("line")
		.attr("class", "d_edge")
		.attr("stroke-width", function(d){
			return d.weight*(2-1)+1 //((x-xmin)/(xmax-xmin))*(newmax-newmin)+newmin
		});	
			
	d3.select("#d_nodes")
		.selectAll("new_d_node")	
		.data(selection.datum().nodes)
		.enter()
		.append("circle")
		.attr("class", "d_node")
		.attr("r", dNodeRadius)
		.attr("fill", selection.attr("fill"))
		.attr("stroke", "rgb(100,100,100)")
		.attr("stroke-width", 3)
		.attr("stroke-opacity", 0)
		.attr("cursor", "pointer")
		.each(function(){
			d3.select(this).call(transferHighlighting);
		})
		.on("mouseover", function(){
			d3.select(this).call(showValueHoverNode);
		})
		.on("mouseout", function(){
			d3.select(this).call(eraseValueHoverNode)
		})
		.on("click", function(d){
			//d3.select(this).call(showMsiImage);
			d3.select(this).call(listMzValues);
			d3.select("#mzlist").property("value", d.name);
			d3.select(this).call(changeColorScale, false);
			d3.select(this).call(highlightElement)
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
		.append("title")
		.text(function(d){
			return "m/z " + d.name;
		});
		
	
	
	var link = d3.selectAll(".c_edge, .h_edge, .d_edge")				
	var node = d3.selectAll(".c_node, .d_node");
	
	//Alpha reset to "reheat" the simulation. Otherwise alpha will decrease too much and the simulation will stop.
	forceSimulation.alpha(1).restart();
	
	//Add all nodes (c_node's and d_node's) to the simulation
	forceSimulation
		.nodes(node.data())
		.on("tick", function(){
			ticked(link, node)
		});
	
	//Add all c_edge's to the simulation
	forceSimulation
		.force("c_link")
		.links(d3.selectAll(".c_edge").data());
	
	//Add all h_edge's to the simulation
	forceSimulation
		.force("h_link")
		.links(d3.selectAll(".h_edge").data());	
	
	//Add all d_edge's to the simulation and set their strength equal to 10 times their weight.
	forceSimulation
		.force("d_link")
		.links(d3.selectAll(".d_edge").data())
		.strength(function(d){
			var weight = graph.edges.filter(function(x){
				return x.source === d.source.id && x.target === d.target.id;
			})[0].weight;
			return weight;
		});
}

function collapseCommunity(selection){						
	var cNode = graph.c_nodes.filter(function(x){
					if(x.id === selection.datum().id){
						return $.extend(true, {}, x);
					}
				});
	
	var ids = cNode[0].nodes.map(function(x){
				return x.id;
			});
			
	var cEdges = [];
	var hEdges = [];
	var communities = [];
	var communityNodes = selection.datum().nodes.map(function(x){
		return x.id;
	})
	
	d3.selectAll(".c_node")
		.each(function(x){
			communities.push(x.id);
		});
	
	graph.c_edges.map(function(x){
		if(x.source === selection.datum().id){
			var sourceCommunityIds = graph.c_nodes.filter(
									function(c_nodeSource){
										return c_nodeSource.id === x.source;
									})[0].nodes.map(function(d_nodeSource){
										return d_nodeSource.id;
									});

			if(communities.indexOf(x.target) !== -1){
				cEdges.push($.extend(true, {}, x));
			}else{
				graph.c_nodes.filter(function(y){
					return y.id === x.target;
				}).map(function(z){
					z.nodes.map(function(d_nodeTarget){
						graph.edges.map(function(edge){
							if(edge.target === d_nodeTarget.id && sourceCommunityIds.indexOf(edge.source) !== -1
							|| edge.source === d_nodeTarget.id && sourceCommunityIds.indexOf(edge.target) !== -1){
								var hEdge = {};
								hEdge.source = x.source;
								hEdge.target = d_nodeTarget.id;
								hEdges.push(hEdge);	
							}
						});
					});
				});
			}
		}
		if(x.target === selection.datum().id){
			var targetCommunityIds = graph.c_nodes.filter(
									function(c_nodeTarget){
										return c_nodeTarget.id === x.target;
									})[0].nodes.map(function(d_nodeTarget){
										return d_nodeTarget.id;
									});
			
			if(communities.indexOf(x.source) !== -1){
				cEdges.push($.extend(true, {}, x));
			}else{
				graph.c_nodes.filter(function(y){
					return y.id === x.source;
				}).map(function(z){
					z.nodes.map(function(d_nodeSource){
						graph.edges.map(function(edge){
							if(edge.source === d_nodeSource.id && targetCommunityIds.indexOf(edge.target) !== -1
							|| edge.target === d_nodeSource.id && targetCommunityIds.indexOf(edge.source) !== -1){
								var hEdge = {};
								hEdge.target = x.target;
								hEdge.source = d_nodeSource.id;
								hEdges.push(hEdge);		
							}
						});
					});	
				});
			}
		}
	});
	
	d3.selectAll(".h_edge, .d_edge")
		.each(function(d){
			if(ids.indexOf(d.source.id) !== -1
			|| ids.indexOf(d.target.id) !== -1){
				d3.select(this).remove();
			}
		});
	
	d3.selectAll(".d_node")
		.each(function(d){
			if(ids.indexOf(d.id) !== -1){
				d3.select(this).remove()
			}
		});
		
	d3.select("#c_edges")
		.selectAll("new_c_edges")
		//.selectAll(".c_edge")
		.data(cEdges)
		.enter()
		.append("line")
		.attr("class", "c_edge");
				
	d3.select("#h_edges")
		.selectAll("new_h_edges")
		//.selectAll(".h_edges")
		.data(hEdges)
		.enter()
		.append("line")
		.attr("class", "h_edge");
	
	d3.select("#c_nodes")
		.selectAll("new_c_node")
		.data(cNode)
		.enter()
		.append("circle")
		.attr("class", "c_node")
		.attr("r", cNodeRadius)
		.attr("fill", selection.attr("fill"))
		.attr("stroke", "rgb(100,100,100)")
		.attr("stroke-width", 4)
		.attr("stroke-opacity", 0)
		.attr("cursor", "pointer")
		.each(function(){
			d3.select(this).call(transferHighlighting);
		})
		.on("mouseover", function(){
			d3.select(this).call(showValueHoverNode);
		})
		.on("mouseout", function(){
			d3.select(this).call(eraseValueHoverNode);
		})
		.on("click", function(){
			if(d3.event.ctrlKey || d3.event.metaKey){
				d3.select(this).call(expandCommunity);
			}else{
				d3.select(this).call(listMzValues);
				//d3.select(this).call(showMsiImage);
				d3.select(this).call(changeColorScale, true);
				d3.select(this).call(highlightElement);
			}
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
		.append("title")
		.text(function(d){
			return "Community " + d.id;
		});
	
	selection.remove();
	
	var link = d3.selectAll(".c_edge, .h_edge, .d_edge")				
	var node = d3.selectAll(".c_node, .d_node");	
	
	//Alpha reset to "reheat" the simulation. Otherwise alpha will decrease too much and the simulation will stop.
	forceSimulation.alpha(1).restart();
	
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
	
	//Add all h_edge's to the simulation
	forceSimulation
		.force("h_link")
		.links(d3.selectAll(".h_edge").data());
	
	//Add all d_edge's to the simulation
	forceSimulation
		.force("d_link")
		.links(d3.selectAll(".d_edge").data());
}

function repackCirclePacking(packFlag){
	var root;
	if(packFlag === "intensity"){
		root = packing(function(d){return d.mean_intensity + circlePackingMinRadius});
	}else if(packFlag === "degree"){
		root = packing(function(d){return d.degree + circlePackingMinRadius});
	}
	
	svgCirclePackVis
		.selectAll("circle")
		.data(root.descendants())
		.transition()
		.duration(3000)
		.attr("cx", function(d){
			return d.x;
		})
		.attr("cy", function(d){
			return d.y;
		})
		.attr("r", function(d){
			return d.r;
		})
	
}

function changeVis(visType){
	if(visType !== activeVis){
		activeVis = visType;
		if(visType === "graph"){
			d3.select("#graphSvg").attr("display", "auto");
			d3.select("#expanded_c_title").attr("style", "display: auto");
			d3.select("#expanded_c").attr("style", "display: auto");
			d3.select("#circlepackSvg").attr("display", "none");
			d3.select("#simulation_settings").attr("style", "display: flex");
			d3.select("#circlepack_weighting").attr("style", "display: none");
		}else if(visType === "circlepacking"){
			d3.select("#graphSvg").attr("display", "none");
			d3.select("#expanded_c_title").style("display", "none");
			d3.select("#expanded_c").style("display", "none");
			d3.select("#circlepackSvg").attr("display", "auto");
			d3.select("#simulation_settings").attr("style", "display: none");
			d3.select("#circlepack_weighting").attr("style", "display: flex");
		}
	}
}

function changeSimulationIteration(iterations){
	forceSimulation.alpha(1).alphaDecay(1-Math.pow(0.001,1/iterations)).restart();
}

function changeSimulationCharge(modifier){
	forceSimulation
		.force("charge")
		.strength(function(d){
			if(d.nodes){
				return d_node_charge * modifier;
			}else{
				return c_node_charge * modifier;
			}
		});
	
	forceSimulation.alpha(1).restart();
}

function changeColorScale(selection, colorChangeFlag){
	var c_canvasData;
	var d_canvasData;
	
	var imageDataObject;
	var selectionData;
	var communityId;
	
	var pcaImgFlag = d3.select("#pca_bg_checkbox").property("checked");
	
	var c_canvas = d3.select("#c_canvas");
	var c_ctx = c_canvas.node().getContext("2d");
	
	var d_canvas = d3.select("#d_canvas");
	var d_ctx = d_canvas.node().getContext("2d");

	var c_height = parseInt(d3.select("#image_1").style("height")) - borderBuffer;
	var c_width = parseInt(d3.select("#image_1").style("width")) - borderBuffer;
	
	var d_width = parseInt(d3.select("#image_2").style("width")) - borderBuffer;
	var d_height = parseInt(d3.select("#image_2").style("height")) - borderBuffer;
	
	if(d3.select("#msi_image_composition_select").property("value") === "maximum"){
		imageDataObject = maximumImageDataObject;
	}else if(d3.select("#msi_image_composition_select").property("value") === "average"){
		imageDataObject = meanImageDataObject;
	}
	
	if(selection){
		if(selection.datum().data){
			//Access data in circlePacking
			var selectionData = selection.datum().data;
		}else{
			//Access data in graph
			var selectionData = selection.datum();
		}
		
		if(selectionData.nodes){
			c_canvasData = selectionData.id;
			d_canvasData = selectionData.name;
		}else{
			c_canvasData = selectionData.membership;
			d_canvasData = selectionData.name;
		}
		d3.select("#c_canvas").datum(c_canvasData);
		d3.select("#d_canvas").datum(d_canvasData);
	}else{
		c_canvasData = c_canvas.datum();
		d_canvasData = d_canvas.datum();
	}	
	
	if(c_canvasData !== undefined){
		if(pcaImgFlag === false){
			if(paintedCommunity !== c_canvasData || colorChangeFlag === true){
				paintedCommunity = c_canvasData;
				var imageData = c_ctx.createImageData(imageDataObject[c_canvasData]);
				imageData.data.set(imageDataObject[c_canvasData].data);
				var c_scaledImageData = colorScaler(d3.select("#msi_image_colorscale_select").property("value"), imageData);
				var offscreenCanvas = document.createElement("canvas");
				offscreenCanvas.width = c_width;
				offscreenCanvas.height = c_height;
				var osc_ctx = offscreenCanvas.getContext("2d");
				osc_ctx.putImageData(c_scaledImageData, 0, 0);
				c_ctx.clearRect(0, 0, c_width, c_height);
				c_ctx.drawImage(offscreenCanvas, 0, 0);
			}
		}else if(pcaImgFlag === true){
			paintedCommunity = c_canvasData;
			// contains activate_pca_bg()
			threshold_pca();
		}
	}else{
		clearCanvas(clearCanvasFlags.C_CANVAS);
	}	
	
	if(d_canvasData !== undefined){
		if(pcaImgFlag === false){
			paintedValue = d_canvasData;
			var imageData = d_ctx.createImageData(document.getElementById(d_canvasData).__data__);
			imageData.data.set(document.getElementById(d_canvasData).__data__.data);
			var d_scaledImageData = colorScaler(d3.select("#msi_image_colorscale_select").property("value"), imageData);
			d_ctx.clearRect(0, 0, d_width, d_height);
			d_ctx.putImageData(d_scaledImageData, 0, 0);
		}else if(pcaImgFlag === true){
			paintedValue = d_canvasData;
			// contains activate_pca_bg()
			threshold_pca();
		}
	}else{
		clearCanvas(clearCanvasFlags.D_CANVAS);
	}
}

function changeColorMap(){
	var canvas = d3.select("#colormap_canvas");
	var ctx = canvas.node().getContext("2d");
	var widthBuffer = 4;
	var width = canvas.attr("width") - 2*widthBuffer;;
	var height = canvas.attr("height");
	var lineWidth = 2;
	
	ctx.clearRect(widthBuffer+lineWidth, lineWidth, width-2*lineWidth, height-2*lineWidth);
	
	var lingrad = ctx.createLinearGradient(widthBuffer+lineWidth, height-2*lineWidth, width-2*lineWidth, height-2*lineWidth);
	lingrad.addColorStop(0, "rgb(0,0,0)");
	lingrad.addColorStop(1, "rgb(255,255,255)");
	
	ctx.save();
	ctx.fillStyle = lingrad;
	ctx.fillRect(widthBuffer+lineWidth, lineWidth, width-2*lineWidth, height-2*lineWidth);
	ctx.restore();
	
	var imageData = ctx.getImageData(widthBuffer+lineWidth, lineWidth, width-2*lineWidth, height-2*lineWidth);
	var scaledImageData = colorScaler(d3.select("#msi_image_colorscale_select").property("value"), imageData);
	ctx.putImageData(scaledImageData,widthBuffer+lineWidth,lineWidth);
}

function highlightElement(selection){
	// Selector element has a value, nodes do not
	var value = selection.node().value;
	var membership;
	var isCommunityNode = false;
	var selection_class = selection.attr("class");
	
	if(value){ // Selector was called, value has a value
		d3.selectAll(".leaf_node")
			.each(function(d){
				if(d.data.name === value){
					d3.select(this)
						.attr("stroke-opacity", 0.8);
					membership = d.data.membership;
				}else{
					d3.select(this)
						.attr("stroke-opacity", 0);
				}
			});	
	}else{ // Vertex was called, value is undefined	
		//d3.selectAll(".leaf_node").attr("stroke-opacity", 0);
		if(selection_class === "c_node" || selection_class === "d_node"){
			selection.attr("stroke-opacity", 0.8);
			d3.selectAll(".capsule_node, .leaf_node")
				.each(function(d){
					if(d.data.id === selection.datum().id){
							d3.select(this).attr("stroke-opacity", 0.8);			}
					
				})
		}else if(selection_class === "capsule_node"){
			selection.attr("stroke-opacity", 0.8);
			d3.selectAll(".c_node")
				.each(function(d){
					if(d.id === selection.datum().data.id){
							d3.select(this).attr("stroke-opacity", 0.8);
					}
				})
		}else if(selection_class === "leaf_node"){
			selection.attr("stroke-opacity", 0.8);
			var isExpanded = false;
			d3.selectAll(".d_node")
				.each(function(d){
					if(d.id === selection.datum().data.id){
							isExpanded = true;
							d3.select(this).attr("stroke-opacity", 0.8);
					}
				})
			if(isExpanded === false){
					membership = selection.datum().data.membership;
			}
		}
	}
	
	if(membership){
		d3.selectAll(".c_node")
			.each(function(d){
				if(d.id === membership){
					d3.select(this).attr("stroke-opacity", 0.8);
					d3.selectAll(".d_node").attr("stroke-opacity", 0);
					isCommunityNode = true;
				}else{
					d3.select(this).attr("stroke-opacity", 0);
				}
			});
		
		if(!isCommunityNode){
			d3.selectAll(".d_node")
				.each(function(d){
					if(d.name === value){
						d3.select(this).attr("stroke-opacity", 0.8);
					}else{
						d3.select(this).attr("stroke-opacity", 0);
					}
				});
		}
	}
}

function deHighlightElements(){
	// Selector element has a value, nodes do not
	//var value = selection.node().value;

	/*if(value){ // Selector was called, value has a value
		d3.selectAll(".leaf_node")
			.each(function(d){
				if(d.data.name === value){
					d3.select(this)
						.attr("stroke-opacity", 0);
				}
			});
	}else{ // Vertex was called, value is undefined
		selection.attr("stroke-opacity", 0);
	}*/
	
	d3.selectAll(".capsule_node, .leaf_node, .c_node, .d_node").attr("stroke-opacity", 0);
}

function transferHighlighting(selection){
	var value = d3.select("#mzlist").node().value;
	
	if(selection.attr("class") === "c_node"){
		if(selection.datum().nodes.map(function(x){return x.name}).indexOf(value) !== -1){
			selection.attr("stroke-opacity", 0.8);
		}
	}else if(selection.attr("class") === "d_node"){
		if(selection.datum().name === value){
			selection.attr("stroke-opacity", 0.8);
		}
	}	
}


function activate_pca_bg(){
	var c_canvas = d3.select("#c_canvas");
	var c_ctx = c_canvas.node().getContext("2d");
	var c_width = d3.select("#image_1").node().getBoundingClientRect().width - borderBuffer;
	var c_height = d3.select("#image_1").node().getBoundingClientRect().height -borderBuffer;
	
	if(paintedValue !== undefined){
		var d_canvas = d3.selectAll("#d_canvas");
		var d_ctx = d_canvas.node().getContext("2d");
	}
	
	c_ctx.save();
	c_ctx.mozImageSmoothingEnabled = false;
	c_ctx.webkitImageSmoothingEnabled = false;
	c_ctx.msImageSmoothingEnabled = false;
	c_ctx.imageSmoothingEnabled = false;
	c_ctx.save()
	c_ctx.fillStyle = "rgba(0,0,0,1)";
	c_ctx.save();
	c_ctx.translate(borderBuffer, borderBuffer);
	c_ctx.fillRect(0,0,c_width,c_height);
	c_ctx.drawImage(document.getElementById("pca_rgb"),0,0,c_width-imageBuffer,c_height-imageBuffer);
	
	if(paintedValue !== undefined){
		d_ctx.drawImage(c_canvas.node(),0,0);
	}
	
	c_ctx.restore();
	c_ctx.restore();
	c_ctx.restore();
}


function threshold_pca(){
	var c_canvas = d3.select("#c_canvas");
	var c_ctx = c_canvas.node().getContext("2d");
	
	var d_canvas = d3.select("#d_canvas");
	var d_ctx = d_canvas.node().getContext("2d");

	var c_width = parseInt(d3.select("#image_1").style("width")) - borderBuffer;
	var c_height = parseInt(d3.select("#image_1").style("height")) - borderBuffer;
	
	var d_width	= parseInt(d3.select("#image_2").style("width") - borderBuffer);
	var d_height = parseInt(d3.select("#image_2").style("height") - borderBuffer);
	
	var canvasRow = c_width*4;
	var upperBorderBuffer = canvasRow*borderBuffer;
	var leftBorderBuffer = borderBuffer*4;
	
	var offscreenCanvas = document.createElement("canvas");
	offscreenCanvas.width = c_width;
	offscreenCanvas.height = c_height;
	var osc_ctx = offscreenCanvas.getContext("2d");
	
	var imageDataObject;
	
	// Create image data for community image if one is chosen
	if(paintedCommunity !== undefined){
		if(d3.select("#msi_image_composition_select").property("value") === "maximum"){
			imageDataObject = maximumImageDataObject;
		}else if(d3.select("#msi_image_composition_select").property("value") === "average"){
			imageDataObject = meanImageDataObject;
		}
		
		var c_imageData = osc_ctx.createImageData(imageDataObject[paintedCommunity]);
		c_imageData.data.set(imageDataObject[paintedCommunity].data);
		//osc_ctx.putImageData(imageData,0,0);
		//var imageData = c_ctx.getImageData(0, 0, c_width, c_height);
		var c_data = c_imageData.data;
	}
	
	// Create image data for m/z-value image if one is chosen
	if(paintedValue !== undefined){
		var d_imageData = osc_ctx.createImageData(document.getElementById(paintedValue).__data__);
		d_imageData.data.set(document.getElementById(paintedValue).__data__.data);
		var d_data = d_imageData.data;
	}
		
	var dynamicThreshold = d3.select("#pca_dynamic_scale_checkbox").property("checked");
	
	if(paintedCommunity !== undefined){
		if(dynamicThreshold === true){
			for(var i=3; i<c_data.length; i+=4){
				if(i > upperBorderBuffer){
					if(i%canvasRow > leftBorderBuffer){
						if(paintedCommunity !== undefined){
							c_data[i] = c_data[i-1] > 10 ? 255 - c_data[i-1] : 245;
						}
						
						if(paintedValue !== undefined){
							d_data[i] = d_data[i-1] > 10 ? 255 - d_data[i-1] : 245;
						}
					}
				}
			}
		}else if(dynamicThreshold === false){
			var threshold = 255*parseFloat(d3.select("#pca_threshold_scale").property("value"));
			for(var i=3; i<c_data.length; i+=4){
				if(i > upperBorderBuffer){
					if(i%canvasRow > leftBorderBuffer){
						if(paintedCommunity !== undefined){
							//if(c_data[i] !== 0 && c_data[i-1] !== 0 && c_data[i-2] !== 0 && c_data[i-3] !== 0){						
							if(c_data[i-1] < threshold){
								c_data[i-3] = 30;
								c_data[i-2] = 30;
								c_data[i-1] = 30;
								c_data[i] = 240;
							}else{
								c_data[i] = 0;
							}
						}
						
						if(paintedValue !== undefined){
							if(d_data[i-1] < threshold){
								d_data[i-3] = 30;
								d_data[i-2] = 30;
								d_data[i-1] = 30;
								d_data[i] = 240;
							}else{
								d_data[i] = 0;
							}
						}
					}
				}
			}
		}
	}
	
	if(paintedCommunity !== undefined){
		c_ctx.clearRect(0,0,c_width, c_height);
	}
	
	if(paintedValue !== undefined){
		d_ctx.clearRect(0,0, d_width, d_height);
	}
	
	activate_pca_bg();

	if(paintedCommunity !== undefined){
		osc_ctx.putImageData(c_imageData, 0, 0);
		c_ctx.drawImage(offscreenCanvas, 0, 0);
	}
	
	if(paintedValue !== undefined){
		osc_ctx.putImageData(d_imageData, 0, 0);
		d_ctx.drawImage(offscreenCanvas, 0, 0);
	}
}

function changePcaThresholdText(selection){
	d3.select("#pca_threshold_chosen")
		.text(selection.property("value"));
}


	/*svgCirclePackVis
		.selectAll("circle")
		.data(root.descendants())
		.transition()
		.duration(3000)
		.attr("cx", function(d){
			return d.x;
		})
		.attr("cy", function(d){
			return d.y;
		})
		.attr("r", function(d){
			return d.r;
		})*/