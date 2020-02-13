const d3 = require('d3');
const events_per_day_2019 = require('../queries/events_per_day_2019_org_union_sorted_day.csv');

let sqDataset = [];
let sqDatasetRepos = [];
let sqDatasetUsernames = [];

let lnDataset = sqDataset;

d3.csv(events_per_day_2019, d => {
    sqDataset.push([+d.day_of_year, +d.week_, +d.day_of_week, +d.event_count, +d.month_, +d.day_of_month, +d.quarter_, +d.year_, +d.org_ct, +d.ind_ct, +d.repo_watch_event_count, +d.user_event_count]);
    sqDatasetRepos.push(d.repo);
    sqDatasetUsernames.push(d.username);
}).then(d => {
    // preprocessing
    getSqStats();
    getLnStats();

    title();

    squareplot();
    sqPltCaption();

    // scatterplot();

    evtctStatsTitle();
    evtctStats();

    repoStatsTitle();
    repoStats();

    userStatsTitle();
    userStats();
});

let sqMinEvtCt, sqMaxEvtCt;
let sqMinWk, sqMaxWk;
let sqMinMonth, sqMaxMonth;

let sqDim, sqPad;
let sqN, sqM;
let sqZoomInDur, sqZoomOutDur;
let sqLabelSize;
let sqPltWidth, sqPltHeight;

let sqFillExp = 2;
let sqFillColors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

let squares;

function getSqStats() {

    sqMinEvtCt = d3.min(sqDataset, d => d[3]);
    sqMaxEvtCt = d3.max(sqDataset, d => d[3]);
    sqMinWk = d3.min(sqDataset, d => d[1]);
    sqMaxWk = d3.max(sqDataset, d => d[1]);
    sqMinMonth = d3.min(sqDataset, d => d[4]);
    sqMaxMonth = d3.max(sqDataset, d => d[4]);

    // square dimensions
    sqDim = 12
    sqPad = 4
    // square counts
    sqN = sqMaxWk - sqMinWk + 1;
    sqM = 7
    // square size transition timings
    sqZoomInDur = 100  // ms
    sqZoomOutDur = 100
    // circle transition timings
    cirZoomInDur = 50
    cirSize = 1.5
    cirZoomSize = 2.5
    // label properties
    sqLabelSize = sqDim
    sqLabelFadeInDur = 200
    sqLabelFadeOutDur = sqLabelFadeInDur
    sqLabelOpacity = 0.6
    // square plot svg dimensions
    sqPltWidth = sqPad + 3 * sqLabelSize + sqPad + (sqDim + sqPad) * (sqN + sqMaxMonth - sqMinMonth + 1);  // 11 is no. months
    sqPltHeight = sqPad + sqLabelSize + sqPad + (sqDim + sqPad) * sqM + sqPad + sqLabelSize + sqPad;

}

var selectBoxX = -1;
var selectBoxY = -1;
var inSelect = false;


function title() {
    d3
    .select('#title')
    .style('width', sqPltWidth * 3 / 4 + 'px')
}

function sqPltCaption() {
    caption = d3
        .select('body')
        .append('div')
        .attr('id', 'sqpltcaption')

    caption
        .style('width', sqPltWidth * 3 / 4 + 'px')
        .append('p')
        .text('Total GitHub event counts are plotted over the past year, \
        with darker colors indicating more events. Click and drag on squares \
        to select time ranges. Shift-click to combine selections. Click anywhere \
        on the graphic to reset the selection. Summary statistics will update \
        below, according to the selected time range.')
}

function evtctStatsTitle() {
    title = d3
        .select('body')
        .append('div')
        .attr('class', 'statsTitle')

    title
        .style('width', sqPltWidth * 3 / 4 + 'px')
        .append('h2')
        .text('ORG-OWNED VS. INDIVIDUALLY-OWNED REPO EVENTS')
}

function repoStatsTitle() {
    title = d3
        .select('body')
        .append('div')
        .attr('class', 'statsTitle')
        
    title.append('hr')
    
    title
        .style('width', sqPltWidth * 3 / 4 + 'px')
        .append('h2')
        .text('TOP REPO')
}

function userStatsTitle() {
    title = d3
        .select('body')
        .append('div')
        .attr('class', 'statsTitle')
        
    title.append('hr')
    
    title
        .style('width', sqPltWidth * 3 / 4 + 'px')
        .append('h2')
        .text('TOP USER')
}

function clearBoxSelection() {
    d3.selectAll('.selected')
                .classed('selected', false)
                .transition()
                .duration(sqZoomInDur)
                .attr('x', d => squareXPos(d))
                .attr('y', d => squareYPos(d))
                .attr('width', sqDim)
                .attr('height', sqDim)
                .style('stroke', 'none');
}

function squareplot() {

    let plt = d3
        .select('body')
        .append('svg')
        .attr('id', 'squareplot')
        .attr('width', sqPltWidth)
        .attr('height', sqPltHeight);

    addEvents();

    plt
        .append('text')
        .classed('daylabel', true)
        .attr('x', sqPad + sqPltWidth / 8)
        .attr('y', sqPltHeight - sqPad)

    // squares
    squares = plt.selectAll('rect')
        .data(sqDataset)
        .enter()
        .append('rect')
        .attr('x', d => squareXPos(d))
        .attr('y', d => squareYPos(d))
        .attr('width', sqDim)
        .attr('height', sqDim)
        .attr('fill', d => squareFill(d))
        .on('click', d => console.log(d))
        .on('mouseover', d => {
            plt.select('.daylabel')
                .transition()
                .duration(sqLabelFadeInDur)
                .style('fill-opacity', sqLabelOpacity)
                .text(dayOfMonthLabel(d))
        })
        .on('mouseout', () => {
            plt.select('.daylabel')
                .transition()
                .duration(sqLabelFadeOutDur)
                .style('fill-opacity', 0)
        })

    // month labels
    plt
        .selectAll('text')
        .data(sqDataset)
        .enter()
        .append('text')
        .text(d => sqMonthLabel(d))
        .attr('x', d => squareXPos(d))
        .attr('y', sqLabelSize);

    // day labels
    plt
        .append('text').text('Mon').attr('x', sqPad).attr('y', sqLabelSize + squareYPos([0, 0, 2, 0, 0, 0, 0, 0]));
    plt
        .append('text').text('Wed').attr('x', sqPad).attr('y', sqLabelSize + squareYPos([0, 0, 4, 0, 0, 0, 0, 0]));
    plt
        .append('text').text('Fri').attr('x', sqPad).attr('y', sqLabelSize + squareYPos([0, 0, 6, 0, 0, 0, 0, 0]));


    legend = plt.append('g')
        .attr('transform', `translate(${sqPltWidth * 6 / 8}, ${sqPltHeight - sqPad})`)

    // legend
    legend
        .append('text')
        .text('less events')
        .attr('x', -2 * sqPad)
        .attr('text-anchor', 'end');

    legend
        .append('text')
        .text('more events')
        .attr('x', 2 * sqPad + 5 * (sqDim + sqPad) + sqPad)
    
    legend.selectAll('rect')
        .data(sqFillColors)
        .enter()
        .append('rect')
        .attr('x', (d, i) => sqPad + i * (sqDim + sqPad))
        .attr('y', -sqLabelSize)
        .attr('width', sqDim)
        .attr('height', sqDim)
        .attr('fill', d => d)
}

function addEvents() {
    d3.select('#squareplot')
    .on('mousedown', function() {
        if (!d3.event.shiftKey) {
            // clear all selected boxes
            clearBoxSelection();
            redrawScatterPlot();
        }

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

        d3.selectAll('#squareplot>rect').each(function(d, i) {
            // if in boundaries
            if (d3.select(this).classed('selected')) {
                return;
            }
            if(squareXPos(d) <= Math.max(selectBoxX, curX) && Math.min(curX, selectBoxX) <= squareXPos(d) + sqDim &&
                    squareYPos(d) <= Math.max(selectBoxY, curY) && Math.min(curY, selectBoxY) <=  squareYPos(d) + sqDim) {
                // already selected
                if (d3.select(this).classed('selecting')) {
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
                    .style('stroke', 'orange')
                    .style('stroke-weight', sqDim / 4 + "px")
                    .style('style-dasharray', '5, 5');
                d3.select(this).classed('selecting', true);
            } else {
                // deselect it
                d3.select(this).transition()
                    .duration(sqZoomInDur)
                    .attr('x', squareXPos(d))
                    .attr('y', squareYPos(d))
                    .attr('width', sqDim)
                    .attr('height', sqDim)
                    .style('stroke', 'none');
                d3.select(this).classed('selecting', false);
            }
        });
        highlightSelectedScatterPlot();

    }).on('mouseup', function() {
        d3.selectAll('.selecting').classed('selected', true).classed('selecting', false);
        inSelect = false;
        redrawEventCountStats();
        redrawRepoStats();
        redrawUserStats();
    });
}

function highlightSelectedScatterPlot() {
    d3.selectAll('g circle')
        .transition()
        .duration(cirZoomInDur)
        .style('fill', (d, i) => checkIfCircleSelected(d, i) ? "orange": sqFillColors[4])
        .attr('r', (d, i) => checkIfCircleSelected(d, i) ? cirZoomSize: cirSize);
}

function checkIfCircleSelected(d, i) {
    return squares._groups[0][i].className.baseVal == 'selected' ||
        squares._groups[0][i].className.baseVal == 'selecting';
}

function squareXPos(d) {
    return sqPad + 3 * sqLabelSize + sqPad + (d[1] - sqMinWk + d[4] - sqMinMonth) * (sqDim + sqPad);
}

function squareYPos(d) {
    return sqPad + sqLabelSize + sqPad + (d[2] - 1) * (sqDim + sqPad);  // day of week is [1,7] -> [0,6]
}

function squareFill(d) {

    const sqFillScale = d3
        .scaleQuantize()
        .domain([sqMinEvtCt ** sqFillExp, sqMaxEvtCt ** sqFillExp])
        .range(sqFillColors);

    return sqFillScale(d[3] ** sqFillExp)
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function sqMonthLabel(d) {
    return d[5] == 8 ? months[d[4]-1] : '';
}

const daySuffix = ['st', 'nd', 'rd', 'th']

function dayOfMonthLabel(d) {
    // return d
    return `${months[d[4] - 1]} ${d[5]}${(d[5] % 10 == 0) || (d[5] >= 11) && (d[5] <= 19) ? 'th' : daySuffix[Math.min(3, d[5] % 10 - 1)]} ${d[7]}`;
}

d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
};

let lnMinDay, lnMaxDay;

let lnPltWidth, lnPltHeight;
let lnPltPad;

let lnXMap, lnYMap;

function getLnStats() {

    lnMinDay = d3.min(lnDataset, d => d[0]);
    lnMaxDay = d3.max(lnDataset, d => d[0]);

    // line plot svg dimensions
    lnPltWidth = sqPltWidth;
    lnPltHeight = sqPltHeight / 2;

    lnPltPad = sqPad;

    // x axis data map
    lnXMap = d3.scaleLinear()
        .domain([lnMinDay, lnMaxDay])
        .range([0 + lnPltPad, lnPltWidth - lnPltPad]);

    // y axis data map
    lnYMap = d3.scaleLinear()
        .domain([d3.min(lnDataset, d => d[3]), d3.max(lnDataset, d => d[3])])
        .range([lnPltHeight - lnPltPad, 0 + lnPltPad]);
}

function scatterplot() {
    // make svg
    d3.select('body')
        .append('svg')
        .attr('width', lnPltWidth)
        .attr('height', lnPltHeight)
        .attr('align', 'center')
        .append('g')
        .attr('id', 'scatter');

    redrawScatterPlot();
}

function redrawScatterPlot() {
    // scatter plot
    d3.selectAll("#scatter circle").remove();
    d3.selectAll('#scatter')
        .selectAll('dot')
        .data(lnDataset)
        .enter()
        .append('circle')
            .attr('cx', d => lnXMap(d[0]))
            .attr('cy', d => lnYMap(d[3]))
            .attr('r', cirSize)
            .style('fill', sqFillColors[4]);
}

let barWidth, barHeight;
let barDuration = 400;
let barEase = d3.easeExp

const barLabelPad = 12
const barLabelSize = 12

let org_pct, ind_pct;
let org_ct, ind_ct;

let tot_glob_ct, org_glob_ct, ind_glob_ct

function evtctStats() {

    tot_glob_ct = d3.mean(sqDataset, d => d[3])
    org_glob_ct = d3.mean(sqDataset, d => d[8])
    ind_glob_ct = d3.mean(sqDataset, d => d[9])

    barWidth = sqPltWidth * 3 / 4;
    barHeight = barLabelPad + 2 * (barLabelSize + barLabelPad);

    let svg = d3
        .select('body')
        .append('svg')
        .attr('id', 'eventcountstats')
        .attr('width', barWidth)
        .attr('height', barHeight);

    let midpoint = barWidth / 2;

    svg
        .append('rect')
        .attr('id', 'org_rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', midpoint)
        .attr('height', barHeight)
        .attr('fill', '#305da1');

    svg
        .append('rect')
        .attr('id', 'ind_rect')
        .attr('x', midpoint)
        .attr('y', 0)
        .attr('width', barWidth - midpoint)
        .attr('height', barHeight)
        .attr('fill', sqFillColors[2]);

    svg
        .append('text')
        .attr('id', 'org_label')
        .attr('x', barLabelPad)
        .attr('y', barLabelPad + barLabelSize)
        .attr('fill', 'white')
        .text('ORG')
        .style('font-size', barLabelSize + 'pt');
    svg
        .append('text')
        .attr('id', 'ind_label')
        .attr('x', barWidth - barLabelPad)
        .attr('y', barLabelPad + barLabelSize)
        .attr('text-anchor', 'end')
        .attr('fill', 'white')
        .text('IND')
        .style('font-size', barLabelSize + 'pt');

    org_pct = 50;
    svg.append('text')
        .attr('id', 'org_pct')
        .attr('x', midpoint - barLabelPad)
        .attr('y', barHeight - barLabelPad)
        .attr('text-anchor', 'end')
        .attr('fill', 'white')
        .text(org_pct.toFixed(0))
        .style('font-size', 2 * barLabelSize + barLabelPad + 'pt');

    ind_pct = 50;
    svg.append('text')
        .attr('id', 'ind_pct')
        .attr('x', midpoint + barLabelPad)
        .attr('y', barHeight - barLabelPad)
        .attr('fill', 'white')
        .text(ind_pct.toFixed(0) + '%')
        .style('font-size', 2 * barLabelSize + barLabelPad + 'pt');

    org_ct = 0
    svg
        .append('text')
        .attr('id', 'org_evt_ct')
        .attr('x', barLabelPad)
        .attr('y', barHeight - barLabelPad)
        .attr('fill', 'white')
        .text(org_ct)
        .style('font-size', barLabelSize + 'pt');
    ind_ct = 0
    svg
        .append('text')
        .attr('id', 'ind_evt_ct')
        .attr('x', barWidth - barLabelPad)
        .attr('y', barHeight - barLabelPad)
        .attr('text-anchor', 'end')
        .attr('fill', 'white')
        .text(ind_ct)
        .style('font-size', barLabelSize + 'pt');

    redrawEventCountStats();
}

function redrawEventCountStats() {

    let total, org, ind;

    if (d3.selectAll('.selected')._groups[0].length == 0) {
        // global average
        total = tot_glob_ct;
        org = org_glob_ct;
        ind = ind_glob_ct;
    } else {
        // selected average
        total = d3.mean(d3.selectAll('.selected').data(), d => d[3])
        org = d3.mean(d3.selectAll('.selected').data(), d => d[8])
        ind = d3.mean(d3.selectAll('.selected').data(), d => d[9])
    }

    let midpoint = barWidth * org / total;
    org_pct_new = org / total * 100;
    ind_pct_new = ind / total * 100;

    d3.select('#org_rect')
        .transition()
        .duration(barDuration)
        .ease(barEase)
        .attr('width', midpoint)
    
    d3.select('#ind_rect')
        .transition()
        .duration(barDuration)
        .ease(barEase)
        .attr('x', midpoint)
        .attr('width', barWidth - midpoint)

    d3.select('#org_pct')
        .transition()
        .duration(barDuration)
        .ease(barEase)
        .textTween(() => {
            const i = d3.interpolate(org_pct, org_pct_new);
            return t => { return `${(org_pct = i(t)).toFixed(0)}`; }
        })
        .attr('x', midpoint - barLabelPad);
    d3.select('#ind_pct')
        .transition()
        .duration(barDuration)
        .ease(barEase)
        .textTween(() => {
            const i = d3.interpolate(ind_pct, ind_pct_new);
            return t => { return `${(ind_pct = i(t)).toFixed(0)}`; }
        })
        .attr('x', midpoint + barLabelPad);

    d3.select('#org_evt_ct')
        .transition()
        .duration(barDuration)
        .ease(barEase)
        .textTween(() => {
            const i = d3.interpolate(org_ct, org);
            return t => { return `${format(org_ct = i(t))}`; }
        })
    d3.select('#ind_evt_ct')
        .transition()
        .duration(barDuration)
        .ease(barEase)
        .textTween(() => {
            const i = d3.interpolate(ind_ct, ind);
            return t => { return `${format(ind_ct = i(t))}`; }
        })
}

format = d3.format(".3s")

let maxRepoCtGlob, maxRepoGlob;

function repoStats() {

    maxRepoCtGlob = d3.max(sqDataset, d => d[10])
    maxRepoGlob = sqDatasetRepos[d3.maxIndex(sqDataset, d => d[10])]

    let div = d3
        .select('body')
        .append('div')
        .attr('id', 'repostats')
        .style('width', barWidth + 'px')

    div.append('a')
    div.append('p')

    redrawRepoStats();
}

function redrawRepoStats() {

    let maxRepoCt, maxRepo;

    if (d3.selectAll('.selected')._groups[0].length == 0) {
        // global average
        maxRepoCt = maxRepoCtGlob;
        maxRepo = maxRepoGlob;
    } else {
        // selected average
        maxRepoCt = d3.max(d3.selectAll('.selected').data(), d => d[10]);
        maxRepo = sqDatasetRepos[sqindexof(maxRepoCt, 10)];
    }

    d3
        .select('#repostats>a')
        .attr('href', 'https://www.github.com/' + maxRepo)
        .text(maxRepo);

    d3
        .select('#repostats>p')
        .text(`${format(maxRepoCt)} stars`);
}

let maxUserCtGlob, maxUserGlob;

function userStats() {

    maxUserCtGlob = d3.max(sqDataset, d => d[11])
    maxUserGlob = sqDatasetUsernames[d3.maxIndex(sqDataset, d => d[11])]

    let div = d3
        .select('body')
        .append('div')
        .attr('id', 'userstats')
        .style('width', barWidth + 'px')

    div.append('a')
    div.append('p')

    redrawUserStats();
}

function redrawUserStats() {

    let maxUserCt, maxUser;

    if (d3.selectAll('.selected')._groups[0].length == 0) {
        // global average
        maxUserCt = maxUserCtGlob;
        maxUser = maxUserGlob;
    } else {
        // selected average
        maxUserCt = d3.max(d3.selectAll('.selected').data(), d => d[11]);
        maxUser = sqDatasetUsernames[sqindexof(maxUserCt, 11)];
    }

    d3
        .select('#userstats>a')
        .attr('href', 'https://www.github.com/' + maxUser)
        .text(maxUser);

    d3
        .select('#userstats>p')
        .text(`${format(maxUserCt)} commit comments`);
}

function sqindexof(d, k) {
    for (let i = 0; i < sqDataset.length; ++i) {
        if (sqDataset[i][k] == d) {
            return i;
        }
    }
    return -1;
}
