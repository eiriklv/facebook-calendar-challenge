var layOutDay = (function() {
    
    'use strict';

    var selector = 'scheduler';

    /**
     * Render a single event to HTML.
     * @param  {number} start - event start time at number of minutes past 9AM.
     * @param  {number} end - event end time at number of minutes past 9AM.
     * @param  {number} offset - left edge / column offset for the event.
     * @param  {number} width - width of the event in percentage of the total available width.
     * @return {string} the HMTL string representation of the event.
     */
    function renderEvent(start, end, offset, width) {
        var style = [
            'top: ' + start + 'px;',
            'left: ' + offset + '%;',
            'height: ' + (end - start) + 'px;',
            'width: ' + width + '%"'
        ].join('');

        return [
            '<div class="event" style="' + style + '">',
            '   <div class="content">',
            '       <div class="inner-content">',
            '           <span class="event-title">Sample Item</span>',
            '           <span class="event-location">Sample Location</span>',
            '       </div>',
            '   </div>',
            '</div>'
        ].join('');
    }

    /**
     * Render an a set of events to HTML and append to document.
     * @param {number} blocks - a collection of blocks of consecutive ovelapping events
     */
    function renderLayout(blocks) {
        var calendarElement = document.getElementById(selector),
            html = [],
            width,
            offset;

        calendarElement.innerHTML = '';

        blocks.forEach(function(block) {
            width = 100 / (block.length);

            block.forEach(function(column, index) {
                offset = ((index * width) / 100) * 100;

                column.forEach(function(event) {
                    html.push(renderEvent(event.start, event.end, offset, width));
                });
            });
        });

        calendarElement.innerHTML = html.join('');
    }

    /**
     * Generate an array representation of the layout where:
     * - each element (called block) is an array of columns
     * - each column is an array of event objects
     *
     * All consecutively overlapping events are added to the
     * same block. Events are placed in columns, from left to right.
     * 
     * @param  {array} events - an array of event objects
     * @return {array} - the layout array structure
     */
    function generateLayout(events) {
        var blocks = [],
            sortedEvents = sortByProp(events, 'start'),
            overlaps,
            placed,
            lastBlock;

        sortedEvents.forEach(function(event) {
            if (blocks.length === 0) {
                return blocks.push([[event]]);
            }

            lastBlock = blocks[blocks.length - 1];

            overlaps = lastBlock.some(function(column) {
                return (event.start < column[column.length - 1].end);
            });

            if (!overlaps) {
                return blocks.push([[event]]);
            }

            placed = lastBlock.some(function(column) {
                if (event.start >= column[column.length - 1].end) {
                    return !!column.push(event);
                }
            });

            if (!placed) {
                return lastBlock.push([event]);
            }
        });

        return blocks;
    }

    /**
     * Sort an array of event objects without side-effects (object ref's still apply ofc)
     * @param  {number} array - the array that should be sorted
     * @param  {string} prop - what object property to sort by
     * @param  {boolean} desc - sorts ascending by default (false)
     * @return {array} - sorted array
     */
    function sortByProp(array, prop, desc) {
        return array.slice().sort(function (a, b) {
            return desc ? (a[prop] + b[prop]) : (a[prop] - b[prop]);
        });
    }

    /**
     * Lay events out in the document
     * @param  {array} events - array of event objects
     */
    return function(events) {
        renderLayout(generateLayout(events || []));
    };
}());
