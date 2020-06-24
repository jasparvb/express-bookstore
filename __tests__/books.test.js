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
        58,  
        'Klett', 
        'Das Runde muss ins eckige', 
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
  