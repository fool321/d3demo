const svgChart = d3.select("svg");
const margin = { top: 20, right: 20, bottom: 110, left: 40 };
const margin2 = { top: 430, right: 20, bottom: 30, left: 40 };
const width = +svgChart.attr("width") - margin.left - margin.right;
const height = +svgChart.attr("height") - margin.top - margin.bottom;
const height2 = +svgChart.attr("height") - margin2.top - margin2.bottom;

const x = d3.scaleTime().range([0, width]);
const x2 = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);
const y2 = d3.scaleLinear().range([height2, 0]);

const xAxis = d3.axisBottom(x);
const xAxis2 = d3.axisBottom(x2);
const yAxis = d3.axisLeft(y);

const brush = d3
  .brushX()
  .extent([
    [0, 0],
    [width, height2 - 1],
  ])
  .on("brush end", brushed);

const valueLine = d3
  .line()
  .curve(d3.curveBasis)
  .x((d) => x(d.date))
  .y((d) => y(d.unemployment));

const valueLine2 = d3
  .line()
  .curve(d3.curveBasis)
  .x((d) => x2(d.date))
  .y((d) => y2(d.unemployment));

svgChart
  .append("defs")
  .append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);

const focus = svgChart
  .append("g")
  .attr("class", "focus")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const context = svgChart
  .append("g")
  .attr("class", "context")
  .attr("transform", `translate(${margin2.left},${margin2.top})`);

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

dataAll = {};
dataArray = [];

const euUnion = "EU27_2020";
d3.csv("unemployment_eu1.csv", (error, data) => {
  if (error) throw error;
  data.forEach((d) => {
    if (dataAll[d.State] === undefined) dataAll[d.State] = [];
    dataAll[d.State].push(d);
  });

  for (const country in dataAll) {
    dataAll[country].forEach((d) => {
      d.date = d3.timeParse("%Y-%m")(d.TIME_PERIOD);
      d.unemployment = +d["OBS_VALUE"];
    });

    dataAll[country].sort((a, b) => a.date - b.date);
  }

  x.domain(d3.extent(data, (d) => d.date));
  y.domain([0, d3.max(data, (d) => d.unemployment)]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus.selectAll(".line").remove();
  context.selectAll(".line").remove();
  addNational();
});

function drawGraph() {
  context
    .selectAll(".line")
    .data(dataArray)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("stroke", function (d) {
      if (d[0].State == euUnion) {
        return "black";
      }
      return getColor(d[0].State);
    })
    .style("stroke-dasharray", function (d) {
      // debugger
      if (d[0].State == euUnion) {
        return 5;
      }
    })
    .attr("d", function (d) {
      return valueLine2(d);
    });
  focus
    .selectAll(".line")
    .data(dataArray)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("stroke", function (d) {
      if (d[0].State == euUnion) {
        return "black";
      }
      return getColor(d[0].State);
    })
    .attr("d", function (d) {
      return valueLine(d);
    })
    .style("stroke-dasharray", function (d) {
      if (d[0].State == euUnion) {
        return 5;
      }
    })
    .on("mouseover", function (d1) {
      focus
        .selectAll(".line")
        .style("stroke-opacity", function (d2) {
          if (d1 == d2) return 1;
          else return 0.15;
        })
        .style("stroke-width", function (d3) {
          if (d1 == d3) return 3;
          else return 1.5;
        })
        .style("stroke-dasharray", function (d) {
          if (d[0].State == euUnion) {
            return 5;
          }
        });
      svgMap
        .selectAll("path")
        .style("fill-opacity", function (d2) {
          if (d1[0].State == d2.properties.name) {
            return "1";
          } else {
            return "0";
          }
        })
        .style("stroke-dasharray", function (d2) {
          if (d1[0].State == euUnion) return "5";
        });
      div.transition().style("opacity", 1.0);
      div
        .html("<span>" + d1[0].State + "</span>")
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d1) {
      focus
        .selectAll(".line")
        .style("stroke-opacity", "1")
        .style("stroke-width", 1.5);
      div.transition().style("opacity", 0);
      svgMap
        .selectAll("path")
        .style("fill-opacity", "1")
        .style("stroke", "black")
        .style("stroke-dasharray", "0");
    });

  if (d3.select(".axis--x").empty()) {
    focus.append("g").attr("class", "axis axis--x");

    focus.append("g").attr("class", "axis axis--y");

    context.append("g").attr("class", "axis axis--x");

    svgChart
      .append("text")
      .attr("x", width / 2 + 30)
      .attr("y", height + 55)
      .style("text-anchor", "middle")
      .text("Date");

    svgChart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Percent Unemployed");

    svgChart
      .append("text")
      .attr("x", width / 2 + 30)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("text-decoration", "underline")
      .text("Harmonised unemployment rates (%) - monthly data");
  }

  focus
    .select(".axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.select(".axis--y").call(yAxis);

  context
    .select(".axis--x")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

  if (d3.select(".brush").empty()) {
    context.append("g").attr("class", "brush");
  }

  context.select(".brush").call(brush).call(brush.move);
}

function brushed() {
  //if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  focus.selectAll(".line").attr("d", function (d) {
    return valueLine(d);
  });
  focus.select(".axis--x").call(xAxis);
}

function update() {
  drawGraph();
}

function addNational() {
  dataArray.push(dataAll[euUnion]);
  update();
}

function addAll() {
  clear();
  svgMap.selectAll("path").style("fill", "white");
  for (var country in dataAll) {
    // console.log(country);
    // debugger
    dataArray.push(dataAll[country]);
  }
  mapColors();
  update();
}

function clearAll() {
  clear();
  svgMap.selectAll("path").style("fill", "white");
  update();
}

function addBelow(){
  clear();
  svgMap.selectAll("path").style("fill", "white");
  for (var country in dataAll) { // NL

    var a1 = dataAll[country][0].OBS_VALUE;
    var a2 = dataAll['EU27_2020'][0].OBS_VALUE;
    var a3 = a1 - a2;

    if (a3 < 0) {
      dataArray.push(dataAll[country]);

      svgMap.selectAll("path").style("fill", function(d){
  
        if (eu27Abbr[d.properties.name] == country){
        return getColor(eu27Abbr[d.properties.name]);
      }
      else return 1;
    
    }); 
    }

  }  
  update();
}

function addBelow_new(){
  clear();
  svgMap.selectAll("path").style("fill", "white");
  for (var country in dataAll) { // NL
    // c = dataAll[country][-1]
    // debugger
    var a1 = dataAll[country][83].OBS_VALUE;
    var a2 = dataAll['EU27_2020'][83].OBS_VALUE;
    var a3 = a1 - a2;

    if (a3 < 0) {
      dataArray.push(dataAll[country]);

      svgMap.selectAll("path").style("fill", function(d){
        if (eu27Abbr[d.properties.name] == country){
        return getColor(eu27Abbr[d.properties.name]);
      }
      else return 1;
    
    }); 
    }

  }  
  update();
}

function clear() {
  dataArray = [];
  context.selectAll(".line").remove();
  focus.selectAll(".line").remove();
}
function getColor(state) {
  return colorScale(state);
}
