function getViewMode() {
    const viewMode = localStorage.getItem('viewMode');
    if (viewMode === 'dark') {
        toggleDarkMode();
        document.querySelectorAll('.menu').forEach(menu => {
            menu.style.filter = 'invert(1)';
        });
    } else if (viewMode === 'light') {
        toggleLightMode();
    } else if (viewMode === 'auto') {
        toggleAutoMode();
    } else {
        toggleLightMode('auto');
    }
    const font = localStorage.getItem('font') || 'NotoSans';
    document.body.style.fontFamily = font;
}

function toggleDarkMode(a) {
    localStorage.setItem('viewMode', 'dark');
    if (a === 'auto') {
        localStorage.setItem('viewMode', 'auto');
    }
    const root = document.documentElement;
    root.style.setProperty('--background-color', '#121212');
    root.style.setProperty('--text-color', '#ffffff');
    root.style.setProperty('--border-color', '#333333');
    root.style.setProperty('--primary-color', '#256029');
    document.querySelectorAll('.headIcon').forEach(icon => icon.style.filter = 'invert(1)');
    document.querySelectorAll('.menu').forEach(menu => {
        menu.style.filter = 'invert(1)';
    });
}

function toggleLightMode(a) {
    localStorage.setItem('viewMode', 'light');
    if (a === 'auto') {
        localStorage.setItem('viewMode', 'auto');
    }
    const root = document.documentElement;
    root.style.setProperty('--background-color', '#f1f1f1');
    root.style.setProperty('--text-color', '#333');
    root.style.setProperty('--border-color', '#cccccc');
    document.querySelectorAll('.headIcon').forEach(icon => {
        icon.style.filter = 'invert(0)'
    });
    document.querySelectorAll('.menu').forEach(menu => {
        menu.style.filter = 'invert(0)';
    });
}

function toggleAutoMode() {
    localStorage.setItem('viewMode', 'auto');
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        toggleDarkMode('auto');
    } else {
        toggleLightMode('auto');
    }
}

function getSettings() {
    const viewMode = localStorage.getItem('viewMode') || 'auto';
    document.querySelector(`input[name="viewMode"][value="${viewMode}"]`).checked = true;
    // const language = localStorage.getItem('language') || 'de';
    // document.getElementById('language').value = language;
    const font = localStorage.getItem('font') || 'NotoSans';
    document.getElementById('font').value = font;
    document.body.style.fontFamily = font;
}

function getData() {
    fetch('/api/all').then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
    }).then(data => {
        document.getElementById('data-table').innerHTML = '';
        if (data.length === 0) {
            document.getElementById('data-table').innerHTML = '<tr><td colspan="6">Keine Daten gefunden</td></tr>';
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            displayData(item);
        }
    }).catch(error => {
        console.error('Es gab ein Problem mit der Fetch-Operation:', error);
    });
}

function displayData(item) {
    const row = document.createElement('tr');
    const tags = decrypt(item.tags);
    row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td class="tdTags">${tags}</td>
        <td>${item.ort}</td>
        <td class="none">
            <button class="edit-button" onclick="editItem(${item.id})"><img src="images/edit-pen-icon.webp" class="menu" alt="edit"></button>
            <button class="delete-button" onclick="deleteItem(${item.id})"><img src="images/recycle-bin-icon.webp" class="menu" alt="delete"></button>
        </td>
    `;
    document.getElementById('data-table').appendChild(row);
    if (localStorage.getItem('viewMode') === 'dark' || localStorage.getItem('viewMode') === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        row.querySelectorAll('.menu').forEach(menu => menu.style.filter = 'invert(1)');
    }
}

function deleteItem(id) {
    fetch(`/api/delete/${id}`, {
        method: 'DELETE'
    }).then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
    }).then(data => {
        console.log('Item gelöscht:', data);
        // Entferne die Zeile aus der Tabelle
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.remove();
        }
    }).catch(error => {
        console.error('Es gab ein Problem mit der Fetch-Operation:', error);
    });
}

function toggleForms() {
    const addType = document.getElementById('addType').value;
    const itemForm = document.getElementById('add-item-form');
    const tagForm = document.getElementById('tag-add');

    if (addType === 'add-item') {
        itemForm.style.display = 'flex';
        tagForm.style.display = 'none';
    } else {
        itemForm.style.display = 'none';
        tagForm.style.display = 'flex';
    }
}

function decrypt(tags) {
    if (!tags) {
        return '';
    }
    const tagNames = tags.split(',');
    const allTags = JSON.parse(localStorage.getItem('tags')) || [];
    let decryptedTags = "";
    for (const tagName of tagNames) {
        const trimmedTagName = tagName.trim();
        if (trimmedTagName) {
            const tagData = allTags.find(t => t.name === trimmedTagName);
            if (tagData) {
                decryptedTags += `
                    <span onclick="searchTag('${tagData.name}')" title="${tagData.description}" class="tag" style="background-color: ${tagData.color}">${tagData.emoji || ''} ${tagData.name}</span>
                `;
            } else {
                // Fallback for a tag that is not found
                decryptedTags += `<span class="tag" onclick="searchTag('${trimmedTagName}')">${trimmedTagName}</span>`;
            }
        }
    }
    return decryptedTags;
}

document.addEventListener('DOMContentLoaded', () => {
    getTags();
});

function getTags(){
    fetch('/api/tags').then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
    }).then(data => {
        localStorage.setItem('tags', JSON.stringify(data));
    }).catch(error => {
        console.error('Es gab ein Problem beim Laden der Tags:', error);
    });
}

function exportData() {
    fetch('/api/all').then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
    }).then(data => {
        const csvContent = "data:text/csv;charset=utf-8," + data.map(e => Object.values(e).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory_data.csv");
        document.body.appendChild(link);
        link.click();
    }).catch(error => {
        console.error('Es gab ein Problem mit der Fetch-Operation:', error);
    });
}

function searchItems() {
    const searchType = document.getElementById('searchType').value;
    const value = document.getElementById('search').value.trim();
    if (value === '') {
        alert('Bitte gib einen Suchbegriff ein.');
        return;
    }
    if (searchType === 'full') {
        searchFull(value);
    } else if (searchType === 'id') {
        searchId(value);
    } else if (searchType === 'tag') {
        searchTag(value);
    } else if (searchType === 'anzahl') {
        searchAnzahl(value);
    } else {
        alert('Ungültiger Suchtyp.');
    }
}

function searchFull(value) {
    fetch(`/api/search/full/${encodeURIComponent(value)}`).then(response => response.json())
        .then(data => {
            document.getElementById('data-table').innerHTML = '';
            if (data.length === 0) {
                document.getElementById('data-table').innerHTML = '<tr><td colspan="6">Keine Daten gefunden</td></tr>';
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                displayData(item);
            }
        }).catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}

function searchId(value) {
    if (isNaN(value)) {
        alert('Bitte gib eine gültige ID ein.');
        return;
    }
    fetch(`/api/search/id/${value}`).then(response => response.json())
        .then(data => {
            document.getElementById('data-table').innerHTML = '';
            if (data.length > 0) {
                displayData(data[0]);
            } else {
                document.getElementById('data-table').innerHTML = '<tr><td colspan="6">Keine Daten gefunden</td></tr>';
                return;
            }
        })
        .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}

function searchTag(value) {
    fetch(`/api/search/tags/${encodeURIComponent(value)}`).then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                document.getElementById('data-table').innerHTML = '<tr><td colspan="6">Keine Daten gefunden</td></tr>';
                return;
            }
            document.getElementById('data-table').innerHTML = '';
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                displayData(item);
            }
        }).catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}

function searchAnzahl(value) {
    if (isNaN(value)) {
        alert('Bitte gib eine gültige Anzahl ein.');
        return;
    }
    fetch(`/api/search/quantity/${value}`).then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                document.getElementById('data-table').innerHTML = '<tr><td colspan="6">Keine Daten gefunden</td></tr>';
                return;
            }
            document.getElementById('data-table').innerHTML = '';
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                displayData(item);
            }
        }).catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}

function suggestTag(origin) {
    let input = document.getElementById(origin).value;
    input = input.trim().split(',').slice(-1)[0].trim();
    const tags = localStorage.getItem('tags');
    if (!tags) {
        alert("Keine Tags gefunden, Bitte erst Tags hinzufügen.");
        return;
    }
    const tagList = JSON.parse(tags);
    console.log(tagList);
    const suggestions = tagList.filter(tag => tag.name.toLowerCase().includes(input.toLowerCase()));

    const suggestionContainer = document.createElement('section');
    suggestionContainer.id = 'suggestions';
    suggestionContainer.innerHTML = '';
    suggestions.forEach(tag => {
        if (document.getElementById(origin).value.split(',').map(t => t.trim()).includes(tag.name)) return; // Skip if tag already exists in input
        const suggestionItem = document.createElement('span');
        suggestionItem.textContent = tag.emoji + ' ' + tag.name;
        suggestionItem.style.cursor = 'pointer';
        suggestionItem.style.backgroundColor = tag.color;
        suggestionItem.className = 'suggestion-item tag';
        suggestionItem.onclick = function () {
            const tagsInput = document.getElementById(origin);
            let current = tagsInput.value;
            let parts = current.split(',');
            parts[parts.length - 1] = ' ' + tag.name;
            tagsInput.value = parts.join(',').replace(/^,/, '').trim() + ', ';
            tagsInput.focus();
            tagsInput.setSelectionRange(tagsInput.value.length, tagsInput.value.length);
            suggestionContainer.innerHTML = '';
            if (suggestionContainer.parentNode) suggestionContainer.parentNode.removeChild(suggestionContainer);
            suggestionContainer.innerHTML = '';
            document.removeChild(suggestionContainer);
        };
        suggestionContainer.appendChild(suggestionItem);
    });
    // Remove any existing suggestion container
    const old = document.getElementById('suggestions');
    if (old) old.remove();
    let dialogId = 'add-dialog';
    if (origin === 'tagsEdit') {
        dialogId = 'dialog';
    }
    const dialog = document.getElementById(dialogId);
    const tagsInput = document.getElementById(origin);
    // Insert the suggestion container directly after the tags input
    tagsInput.parentNode.insertBefore(suggestionContainer, tagsInput.nextSibling);

    // Position the suggestion container absolutely relative to the dialog
    const inputRect = tagsInput.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
    suggestionContainer.style.position = 'absolute';
    suggestionContainer.style.zIndex = '10000';
    suggestionContainer.style.top = (inputRect.bottom - dialogRect.top) + 'px';
    suggestionContainer.style.left = (inputRect.left - dialogRect.left) + 'px';
    suggestionContainer.style.backgroundColor = 'white';
    suggestionContainer.style.border = '1px solid #ccc';
    suggestionContainer.style.width = tagsInput.offsetWidth + 'px';
}

function editItem(id) {
    fetch('/api/get/' + id)
        .then(response => response.json())
        .then(data => {
            const dialog = document.createElement('dialog');
            document.body.appendChild(dialog);
            dialog.id = 'dialog';
            dialog.innerHTML = `
                        <form id="edit-item-form">
                            <label for="name">Name:<input type="text" id="nameEdit" name="name" value="${data.name}" placeholder="z.B. Schraubenzieher" required></label><br>
                            <label for="description">Beschreibung:<input type="text" id="descriptionEdit" name="description" value="${data.description}" placeholder="z.B. Phillips-Kopf, Größe 2" required></label>
                            <br>
                            <label for="quantity">Anzahl:<input type="number" id="quantityEdit" name="quantity" value="${data.quantity}" placeholder="z.B. 5" required></label>
                            <br>
                            <label for="tags">Tags:<input type="text" id="tagsEdit" name="tags" value="${data.tags}" oninput="suggestTag('tagsEdit')" placeholder="z.B. Werkzeug, Metall"></label><br>
                            <label for="ort">Ort:<input type="text" id="ortEdit" name="ort" value="${data.ort}" placeholder="z.B. Werkstatt, Schublade 3"></label><br>
                            <section>
                                <button type="button" class="normalButton" onclick="edit(${id})">Aktualisieren</button>
                                <button type="button" class="normalButton red" onclick="closeEdit()">Abbrechen</button>
                            </section>
                        </form>
                    `;
            dialog.showModal();
        })
        .catch(error => console.error('Fehler beim Abrufen des Items:', error));
}

function closeEdit() {
    document.getElementById('dialog').close();
    document.getElementById('dialog').remove();
}

function edit(id) {
    const name = document.getElementById('nameEdit').value;
    const description = document.getElementById('descriptionEdit').value;
    const quantity = document.getElementById('quantityEdit').value;
    let tags = document.getElementById('tagsEdit').value;
    const ort = document.getElementById('ortEdit').value;
    if (tags.length > 0 && tags[tags.length - 1] === ',') {
        tags = tags.slice(0, -1); // Remove trailing comma
    }
    fetch('/api/update/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, quantity, tags, ort })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        closeEdit();
        getData(); // Aktualisiere die Tabelle
    }).catch(error => {
        console.error('Es gab ein Problem mit der Fetch-Operation:', error);
    });
}

function editTag(tagId) {
    const tagsData = JSON.parse(localStorage.getItem('tags') || '[]');
    const tag = tagsData.find(t => t.id === tagId);
    if (!tag) {
        alert('Tag nicht gefunden.');
        return;
    }
    const dialog = document.createElement('dialog');
    console.log(tag);
    dialog.id = 'editTagDialog';
    dialog.innerHTML = `
                    <form id="editTagForm">
                        <section class="dialogHeader">
                            <h3>Tag bearbeiten</h3>
                            <button type="button" onclick="deleteTag(${tagId})"><img class="menu" src="images/recycle-bin-icon.webp" alt="Delete"></button>
                        </section>
                        <label for="tagName">Name:<input type="text" id="tagName" value="${tag.name}" name="tagName" placeholder="z.B. Wichtig" required></label>
                        <label for="tagColor">Farbe:<input type="color" id="tagColor" name="tagColor" value="${tag.color}" required></label>
                        <label for="tag-icon">Tag Emoji:
                            <select name="tag-icon" id="tag-icon">
                                <option value="📦">📦 Paket</option>
                                <option value="📅">📅 Kalender</option>
                                <option value="📈">📈 Steigendes Diagramm</option>
                                <option value="📉">📉 Fallendes Diagramm</option>
                                <option value="📊">📊 Balkendiagramm</option>
                                <option value="📍">📍 Standort-Pin</option>
                                <option value="📁">📁 Ordner</option>
                                <option value="🗂️">🗂️ Ablage</option>
                                <option value="🏷️">🏷️ Etikett</option>
                                <option value="💔">💔 Gebrochenes Herz</option>
                                <option value="💕">💕 Zwei Herzen</option>
                                <option value="💖">💖 Glitzerndes Herz</option>
                                <option value="💼">💼 Aktentasche</option>
                                <option value="😂">😂 Lachtränen</option>
                                <option value="😅">😅 Erleichtertes Lächeln</option>
                                <option value="😆">😆 Grinsendes Lachen</option>
                                <option value="😋">😋 Leckeres Gesicht</option>
                                <option value="😎">😎 Cooles Gesicht</option>
                                <option value="😜">😜 Zunge raus</option>
                                <option value="😡">😡 Wütendes Gesicht</option>
                                <option value="😢">😢 Trauriges Gesicht</option>
                                <option value="😁">😁 Zahniges Grinsen</option>
                                <option value="😍">😍 Verliebtes Gesicht</option>
                                <option value="🥰">🥰 Lächelnd mit Herzen</option>
                                <option value="🥺">🥺 Bittendes Gesicht</option>
                                <option value="😭">😭 Weinendes Gesicht</option>
                                <option value="🤔">🤔 Nachdenklich</option>
                                <option value="🤗">🤗 Umarmung</option>
                                <option value="🤩">🤩 Beeindruckt</option>
                                <option value="🤫">🤫 Psst!</option>
                                <option value="🙏">🙏 Betend</option>
                                <option value="❤️">❤️ Rotes Herz</option>
                                <option value="🎉">🎉 Party</option>
                                <option value="🔧">🔧 Schraubenschlüssel</option>
                                <option value="🛠️">🛠️ Werkzeug</option>
                                <option value="👍">👍 Daumen hoch</option>
                                <option value="🙄">🙄 Augenrollen</option>
                                <option value="🤣">🤣 Lachanfall</option>
                            </select>
                        </label>
                        <label for="tagDescription">Beschreibung:<input type="text" id="tagDescription" name="tagDescription" value="${tag.description || ''}" placeholder="Beschreibung des Tags"></input></label>
                        <section>
                            <button type="button" class="normalButton" onclick="editTagFin(${tag.id})">Speichern</button>
                            <button type="button" class="normalButton red" onclick="this.closest('dialog').remove()">Abbrechen</button>
                        </section>
                    </form>
                `;

    document.body.appendChild(dialog);
    getViewMode();
    dialog.showModal();
}

function editTagFin(tagId) {
    const form = document.getElementById('editTagForm');
    const tagName = form.tagName.value.trim();
    const tagColor = form.tagColor.value;
    const tagEmoji = form.tagEmoji.value;
    const tagDescription = form.tagDescription.value.trim();

    fetch('/api/updateTag/' + tagId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: tagName,
            color: tagColor,
            emoji: tagEmoji,
            description: tagDescription
        })
    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Tag erfolgreich aktualisiert');
                document.querySelector('dialog').remove();
                getTags(); // Refresh the tags list
            } else {
                alert('Fehler beim Aktualisieren des Tags: ' + data.message);
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
        });
}

function deleteTag(tagId) {
    if (!confirm('Bist du sicher, dass du diesen Tag löschen möchtest?')) {
        return;
    }
    fetch('/api/deleteTag/' + tagId, {
        method: 'DELETE'
    }).then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        alert('Tag erfolgreich gelöscht');
        document.getElementById('editTagDialog').remove();
        getTags(); // Refresh the tags list
        display()
        return;
    }).catch(error => {
            console.error('Error:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
        });
}

function display() {
    const container = document.getElementById('tagList');
    container.innerHTML = ''; // Clear existing content
    container.innerHTML = '<h4>Alle Tags:</h4>';
    const tagsData = JSON.parse(localStorage.getItem('tags') || '[]');
    tagsData.forEach(tag => {
        console.log(tag);
        container.innerHTML += `
            <span onclick="editTag(${tag.id})" class="tag settingsTag" style="background-color: ${tag.color}" title="${tag.description}" >
                ${tag.emoji || ''} ${tag.name}
            </span>
        `;
    });
}

function showAdd(){
    const dialog = document.createElement('dialog');
    dialog.id = 'add-dialog';
    document.body.appendChild(dialog);
    dialog.innerHTML = `
            <section class="dialogHeader">
                <select name="addType" id="addType" onchange="toggleForms()">
                    <option value="add-item">Item hinzufügen</option>
                    <option value="add-tag">Tag hinzufügen</option>
                </select>
                <button onclick="document.querySelectorAll('form').forEach(form => {form.reset()})">
                    <img src="images/undo-arrow-icon.webp" alt="Reset" class="formReset menu" title="Formular zurücksetzen">
                </button>
            </section>
            <form id="add-item-form">
                <label for="name">Name:<input type="text" id="name" name="name" placeholder="z.B. Schraubenzieher" required></label><br>
                <label for="description">Beschreibung:<input type="text" id="description" name="description" placeholder="z.B. Phillips-Kopf, Größe 2" required></label>
                <br>
                <label for="quantity">Anzahl:<input type="number" id="quantity" name="quantity" placeholder="z.B. 5" required></label>
                <br>
                <label for="tags">Tags:<input type="text" id="tags" name="tags" oninput="suggestTag('tags')" placeholder="z.B. Werkzeug, Metall"></label><br>
                <label for="ort">Ort:<input type="text" id="ort" name="ort" placeholder="z.B. Werkstatt, Schublade 3"></label><br>
                <section>
                    <button type="submit" class="normalButton">Hinzufügen</button>
                    <button type="button" class="normalButton red" onclick="document.querySelector('dialog').close()">Abbrechen</button>
                </section>
            </form>

            <form id="tag-add" style="display: none;">
                <label for="tag-name">Tag Name:<input type="text" id="tag-name" name="tag-name" placeholder="z.B. Wichtig" required></label>
                <label for="tag-description">Tag Beschreibung:<input type="text" id="tag-description" name="tag-description" placeholder="Beschreibung des Tags" required></label>
                <label for="tag-color">Tag Farbe:<input type="color" id="tag-color" name="tag-color" required></label>

                <label for="tag-icon">Tag Emoji:
                    <select name="tag-icon" id="tag-icon">
                        <option value="📦">📦 Paket</option>
                        <option value="📅">📅 Kalender</option>
                        <option value="📈">📈 Steigendes Diagramm</option>
                        <option value="📉">📉 Fallendes Diagramm</option>
                        <option value="📊">📊 Balkendiagramm</option>
                        <option value="📍">📍 Standort-Pin</option>
                        <option value="📁">📁 Ordner</option>
                        <option value="🗂️">🗂️ Ablage</option>
                        <option value="🏷️">🏷️ Etikett</option>
                        <option value="💔">💔 Gebrochenes Herz</option>
                        <option value="💕">💕 Zwei Herzen</option>
                        <option value="💖">💖 Glitzerndes Herz</option>
                        <option value="💼">💼 Aktentasche</option>
                        <option value="😂">😂 Lachtränen</option>
                        <option value="😅">😅 Erleichtertes Lächeln</option>
                        <option value="😆">😆 Grinsendes Lachen</option>
                        <option value="😋">😋 Leckeres Gesicht</option>
                        <option value="😎">😎 Cooles Gesicht</option>
                        <option value="😜">😜 Zunge raus</option>
                        <option value="😡">😡 Wütendes Gesicht</option>
                        <option value="😢">😢 Trauriges Gesicht</option>
                        <option value="😁">😁 Zahniges Grinsen</option>
                        <option value="😍">😍 Verliebtes Gesicht</option>
                        <option value="🥰">🥰 Lächelnd mit Herzen</option>
                        <option value="🥺">🥺 Bittendes Gesicht</option>
                        <option value="😭">😭 Weinendes Gesicht</option>
                        <option value="🤔">🤔 Nachdenklich</option>
                        <option value="🤗">🤗 Umarmung</option>
                        <option value="🤩">🤩 Beeindruckt</option>
                        <option value="🤫">🤫 Psst!</option>
                        <option value="🙏">🙏 Betend</option>
                        <option value="❤️">❤️ Rotes Herz</option>
                        <option value="🎉">🎉 Party</option>
                        <option value="🔧">🔧 Schraubenschlüssel</option>
                        <option value="🛠️">🛠️ Werkzeug</option>
                        <option value="👍">👍 Daumen hoch</option>
                        <option value="🙄">🙄 Augenrollen</option>
                        <option value="🤣">🤣 Lachanfall</option>
                    </select>
                </label>

                <section>
                    <button type="submit" class="normalButton">Tag hinzufügen</button>
                    <button type="button" class="normalButton red" onclick="document.querySelector('dialog').close()">Abbrechen</button>
                </section>
            </form>
        `

    document.getElementById('tag-add').addEventListener('submit', function (event) {
        event.preventDefault();
        const tagName = document.getElementById('tag-name').value;
        const tagDescription = document.getElementById('tag-description').value;
        const tagColor = document.getElementById('tag-color').value;
        const tagIcon = document.getElementById('tag-icon').value;
        fetch('/api/addTag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: tagName, description: tagDescription, color: tagColor, emoji: tagIcon })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            return response.json();
        }).then(data => {
            console.log(data);
            document.getElementById('tag-add').reset();
            document.querySelector('dialog').close();
            if (window.location.pathname !== '/' || window.location.pathname !== '/index.html') {
                return;
            }
            getData(); // Aktualisiere die Tabelle
            getTags(); // Aktualisiere die Tags 
        }).catch(error => {
            console.error('Es gab ein Problem mit der Fetch-Operation:', error);
        });
    });

    document.getElementById('add-item-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const quantity = document.getElementById('quantity').value;
        const tags = document.getElementById('tags').value;
        const ort = document.getElementById('ort').value;
        const length = tags.length;
        if (length > 0 && tags[length - 1] === ',') {
            tags = tags.slice(0, -1); // Remove trailing comma
        }
        fetch('/api/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: { "name": name, "description": description, "quantity": quantity, "tags": tags, "ort": ort }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            document.getElementById('add-item-form').reset();
            document.querySelector('dialog').close();
            getData(); // Aktualisiere die Tabelle
        }).catch(error => {
            console.error('Es gab ein Problem mit der Fetch-Operation:', error);
        });
    });
    
    dialog.showModal();
    getViewMode();
}

function deleteData(){
    if (confirm('Bist du sicher, dass du alle Daten löschen möchtest? Dies kann nicht rückgängig gemacht werden!')) {
        fetch('/api/deleteAll', {
            method: 'DELETE'
        }).then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            alert('Alle Daten wurden gelöscht.');
            getData(); // Aktualisiere die Tabelle
        }).catch(error => {
            console.error('Es gab ein Problem mit der Fetch-Operation:', error);
        });
    }
    localStorage.removeItem('tags'); // Clear tags from localStorage
    document.getElementById('tagList').innerHTML = '<h4>Alle Tags:</h4>'; // Clear displayed tags
    localStorage.removeItem('viewMode'); // Clear view mode
}