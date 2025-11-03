window.onload = function() {
    // Alustetaan kaikki tooltipit sivulla
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Ladataan ja rakennetaan tapahtumaloki ja To Do -lista
    loadAccordionContent('tapahtumaloki.txt', 'infoAccordion', 0);
    loadAccordionContent('todo.txt', 'todoAccordion', 100); // Aloitetaan ID:t 100:sta duplikaattien välttämiseksi
};
