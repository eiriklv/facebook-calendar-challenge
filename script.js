var layOutDay = (function() {
    var selector = 'scheduler';

    function renderEvent(start, end, offset, width) {
        return [
            '<div class="event" style="top: ' + start + 'px; left: ' + offset + '%; height: ' + (end - start) + 'px; width: ' + width + '%">',
                '<div class="content">',
                    '<div class="inner-content">',
                        '<span class="event-title">Sample Item</span>',
                        '<span class="event-location">Sample Location</span>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('');
    }

    function renderLayout(blocks) {
        var calendarElement = document.getElementById(selector);
        var width, column, offset;

        calendarElement.innerHTML = '';

        blocks.forEach(function(block) {
            width = 100 / (block.length);

            block.forEach(function(column, index) {
                offset = ((index * width) / 100) * 100;

                column.forEach(function(eventElement) {
                    calendarElement.innerHTML += renderEvent(eventElement.start, eventElement.end, offset, width);
                });
            });
        });
    };

    function generateBlocks(events) {
        var blocks = [];
        var sortedEvents = sort(events, 'start');

        sortedEvents.forEach(function(event) {
            var overlaps = false;
            var placed = false;
            var lastBlock = blocks[blocks.length - 1];

            if (blocks.length === 0) {
                console.log('adding first block and the first column of the first block');
                blocks[0] = []; // create the first block
                blocks[0][0] = []; // create the first column of the first block
                blocks[0][0].push(event);
            } else {
                console.log('adding another event to either existing block, in existing or new columns, or in new block and new column');

                // first check if it overlaps with any of the columns in the last block
                lastBlock.forEach(function(column) {
                    if (!overlaps && (event.start < column[column.length - 1].end)) {
                        overlaps = true;
                    }
                });

                console.log(overlaps ? 'it overlaps' : 'it does not overlap');

                // if the event overlaps with the last block, try to place it in an existing column
                if (overlaps) {
                    lastBlock.forEach(function(column) {
                        if (!placed && (event.start > column[column.length - 1].end)) {
                            console.log('pushing to existing column');
                            column.push(event);
                            placed = true;
                        }
                    });

                    // if it could not be placed in an existing column - create an additional column and place it there
                    if (!placed) {
                        console.log('creating an additional column in existing block');
                        lastBlock[lastBlock.length] = [];
                        lastBlock[lastBlock.length - 1].push(event);
                        placed = true;
                    }
                    // if the element did not overlap - create a new block with a new column and place it there
                } else {
                    console.log('creating a new a new block with a new column');
                    blocks[blocks.length] = []; // the next block
                    blocks[blocks.length - 1][0] = []; // the first column of the first block
                    blocks[blocks.length - 1][0].push(event);
                }
            }
        });

        return blocks;
    }

    function sort(array, param, desc) {
        var arrayCopy = array.slice();

        arrayCopy.sort(function(a, b) {
            return desc ? (a[param] + b[param]) : (a[param] - b[param]);
        });

        return arrayCopy;
    }

    function layOutDay(events) {
        var blocks = generateBlocks(events);
        renderLayout(blocks);
    }

    return layOutDay;
}());
