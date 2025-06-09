document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const formContainer = document.getElementById('form-container');
  const appointmentForm = document.getElementById('appointment-form');
  const cancelButton = document.getElementById('cancel-button');
  const deleteContainer = document.createElement('div'); // Contenedor para eliminar citas
  deleteContainer.id = 'delete-container';
  deleteContainer.classList.add('hidden');
  deleteContainer.innerHTML = `
      <h2>Eliminar Cita</h2>
      <p id="event-details"></p>
      <button id="delete-event-button" class="fc-button">Eliminar</button>
      <button id="close-delete-button" class="fc-button">Cancelar</button>
    `;
  document.body.appendChild(deleteContainer);

  // Horas visibles en el calendario
  const allowedTimes = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
    '11:50', '12:20', '12:50', '13:20', '13:50', '14:20',
    '14:50', '15:00', '15:30', '16:00', '16:30', '17:00',
    '17:30', '18:20', '18:50', '19:20', '19:50', '20:20'
  ];

  // Generar eventos de fondo para ocultar los intervalos no permitidos
  const hiddenSlots = [];
  let currentTime = '08:30';
  while (currentTime !== '21:00') {
    const nextTime = new Date(`1970-01-01T${currentTime}:00Z`);
    nextTime.setMinutes(nextTime.getMinutes() + 30);
    const formattedNextTime = nextTime.toISOString().slice(11, 16);

    if (!allowedTimes.includes(currentTime)) {
      hiddenSlots.push({
        start: `1970-01-01T${currentTime}:00`,
        end: `1970-01-01T${formattedNextTime}:00`,
        display: 'background',
        color: '#f0f0f0' // Color para ocultar los intervalos no permitidos
      });
    }

    currentTime = formattedNextTime;
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth', // Cambiar a la vista mensual por defecto
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridDay'
    },
    selectable: true,
    editable: true,
    slotDuration: '00:10:00',
    slotLabelInterval: '00:30:00',
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    slotMinTime: '08:30:00', // Hora de inicio del día
    slotMaxTime: '21:00:00', // Hora de fin del día
    allDaySlot: false,
    events: hiddenSlots, // Ocultar los intervalos no permitidos

    // Cambiar a la vista diaria al hacer clic en un día en la vista mensual
    dateClick: function (info) {
      if (calendar.view.type === 'dayGridMonth') {
        calendar.changeView('timeGridDay', info.dateStr); // Cambiar a la vista diaria
      }
    },

    // Selección en vista de agenda diaria
    dateClick: function (info) {
  if (calendar.view.type === 'dayGridMonth') {
    // Si estás en mes, cambia a día
    calendar.changeView('timeGridDay', info.dateStr);
  } else {
    // Si estás ya en vista diaria, abre el formulario directamente
    const selectedStart = info.date;
    const selectedEnd = new Date(selectedStart.getTime() + 30 * 60000); // 30 min

    const eventsInSlot = calendar.getEvents().filter(event =>
      event.start.getTime() === selectedStart.getTime() && !event.allDay
    );

    if (eventsInSlot.length >= 4) {
      alert('Ya hay 4 citas en esta franja horaria. Por favor, selecciona otra hora.');
      return;
    }

    formContainer.classList.remove('hidden');
    calendarEl.style.transform = 'translateX(-10%)';

    appointmentForm.onsubmit = function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const dni = document.getElementById('dni').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const service = document.getElementById('service').value;
      const medicalHistory = document.getElementById('medical-history').value;

      if (name && dni && email && phone && service) {
        calendar.addEvent({
          title: `${name} (${dni}) - ${service}`,
          start: selectedStart.toISOString(),
          end: selectedEnd.toISOString(),
          allDay: false,
          extendedProps: {
            email: email,
            phone: phone,
            service: service,
            medicalHistory: medicalHistory || 'Sin antecedentes médicos'
          }
        });
      }

      formContainer.classList.add('hidden');
      calendarEl.style.transform = 'translateX(0)';
      appointmentForm.reset();
    };
  }
},

    // Evento para hacer clic en una cita existente
    eventClick: function (info) {
      const event = info.event;

      // Mostrar el contenedor de eliminación
      deleteContainer.classList.remove('hidden');
      deleteContainer.querySelector('#event-details').textContent = `
          Cita de ${event.title} el ${event.start.toLocaleString()}
        `;

      // Manejar la eliminación del evento
      deleteContainer.querySelector('#delete-event-button').onclick = function () {
        event.remove(); // Eliminar el evento del calendario
        deleteContainer.classList.add('hidden'); // Ocultar el contenedor
      };

      // Manejar el cierre del contenedor
      deleteContainer.querySelector('#close-delete-button').onclick = function () {
        deleteContainer.classList.add('hidden'); // Ocultar el contenedor
      };
    }
  });

  // Cerrar el formulario al hacer clic fuera de él
  document.addEventListener('click', function (e) {
    if (!formContainer.contains(e.target) && !e.target.closest('.fc-event')) {
      formContainer.classList.add('hidden');
      calendarEl.style.transform = 'translateX(0)';
      appointmentForm.reset();
    }
  });

  cancelButton.addEventListener('click', function () {
    formContainer.classList.add('hidden');
    calendarEl.style.transform = 'translateX(0)';
    appointmentForm.reset();
  });

  calendar.render();
});
