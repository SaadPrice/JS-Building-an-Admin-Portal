const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Fs = require('fs').promises;
const Path = require('path');
const app = express();
const liveServer = require('live-server');

const Port = 3000;
const DB_PATH = Path.join(__dirname, 'db.json');

async function main() {
    app.use(cors());
    app.use(bodyParser.json());

    app.get('/listBooks', async (req, res) => {
        try {
            let books = await loadBooks();
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: true, message: "Internal server error" });
        }
    });

    app.patch('/updateBook', async (req, res) => {
        try {
            let books = await loadBooks();
            if (!req.body.id) return res.status(400).json({ error: true, message: "'id' is required in the request body." });

            let book = books.find(book => book.id === req.body.id);
            if (!book) return res.status(404).json({ error: true, message: `Could not find a book with id ${req.body.id}` });

            const { title, year, quantity, imageURL, description } = { ...book, ...req.body };
            Object.assign(book, { title, year, quantity, imageURL, description });

            await saveBooks(books);
            res.json(book);
        } catch (error) {
            res.status(500).json({ error: true, message: "Internal server error" });
        }
    });

    app.post('/addBook', async (req, res) => {
        try {
            let books = await loadBooks();
            const { title, year, quantity, imageURL, description } = req.body;

            if (!title || !quantity || !description) {
                return res.status(400).json({ error: true, message: "'title', 'quantity', and 'description' are required in the request body." });
            }

            const id = books.reduce((id, book) => Math.max(book.id + 1, id), 1);
            const book = { id, title, year, quantity, imageURL, description };

            books.push(book);
            await saveBooks(books);
            res.json(book);
        } catch (error) {
            res.status(500).json({ error: true, message: "Internal server error" });
        }
    });

    app.delete('/removeBook/:id', async (req, res) => {
        try {
            let books = await loadBooks();
            const bookIndex = books.findIndex(book => book.id === parseInt(req.params.id));

            if (bookIndex === -1) return res.status(404).json({ error: true, message: `Could not find a book with id ${req.params.id}` });

            const deletedBook = books.splice(bookIndex, 1)[0];
            await saveBooks(books);
            res.json(deletedBook);
        } catch (error) {
            res.status(500).json({ error: true, message: "Internal server error" });
        }
    });

    app.listen(Port, () => {
        console.log(`Server is running on http://localhost:${Port}`);
        liveServer.start({
            port: 3000,
            logLevel: 0,
            root: './public'
        });
    });
}

async function loadBooks() {
    const data = await Fs.readFile(DB_PATH);
    const { books } = JSON.parse(data);
    return books;
}

async function saveBooks(books) {
    await Fs.writeFile(DB_PATH, JSON.stringify({ books }, null, 2));
}

main();
