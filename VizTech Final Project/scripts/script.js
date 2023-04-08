// 1. Grab the dimensions of the open window in the browser.
// Our geographical map will extend throughout the window.

const width = window.innerWidth, height = window.innerHeight;

// Try to use these two variables for `width` and `height` instead and
// notice what happens to the size of the map visualization. Can you tell why?

//viewport information of a specific SVG canvas
//const width = document.querySelector("#viz").clientWidth;
//const height = document.querySelector("#viz").clientHeight;

// 2. We initialize variables for the svg container that holds all
// of our visualization elements. And we also initialize a variable
// to store just the element that holds our map; this element is a group
// that in HTML tags is given by "g". See the index.html for more information.

//This is a specification of the SVG canvas

const svg = d3.select("#viz")
            .attr("width", width)
            .attr("height", height);

const map = svg.select("#map");

// 3. Because we are creating a map, we also want to add some kind of "ocean". This is going
// to be just a rectangle that has an ID called #ocean. See the index.html

d3.select("#ocean")
  .attr("width", width)
  .attr("height", height);

// 4. Here start building the geographical map by first loading a TopoJSON file.

d3.json("data/Boston_Neighborhoods.geojson").then(function(Boston) {


    let geoJSON = topojson.feature(world, world.objects.countries);

    // TO DO
    
    // 6.
    // Filtering Out Polygons: We are removing the JavaScript object that stores the features
    // of Antarctica because we will hide Antarctica from the specific map we are making.

    // TO DO

    /**
     * 7. Map Projections
     * 
     * Just like we set up a linear scale for mapping data values to pixel positions
     * in a bar chart or scatter plot (e.g., with linearScale), we need to create a
     * function that maps raw coordinate values given in the geoJSON file into screen
     * pixels. There is no one way of using projections for creating maps. In general,
     * the visible size of a countries boundary shape depends on the projection used
     * to make it visible. See this: https://www.thetruesize.com
     * 
     * In the following we will set up a "flat" map projection otherwise known as
     * spherical Mercator projection (an equirectangular projection).
     * 
     * For more information on projections that d3 implements, see:
     * https://github.com/d3/d3-geo#azimuthal-projections
    */

    let proj = d3.geoMercator().fitSize([width, height], geoJSON);

    /**
     * 8. Geographical Path Constructor
     * 
     * 
     */

   let path = d3.geoPath().projection(proj);

   //D3 join pattern approach, binding "path" SVG shapes into geoJSON data
   map.selectAll("path")
      .data(geoJSON.features)
      .enter()
      .append("path")
          // we use d attribute in SVG to define a path to be drawn
      // "d" is a presentation attribute, we can also use CSS properties on it
      .attr("d", path)
    // everything below is presentationa attributes
      .attr("fill", "#fcedda")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke", "000")
      .attr("stroke-width", "0.5px");

    
    /**
     * 9. Plotting on the Geographical Map
     * 
     * Plot two circles on the geographical map to denote the location 
     * of particular cities. The location of a city is given by the 
     * coordinates for latitude and longitude. Once you get the
     * coordinates, you use the projection function defined previously,
     * e.g., the Mercator projection, and you pass in those coordinates
     * in the function to project them onto the map as pixel positions.
     */

    // NOTE: The coordinates for a city are given as: [longitude, latitude]
    //       because that is how the projection function wants them.

    var points = [

      {
        "name": "Boston", 
        "coords": [-71.0589, 42.3601]
    },
    {
      "name": "London", 
      "coords": [-0.1278, 51.5074]
    }
    ];

    // 10. The following is a D3 join pattern for adding
    // SVG circle shapes. 
    //
    // Here, notice how we transform the circles using
    // the projection function we defined previously. Essentially, the
    // projection is just a function that requires an input argument, 
    // namely the coordinates of a point.

   map.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("r", 4)
      .attr("fill", "red")
      .attr("transform", function(d) {
        return "translate(" + proj(d.coords) + ")";
      });

    /**
     * 11. D3 Zoom and Pan
     * 
     * D3 provides a method called .zoom() that adds zoom and pan behaviour to an
     * HTML or SVG element. 
     * 
     * For more information, see: https://www.d3indepth.com/zoom-and-pan/
     * 
     * Documentation: https://github.com/d3/d3-zoom
     */


    function zoomed(e) {

      map.attr("tranform",e.transform);
  
    }

    let zoom = d3.zoom()
    .translateExtent([[0,0],[width,height]])
    .scaleExtent([1,15])
    .on("zoom", zomed);
    svg.call(zoom)

});