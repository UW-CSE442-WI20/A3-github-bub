const d3 = require('d3');
const usersPerDaySorted = require('../queries/distinct_users_per_day_2019.csv');

let dataset = [];
d3.csv(usersPerDaySorted, d => {
    dataset.push([+d.day, +d.week, +d.day_of_week, +d.cnt]);
}).then(d => {
    squareplot();
});

// square dimensions
const dim = 12
const pad = 4

// square counts
const n = 53
const m = 7

// svg dimensions
const w = pad + (dim + pad) * n
const h = pad + (dim + pad) * m

let max = -1, min = -1;

function squareplot() {

    for (let i = 0; i < dataset.length; ++i) {
        let d = dataset[i]
        max = (max == -1) ? d[3] : Math.max(max, d[3]);
        min = (min == -1) ? d[3] : Math.min(min, d[3]);
    }

    let plt = d3
        .select('body')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .attr('align', 'center');

    plt
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', d => squareXPos(d))
        .attr('y', d => squareYPos(d))
        .attr('width', dim)
        .attr('height', dim)
        .attr('fill', d => squareFill(d))
        .on('click', d => console.log(d))
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);
}

function squareXPos(d) {
    return pad + d[1] * (dim + pad);  // week is [0,52]
}

function squareYPos(d) {
    return pad + (d[2] - 1) * (dim + pad);  // day of week is [1,7] -> [0,6]
}

const cmin = [256, 256, 256]
const cmax = [229, 57, 53]

function squareFill(d) {
    let frac = (d[3] - min) / (max - min);
    let r = Math.round(cmin[0] - frac * (cmin[0] - cmax[0]));
    let g = Math.round(cmin[1] - frac * (cmin[1] - cmax[1]));
    let b = Math.round(cmin[2] - frac * (cmin[2] - cmax[2]));
    return `rgb(${r}, ${g}, ${b})`;
}

function handleMouseOver(d) {
    d3.select(this)
        .attr('x', squareXPos(d) - dim / 2)
        .attr('y', squareYPos(d) - dim / 2)
        .attr('width', dim * 2)
        .attr('height', dim * 2);
}

function handleMouseOut(d) {
    d3.select(this)
        .attr('x', squareXPos(d))
        .attr('y', squareYPos(d))
        .attr('width', dim)
        .attr('height', dim);
}
