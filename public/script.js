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
                    `;
            document.getElementById('data-table').appendChild(row);
        }
    }).catch(error => {
        console.error('Es gab ein Problem mit der Fetch-Operation:', error);
    });
}