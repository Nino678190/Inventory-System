function getViewMode() {
    const viewMode = localStorage.getItem('viewMode');
    if (viewMode === 'dark') {
        toggleDarkMode();
    } else if (viewMode === 'light') {
        toggleLightMode();
    } else if (viewMode === 'auto') {
        toggleAutoMode();
    } else {
        toggleLightMode('auto');
    }
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
    document.querySelectorAll('.headIcon').forEach(icon => [
        icon.style.filter = 'invert(0)'
    ])
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
    const language = localStorage.getItem('language') || 'de';
    document.getElementById('language').value = language;
    const font = localStorage.getItem('font') || 'noto-sans';
    document.getElementById('font').value = font;
}

function getData() {
    fetch('/api/all').then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
    }).then(data => {
        console.log(data);
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
            <button class="edit-button" onclick="editItem(${item.id})"><img src="images/edit-pen-icon.png" class="menu" alt="edit"></button>
            <button class="delete-button" onclick="deleteItem(${item.id})"><img src="images/recycle-bin-icon.png" class="menu" alt="delete"></button>
        </td>
    `;
    document.getElementById('data-table').appendChild(row);
    if (localStorage.getItem('viewMode') === 'dark') {
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
                    <span class="tag" style="background-color: ${tagData.color}">${tagData.emoji || ''} ${tagData.name}</span>
                `;
            } else {
                // Fallback for a tag that is not found
                decryptedTags += `<span class="tag">${trimmedTagName}</span>`;
            }
        }
    }
    return decryptedTags;
}

// It's better to fetch tags once when the page loads
document.addEventListener('DOMContentLoaded', () => {
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
});

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
    fetch(`/api/search/full/${encodeURIComponent(value)}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('data-table').innerHTML = '';
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
    fetch(`/api/search/id/${value}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('data-table').innerHTML = '';
        if (data.length > 0) {
            displayData(data[0]);
        } else {
            alert('Kein Eintrag gefunden.');
        }
    })
    .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}