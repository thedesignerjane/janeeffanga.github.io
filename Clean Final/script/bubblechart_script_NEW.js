var fileName = "./datasets/ridership.csv";
var stationFile = './datasets/station_location.csv';

//function draw (year) {

  Promise.all([ d3.csv(fileName), d3.csv(stationFile) ]).then(function(result) {
    // Once the dataset is loaded, call a function that processes the dataset
    processData(result[0], result[1]);
  });

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
      });

    console.log(newData);

  };
//}
document.getElementById("year-select").addEventListener("change", function() {
  // Get the selected year value
  var selectedYear = this.value;
});

function updateBubbleChart(year) {
  // Filter the newData array based on the selected year
  var filteredData = newData.filter(function(d) {
    return d.year === year;
  });
}

// mapping station coordinates to their corresponding location on the map

// Assuming you have already created the map and stored it in a variable called 'map'

// After fetching and processing the ridership data and station location data from the CSV file

// Create a canvas element to render the bubble chart
// var canvas = document.createElement('canvas');
// document.body.appendChild(canvas);

// Create an array to store the data for the bubble chart
// var bubbleChartData = {
//   datasets: [{
//     label: 'Station Ridership',
//     data: stationData.map(station => {
//       return {
//         x: station.longitude, // Use the longitude as x value
//         y: station.latitude, // Use the latitude as y value
//         r: station.ridership, // Use the ridership as bubble size
//       };
//     }),
//     backgroundColor: 'rgba(75, 192, 192, 0.8)', // Set the color of the bubbles
//     hoverBackgroundColor: 'rgba(75, 192, 192, 1)', // Set the hover color of the bubbles
//   }]
// };

// Create a bubble chart using Chart.js
// var bubbleChart = new Chart(canvas, {
//   type: 'bubble',
//   data: bubbleChartData, // Use the updated variable name for the data object
//   options: {
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: 'Longitude' // Set the x-axis label
//         }
//       },
//       y: {
//         title: {
//           display: true,
//           text: 'Latitude' // Set the y-axis label
//         }
//       }
//     },
//     plugins: {
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             // Customize the tooltip label
//             var station = stationData[context.dataIndex];
//             return station.name + ': ' + station.ridership + ' riders'; // Display the station name and ridership in the tooltip
//           }
//         }
//       }
//     }
//   }
// });

// d3.csv("./datasets/ridership.csv").then(function(data){

//   // This accesses the first row of the csv dataset
//   console.log(data[0]);

//   data.forEach( function(d) {
//     d.ridership = +d.ridership;
//   });

//   //grouping data by stationname
//   let grouped_data = d3.group(data, d => d.stationname);
//   console.log(grouped_data);

//   //calculating the total ridership for each line at each station
//   let ridership_data = d3.rollup(data, 
//     v => d3.sum(v, d => d.ridership), 
//     d => d.stationname,
//     d => d.line
//   );
  
//   // Convert the rollup result to an array of objects
//   ridership_data = Array.from(ridership_data, ([station, lines]) => ({
//     stationname: station,
//     ridership_by_line: Array.from(lines, ([line, ridership]) => ({
//       line: line,
//       ridership: ridership
//     }))
//   }));
  
//   console.log(ridership_data);

//   let stations = [];

//   grouped_data.map(group => {
//     let totalRidership = group[1].reduce((acc, cur) => {
//       return acc + cur.ridership;
//     }, 0);
  
//     // Determine color based on line(s) served
//     let color;
//     if (group[1].some(d => d.line === 'Red')) {
//       color = 'red';
//     } else if (group[1].some(d => d.line === 'Blue')) {
//       color = 'blue';
//     } else if (group[1].some(d => d.line === 'Green')) {
//       color = 'green';
//     } else if (group[1].some(d => d.line === 'Orange')) {
//       color = 'orange';
//     } else if (group[1].some(d => d.line === 'Silver')) {
//       color = 'silver';
//     } else {
//       color = 'gray';
//     }
  
//     stations.push({
//       name: group[0],
//       ridership: totalRidership,
//       color: color
//     });
//   });
  
//   console.log(stations);

//   //svg container for the chart

//   const margin = { top: 10, right: 30, bottom: 30, left: 60 };
//   const width = 800 - margin.left - margin.right;
//   const height = 600 - margin.top - margin.bottom;

//   const svg = d3.select("#chart")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

//   //creating the bubble chart

//   //scales
//   const xScale = d3.scaleLinear()
//   .domain([0, d3.max(stations, d => d.ridership)])
//   .range([0, width]);

// const yScale = d3.scaleBand()
//   .domain(stations.map(d => d.name))
//   .range([0, height])
//   .padding(0.1);

// const colorScale = d3.scaleOrdinal()
//   .domain(['Red', 'Blue', 'Green', 'Orange', 'Silver', 'None'])
//   .range(['#FF0000', '#0000FF', '#00FF00', '#FFA500', '#C0C0C0', '#808080']);

// //x-axis
// const xAxis = d3.axisBottom(xScale)
//   .ticks(5)
//   .tickSize(-height);

// svg.append("g")
//   .attr("transform", `translate(0, ${height})`)
//   .call(xAxis)
//   .call(g => g.select(".domain").remove())
//   .call(g => g.selectAll(".tick line").attr("stroke-opacity", 0.2));

// //y-axis
// const yAxis = d3.axisLeft(yScale)
//   .tickSize(-width);

// svg.append("g")
//   .call(yAxis)
//   .call(g => g.select(".domain").remove())
//   .call(g => g.selectAll(".tick line").attr("stroke-opacity", 0.2));

// //circles
// const circles = svg.selectAll("circle")
//   .data(stations)
//   .join("circle")
//   .attr("cx", 0)
//   .attr("cy", d => yScale(d.name) + yScale.bandwidth() / 2)
//   .attr("r", d => Math.sqrt(d.ridership / Math.PI))
//   .attr("fill", d => colorScale(d.color))
//   .attr("opacity", 0.8);

// //tooltip
// const tooltip = d3.select("#chart")
//   .append("div")
//   .attr("class", "tooltip")
//   .style("opacity", 0);

// circles.on("mouseover", function (event, d) {
//     const x = event.pageX + 10;
//     const y = event.pageY + 10;
//     tooltip.transition()
//         .duration(200)
//         .style("opacity", .9);
//     tooltip.html(`<div>${d.name}</div>
//                     <div>${d.ridership} riders</div>`)
//         .style("left", `${x}px`)
//         .style("top", `${y}px`);
//   })
//   .on("mouseout", function (d) {
//     tooltip.transition()
//         .duration(500)
//         .style("opacity", 0);
//   });

// });

