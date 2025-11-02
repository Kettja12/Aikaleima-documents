/**
 * Lataa sisällön tekstitiedostosta ja rakentaa siitä Bootstrap-accordionin.
 * @param {string} file - Ladattavan tiedoston nimi (esim. 'tapahtumaloki.txt').
 * @param {string} accordionId - Sen elementin ID, johon accordion rakennetaan.
 * @param {number} idStartIndex - Aloitusindeksi ID-attribuuteille duplikaattien välttämiseksi.
 */
function loadAccordionContent(file, accordionId, idStartIndex) {
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error('Verkkovastaus ei ollut kunnossa: ' + response.statusText);
            }
            return response.text();
        })
        .then(text => {
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const accordionContainer = document.getElementById(accordionId);
            if (!accordionContainer) {
                console.error(`Elementtiä ID:llä '${accordionId}' ei löytynyt.`);
                return;
            }

            let currentItem = null;
            let items = [];

            lines.forEach(line => {
                if (line.startsWith('-') && !line.startsWith('--')) {
                    if (currentItem) {
                        items.push(currentItem);
                    }
                    currentItem = { title: line.substring(1).trim(), content: [] };
                } else if (currentItem) {
                    currentItem.content.push(line.replace(/^--/, '').trim());
                }
            });
            if (currentItem) {
                items.push(currentItem);
            }

            items.forEach((item, index) => {
                const uniqueIndex = idStartIndex + index;
                const isFirst = index === 0;

                const itemHtml = `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading${uniqueIndex}">
                            <button class="accordion-button ${isFirst ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${uniqueIndex}" aria-expanded="${isFirst}" aria-controls="collapse${uniqueIndex}">
                                ${item.title}
                            </button>
                        </h2>
                        <div id="collapse${uniqueIndex}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" aria-labelledby="heading${uniqueIndex}" data-bs-parent="#${accordionId}">
                            <div class="accordion-body">
                                ${item.content.join('<br>')}
                            </div>
                        </div>
                    </div>`;
                accordionContainer.innerHTML += itemHtml;
            });
        })
        .catch(error => {
            console.error(`Tiedoston '${file}' lataamisessa tapahtui virhe:`, error);
            const container = document.getElementById(accordionId);
            if (container) container.innerHTML = `<p>Sisällön lataaminen epäonnistui.</p>`;
        });
}

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
