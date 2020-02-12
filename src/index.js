const d3 = require('d3');
const events_per_day_2019 = require('../queries/events_per_day_2019_union_sorted.csv');

let sqdataset = [];
let sqMin, sqMax;

let lndataset = sqdataset;

d3.csv(events_per_day_2019, d => {
    sqdataset.push([+d.day_of_year, +d.week, +d.day_of_week, +d.event_count, new Date(d.datetime).getMonth()]);
}).then(d => {
    title();
    getSqMinMax();
    squareplot();
    lineplot();
});

// square dimensions
const sqDim = 12
const sqPad = 4
// square counts
const sqN = 53
const sqM = 7
// square size transition timings
const sqZoomInDur = 100  // ms
const sqZoomOutDur = sqZoomInDur
// label properties
const sqLabelSize = 12
// square plot svg dimensions
const sqPltWidth = sqPad + (sqDim + sqPad) * (sqN + 11)  // 11 is no. months
const sqPltHeight = sqPad + sqLabelSize + sqPad + (sqDim + sqPad) * sqM

var selectBoxX = -1;
var selectBoxY = -1;
var inSelect = false;


function title() {
    d3
    .select('#title')
    .style('width', sqPltWidth + 'px')
    .style('margin', 'auto');
}

function getSqMinMax() {
    sqMin = d3.min(sqdataset, d => d[3]);
    sqMax = d3.max(sqdataset, d => d[3]);
}

function squareplot() {

    let plt = d3
        .select('body')
        .append('svg')
        .attr('id', 'squareplot')
        .attr('width', sqPltWidth)
        .attr('height', sqPltHeight);

    d3.select('#squareplot')
        .on('mouseclick', function() {

        })
        .on('mousedown', function() {
            // clear all selected boxes
            d3.selectAll('.selected')
                .classed('selected', false)
                .transition()
                .duration(sqZoomInDur)
                .attr('x', d => squareXPos(d))
                .attr('y', d => squareYPos(d))
                .attr('width', sqDim)
                .attr('height', sqDim)
                .style('stroke', 'none');

            // start selection
            inSelect = true;
            var coords = d3.mouse(this);
            selectBoxX = coords[0];
            selectBoxY = coords[1];
        }).on('mousemove', function() {
            // if not in selection
            if(!inSelect) {
                return;
            }

            var coords = d3.mouse(this);
            var curX = coords[0];
            var curY = coords[1];

            d3.selectAll('svg>rect').each(function(d, i) {
                // if in boundaries
                if(squareXPos(d) <= Math.max(selectBoxX, curX) && Math.min(curX, selectBoxX) <= squareXPos(d) + sqDim &&
                        squareYPos(d) <= Math.max(selectBoxY, curY) && Math.min(curY, selectBoxY) <=  squareYPos(d) + sqDim) {
                    // already selected
                    if (d3.select(this).classed('selected')) {
                        return;
                    }

                    // not yet selected, select it

                    d3.select(this).moveToFront()
                        .transition()
                        .duration(sqZoomOutDur)
                        .attr('x', squareXPos(d) + sqDim / 8)
                        .attr('y', squareYPos(d) + sqDim / 8)
                        .attr('width', sqDim * 3 / 4)
                        .attr('height', sqDim * 3 / 4)
                        .style('stroke', 'gray')
                        .style('stroke-weight', sqDim / 4 + "px")
                        .style('style-dasharray', '5, 5');
                    d3.select(this).classed('selected', true);
                } else {
                    // deselect it
                    d3.select(this).transition()
                        .duration(sqZoomInDur)
                        .attr('x', squareXPos(d))
                        .attr('y', squareYPos(d))
                        .attr('width', sqDim)
                        .attr('height', sqDim)
                        .style('stroke', 'none');
                    d3.select(this).classed('selected', false);
                }
            });

        }).on('mouseup', function() {
            inSelect = false;
            console.log(d3.selectAll('.selected'));
        });

    // squares
    plt
        .selectAll('rect')
        .data(sqdataset)
        .enter()
        .append('rect')
        .attr('x', d => squareXPos(d))
        .attr('y', d => squareYPos(d))
        .attr('width', sqDim)
        .attr('height', sqDim)
        .attr('fill', d => squareFill(d))
        .on('click', function(d) {
            console.log(d);
        })
        // .on('mouseover', handleMouseOver)
        // .on('mouseout', handleMouseOut)


    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // month labels
    plt
        .selectAll('text')
        .data(months)
        .enter()
        .append('text')
        .text(d => d)
        .attr('x', (d, i) => i * 5.5 * (sqDim + sqPad))
        .attr('y', d => sqLabelSize)
        .attr('font-family', 'Roboto, sans-serif')
        .attr('font-weight', 300)
        .attr('font-size', '12pt')
        .attr('fill', 'lightgray')
        .style('user-select', 'none');
}

function squareXPos(d) {
    return sqPad + (d[1] + d[4]) * (sqDim + sqPad);  // week is [0,52]
}

function squareYPos(d) {
    return sqPad + 12 + sqPad + (d[2] - 1) * (sqDim + sqPad);  // day of week is [1,7] -> [0,6]
}

function squareFill(d) {
    const cmin = [230, 230, 230]
    const cmax = [229, 57, 53]

    // red channel data map
    const sqRFillScale = d3
        .scaleLinear()
        .domain([sqMin, sqMax])
        .range([cmin[0], cmax[0]]);

    // green channel data map
    const sqGFillScale = d3
        .scaleLinear()
        .domain([sqMin, sqMax])
        .range([cmin[1], cmax[1]]);

    // blue channel data map
    const sqBFillScale = d3
        .scaleLinear()
        .domain([sqMin, sqMax])
        .range([cmin[2], cmax[2]]);

    let r = Math.round(sqRFillScale(d[3]));
    let g = Math.round(sqGFillScale(d[3]));
    let b = Math.round(sqBFillScale(d[3]));
    return `rgb(${r}, ${g}, ${b})`;
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
};

// function handleMouseOver(d) {
//     d3.select(this)
//         .moveToFront()
//         .transition()
//         .duration(sqZoomInDur)
//         .attr('x', squareXPos(d) - sqDim / 2)
//         .attr('y', squareYPos(d) - sqDim / 2)
//         .attr('width', sqDim * 2)
//         .attr('height', sqDim * 2);
// }

// function handleMouseOut(d) {
//     d3.select(this)
//         .transition()
//         .duration(sqZoomOutDur)
//         .attr('x', squareXPos(d))
//         .attr('y', squareYPos(d))
//         .attr('width', sqDim)
//         .attr('height', sqDim);
// }

// line plot svg dimensions
const lnPltWidth = sqPltWidth
const lnPltHeight = sqPltHeight * 2

function lineplot() {

    let plt = d3
        .select('body')
        .append('svg')
        .attr('width', lnPltWidth)
        .attr('height', lnPltHeight)
        .attr('align', 'center');

    // x axis data map
    let x = d3.scaleLinear()
        .domain([1, 365])
        .range([0, lnPltWidth]);

    // y axis data map
    let y = d3.scaleLinear()
        .domain([d3.min(lndataset, d => d[3]), d3.max(lndataset, d => d[3])])
        .range([lnPltHeight, 0]);

    // path
    plt
        .append('path')
        .datum(lndataset)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
            .x(d => x(d[1] * 7 + d[2]))
            .y(d => y(d[3])));
}

