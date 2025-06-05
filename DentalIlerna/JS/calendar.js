document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
  
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridDay',
      locale: 'es',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridDay'
      },
      selectable: true,
      editable: true,
      slotDuration: '00:30:00',
      slotMinTime: '08:00:00',
      slotMaxTime: '20:00:00',
      allDaySlot: false,
      events: 'events.json',
  
      // Selección en vista de agenda diaria
      select: function (info) {
        const eventosEnMismaFranja = calendar.getEvents().filter(event =>
          event.startStr === info.startStr && !event.allDay
        );
  
        if (eventosEnMismaFranja.length >= 4) {
          alert('Ya hay 4 citas en esta franja. Elige otro horario.');
          calendar.unselect();
          return;
        }
  
        const title = prompt('Introduce el nombre del paciente:');
        if (title) {
          calendar.addEvent({
            title: title,
            start: info.startStr,
            end: info.endStr,
            allDay: false
          });
        }
  
        calendar.unselect();
      },
  
      // Clic en día del mes (vista mensual)
      dateClick: function (info) {
        const fechaBase = info.dateStr;
        const eventos = calendar.getEvents();
  
        // Generar franjas de 30 minutos desde 08:00 a 19:30
        const franjas = [];
        for (let h = 8; h < 20; h++) {
          franjas.push(`${h.toString().padStart(2, '0')}:00`);
          franjas.push(`${h.toString().padStart(2, '0')}:30`);
        }
  
        // Filtrar franjas con menos de 4 citas
        const franjasDisponibles = franjas.filter(hora => {
          const fechaHora = `${fechaBase}T${hora}:00`;
          const cantidad = eventos.filter(ev => ev.startStr === fechaHora).length;
          return cantidad < 4;
        });
  
        if (franjasDisponibles.length === 0) {
          alert('No hay franjas disponibles para este día.');
          return;
        }
  
        // Mostrar prompt con las franjas disponibles
        const seleccion = prompt(
          `Selecciona una franja:\n${franjasDisponibles.join('\n')}`
        );
  
        if (!seleccion || !franjasDisponibles.includes(seleccion)) {
          alert('Franja no válida o cancelada.');
          return;
        }
  
        const start = `${fechaBase}T${seleccion}:00`;
        const endMinutes = seleccion.endsWith(':30') ? parseInt(seleccion.split(':')[0]) + 1 + ':00' : seleccion.split(':')[0] + ':30';
        const end = `${fechaBase}T${endMinutes}:00`;
  
        const title = prompt('Introduce el nombre del paciente:');
        if (title) {
          calendar.addEvent({
            title: title,
            start: start,
            end: end,
            allDay: false
          });
        }
      },
  
      eventClick: function (info) {
        if (confirm(`¿Eliminar la cita con "${info.event.title}"?`)) {
          info.event.remove();
        }
      }
    });
  
    calendar.render();
  });
  