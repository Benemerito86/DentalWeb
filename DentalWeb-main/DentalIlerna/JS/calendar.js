document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const formContainer = document.getElementById('form-container');
  const mainContainer = document.getElementById('main-container');
  const appointmentForm = document.getElementById('appointment-form');
  const cancelButton = document.getElementById('cancel-button');

  const deleteContainer = document.createElement('div');
  deleteContainer.id = 'delete-container';
  deleteContainer.classList.add('hidden');
  deleteContainer.innerHTML = `
    <h2>Eliminar Cita</h2>
    <p id="event-details"></p>
    <button id="delete-event-button" class="fc-button">Eliminar</button>
    <button id="close-delete-button" class="fc-button">Cancelar</button>
  `;
  document.body.appendChild(deleteContainer);

  function toggleFormVisibility(show) {
    if (show) {
      formContainer.classList.remove('hidden');
      mainContainer.classList.add('form-visible');
    } else {
      formContainer.classList.add('hidden');
      mainContainer.classList.remove('form-visible');
      appointmentForm.reset();
    }
  }

  const blockedSlots = [
    { start: '11:30', end: '12:00' },
    { start: '18:00', end: '18:30' }
  ];

  const FullCalendar = window.FullCalendar;
  const calendar = new FullCalendar.Calendar(calendarEl, {
    timeZone: 'Europe/Madrid',
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridDay'
    },
    selectable: true,
    editable: false,
    slotDuration: '00:30:00',
    slotLabelInterval: '00:30:00',
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    slotMinTime: '08:30:00',
    slotMaxTime: '21:00:00',
    allDaySlot: false,
    dayMaxEvents: false,
    eventOverlap: true,
    slotEventOverlap: true,

    // Aquí cargamos las citas desde la BD y también ponemos franjas bloqueadas
    events: function (fetchInfo, successCallback, failureCallback) {
      fetch('http://localhost:3000/citas')
        .then(res => {
          if (!res.ok) throw new Error('Error al cargar las citas');
          return res.json();
        })
        .then(citas => {
          const events = [];

          // Añadir citas recibidas desde el servidor
          citas.forEach(cita => {
            events.push({
              id: cita.id,
              title: `${cita.nombre} (${cita.dni}) - ${cita.servicio}`, // Ajusta si tu servidor no envía title
              start: cita.inicio,
              end: cita.fin,
              allDay: false
            });
          });

          // Añadir franjas horarias bloqueadas para cada día
          let day = new Date(fetchInfo.start);
while (day < fetchInfo.end) {
  blockedSlots.forEach(slot => {
    const start = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      parseInt(slot.start.split(':')[0], 10),
      parseInt(slot.start.split(':')[1], 10)
    );

    const end = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      parseInt(slot.end.split(':')[0], 10),
      parseInt(slot.end.split(':')[1], 10)
    );

    events.push({
      start: start.toISOString(),
      end: end.toISOString(),
      display: 'background',
      color: '#f02f30'
    });
  });
  day.setDate(day.getDate() + 1);
}

          successCallback(events);
        })
        .catch(err => {
          console.error(err);
          failureCallback(err);
        });
    },

    dateClick: function (info) {
      if (calendar.view.type === 'dayGridMonth') {
        calendar.changeView('timeGridDay', info.dateStr);
      } else {
        const selectedStart = info.date;
        const selectedEnd = new Date(selectedStart.getTime() + 30 * 60000);

        const selectedTime = selectedStart.toTimeString().slice(0, 5);
        const isBlocked = blockedSlots.some(slot =>
          selectedTime >= slot.start && selectedTime < slot.end
        );

        if (isBlocked) {
          alert('No se pueden coger citas en este horario bloqueado.');
          return;
        }

        const eventsInSlot = calendar.getEvents().filter(event =>
          event.start.getTime() === selectedStart.getTime() && !event.allDay
        );

        if (eventsInSlot.length >= 4) {
          alert('Ya hay 4 citas en esta franja horaria. Por favor, selecciona otra hora.');
          return;
        }

        toggleFormVisibility(true);

        appointmentForm.onsubmit = function (e) {
          e.preventDefault();

          const cita = {
            nombre: document.getElementById('name').value,
            dni: document.getElementById('dni').value,
            mail: document.getElementById('email').value,
            telefono: document.getElementById('phone').value,
            servicio: document.getElementById('service').value,
            antecedentes: document.getElementById('medical-history').value,
            inicio: selectedStart.toISOString(),
            fin: selectedEnd.toISOString()
          };

          fetch('http://localhost:3000/add-cita', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cita)
          })
            .then(response => response.json())
            .then(data => {
              if (data.id) {
                calendar.addEvent({
                  id: data.id,
                  title: `${cita.nombre} (${cita.dni}) - ${cita.servicio}`,
                  start: cita.inicio,
                  end: cita.fin
                });
              }
              toggleFormVisibility(false);
            })
            .catch(err => {
              console.error('Error al guardar la cita:', err);
              alert('Error al guardar la cita');
            });
        };
      }
    },

    eventClick: function (info) {
      const event = info.event;

      deleteContainer.classList.remove('hidden');
      const adjustedDate = new Date(event.start.getTime() - 2 * 60 * 60 * 1000);
deleteContainer.querySelector('#event-details').textContent =
  `Cita de ${event.title} el ${adjustedDate.toLocaleString()}`;

      deleteContainer.querySelector('#delete-event-button').onclick = function () {
        event.remove();
        deleteContainer.classList.add('hidden');
      };

      deleteContainer.querySelector('#close-delete-button').onclick = function () {
        deleteContainer.classList.add('hidden');
      };
    }
  });

  document.addEventListener('click', function (e) {
    if (!formContainer.contains(e.target) &&
      !e.target.closest('.fc-event') &&
      !formContainer.classList.contains('hidden')) {
      toggleFormVisibility(false);
    }
  });

  cancelButton.addEventListener('click', function () {
    toggleFormVisibility(false);
  });

  toggleFormVisibility(false);
  calendar.render();

  function ajustarEventos() {
    const eventosPorHora = {};

    document.querySelectorAll('.fc-timegrid-event').forEach(evento => {
      const startAttr = evento.getAttribute('data-start');
      let startTime;
      if (startAttr) {
        startTime = startAttr;
      } else {
        const slot = evento.closest('.fc-timegrid-slot');
        startTime = slot ? slot.getAttribute('data-time') : '';
      }
      if (!startTime) return;

      if (!eventosPorHora[startTime]) eventosPorHora[startTime] = [];
      eventosPorHora[startTime].push(evento);
    });

    Object.values(eventosPorHora).forEach(eventos => {
      eventos.forEach((evento, idx) => {
        evento.style.width = '25%';
        evento.style.left = (idx * 25) + '%';
        evento.style.position = 'absolute';
        evento.style.margin = '0';
        evento.style.right = 'auto';
      });
    });
  }

  calendar.on('eventDidMount', function () {
    setTimeout(ajustarEventos, 0);
  });

  calendar.render();
  setTimeout(ajustarEventos, 0);
});
