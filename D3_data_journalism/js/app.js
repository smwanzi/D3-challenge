// @TODO:
// Code for Chart is Wrapped Inside a Function That Automatically Resizes the Chart
function makeResponsive() {

  // If SVG Area is not Empty When Browser Loads, Remove & Replace with a Resized Version of Chart
  var svgArea = d3.select("body").select("svg");

  // Clear SVG is Not Empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }
// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 700;

// Define the chart's margins as an object
var margin = {
  top: 50,
  right: 40,
  bottom: 90,
  left: 95
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create canvas, append SVG area to it, and set it's dimensions
var svg = d3.select("#scatter")  
    .classed('chart',true)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  
// Create the chartGroup that will contain the data
// Use transform attribute to fit it within the canvas
var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create Chart

// Initial params
var chosenXAxis = 'poverty',
        chosenYAxis = 'healthcare';

// Load data from data.csv
d3.csv("data/data.csv").then(data =>{
    // Print data to console
    console.log(data);
    // Cast each data value to a number
    data.forEach( d =>{
          d.poverty = +d.poverty;
          d.age = +d.age;
          d.income = +d.income;
          d.obesity = +d.obesity;
          d.smokes = +d.smokes;
          d.healthcare = +d.healthcare;
    });
    // Create x & y scale functions
    var xScale = getXScaleForAxis(data,chosenXAxis),
          yScale = getYScaleForAxis(data,chosenYAxis);
        
    // Create axes functions
    var xAxis = d3.axisBottom(xScale),
          yAxis = d3.axisLeft(yScale);

    // Append Axes to the chart
    var xAxis = chartGroup.append('g')
            .attr('transform',`translate(0,${height})`)
            .call(xAxis);
    var yAxis = chartGroup.append('g')
            .call(yAxis);

  // Add X and Y axis titles
  chartGroup.append("text")
      .attr("transform", `translate(${width - 40},${height - 5})`)
      .attr("class", "axis-text-main")
      .text("Demographics")

  chartGroup.append("text")
      .attr("transform", `translate(15,60 )rotate(270)`)
      .attr("class", "axis-text-main")
      .text("Health Risk Factors")

  // Create circles 
  var stateCircles = chartGroup.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .classed('stateCircle',true)
        .attr('cx', d => xScale(d[chosenXAxis]))
        .attr('cy', d => yScale(d[chosenYAxis]))
        .attr('r' , 13)
        
  // add text
  var stateText = chartGroup.append('g').selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .classed('stateText',true)
        .attr('x', d => xScale(d[chosenXAxis]))
        .attr('y', d => yScale(d[chosenYAxis]))
        .attr('transform','translate(0,4.5)')
        .text(d => d.abbr)

  // Create group for 3 xAxis labels
  var xLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 20})`);
  // Poverty
  var povertyLabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .classed('aText active', true)
        .text('In Poverty (%)');
  // Age
  var ageLabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')
        .classed('aText inactive', true)
        .text('Age (Median)');
  // Income
  var incomeLabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .classed('aText inactive', true)
        .text('Household Income (Median)');

  // Create group for 3 yAxis labels
  var yLabelsGroup = chartGroup.append('g')

  // Healthcare
  var HealthLabel = yLabelsGroup.append('text')
        .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
        .attr('value', 'healthcare')
        .classed('aText active', true)
        .text('Lacks Healthcare (%)');

  // Smokes
  var smokesLabel = yLabelsGroup.append('text')
        .attr("transform", `translate(-60,${height / 2})rotate(-90)`)
        .attr('value', 'smokes')
        .classed('aText inactive', true)
        .text('Smokes (%)');

  // Obesity
  var obesityLabel = yLabelsGroup.append('text')
        .attr("transform", `translate(-80,${height / 2})rotate(-90)`)
        .attr('value', 'obesity')
        .classed('aText inactive', true)
        .text('Obesse (%)');

  // updateToolTip function
  var stateCircles = updateToolTip(chosenYAxis,chosenXAxis,stateCircles,stateText),
          stateText = updateToolTip(chosenYAxis,chosenXAxis,stateCircles,stateText);

  // Event listener - X axis labels   
  xLabelsGroup.selectAll('text')
      .on('click', function() {
        // Get value of selection
        var value = d3.select(this).attr('value');
        if (value !== chosenXAxis) {
        // Replace chosenXAxis with value
            chosenXAxis = value;
        // Update x scale for the new data
            xScale = getXScaleForAxis(data, chosenXAxis);
        // Update x axis transition
            xAxis.transition()
                  .duration(1000)
                  .ease(d3.easeBack)
                  .call(d3.axisBottom(xScale));                       
            // Update state circles transition
            stateCircles.transition()
                .duration(1000)
                .ease(d3.easeBack)
                .on('start',function(){
                      d3.select(this)
                          .attr("opacity", 0.50)
                          .attr('r',15);
              })
                .on('end',function(){
                      d3.select(this)
                          .attr("opacity", .75)
                          .attr('r',12)
              })
              .attr('cx', d => xScale(d[chosenXAxis]));

            d3.selectAll('.stateText').transition()
              .duration(1000)
              .ease(d3.easeBack)
              .attr('x', d => xScale(d[chosenXAxis]));

        // Update tooltip with new data
        stateCircles = updateToolTip(chosenYAxis,chosenXAxis,stateCircles,stateText),
                 stateText = updateToolTip(chosenYAxis,chosenXAxis,stateCircles,stateText);
  
        if (chosenXAxis === 'poverty') {
              povertyLabel
                .classed('active', true)
                .classed('inactive', false);
              incomeLabel
                .classed('active', false)
                .classed('inactive', true);
              ageLabel
                .classed('active', false)
                .classed('inactive', true);
        }
        else if (chosenXAxis === 'age'){
              povertyLabel
                .classed('active', false)
                .classed('inactive', true);
              incomeLabel
                .classed('active', false)
                .classed('inactive', true);
            ageLabel
                .classed('active', true)
                .classed('inactive', false);
        }
        else {
              povertyLabel
                .classed('active', false)
                .classed('inactive', true);
              incomeLabel
                .classed('active', true)
                .classed('inactive', false);
            ageLabel
                .classed('active', false)
                .classed('inactive', true);
        }
     }
  });

  //Event listener - Y axis labels
  yLabelsGroup.selectAll('text')
      .on('click', function() {
        // Get value of selection
        var value = d3.select(this).attr('value');
        if (value !== chosenYAxis) {
        // Replace chosenYAxis with value          
            chosenYAxis = value;
        // Update y scale for the new data
            yScale = getYScaleForAxis(data, chosenYAxis);
        // Update y axis transition
            yAxis.transition()
                .duration(1000)
                .ease(d3.easeBack)
                .call(d3.axisLeft(yScale));
        // Update state circles transition
            stateCircles.transition()
                .duration(1000)
                .ease(d3.easeBack)
                .on('start',function(){
                    d3.select(this)
                      .attr("opacity", 0.75)
                      .attr('r',15);
              })
              .on('end',function(){
                    d3.select(this)
                      .attr("opacity", .85)
                      .attr('r',14)
              })
              .attr('cy', d => yScale(d[chosenYAxis]));

          d3.selectAll('.stateText').transition()
              .duration(1000)
              .ease(d3.easeBack)
              .attr('y', d => yScale(d[chosenYAxis]));

// Update tooltips with new data
stateCircles = updateToolTip(chosenYAxis,chosenXAxis,stateCircles,stateText),
          stateText = updateToolTip(chosenYAxis,chosenXAxis,stateCircles,stateText);
  
      if (chosenYAxis === 'healthcare') {
            HealthLabel
                .classed('active', true)
                .classed('inactive', false);
            smokesLabel
                .classed('active', false)
                .classed('inactive', true);
            obesityLabel
                .classed('active', false)
                .classed('inactive', true);
        }
        else if (chosenYAxis === 'obesity'){
            HealthLabel
                .classed('active', false)
                .classed('inactive', true);
            smokesLabel
                .classed('active', false)
                .classed('inactive', true);
            obesityLabel
                .classed('active', true)
                .classed('inactive', false);
        }
        else {
            HealthLabel
                .classed('active', false)
                .classed('inactive', true);
            smokesLabel
                .classed('active', true)
                .classed('inactive', false);
            obesityLabel
                .classed('active', false)
                .classed('inactive', true);
        }
      }
  });
  
});
  // function to update x-scale var upon click on axis label
    function getXScaleForAxis(data,chosenXAxis) {
          var xScale = d3.scaleLinear()
              .domain([d3.min(data, d => d[chosenXAxis])*.9, 
                  d3.max(data, d => d[chosenXAxis])*1.1])
              .range([0, width]);          
          return xScale;
  }
  // function to update y-scale var upon click on axis label
    function getYScaleForAxis(data,chosenYAxis) {
          var yScale = d3.scaleLinear()
              .domain([d3.min(data, d => d[chosenYAxis])*.9, 
                  d3.max(data, d => d[chosenYAxis])*1.1])
              .range([height, 0]);
          return yScale;
  }
  // function to update state circles group with tool tips  
  function updateToolTip(chosenYAxis,chosenXAxis,stateCircles,stateText) {
      var toolTip = d3.tip()
            .attr('class','d3-tip')
            .offset([80, -60])
            .html( d => {
              if(chosenXAxis === "poverty")
                  return (`${d.state}<br>${chosenYAxis}:${d[chosenYAxis]}% 
                      <br>${chosenXAxis}:${d[chosenXAxis]}%`)
              else if (chosenXAxis === 'income')
                  return (`${d.state}<br>${chosenYAxis}:${d[chosenYAxis]}% 
                      <br>${chosenXAxis}:$${d[chosenXAxis]}`)
              else
                return (`${d.state}<br>${chosenYAxis}:${d[chosenYAxis]}% 
                      <br>${chosenXAxis}:${d[chosenXAxis]}`)
        });
  
    stateCircles.call(toolTip);
    stateCircles.on('mouseover', toolTip.show).on('mouseout', toolTip.hide);
  
    d3.selectAll('.stateText').call(toolTip);
    d3.selectAll('.stateText').on('mouseover', toolTip.show).on('mouseout', toolTip.hide);
  
    return stateCircles;
    // return stateText;
  }
}
// When Browser Loads, makeResponsive() is Called
makeResponsive();

// When Browser Window is Resized, makeResponsive() is Called
d3.select(window).on("resize", makeResponsive);