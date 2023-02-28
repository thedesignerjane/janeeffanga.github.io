
d3.csv("./data/gapminder.csv").then(function(data) {
  
    // 1. DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS
    const width = document.querySelector("#chart").clientWidth;
    const height = document.querySelector("#chart").clientHeight;
  
    // Initializing the viewport of the SVG canvas
    // An SVG Canvas's Viewport has a "width" and "height"
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    // 2. FILTER THE DATA
    let filtered_data = data.filter(function(d) {
      return d.country === 'Nigeria' || d.country === 'Ghana';
    });
  
    // 3. DETERMINE MIN AND MAX VALUES OF VARIABLES
    const gdpPercap = {
      min: d3.min(filtered_data, function(d) { return +d.gdpPercap; }),
      max: d3.max(filtered_data, function(d) { return +d.gdpPercap; })
    };
  
    // 4. CREATE SCALES
    const margin = {
      top: 50, 
      left: 100, 
      right: 50, 
      bottom: 100
    };
    
    const xScale = d3.scaleBand()
      .domain(["1952","1957","1962","1967","1972","1977","1982","1987","1992","1997","2002","2007"])
      .range([margin.left, width - margin.right])
      .padding(0.2);
    
    const yScale = d3.scaleLinear()
      .domain([50, gdpPercap.max])
      .range([height - margin.bottom, margin.top]);
  
    const colorScale = d3.scaleOrdinal()
      .domain(["Nigeria", "Ghana"])
      .range(["#046c3c", "#fbd313"]);
  
    // 5. DRAW AXES
    const xAxis = svg.append("g")
      .attr("class","axis")
      .attr("transform", `translate(0,${height-margin.bottom})`)
      .call(d3.axisBottom().scale(xScale));
  
    const yAxis = svg.append("g")
      .attr("class","axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft().scale(yScale));
  
    // 6. DRAW BARS
    const bars = svg.selectAll(".bar")
      .data(filtered_data)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.year) + xScale.bandwidth() / 2 * (d.country === 'Nigeria' ? 0 : 1); })
        .attr("y", function(d) { return yScale(d.gdpPercap); })
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", function(d) { return height - (margin.bottom + yScale(d.gdpPercap)); })
        .attr("fill", function(d) { return colorScale(d.country); });
  
    
    //7. DRAW AXIS LABELS

    const xAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("x", width/2)
        .attr("y", height-margin.bottom/2)
        .text("Year");

    const yAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("transform","rotate(-90)")
        .attr("x", -height/2)
        .attr("y", margin.left/2)
        .text("GDP per Capita ($)");


    //8. DRAW LEGEND
    const legendData = [
        { color: "#046c3c", label: "Nigeria" },
        { color: "#fbd313", label: "Ghana" }
      ];
      
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${margin.right + 80}, ${margin.top})`);


    const legendItems = legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")

    legendItems.attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill",  d => d.color)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("rx", 2)
        .attr("ry", 2)

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 9)
        .text(d => d.label);
        
    
});

 
