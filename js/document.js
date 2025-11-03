function processTitle(line, title) {
    if (line.startsWith('-') && !line.startsWith('--')) {
        title+=' '+ line.substring(1).trim();
    }
    return title;
}
function processContent(line,content) {
    if (line.startsWith('--') ) {
        content+=' '+ line.substring(2).trim();
    }
    return content;

}
function checkNewItem(line,content) {
    if (line.startsWith('--') ) {
        return false;
    }
    return  content.length>0;

}

/**
 * Jäsentää tekstitiedoston rivit olioiksi (items).
 */
function parseTextToItems(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    let items = [];
    let title = "";
    let content = "";

    lines.forEach(line => {
        if (checkNewItem(line,content)) {
            items.push(
                 {
                title:title,
                content:content

            });
            title = "";
            content = "";
        }
        title = processTitle(line, title);
        content = processContent(line, content);
    });
    if (title.length > 0 && content.length > 0) {
        items.push(
        {
            title:title,
            content:content
        });
    }
    return items;
}

/**
 * Luo accordion-elementtien HTML-merkkijonon.
 * @param {Array} items - Jäsennettyjen elementtien taulukko.
 * @param {string} accordionId - Pääaccordionin ID.
 * @param {number} idStartIndex - ID-numeroiden aloitusindeksi.
 * @returns {string} - HTML-merkkijono.
 */
function createAccordionHtml(items, accordionId, idStartIndex) {
    return items.map((item, index) => {
        const uniqueIndex = idStartIndex + index;
        const isFirst = index === 0;
        return `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${uniqueIndex}">
                    <button class="accordion-button ${isFirst ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${uniqueIndex}" aria-expanded="${isFirst}" aria-controls="collapse${uniqueIndex}">
                        ${item.title}
                    </button>
                </h2>
                <div id="collapse${uniqueIndex}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" aria-labelledby="heading${uniqueIndex}" data-bs-parent="#${accordionId}">
                    <div class="accordion-body">
                        ${item.content}
                    </div>
                </div>
            </div>`;
    }).join('');
}

/**
 * Renderöi HTML-sisällön elementtiin.
 * @param {string} html - Renderöitävä HTML.
 * @param {string} accordionId - Kohde-elementin ID.
 */
function renderAccordion(html, accordionId) {
    const accordionContainer = document.getElementById(accordionId);
    if (accordionContainer) {
        accordionContainer.innerHTML = html;
    } else {
        console.error(`Elementtiä ID:llä '${accordionId}' ei löytynyt.`);
    }
}

/**
 * Käsittelee virheet tiedoston latauksessa.
 * @param {Error} error - Tapahtunut virhe.
 * @param {string} file - Tiedoston nimi.
 * @param {string} accordionId - Kohde-elementin ID.
 */
function handleFetchError(error, file, accordionId) {
    console.error(`Tiedoston '${file}' lataamisessa tapahtui virhe:`, error);
    const container = document.getElementById(accordionId);
    if (container) {
        container.innerHTML = `<p>Sisällön lataaminen epäonnistui.</p>`;
    }
}

/**
 * Lataa sisällön ja rakentaa Bootstrap-accordionin.
 * @param {string} file - Ladattavan tiedoston nimi.
 * @param {string} accordionId - Kohde-elementin ID.
 * @param {number} idStartIndex - Aloitusindeksi ID-attribuuteille.
 */
function loadAccordionContent(file, accordionId, idStartIndex) {
    fetch(file)
        .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
        .then(text => parseTextToItems(text))
        .then(items => createAccordionHtml(items, accordionId, idStartIndex))
        .then(html => renderAccordion(html, accordionId))
        .catch(error => handleFetchError(error, file, accordionId));
}
