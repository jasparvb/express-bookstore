process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
let db = require("../db")

let bookISBN;

beforeEach(async () => {
    let result = await db.query(`
    INSERT INTO 
      books (isbn, amazon_url, author, language, pages, publisher, title, year)   
      VALUES(
        '111222111', 
        'https://amazon.com/book', 
        'Karl May', 
        'German', 
        358,  
        'Klett', 
        'Der Schatz im Silbersee', 
        2008) 
      RETURNING isbn`);

    bookISBN = result.rows[0].isbn
});

afterEach(async () => {
    await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
    await db.end()
});

/** GET all books */

describe("GET /books", function () {
    test("Returns list of books", async function () {
        const res = await request(app).get(`/books`);
        const { books } = res.body;
        expect(res.statusCode).toBe(200);
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("amazon_url");
    });
});

/** GET book by isbn */

describe("GET /books/:isbn", function () {
    test("Gets a single book", async function () {
        const res = await request(app).get(`/books/${bookISBN}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.book).toHaveProperty("isbn");
        expect(res.body.book.isbn).toBe(bookISBN);
    });
  
    test("Responds with 404 if can't find book", async function () {
        const res = await request(app).get(`/books/00000`);
        expect(res.statusCode).toBe(404);
    });
});
  
/** POST create new book */

describe("POST /books", function () {
    test("Creates a new book", async function () {
        const res = await request(app).post(`/books`).send({
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.book).toHaveProperty("isbn");
        expect(res.body.book).toHaveProperty("author");
        expect(res.body.book.isbn).toEqual("0691161518");
        expect(res.body.book.pages).toEqual(264);
        //test using our API
        const getBooksRes = await request(app).get(`/books`);
        expect(getBooksRes.body.books).toHaveLength(2);
    });

    test("Prevents creating book without required fields", async function () {
        const res = await request(app).post(`/books`).send({title: "Power-Up: Unlocking the Hidden Mathematics in Video Games"});
        expect(res.statusCode).toBe(400);
    });
});

/** PUT update a book by isbn */

describe("PUT /books/:isbn", function () {
    const UPDATE_BOOK = {
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017
    }
    test("Updates a single book", async function () {
        const res = await request(app).put(`/books/${bookISBN}`).send(UPDATE_BOOK);
        expect(res.statusCode).toBe(200);
        expect(res.body.book.publisher).toBe("Princeton University Press");
    });

    test("Prevents updating book without required fields", async function () {
        const res = await request(app).put(`/books/${bookISBN}`).send({title: "Power-Up: Unlocking the Hidden Mathematics in Video Games"});
        expect(res.statusCode).toBe(400);
    });
  
    test("Responds with 404 if can't find book", async function () {
        const res = await request(app).put(`/books/00000`).send(UPDATE_BOOK);
        expect(res.statusCode).toBe(404);
    });
});

/** DELETE delete a book by isbn */

describe("DELETE /books/:isbn", function () {
    test("Deletes a single a book", async function () {
        const res = await request(app).delete(`/books/${bookISBN}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Book deleted" });
    });
    test("Responds with 404 if can't find book", async function () {
        const res = await request(app).delete(`/books/00000`);
        expect(res.statusCode).toBe(404);
    });
});
  