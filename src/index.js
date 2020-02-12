const d3 = require('d3');
const events_per_day_2019 = require('../queries/events_per_day_2019_sorted_day.csv');

let sqDataset = [];

let lnDataset = sqDataset;

d3.csv(events_per_day_2019, d => {
    sqDataset.push([+d.day_of_year, +d.week_, +d.day_of_week, +d.event_count, +d.month_, +d.day_of_month, +d.quarter, +d.year]);
}).then(d => {
    getSqStats();
    getLnStats();
    title();
    squareplot();
    lineplot();
});

let sqMinEvtCt, sqMaxEvtCt;
let sqMinWk, sqMaxWk;
let sqMinMonth, sqMaxMonth;

let sqDim, sqPad;
let sqN, sqM;
let sqZoomInDur, sqZoomOutDur;
let sqLabelSize;
let sqPltWidth, sqPltHeight;

function getSqStats() {

    sqMinEvtCt = d3.min(sqDataset, d => d[3]);
    sqMaxEvtCt = d3.max(sqDataset, d => d[3]);
    sqMinWk = d3.min(sqDataset, d => d[1]);
    sqMaxWk = d3.max(sqDataset, d => d[1]);
    sqMinMonth = d3.min(sqDataset, d => d[4]);
    sqMaxMonth = d3.max(sqDataset, d => d[4]);

    console.log(sqMinWk);
    console.log(sqMaxWk);
    console.log(sqMinMonth);
    console.log(sqMaxMonth);

    // square dimensions
    sqDim = 12
    sqPad = 4
    // square counts
    sqN = sqMaxWk - sqMinWk + 1;
    sqM = 7
    // square size transition timings
    sqZoomInDur = 100  // ms
    sqZoomOutDur = sqZoomInDur
    // label properties
    sqLabelSize = sqDim
    // square plot svg dimensions
    sqPltWidth = sqPad + (sqDim + sqPad) * (sqN + sqMaxMonth - sqMinMonth + 1)  // 11 is no. months
    sqPltHeight = sqPad + sqLabelSize + sqPad + (sqDim + sqPad) * sqM
}

function title() {
    d3
    .select('#title')
    .style('width', sqPltWidth + 'px')
}

function squareplot() {

    let plt = d3
        .select('body')
        .append('svg')
        .attr('id', 'squareplot')
        .attr('width', sqPltWidth)
        .attr('height', sqPltHeight);

    // squares
    plt
        .selectAll('rect')
        .data(sqDataset)
        .enter()
        .append('rect')
        .attr('x', d => squareXPos(d))
        .attr('y', d => squareYPos(d))
        .attr('width', sqDim)
        .attr('height', sqDim)
        .attr('fill', d => squareFill(d))
        .on('click', d => console.log(d))
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    // month labels
    plt
        .selectAll('text')
        .data(sqDataset)
        .enter()
        .append('text')
        .text(d => monthLabel(d))
        .attr('x', d => squareXPos(d))
        .attr('y', sqLabelSize);
}

function squareXPos(d) {
    return sqPad + (d[1] - sqMinWk + d[4] - sqMinMonth) * (sqDim + sqPad);
}

function squareYPos(d) {
    return sqPad + sqLabelSize + sqPad + (d[2] - 1) * (sqDim + sqPad);  // day of week is [1,7] -> [0,6]
}

function squareFill(d) {
    const cmin = [256, 256, 256]
    const cmax = [229, 57, 53]

    // red channel data map
    const sqRFillScale = d3
        .scaleLinear()
        .domain([sqMinEvtCt, sqMaxEvtCt])
        .range([cmin[0], cmax[0]]);

    // green channel data map
    const sqGFillScale = d3
        .scaleLinear()
        .domain([sqMinEvtCt, sqMaxEvtCt])
        .range([cmin[1], cmax[1]]);

    // blue channel data map
    const sqBFillScale = d3
        .scaleLinear()
        .domain([sqMinEvtCt, sqMaxEvtCt])
        .range([cmin[2], cmax[2]]);

    let r = Math.round(sqRFillScale(d[3]));
    let g = Math.round(sqGFillScale(d[3]));
    let b = Math.round(sqBFillScale(d[3]));
    return `rgb(${r}, ${g}, ${b})`;
}

function monthLabel(d) {

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return d[5] == 8 ? months[d[4]-1] : '';
}

d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
};

function handleMouseOver(d) {
    d3.select(this)
        .moveToFront()
        .transition()
        .duration(sqZoomInDur)
        .attr('x', squareXPos(d) - sqDim / 2)
        .attr('y', squareYPos(d) - sqDim / 2)
        .attr('width', sqDim * 2)
        .attr('height', sqDim * 2);
}

function handleMouseOut(d) {
    d3.select(this)
        .transition()
        .duration(sqZoomOutDur)
        .attr('x', squareXPos(d))
        .attr('y', squareYPos(d))
        .attr('width', sqDim)
        .attr('height', sqDim);
}

let lnMinDay, lnMaxDay;

let lnPltWidth, lnPltHeight;

function getLnStats() {

    lnMinDay = d3.min(lnDataset, d => d[0]);
    lnMaxDay = d3.max(lnDataset, d => d[0]);

    // line plot svg dimensions
    lnPltWidth = sqPltWidth
    lnPltHeight = sqPltHeight / 3
}

function lineplot() {

    let plt = d3
        .select('body')
        .append('svg')
        .attr('width', lnPltWidth)
        .attr('height', lnPltHeight)
        .attr('align', 'center');

    // x axis data map
    let x = d3.scaleLinear()
        .domain([lnMinDay, lnMaxDay])
        .range([0, lnPltWidth]);

    // y axis data map
    let y = d3.scaleLinear()
        .domain([d3.min(lnDataset, d => d[3]), d3.max(lnDataset, d => d[3])])
        .range([lnPltHeight, 0]);

    // path
    plt
        .append('path')
        .datum(lnDataset)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
            .x(d => x(d[1] * 7 + d[2]))
            .y(d => y(d[3])));
}
