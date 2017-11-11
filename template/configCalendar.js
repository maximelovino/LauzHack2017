
$(document).ready(function() {


    /* initialize the external events
    -----------------------------------------------------------------*/

    $('#external-events .mdl-navigation__link').each(function() {

        // store data so the calendar knows to render an event upon drop
        $(this).data('event', {
            title: $.trim($(this).text()), // use the element's text as the event title
            stick: true // maintain when user navigates (see docs on the renderEvent method)
        });

        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true,      // will cause the event to go back to its
            revertDuration: 0  //  original position after the drag
        });

    });


    /* initialize the calendar
    -----------------------------------------------------------------*/

    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        slotLabelFormat: 'H:mm', // uppercase H for 24-hour clock
        defaultView: 'agendaWeek',
        slotDuration: '00:15:00',
        allDaySlot: false,
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar
        eventResize: function(event, jsEvent, ui, view ){
            console.log("resize");
            console.log(event.start);
        },
        eventDrop: function(event, jsEvent, ui, view ){
            console.log("drag");
            console.log(event.start);
        },
        drop: function(date, jsEvent, ui, resourceId) {
            console.log(date);
            // is the "remove after drop" checkbox checked?
            if ($('#drop-remove').is(':checked')) {
                // if so, remove the element from the "Draggable Events" list
                $(this).remove();
            }
        }
    });


});