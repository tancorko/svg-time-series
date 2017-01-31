import { select, event as d3event } from 'd3-selection'
import { range } from 'd3-array'
import { measureAll } from '../bench'
import { zoom } from 'd3-zoom'
import { ViewWindowTransform } from '../../ViewWindowTransform'

var svg = select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var points = range(2000).map(phyllotaxis(10));

var g = svg.append("g");


const svgNode = svg.node() as SVGSVGElement
const zero = svgNode.createSVGPoint()
zero.x = 0
zero.y = 0



// const p = svgNode.createSVGPoint(10, 10)

g.selectAll("circle")
    .data(points)
  .enter().append("circle")
    .attr("cx", function(d) { return d[0]; })
    .attr("cy", function(d) { return d[1]; })
    .attr("r", 2.5);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(zoom()
        .scaleExtent([1, 1])
        .on("zoom", zoomed));

const viewNode: SVGGElement = g.node() as SVGGElement
const t = new ViewWindowTransform(viewNode.transform.baseVal)
t.setViewPort(width, width)

const rr = 500

function vecToModel(screenVector: SVGPoint): SVGPoint {

	const m1 = t.fromScreenToModel(screenVector)
	const m2 = t.fromScreenToModel(zero)

	const modelVector = svgNode.createSVGPoint()

	modelVector.x = m1.x - m2.x
	modelVector.y = m1.y - m2.y
	return modelVector
}


function phyllotaxis(radius: number) {
  var theta = Math.PI * (3 - Math.sqrt(5));
  return function(i: number) {
    var r = radius * Math.sqrt(i), a = theta * i;
    return [
      r * Math.cos(a),
      r * Math.sin(a)
    ];
  };
}


var newZoom : string = null
let newZoomX = 0
var zoomCount = 0
var maxZoomCount = 0

var draw = drawProc(function ()
{
    document.getElementById("misc").textContent = newZoomX.toString()

	const screenVector = svgNode.createSVGPoint()
	screenVector.x = newZoomX
	screenVector.y = 0

	const modelVector = vecToModel(screenVector)
	t.setViewWindow(-rr - modelVector.x, rr - modelVector.x, -rr - modelVector.y, rr - modelVector.y)
})

draw()

function zoomed()
{
    zoomCount += 1
    const z = d3event.transform.toString()

    if (z != newZoom)
    {
        newZoom = z
		newZoomX = d3event.transform.x
        draw()
    }
}

function drawProc(f: (time: number) => void) {
    var requested = false
    
    return function () {
        if (!requested)
        {
            requested = true
            requestAnimationFrame(function (time)
            {
                requested = false
                f(time)
            })
        }
    }
}

measureAll()
