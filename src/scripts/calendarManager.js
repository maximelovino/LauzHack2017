$(document).ready(function () {
    tasks.forEach(function (item, index) {

        let repo = null;
        let issue = null;
        repos.forEach(function (rep) {
            rep.issues.forEach(function (i) {
                if (i.id === item.issue_id) {
                    repo = rep;
                    issue = i;
                }
            });
        });

        if (repo != null && issue != null) {
            evts.push({
                repo: repo.repo.name,
                title: repo.repo.name + "/" + issue.title,
                stick: true,
                start: moment(item.start),
                end: moment(item.end),
                issue_id: parseInt(item.issue_id),
                issue_url: issue.html_url,
                duration: moment(item.end).subtract(item.start),
                backgroundColor: issue.labels.length === 0? '#00BCD4' : '#'+issue.labels[0].color,
            });
        }
    });

    /* initialize the external events
    -----------------------------------------------------------------*/

    $('#external-events .mdl-navigation__link.ui-draggable.ui-draggable-handle').each(function () {
        var repo = $(this).prevAll('.mdl-list__item:first').contents().filter(function (a) {
            return a === 1;
        }).text();
        var name = $(this).contents().filter(function (a) {
            return a === 1;
        }).text();

        // store data so the calendar knows to render an event upon drop
        $(this).data('event', {
            issue_id: parseInt($(this).data('id')),
            issue_url: $(this).data('git_url'),
            duration: moment('2:00:00'),
            title: repo + "/" + name, // use the element's text as the event title
            stick: true, // maintain when user navigates (see docs on the renderEvent method)
            backgroundColor: $(this).data('color'),
        });
        //$(this).data('repo', repo);
        //$(this).data('name', name);

        // make the event draggable using jQuery UI
        $(this).draggable({
            helper: 'clone',
            scroll: false,
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
            right: 'agendaWeek,agendaDay'
        },
        firstDay: moment().day(),
        slotLabelFormat: 'H:mm', // uppercase H for 24-hour clock
        defaultView: 'agendaWeek',
        slotDuration: '00:15:00',
        allDaySlot: false,
        timeFormat: 'H:mm',
        firstHour: '06:00:00',
        minTime: userFromDB.min,
        maxTime: userFromDB.max,
        eventOverlap: false,
        contentHeight: "auto",
        events: evts,
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar
        eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
            console.log("rezise");
            console.log(event);
            console.log(delta);
            let issue_id = parseInt(event.issue_id);
            let start = event.start.format('YYYY-MM-DD HH:mm:ss');
            let end = event.end.format('YYYY-MM-DD HH:mm:ss');
            event.duration = moment(end).subtract(start);
            console.log("duration update");
            console.log(event);
            console.log(
                {
                    issue_id: issue_id,
                    old_start: start,
                    start: start,
                    end: end
                });
            $.ajax({
                url: "/work/",
                type: 'PUT',
                data: {
                    issue_id: issue_id,
                    old_start: start,
                    start: start,
                    end: end
                }

            })
                .done(function () {
                    console.log("success");
                })
                .fail(function () {
                    alert("error");
                })
                .always(function () {
                    console.log("complete");
                });
        },
        eventDrop: function (event, delta, revertFunc, jsEvent, ui, view) {
            console.log("drag");
            console.log(event);
            console.log(delta);
            let issue_id = parseInt(event.issue_id);
            let old_start = moment(event.start).subtract(delta).format('YYYY-MM-DD HH:mm:ss');
            let start = event.start.format('YYYY-MM-DD HH:mm:ss');
            let end = moment(event.start).add(event.duration).format('YYYY-MM-DD HH:mm:ss');
            console.log(
                {
                    issue_id: issue_id,
                    old_start: old_start,
                    start: start,
                    end: end
                });
            $.ajax({
                url: "/work/",
                type: 'PUT',
                data: {
                    issue_id: issue_id,
                    old_start: old_start,
                    start: start,
                    end: end
                }

            })
                .done(function () {
                    console.log("success");
                })
                .fail(function () {
                    alert("error");
                })
                .always(function () {
                    console.log("complete");
                });
        },
        drop: function (date, jsEvent, ui, resourceId) {
            let id = $(this).data('id');
            console.log(id);
            let start = date.format('YYYY-MM-DD HH:mm:ss');
            console.log(start);
            let end = date.clone().add(2, 'hours').format('YYYY-MM-DD HH:mm:ss');
            console.log(end);
            $.ajax({
                url: "/work",
                type: 'POST',
                data: {
                    issue_id: id,
                    start: start,
                    end: end
                }

            })
                .done(function () {
                    console.log("success");
                })
                .fail(function () {
                    alert("error");
                })
                .always(function () {
                    console.log("complete");
                });
        },
        eventRender: function (event, element) {
            element.find('.fc-bg').wrap(`<a class="gitLink" href=${event.issue_url} target="_blank"></a>`);
            element.find('.fc-title').wrap(`<a class="gitLink" href=${event.issue_url} target="_blank"></a>`);
            element.find('.fc-content').prepend("<i class=\"material-icons closeon\">close</i>");
            element.find(".closeon").click(function () {
                console.log(event);
                $.ajax({
                    url: "/work",
                    type: 'DELETE',
                    data: {
                        issue_id: event.issue_id,
                        start: event.start.format('YYYY-MM-DD HH:mm:ss')
                    }

                })
                    .done(function () {
                        console.log("success");
                    })
                    .fail(function () {
                        alert("error");
                    })
                    .always(function () {
                        console.log("complete");
                    });

                $('#calendar').fullCalendar('removeEvents', event._id);

            });
        }
    });

    $('.fc-toolbar').find('.fc-button').each(function () {
        if ($(this).text() === "today") {
            $(this).attr('class', 'fc-button fc-today-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect');
        } else {
            $(this).attr('class', 'fc-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect');
        }
    });

    $('.fc-center h2').css('color', '#757575');

});