//Click event for appearance and removal of file input field and submit button.
d3.select("#load_text")
	.on("click", function(){
		var displayStatus = d3.select("#load_path").style("visibility");
		if(displayStatus === "hidden"){
			d3.select("#load_button_svg")
				.style("height", headerHeight)
				.style("width", headerHeight)
				.call(rollingButton, displayStatus);
				
			d3.select("#load_path")
				.style("visibility", "visible")
				.transition()
				.duration(500)
				.style("width", "450px");
		} else{
			d3.select("#load_button_svg")
				.call(rollingButton);
		
			d3.select("#load_path")
				.transition()
				.duration(500)
				.style("width", "0px")
				.transition()
				.style("visibility", "hidden");
		}
	});

//Click event to open the manual.
d3.select("#help_svg")
	.on("click", function(){
		window.open("manual.html","_blank")
	})
	
//Click event to open the additional information.
d3.select("#info_svg")
	.on("click", function(){
		window.open("information.html", "_blank")
	})

//Submit button appearance and removal with animation.
function rollingButton(selection, flag){
	//Check flag. When hidden, create button. When visible, remove it.
	if(flag === "hidden"){
		var buttonGroup = selection
							.append("g")
							.attr("id", "load_button_g")
							.attr("transform", "translate(" + headerHeight + ",0)");

		buttonGroup
			.append("rect")
			.attr("id", "load_button_r")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", headerHeight)
			.attr("width", headerHeight)
			.attr("fill", "rgb(0,0,0)");
		
		//Object with points for triangle.
		var triangle_data = [{"x": headerHeight - headerHeight/5,
								"y": headerHeight/8},
							{"x": headerHeight/11,
								"y": headerHeight/2},
							{"x": headerHeight - headerHeight/5,
								"y": headerHeight-headerHeight/8}];	
		
		//Assign triangle data.
		var triangles = buttonGroup
						.selectAll("triangle")
						.data([triangle_data]);
		
		//enter triangle data.
		triangles
			.enter()
			.append("polygon")
			.attr("points", function(d){
				return d.map(function(dd){
					return [dd.x, dd.y].join(",");
				}).join(" ");
			})
			.attr("fill", "rgb(255,255,255)")
			.attr("cursor", "pointer")
			.attr("pointer-events", function(){console.log("Data entered")});
		
		//Incoming animation.
		d3.select("#load_button_g")
			.transition()
			.duration(500)
			.attr("transform", "translate(" + headerHeight + "," + headerHeight + ") rotate(180)");
	}else {
		//Outgoing animation and removal.
		d3.select("#load_button_g")
			.transition()
			.duration(500)
			.attr("transform", "translate(" + headerHeight + ",0) rotate(359)")
			.on("end", function(){
				d3.select(this).remove();
			});
			
	}
}