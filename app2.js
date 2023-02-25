var w = 1000;
var h = 300;

var projection = d3
  .geoAlbers()
  .rotate([-20.0, 0.0])
  .center([0.0, 52.0])
  .parallels([35.0, 65.0])
  .translate([500, 200])
  .scale([300])
  .precision(0.1);

// path generator
var statePath = d3.geoPath().projection(projection);
// SVG element
var svgMap = d3.select("body").append("svg").attr("width", w).attr("height", h);
//Load GeoJSON 
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var GeoJSON = "eu27_features.json"

// bind countries to the map
const eu27Abbr = {
    Austria: "AT",
    Belgium: "BE",
    Bulgaria: "BG",
    Croatia: "HR",
    Cyprus: "CY",
    "Czech Republic": "CZ",
    Denmark: "DK",
    Estonia: "EE",
    Finland: "FI",
    France: "FR",
    Germany: "DE",
    Greece: "EL",
    Hungary: "HU",
    Ireland: "IE",
    Italy: "IT",
    Latvia: "LV",
    Lithuania: "LT",
    Luxembourg: "LU",
    Malta: "MT",
    Netherlands: "NL",
    Poland: "PL",
    Portugal: "PT",
    Romania: "RO",
    Slovakia: "SK",
    Slovenia: "SI",
    Spain: "ES",
    Sweden: "SE",
  };

function checkCountry(json) {
  return eu27Abbr[json.features.properties.name] != undefined;
}

d3.json(GeoJSON, function (json) {

  svgMap
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", statePath)
    .style("stroke", "black")
    .style("fill", "white")
    .on("click", function (d1) {
      console.log(d1)
      svgMap.selectAll("path").style("fill", function (d2) {
        console.log(d2);
        if (d1 == d2) {
          if (this.style.fill == "white") {
            dataArray.push(dataAll[eu27Abbr[d1.properties.name]]);
            update(eu27Abbr[d1.properties.name]);
            return getColor(eu27Abbr[d1.properties.name]);
          } else {
            return getColor(eu27Abbr[d1.properties.name]);
          }
        } else if (this.style.fillOpacity == 1.0) return 1;
        else return 1;
      });
    });
  //   debugger;
});
function mapColors() {
  svgMap
    .selectAll("path")
    .style("stroke", "black")
    .style("stroke-opacity", "1")
    .style("fill", function (d) {
      return getColor(d.properties.name);
    });
}
