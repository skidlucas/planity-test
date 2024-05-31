import React, { useEffect, useState } from 'react'
import { events } from './events'

// BUSINESS RULES
// Your code should render the events on a webpage in a container spanning the whole window.
// The top of the page represents 09:00 am. The bottom of the page represents 09:00 pm.
const START_TIME_IN_MINUTES = 9 * 60;
const END_TIME_IN_MINUTES = 21 * 60;
const PIXELS_PER_MINUTE = window.innerHeight / (END_TIME_IN_MINUTES - START_TIME_IN_MINUTES);

const getEventStartMinutes = (start) => {
    const [startHour, startMinute] = start.split(':').map(Number);

    return startHour * 60 + startMinute;
};

const computeEventPosition = (event) => {
    const startMinutes = getEventStartMinutes(event.start)
    const top = (startMinutes - START_TIME_IN_MINUTES) * PIXELS_PER_MINUTE;
    const height = event.duration * PIXELS_PER_MINUTE;

    return { top, height };
};

const groupOverlappingEvents = (events) => {
    const sortedEvents = events.slice().sort((a, b) => {
        const startA = getEventStartMinutes(a.start);
        const startB = getEventStartMinutes(b.start);

        return startA - startB || a.duration - b.duration;
    });

    const groups = [];
    for (let currentEvent of sortedEvents) {
        let eventAddedToGroup = false;

        for (let group of groups) {
            const overlaps = group.some(groupEvent => {
                const groupEventPosition = computeEventPosition(groupEvent);
                const currentEventPosition = computeEventPosition(currentEvent);

                // check if there is overlapping between the 2 events
                const noOverlap = (
                    groupEventPosition.top + groupEventPosition.height <= currentEventPosition.top ||
                    currentEventPosition.top + currentEventPosition.height <= groupEventPosition.top
                );

                return !noOverlap;
            })

            if (overlaps) {
                group.push(currentEvent);
                eventAddedToGroup = true;
                break;
            }
        }

        if (!eventAddedToGroup) {
            groups.push([currentEvent]);
        }
    }

    return groups;
};

const Calendar = () => {
    const [containerWidth, setContainerWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setContainerWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // first, we find the possible overlapping events and group them together
    const groups = groupOverlappingEvents(events);

    // then we render all events group by group
    const renderEventsOfAGroup = (group) => {
        const groupWidth = containerWidth / group.length;

        return group.map((event, index) => {
            const { top, height } = computeEventPosition(event);
            const left = groupWidth * index;

            return (
                <div
                    key={event.id}
                    className="event"
                    style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        width: `${groupWidth}px`,
                        left: `${left}px`,
                        position: 'absolute',
                        backgroundColor: '#8ebda4',
                        border: '1px solid #315441',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                    }}
                >
                    {event.id}
                </div>
            );
        });
    }

    return (
        <>
            {groups.map((group) => renderEventsOfAGroup(group))}
        </>
    );
};

export default Calendar;