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
    d.date = d.date.slice(-2);
  });

  // Group data by the variable `stationname`. Returns a map from a stationname
  // to the corresponding array of values from the input dataset.
  // var grouped_data = d3.group(data, function(d) {
  //   return d.stationname;
  // });

  var ridershipData = d3.rollup(data, v => d3.sum(v, d => d.ridership), d => d.stationname, d => d.date, d => d.line);

  ridershipData = Array.from(ridershipData, ([station, year]) => ({
    stationname: station,
    ridership_by_year: Array.from(year, ([yearNum, lines]) => ({
      year,
      ridership_by_line: Array.from(lines, ([line, ridership]) => ({
        line: line,
        ridership: ridership
      }))
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
var newData = ridershipData.map((d, index) => ({
    ...stationData[index],
    ridership_by_year: d.ridership_by_year.map((rby) => ({
      ...rby,
      // two additional fields
      totalRidership: sumRidership(rby),
      color: assignColor(rby),
    })).sort((a, b) => parseInt(a.year) - parseInt(b.year))
  })).filter((d) => bostonNeighborhoods.includes(d.neighborhood))

  console.log(newData);

  return newData




};

let geoJSONFile = "https://gist.githubusercontent.com/jdev42092/5c285c4a3608eb9f9864f5da27db4e49/raw/a1c33b1432ca2948f14f656cc14c7c7335f78d95/boston_neighborhoods.json";

const drawMap = async () => {
  const data = processData(await d3.csv(fileName), await d3.csv(stationFile));
  let yearIdx = 0;

  const ditu = await d3.json(geoJSONFile);
  const magicNumber = 200000;
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
          .attr("fill", "#D3DEF2")
          .attr("vector-effect", "non-scaling-stroke")
          .attr("stroke", "#A0BBEC")
          .attr("stroke-width", "1.0");

  const circles = map.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", (d) => d.ridership_by_year[yearIdx].totalRidership / magicNumber)
      .attr("fill", (d) => d.ridership_by_year[yearIdx].color)
      .attr("transform", function(d) {
          return "translate(" + proj([parseFloat(d.Longitude), parseFloat(d.Latitude)]) + ")";
      });

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
          .html(`<p><b>${d.Stationname}</b><br><em><strong>Total ridership: </strong>${d3.format(",")(d.ridership_by_year[yearIdx].totalRidership)}</em><br><strong>Neighborhood: </strong>${d.neighborhood}<br><strong>Lines: </strong>${d.ridership_by_year[yearIdx].ridership_by_line ? d.ridership_by_year[yearIdx].ridership_by_line.map(lineObj => lineObj.line).join(", ") : 'N/A'}</p>`);



      // Optionally, visually highlight the selected circle
      circles.attr("opacity", 0.1);
      d3.select(this)
          .attr("opacity", 1)
          .style("stroke", "black")
          // .style("stroke-width", "0.1%")
          .attr("stroke-width", function(d) {
            return d.radius / 12;  // divide the radius by a scaling factor to adjust stroke width
          })
          // this makes the selected circle "pop out" and stand over the rest of the circles
          .raise();

  }).on("mouseout", function() {

      // Make the tooltip invisible when mouse "leaves" a point
      tooltip.style("visibility", "hidden");

      // Reset the circles' appearance back to original
      circles.attr("opacity", 1);
      d3.select(this)
      .style("stroke", "none");

  });

  const updateData = (index) => {
    const circles = map.selectAll("circle")
      .attr("r", (d) => d.ridership_by_year[index].totalRidership / magicNumber)
      .attr("fill", (d) => d.ridership_by_year[index].color)
      .transition().duration(250);
  }

  function zoomed(e){
    map.attr("transform", e.transform);

    map.selectAll("circle")
    .attr("r", function(d){
        return d.ridership_by_year[yearIdx].totalRidership / (magicNumber * e.transform.k);
    });
  }

  var zoom = d3.zoom()
    .translateExtent([[0,0], [mapwidth, mapheight]])
    .scaleExtent([1, 15])
    .on("zoom", zoomed);

  var scale = 1.5;


  var rScale = d3.scaleSqrt()
  .domain(d3.extent(data, function (d) { 
      // Convert totalRidership values to numbers, handle missing or undefined values
      return +d.totalRidership || 0; 
  }))
  .range([0.1, 20]);
  

  var select = d3.select('#year-select-b');
  select.on('change', function() {
    yearIdx = parseInt(this.value)
    updateData(yearIdx);  
  });

  // Call zoom so it is "listening" for an event on our SVG
  mapsvg.call(zoom);
}

drawMap();

//Choroplethmap

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

  // An object that maps each station to its corresponding neighborhood
  const stationNeighborhoods = {};

  // Loop through newData to create the stationNeighborhoods mapping
  for (const station of newData) {
    stationNeighborhoods[station.Stationname] = station.neighborhood;
  }

  // An object to store the total ridership for each neighborhood
  const neighborhoodRidership = {};

  // Loop through newData to compute the total ridership for each neighborhood
  for (const station of newData) {
    const neighborhood = station.neighborhood;
    const ridershipByYear = station.ridership_by_year;

    if (neighborhood in neighborhoodRidership) {
      // Add the ridership for this station to the total for the neighborhood
      for (let i = 0; i < ridershipByYear.length; i++) {
        neighborhoodRidership[neighborhood][i] += ridershipByYear[i];
      }
    } else {
      // Initialize the total ridership for this neighborhood
      neighborhoodRidership[neighborhood] = [...ridershipByYear];
    }
  }
  console.log(neighborhoodRidership);
});
