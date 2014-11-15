/**
 * Given a set of events, renders the events on a single day calendar with the following layout properties:
 * 1. No events visually overlap.
 * 2. If two events collide in time, they have the same width.
 * 3. An event utilized the maximum width available, but constraint 2) takes precedence over this constraint.
 *
 * @param {array} events - set of events to render
 */
var layOutDay = (function() {
    
    "use strict";

    /**
     * Render a single event to HTML.
     * @param  {number} start - event start time in number of minutes past 9AM.
     * @param  {number} end - event end time in number of minutes past 9AM.
     * @param  {number} offset - left edge / column offset in percentage for the event.
     * @param  {number} width - width of the event in percentage of the total available width.
     * @return {string} the HMTL string representation of the event.
     */
    function renderEventToHTML(start, end, offset, width) {
        var style = [
            'top: ' + start + 'px;',
            'left: ' + offset + '%;',
            'height: ' + (end - start) + 'px;',
            'width: ' + width + '%;'
        ].join('');

        // indented strings for readability only
        return [
            '<div class="event" style="' + style + '">',
            '   <div class="content">',
            '       <div class="inner-content">',
            '           <h3 class="event-title">Sample Item</h3>',
            '           <p class="event-location">Sample Location</p>',
            '       </div>',
            '   </div>',
            '</div>'
        ].join('');
    }

    /**
     * Render an a set of events to HTML.
     * @param {array} blocks - a collection of blocks of consecutive ovelapping events divided in columns
     */
    function renderLayoutToHTML(blocks) {
        var html = [];
        var width;
        var offset;

        blocks.forEach(function(block) {
            width = 100 / (block.length);

            block.forEach(function(column, index) {
                offset = ((index * width) / 100) * 100;

                column.forEach(function(event) {
                    html.push(renderEventToHTML(event.start, event.end, offset, width));
                });
            });
        });

        return html.join('');
    }

    /**
     * Generate an graph (array) representation of the layout where:
     * - each element (block) is an array of columns
     * - each column is an array of event objects
     *
     * All consecutively overlapping events are added to the
     * same block. Events are placed in columns, from left to right.
     * 
     * @param  {array} events - an array of event objects
     * @return {array} - the layout array structure
     */
    function generateLayoutGraph(events) {
        var blocks = [];
        var sortedEvents = sortByProp(events, 'start');
        var overlaps;
        var placed;
        var lastBlock;

        sortedEvents.forEach(function(event) {
            // if it's the first event
            // - place the event in a new column of a new block
            if (blocks.length === 0) {
                return blocks.push([[event]]);
            }

            lastBlock = blocks[blocks.length - 1];

            // evaluate if the event overlaps with any of the events of the last block
            overlaps = lastBlock.some(function(column) {
                return (event.start < column[column.length - 1].end);
            });

            // if the event doesn't overlap with the last block
            // - place the event in a new column of a new block
            if (!overlaps) {
                return blocks.push([[event]]);
            }

            // if the event overlaps with the last block
            // - try to place the event in an existing column of the last block
            placed = lastBlock.some(function(column) {
                if (event.start >= column[column.length - 1].end) {
                    return !!column.push(event);
                }
            });

            // if the event could not be placed in an existing column
            // - create a new column in the last block and place the event
            if (!placed) {
                return lastBlock.push([event]);
            }
        });

        return blocks;
    }

    /**
     * Sort an array of event objects without side-effects (object refs still apply ofc)
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
        var scheduleElement = document.getElementById('schedule');
        scheduleElement.innerHTML = renderLayoutToHTML(generateLayoutGraph(events || []));
    };
}());
