const width = window.innerWidth, height = window.innerHeight;

const svg = d3.select("#viz")
            .attr("width", width)
            .attr("height", height);

const map = svg.select("#map");

d3.select("#ocean")
  .attr("width", width)
  .attr("height", height);

let geoJSONFile = "https://gist.githubusercontent.com/jdev42092/5c285c4a3608eb9f9864f5da27db4e49/raw/a1c33b1432ca2948f14f656cc14c7c7335f78d95/boston_neighborhoods.json";

d3.json(geoJSONFile).then(function(ditu) {

    // var proj = d3.geoMercator().fitSize([width, height], ditu);

    /**
     * Optionally, use this projection instead of the one above. 
     * Its not much different in terms of the resulting map, but it just adds
     * some realism in terms of Boston's actual longitude and latitude
     */

    var proj = d3.geoMercator()
        .fitSize([width, height], ditu)
        // Optionally, add these
        .rotate( [71.057,0] ) // Boston's longitude
        .center( [0, 42.313] ) // Boston's latitude
        // Translate the map to the center of the screen
        .translate( [width/2,height/2] );

    var path = d3.geoPath().projection(proj);

    map.selectAll("path")
        .data(ditu.features)
        .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#FCEDDA")
            .attr("vector-effect", "non-scaling-stroke")
            .attr("stroke", "#FC766AFF")
            .attr("stroke-width", "1px");
    
    var points = [
        {"name": "Boston", "coords": [-71.057, 42.313]}
    ];

    var circleRadius = 10;

    map.selectAll("circle")
        .data(points)
        .enter()
            .append("circle")
            .attr("r", circleRadius)
            .attr("fill", "#201E20")
            .attr("transform", function(d) {
                return "translate(" + proj(d.coords) + ")";
            });

    function zoomed(e) {
        map.attr("transform", e.transform);
    };

    let zoom = d3.zoom()
       
        .translateExtent([[0, 0], [width, height]])

        .scaleExtent([1, 30])
        .on("zoom", zoomed);

    svg.call(zoom);

});