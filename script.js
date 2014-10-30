var layOutDay = (function() {
    'use strict';

    var selector = 'scheduler';

    function renderEvent(start, end, offset, width) {
        return [
            '<div class="event" style="top: ' + start + 'px; left: ' + offset + '%; height: ' + (end - start) + 'px; width: ' + width + '%">',
            '   <div class="content">',
            '       <div class="inner-content">',
            '           <span class="event-title">Sample Item</span>',
            '           <span class="event-location">Sample Location</span>',
            '       </div>',
            '   </div>',
            '</div>'
        ].join('');
    }

    function renderLayout(blocks) {
        var calendarElement = document.getElementById(selector),
            width,
            offset;

        calendarElement.innerHTML = '';

        blocks.forEach(function(block) {
            width = 100 / (block.length);

            block.forEach(function(column, index) {
                offset = ((index * width) / 100) * 100;

                column.forEach(function(event) {
                    calendarElement.innerHTML += renderEvent(event.start, event.end, offset, width);
                });
            });
        });
    }

    function sortEvents(array, param, desc) {
        return array.slice().sort(function (a, b) {
            return desc ? (a[param] + b[param]) : (a[param] - b[param]);
        });
    }

    function generateLayout(events) {
        var blocks = [],
            sortedEvents = sortEvents(events, 'start'),
            overlaps,
            placed,
            lastBlock;

        sortedEvents.forEach(function(event) {
            if (blocks.length === 0) {
                return blocks.push([[event]]);
            }

            lastBlock = blocks[blocks.length - 1];

            overlaps = lastBlock.some(function(column) {
                return (event.start <= column[column.length - 1].end);
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

    return function(events) {
        renderLayout(generateLayout(events));
    };
}());
