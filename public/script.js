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
                        <td>
                            <button class="edit-button" onclick="editItem(${item.id})">Edit</button>
                            <button class="delete-button" onclick="deleteItem(${item.id})">Delete</button>
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

function decrypt(tags){
    fetch('/api/tags').then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
    }).then(data => {
        localStorage.setItem('tags', JSON.stringify(data));
        
    }).catch(error => {
        console.error('Es gab ein Problem mit der Fetch-Operation:', error);
    });

    let decryptedTags = "";
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const tagData = JSON.parse(localStorage.getItem('tags')).find(t => t.name === tag.name);
        if (tagData) {
            decryptedTags += `
                <span class="tag ${tagData.id}" style="background-color: ${tagData.color}">${tagData.emoji } ${tagData.name}</span>
            `
        } else {
            decryptedTags += `
                <span class="tag ${tag.id}" style="background-color: ${tag.color}">${tag.emoji} ${tag.name}</span>
            `; // Fallback, falls Tag nicht gefunden wird
        }
    }
    return decryptedTags;
}