const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./pool.js'); 
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/* 
    Benötigte Endpoints:
    - GET /: Gibt die index.html zurück
    - GET /api/initialize: Initialisiert die Datenbank und erstellt die Tabelle, falls sie nicht existiert
    - GET /api/all: Gibt alle Einträge zurück
    - GET /api/tags: Gibt alle Tag Arten zurück
    - GET /api/get/:id: Gibt einen Eintrag mit der angegebenen ID zurück
    - GET /api/search/:query: Sucht nach Einträgen, die der Abfrage entsprechen
    - POST /api/add: Fügt einen neuen Eintrag hinzu
    - POST /api/addTag: Fügt einen neue Tag Art hinzu
    - PUT /api/update/:id: Aktualisiert einen Eintrag mit der angegebenen ID
    - PUT /api/updateTag/:id: Aktualisiert eine Tag Art mit der angegebenen ID
    - DELETE /api/delete/:id: Löscht einen Eintrag mit der angegebenen ID
    - DELETE /api/deleteTag/:id: Löscht eine Tag Art mit der angegebenen ID
    */

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/public/index.html');
});

app.get('/api/initialize', async (req, res) => {
    try {
        await pool.query('CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, name VARCHAR(100), description TEXT, quantity INT, tags VARCHAR(2000), ort TEXT)');
        await pool.query('CREATE TABLE IF NOT EXISTS tags (id SERIAL PRIMARY KEY, name VARCHAR(100), description TEXT, color VARCHAR(50), emoji VARCHAR(10))');
        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ error: 'Database initialization failed' });
    }
});

app.get('/api/all', async (req, res ) => {
    try {
        const data = await pool.query('SELECT * FROM items');
        res.status(200).json(data.rows);
    } catch (error) {
        console.error('Error fetching all items:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
})

app.get('/api/get/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const data = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
        if (data.rows.length > 0) {
            res.status(200).json(data.rows[0]);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

app.get('/api/search/full/:query', async (req, res) => {
    const { query } = req.params;
    try {
        const data = await pool.query('SELECT * FROM items WHERE name ILIKE $1 OR description ILIKE $1', [`%${query}%`]);
        res.status(200).json(data.rows);
    } catch (error) {
        console.error('Error searching items:', error);
        res.status(500).json({ error: 'Failed to search items' });
    }
});

app.get('/api/search/id/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const data = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
        if (data.rows.length > 0) {
            res.status(200).json(data.rows[0]);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error('Error searching item by ID:', error);
        res.status(500).json({ error: 'Failed to search item by ID' });
    }
});

app.get('/api/search/quantity/:quantity', async (req, res) => {
    const { quantity } = req.params;
    try {
        const data = await pool.query('SELECT * FROM items WHERE quantity = $1', [quantity]);
        if (data.rows.length > 0) {
            res.status(200).json(data.rows);
        } else {
            res.status(404).json({ error: 'No items found with the specified quantity' });
        }
    } catch (error) {
        console.error('Error searching items by quantity:', error);
        res.status(500).json({ error: 'Failed to search items by quantity' });
    }
});

app.get('/api/search/tags/:tags', async (req, res) => {
    const { tags } = req.params;
    try {
        const data = await pool.query('SELECT * FROM items WHERE tags ILIKE $1', [`%${tags}%`]);
        if (data.rows.length > 0) {
            res.status(200).json(data.rows);
        } else {
            res.status(404).json({ error: 'No items found with the specified tags'});
        }
    } catch (error) {
        console.error('Error searching items by tags:', error);
        res.status(500).json({ error: 'Failed to search items by tags' });
    }
});

app.get('/api/tags', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM tags');
        res.status(200).json(data.rows);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

app.post('/api/add', async (req, res) => {
    const { name, description, quantity, tags, ort } = req.body;
    try {
        const data = await pool.query('INSERT INTO items (name, description, quantity, tags, ort) VALUES ($1, $2, $3, $4, $5)', [name, description, quantity, tags, ort]);
        res.status(201).json(data.rows[0]);
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

app.post('/api/addTag', async (req, res) => {
    const { name, description, color, emoji } = req.body;
    try {
        await pool.query('INSERT INTO tags (name, description, color, emoji) VALUES ($1, $2, $3, $4)', [name, description, color, emoji]);
        res.status(201).json('Tag added successfully');
    } catch (error) {
        console.error('Error adding tag:', error);
        res.status(500).json({ error: 'Failed to add tag' });
    }
});

app.put('/api/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, quantity, tags } = req.body;
    try {
        await pool.query('UPDATE items SET name = $1, description = $2, quantity = $3, tags = $4 WHERE id = $5', [name, description, quantity, tags, id]);
        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

app.put('/api/updateTag/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, color, emoji } = req.body;
    try {
        await pool.query('UPDATE tags SET name = $1, description = $2, color = $3, emoji = $4 WHERE id = $5', [name, description, color, emoji, id]);
        res.status(200).json({ message: 'Tag updated successfully' });
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({ error: 'Failed to update tag' });
    }
});

app.delete('/api/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM items WHERE id = $1', [id]);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});