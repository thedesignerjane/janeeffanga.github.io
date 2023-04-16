const container = document.getElementById("map-container");
const mapwidth = container.clientWidth, mapheight = container.clientHeight;

d3.select("#ocean")
  .attr("width", mapwidth)
  .attr("height", mapheight);
  
const mapsvg = d3.select("#viz")
            .attr("width", mapwidth)
            .attr("height", mapheight);

const map = mapsvg.select("#map");

const tooltip = d3.select("#map-container")
    .append("div")
    .attr("class", "bubbletooltip");


var fileName = "./datasets/ridership.csv";
var stationFile = './datasets/station_location.csv';


// Loading the station location data file

function processData(data, stationData) {

  // Cast all values for the variable `ridership` into numbers
  data.forEach( function(d) {
    d.ridership = +d.ridership;
  });

  // Group data by the variable `stationname`. Returns a map from a stationname
  // to the corresponding array of values from the input dataset.
  // var grouped_data = d3.group(data, function(d) {
  //   return d.stationname;
  // });

  var ridershipData = d3.rollup(data, v => d3.sum(v, d => d.ridership), d => d.stationname, d => d.line);

  ridershipData = Array.from(ridershipData, ([station, lines]) => ({
    stationname: station,
    ridership_by_line: Array.from(lines, ([line, ridership]) => ({
      line: line,
      ridership: ridership
    }))
  }));

  // For each station, this function returns the sum of ridership 
  // based on all lines passing through that station.
  function sumRidership(datum) {
    var sum = 0;
    (datum.ridership_by_line).forEach((obj) => {
      sum = sum + obj.ridership;
    });
    return sum;
  }

  /**
   * For each station, this function returns a color value based on
   * the line that passes through that station. If more than one lines
   * pass through that station, the function returns the first of these.
   * There are other ways of handling multiple lines. For example, you
   * could instead assign the color of the station with the highest ridership.
   */
  // function assignColor(datum) {
  //   // Grab the first line that passes through the station
  //   var line = datum.ridership_by_line[0].line;
    
  //   if (line === "Blue Line") {
  //     return "blue";
  //   } else if (line === "Green Line") {
  //     return "green";
  //   } else if (line === "Orange Line") {
  //     return "orange";
  //   } else if (line === "Red Line") {
  //     return "red";
  //   } else if (line === "Silver Line") {
  //     return "silver";
  //   } 

  //   // If none of the above works, return a default color
  //   return "gray";
  // }

  /**
   * This function returns a color value based on the line with the highest
   */

  function assignColor(datum) {
    // Find the line with the highest ridership
    var maxRidership = 0;
    var maxRidershipLine = "";
    for (var i = 0; i < datum.ridership_by_line.length; i++) {
        var line = datum.ridership_by_line[i].line;
        var ridership = datum.ridership_by_line[i].ridership;
        if (ridership > maxRidership) {
            maxRidership = ridership;
            maxRidershipLine = line;
        }
    }

    // Assign color based on line with highest ridership
    if (maxRidershipLine === "Blue Line") {
        return "blue";
    } else if (maxRidershipLine === "Green Line") {
        return "green";
    } else if (maxRidershipLine === "Orange Line") {
        return "orange";
    } else if (maxRidershipLine === "Red Line") {
        return "red";
    } else if (maxRidershipLine === "Silver Line") {
        return "silver";
    }

    // If none of the above works, return a default color
    return "gray";
}

var bostonNeighborhoods = [
    "Allston",
    "Back Bay",
    "Bay Village",
    "Beacon Hill",
    "Brighton",
    "Charlestown",
    "Chinatown",
    "Dorchester",
    "Downtown",
    "East Boston",
    "Fenway-Kenmore",
    "Hyde Park",
    "Jamaica Plain",
    "Mattapan",
    "Mission Hill",
    "North End",
    "Roslindale",
    "Roxbury",
    "South Boston",
    "South End",
    "West End",
    "West Roxbury"
  ];
  /**
   * This function creates a new array of JavaScript objects.
   * It extends the previous one created above called `ridershipData`
   * by adding two additional fields for each station: 
   *              "totalRidership" and "color"
   * For each station, the values for these fields are computed by 
   * separate functions. See above.
   */
  var newData = ridershipData.map(
    (d, index) => {
      return {
        ...d,
        // two additional fields
        totalRidership: sumRidership(d),
        color: assignColor(d),
        ...stationData[index],
      };
    }).filter((d) => bostonNeighborhoods.includes(d.neighborhood));
    
    return newData

  console.log(newData);
};

 

let geoJSONFile = "https://gist.githubusercontent.com/jdev42092/5c285c4a3608eb9f9864f5da27db4e49/raw/a1c33b1432ca2948f14f656cc14c7c7335f78d95/boston_neighborhoods.json";

d3.json(geoJSONFile).then(async function(ditu) {
      const points = processData(await d3.csv(fileName), await d3.csv(stationFile));
    // var proj = d3.geoMercator().fitSize([width, height], ditu);

    /**
     * Optionally, use this projection instead of the one above. 
     * Its not much different in terms of the resulting map, but it just adds
     * some realism in terms of Boston's actual longitude and latitude
     */

    var proj = d3.geoMercator()
        .fitSize([mapwidth, mapheight], ditu)
        // Optionally, add these
        .rotate( [71.057,0] ) // Boston's longitude
        .center( [0, 42.313] ) // Boston's latitude
        // Translate the map to the center of the screen
        .translate( [mapwidth/2,mapheight/2] );

    var path = d3.geoPath().projection(proj);

    map.selectAll("path")
        .data(ditu.features)
        .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#F4EADC")
            .attr("vector-effect", "non-scaling-stroke")
            .attr("stroke", "#ED8B00")
            .attr("stroke-width", "1px");

    const circles = map.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("r", (d) => d.totalRidership / 600000)
        .attr("fill", (d) => d.color)
        .attr("transform", function(d) {
            return "translate(" + proj([parseFloat(d.Longitude), parseFloat(d.Latitude)]) + ")";
        })
        
    circles.on("mouseover", function(e, d) {

        // Update style and position of the tooltip div;
        // what are the `+` symbols doing?

        // You may increase/decrease the relative position 
        // of the tooltip by adding small +- values (e.g., +20, -10). 
        // Note, the tooltip's origin is its top-left point.

        let x = +d3.select(this).attr("cx") + 10;
        let y = +d3.select(this).attr("cy") + 20;

        // Format the display of the numbers,
        // using d3.format()
        // See: https://github.com/d3/d3-format/blob/v3.1.0/README.md#format

        let displayValue = d3.format(",")(d.pop);

        // Make the tooltip visible when mouse "enters" a point
        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            // This is just standard HTML syntax
            .html(`<p><b>${d.stationname}</b><br><em>${d.totalRidership}</em><br>#: ${d.neighborhood}</p>`);

        // Optionally, visually highlight the selected circle
        circles.attr("opacity", 0.1);
        d3.select(this)
            .attr("opacity", 1)
            .style("stroke", "black")
            .style("stroke-width", "1px")
            // this makes the selected circle "pop out" and stand over the rest of the circles
            .raise();

    }).on("mouseout", function() {

        // Make the tooltip invisible when mouse "leaves" a point
        tooltip.style("visibility", "hidden");

        // Reset the circles' appearance back to original
        circles.attr("opacity", 1);
        d3.select(this)
        .style("stroke", "none");

    });;

    function zoomed(e) {
        map.attr("transform", e.transform);
    };

    let zoom = d3.zoom()
       
        .translateExtent([[0, 0], [mapwidth, mapheight]])

        .scaleExtent([1, 30])
        .on("zoom", zoomed);

    mapsvg.call(zoom);

});