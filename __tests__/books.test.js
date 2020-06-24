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

