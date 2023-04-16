let data = [];


const width = document.querySelector("#barchart").clientWidth;
const height = document.querySelector("#barchart").clientHeight;

// Initializing the viewport of the SVG canvas
// An SVG Canvas's Viewport has a "width" and "height"
const svg = d3.select("#barchart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

function draw (year) {

  // convert the date strings to JavaScript Date objects
  data.forEach(function(d) {
    d.date = new Date(d.date);
  });

  // group the data by year and line using d3.nest()
  var yearlyData = d3.nest()
    .key(function(d) { return d.date.getFullYear(); })
    .key(function(d) { return d.line; })
    .rollup(function(d) { return d3.sum(d, function(d) { return d.ridership; }); })
    .entries(data);

  
  //3. DETERMINE MIN AND MAX VALUES OF VARIABLES

  const margin = {
    top: 50, 
    left: 100, 
    right: 50, 
    bottom: 100
  };

  var t = d3.transition()
        .duration(2000);

    const x0 = d3.scaleBand()
    .domain(yearlyData.map(function(d) { return d.key; }))
    .range([margin.left, width - margin.right])
    .padding(0.1);

    const x1 = d3.scaleBand()
    .domain(['Red Line', 'Green Line', 'Blue Line', 'Orange Line', 'Silver Line'])
    .rangeRound([0, x0.bandwidth()])
    .padding(0.1);

    const y = d3.scaleLinear()
    .domain([0, d3.max(yearlyData, function(d) {
      return d3.max(d.values, function(d) { return d.value; });
    })])


    x0.domain(yearlyData.map(function(d) { return d.key; }));
    x1.domain(['Red Line', 'Green Line', 'Blue Line', 'Orange Line', 'Silver Line']).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(yearlyData, function(d) { 

      console.log(yearlyData.filter(function(d) { return isNaN(d.value); }));
      return d3.max(d.values, function(d) { return d.value; });

  })]).nice();


//  4. CREATE SCALES

  const xScale = d3.scaleBand()
      .domain(['Red Line', 'Green Line', 'Blue Line', 'Orange Line', 'Silver Line'])
      .range([margin.left, width - margin.right])
      .padding(0.5);
      
  const yScale = d3.scaleLinear()
      .domain([0, d3.max(yearlyData, function(d) { 
        return d3.max(d.values, function(d) { return d.value; });
      })])
      .range([height - margin.bottom, margin.top]);

  let yAxisGenerator = d3.axisLeft(yScale);
  yAxisGenerator
    .tickFormat(d3.format(".0s"));

  //5. DRAW AXES

  const xAxis = svg.append("g")
      .attr("class","axis")
      .attr("transform", `translate(0,${height-margin.bottom})`)
      .call(d3.axisBottom().scale(xScale));

  const yAxis = svg.append("g")
      .attr("class","axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxisGenerator);

//6. DRAW BARS

    const color = d3.scaleOrdinal()
      .domain(['Red Line', 'Green Line', 'Blue Line', 'Orange Line', 'Silver Line'])
      .range(['#ee0000', '#008633', '#003DA5', '#ED8B00', '#7C878E']);

    var bars = svg.selectAll('.bar')
        .data(yearlyData[year].values)

    bars
        .exit()
        .remove();

    //tooltip
    const tooltip = d3.select("#barchart")
    .append("div")
    .style("opacity", 0.9)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("border-color", "#000000")
    .style("padding", "10px")

    //const formatValue = d3.format(","); // Create format function with commas
    
    const points = bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xScale(d.key); })
    .attr("y", function(d) { return yScale(d.value); })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) { return height - margin.bottom - yScale(d.value); })
    .attr("fill", function(d) { return color(d.key); })
    .on("mouseover", function(event,d) {
      tooltip.transition()
        .duration(1000)
        .style("opacity", 0.9);
      tooltip.html(`<strong>Total ridership:</strong><br> ${d3.format(",")(d.value)}`) 
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 35) + "px");
      })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      });
    
    points.merge(bars)
      .transition(t)
      .attr('y', function(d) {
          return yScale(+d.value);
      })
      .attr('height', function(d) {
          return height - margin.bottom - yScale(+d.value)
      })
      .attr('fill', function(d) {
          return color(d.key);
      })

    svg.select('.x.axis')
      .call(xAxis);

    svg.select('.y.axis')
      .transition(t)
      .call(yAxis);


  // Using d variable in a callback, such as d3.format()
    let displayValue = d3.format(",")(d => d.value);

  
//7. DRAW AXIS LABELS

    const xAxisLabel = svg.append("text")
    .attr("y", height - margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("MBTA Lines");

    const yAxisLabel = svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Ridership");
}

d3.csv("datasets/ridership.csv").then(function(loadedData) {
  data = loadedData;
  draw(0); // draw 2019
});

var select = d3.select('#year-select');
select.on('change', function() {
  console.log(this.value)
    draw(this.value);

  
});