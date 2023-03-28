// Load the CSV file containing the MBTA ridership data
d3.csv("ridership_data.csv", function(error, data) {
    if (error) throw error;
  
    // Process the ridership data here
  
    // Call the function to create the ridership visualization
    createRidershipVisualization();
  });
  
  // Load the GeoJSON file for the interactive map
  d3.json("neighborhoods_map.geojson", function(error, data) {
    if (error) throw error;
  
    // Process the GeoJSON data here
  
    // Call the function to create the interactive map
    createInteractiveMap();
  });
  
  function createRidershipVisualization() {
    // Code to create the ridership visualization here
    const ridershipSection = d3.select("#ridership-section");
  
    // Add the section title
    ridershipSection.append("h2")
      .text("Ridership Across Neighborhoods");
  
    // Add the paragraph text
    ridershipSection.append("p")
      .text("Explore the ridership rating of each Boston neighborhood and see how it changes over time.");
  
    // Add the SVG container for the interactive chloropleth map
    ridershipSection.append("svg")
      .attr("id", "map-container")
      .attr("width", "100%")
      .attr("height", "500");
  
    // Code to create the ridership visualization here
  }
  
  function createInteractiveMap() {
    // Code to create the interactive map here
  }
  
    // Path: Final Project/style.css
    /* Style the ridership section */
    