d3.csv("./datasets/ridership.csv").then(function(data){

  // This accesses the first row of the csv dataset
  console.log(data[0]);

  data.forEach( function(d) {
    d.ridership = +d.ridership;
  });

  //grouping data by stationname
  let grouped_data = d3.group(data, d => d.stationname);
  console.log(grouped_data);

  //calculating the total ridership for each line at each station
  let ridership_data = d3.rollup(data, 
    v => d3.sum(v, d => d.ridership), 
    d => d.stationname,
    d => d.line
  );
  
  // Convert the rollup result to an array of objects
  ridership_data = Array.from(ridership_data, ([station, lines]) => ({
    stationname: station,
    ridership_by_line: Array.from(lines, ([line, ridership]) => ({
      line: line,
      ridership: ridership
    }))
  }));
  
  console.log(ridership_data);

  let stations = [];

  grouped_data.map(group => {
    let totalRidership = group[1].reduce((acc, cur) => {
      return acc + cur.ridership;
    }, 0);
  
    // Determine color based on line(s) served
    let color;
    if (group[1].some(d => d.line === 'Red')) {
      color = 'red';
    } else if (group[1].some(d => d.line === 'Blue')) {
      color = 'blue';
    } else if (group[1].some(d => d.line === 'Green')) {
      color = 'green';
    } else if (group[1].some(d => d.line === 'Orange')) {
      color = 'orange';
    } else if (group[1].some(d => d.line === 'Silver')) {
      color = 'silver';
    } else {
      color = 'gray';
    }
  
    stations.push({
      name: group[0],
      ridership: totalRidership,
      color: color
    });
  });
  
  console.log(stations);

  //svg container for the chart

  const margin = { top: 10, right: 30, bottom: 30, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //creating the bubble chart

  //scales
  const xScale = d3.scaleLinear()
  .domain([0, d3.max(stations, d => d.ridership)])
  .range([0, width]);

const yScale = d3.scaleBand()
  .domain(stations.map(d => d.name))
  .range([0, height])
  .padding(0.1);

const colorScale = d3.scaleOrdinal()
  .domain(['Red', 'Blue', 'Green', 'Orange', 'Silver', 'None'])
  .range(['#FF0000', '#0000FF', '#00FF00', '#FFA500', '#C0C0C0', '#808080']);

//x-axis
const xAxis = d3.axisBottom(xScale)
  .ticks(5)
  .tickSize(-height);

svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis)
  .call(g => g.select(".domain").remove())
  .call(g => g.selectAll(".tick line").attr("stroke-opacity", 0.2));

//y-axis
const yAxis = d3.axisLeft(yScale)
  .tickSize(-width);

svg.append("g")
  .call(yAxis)
  .call(g => g.select(".domain").remove())
  .call(g => g.selectAll(".tick line").attr("stroke-opacity", 0.2));

//circles
const circles = svg.selectAll("circle")
  .data(stations)
  .join("circle")
  .attr("cx", 0)
  .attr("cy", d => yScale(d.name) + yScale.bandwidth() / 2)
  .attr("r", d => Math.sqrt(d.ridership / Math.PI))
  .attr("fill", d => colorScale(d.color))
  .attr("opacity", 0.8);

//tooltip
const tooltip = d3.select("#chart")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

circles.on("mouseover", function (event, d) {
    const x = event.pageX + 10;
    const y = event.pageY + 10;
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(`<div>${d.name}</div>
                    <div>${d.ridership} riders</div>`)
        .style("left", `${x}px`)
        .style("top", `${y}px`);
  })
  .on("mouseout", function (d) {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
  });

});

