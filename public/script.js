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
            const row = document.createElement('tr');
            const tags = decrypt(item.tags);
            row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${tags}</td>
                        <td>${item.ort}</td>
                        <td class="none">
                            <button class="edit-button" onclick="editItem(${item.id})"><img src="images/edit-pen-icon.png" class="menu" alt="edit"></button>
                            <button class="delete-button" onclick="deleteItem(${item.id})"><img src="images/recycle-bin-icon.png" class="menu" alt="delete"></button>
                        </td>
                    `;
            document.getElementById('data-table').appendChild(row);
        }
    }).catch(error => {
        console.error('Es gab ein Problem mit der Fetch-Operation:', error);
    });
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
        itemForm.style.display = 'block';
        tagForm.style.display = 'none';
    } else {
        itemForm.style.display = 'none';
        tagForm.style.display = 'block';
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