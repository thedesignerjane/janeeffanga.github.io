
    const cmapcontainer = document.getElementById("cmap-container");
    const cmapwidth = container.clientWidth, cmapheight = container.clientHeight;

    const cmapsvg = d3.select("#cviz")
                .attr("width", cmapwidth)
                .attr("height", cmapheight);

    const cmap = cmapsvg.select("#cmap");

    d3.select("#cocean")
    .attr("width", cmapwidth)
    .attr("height", cmapheight);

    let geoJSONFile2 = "https://gist.githubusercontent.com/jdev42092/5c285c4a3608eb9f9864f5da27db4e49/raw/a1c33b1432ca2948f14f656cc14c7c7335f78d95/boston_neighborhoods.json";

    d3.json(geoJSONFile2).then(function(ditu) {

        // var proj = d3.geoMercator().fitSize([width, height], ditu);

        /**
         * Optionally, use this projection instead of the one above. 
         * Its not much different in terms of the resulting map, but it just adds
         * some realism in terms of Boston's actual longitude and latitude
         */

        var proj = d3.geoMercator()
            .fitSize([cmapwidth, cmapheight], ditu)
            // Optionally, add these
            .rotate( [71.057,0] ) // Boston's longitude
            .center( [0, 42.313] ) // Boston's latitude
            // Translate the map to the center of the screen
            .translate( [cmapwidth/2,cmapheight/2] );

        var path = d3.geoPath().projection(proj);

        cmap.selectAll("path")
            .data(ditu.features)
            .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#D3DEF2")
                .attr("vector-effect", "non-scaling-stroke")
                .attr("stroke", "#A0BBEC")
                .attr("stroke-width", "1px");
        
        // var points = [
        //     {"name": "Boston", "coords": [-71.057, 42.313]}
        // ];

        // var circleRadius = 10;

        // map.selectAll("circle")
        //     .data(points)
        //     .enter()
        //         .append("circle")
        //         .attr("r", circleRadius)
        //         .attr("fill", "#201E20")
        //         .attr("transform", function(d) {
        //             return "translate(" + proj(d.coords) + ")";
        //         });

        function zoomed(e) {
            cmap.attr("transform", e.transform);
        };

        let zoom = d3.zoom()
        
            .translateExtent([[0, 0], [cmapwidth, cmapheight]])

            .scaleExtent([1, 30])
            .on("zoom", zoomed);

        cmapsvg.call(zoom);

    import("./map.js")
    .then((module) => {
        const newData = module.default;
        console.log(newData);


    
        // function processData() {
        // // An object that maps each station to its corresponding neighborhood
        // const stationNeighborhoods = {};
    
        // // Loop through newData to create the stationNeighborhoods mapping
        // newData.forEach((station) => {
        //     stationNeighborhoods[station.Stationname] = station.neighborhood;
        // });
    
        // // An object to store the total ridership for each neighborhood
        // const neighborhoodRidership = {};
    
        // // Loop through newData to compute the total ridership for each neighborhood
        // newData.forEach((station) => {
        //     const neighborhood = station.neighborhood;
        //     const ridershipByYear = station.ridership_by_year;
    
        //     if (neighborhood in neighborhoodRidership) {
        //     // Add the ridership for this station to the total for the neighborhood
        //     for (let i = 0; i < ridershipByYear.length; i++) {
        //         neighborhoodRidership[neighborhood][i] += ridershipByYear[i];
        //     }
        //     } else {
        //     // Initialize the total ridership for this neighborhood
        //     neighborhoodRidership[neighborhood] = [...ridershipByYear];
        //     }
        // });
        // console.log(neighborhoodRidership);
        // }
            
        // processData();
    
    });
           
    
});
