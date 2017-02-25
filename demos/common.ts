﻿import { ValueFn, select, selectAll, mouse as d3mouse, event as d3event } from 'd3-selection'

import { TimeSeriesChart } from '../draw'
import { measure } from '../measure'
import { IMinMax } from '../segmentTree'



function buildSegmentTreeTuple(index: number, elements: number[][]): IMinMax {
	const nyMinValue = isNaN(elements[index][0]) ? Infinity : elements[index][0]
	const nyMaxValue = isNaN(elements[index][0]) ? -Infinity : elements[index][0]
	const sfMinValue = isNaN(elements[index][1]) ? Infinity : elements[index][1]
	const sfMaxValue = isNaN(elements[index][1]) ? -Infinity : elements[index][1]
	return { min: Math.min(nyMinValue, sfMinValue), max: Math.max(nyMaxValue, sfMaxValue) }
}

export function drawCharts (data: [number, number][]) {
	let charts: TimeSeriesChart[] = []

	const onZoom = () => charts.forEach((c) => c.zoom())
	const onMouseMove = () => {
		const [x, _] = d3mouse(d3event.target)
		charts.forEach((c) => c.highlight(x))
	}

	const onSelectChart: ValueFn<any, any, any> = function (element: any, datum: any, descElement: any) {
		let chart = new TimeSeriesChart(select(this), Date.now(), 86400000, data.map(_ => _), buildSegmentTreeTuple, onZoom, onMouseMove)
		charts.push(chart)
	}

	selectAll('svg').select(onSelectChart)

	let j = 0
	setInterval(function() {
		let newData = data[j % data.length]
		charts.forEach(c => c.updateChartWithNewData(newData))
		j++
	}, 5000)
	measure(3, (fps) => {
		document.getElementById('fps').textContent = fps
	})
}
