$(document).ready(function() {
  var events = [];
  var calendar = $('#calendar').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    defaultView: 'month',
    editable: false,
    events: events,
    timeFormat: 'h:mm a',
    eventClick: function(event) {
      $('#booking-date').text(moment(event.start).format('MMMM Do YYYY'));
      $('#booking-time').text(moment(event.start).format('h:mm a') + ' - ' + moment(event.end).format('h:mm a'));
      $('#booking-description').text(event.title);
      $('#booking-modal').modal('show');
    }

  });

  $('#booking-form').submit(function(event) {
    event.preventDefault();
    var eventData = {
      title: $('#event-description').val(),
      start: moment($('#event-date').val() + ' ' + $('#start-time').val()).format('YYYY-MM-DD HH:mm:ss'),
      end: moment($('#event-date').val() + ' ' + $('#end-time').val()).format('YYYY-MM-DD HH:mm:ss')
    };
  console.log(eventData);
    var database = firebase.database();
    var eventsRef = database.ref('events');
  
    // Check for overlapping events
    eventsRef.once('value', function(snapshot) {
      var overlappingEvents = Object.values(snapshot.val() || {}).filter(function(event) {
        return (
          (event.start <= eventData.start && event.end >= eventData.start) ||
          (event.start <= eventData.end && event.end >= eventData.end) ||
          (event.start >= eventData.start && event.end <= eventData.end)
        );
      });

      eventsRef.on('child_added', function(snapshot) {
        var event = snapshot.val();
        events.push(event);
        calendar.fullCalendar('renderEvent', event, true);
      });
      
  
      if (overlappingEvents.length === 0) {
        // Save event data to Firebase
        eventsRef.push(eventData, function(error) {
          if (error) {
            console.error('Error saving event:', error);
          } else {
            // Reset form and close modal
            calendar.fullCalendar('renderEvent', eventData, true);
            $('#booking-modal').modal('hide');
            $('#booking-form')[0].reset();
            console.log('Booked Successfully!')
          }
        });
      } else {
        alert('The selected time slot is already booked. Please choose another slot.');
      }
    });
  });
});
