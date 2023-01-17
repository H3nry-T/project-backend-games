// const { request } = require("express");
const request = require("supertest");
const app = require("../app/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  db.end();
});

describe("all tests", () => {
  describe("3-GET:/api/categories", () => {
    it("responds with a status code of 200", () => {
      return request(app).get("/api/categories").expect(200);
    });
    it("responds with an error code of 404 if endpoint is misstyped", () => {
      return request(app).get("/api/categoryies").expect(404);
    });
    it("responds with category objects, must have slug, description properties", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then((response) => {
          const categories = response.body.categories;
          expect(categories).not.toHaveLength(0);
          categories.forEach((categoryObj) => {
            expect(categoryObj).toHaveProperty("slug");
            expect(categoryObj).toHaveProperty("description");
          });
        });
    });
  });

  describe("4-GET:/api/reviews", () => {
    it("responds with a status code of 200", () => {
      return request(app).get("/api/categories").expect(200);
    });
    it("responds with an error code of 404 if endpoint is misstyped", () => {
      return request(app).get("/api/categoryies").expect(404);
    });
    it(`responds with an array of review objects, 
        they must have the following properties: 
        owner
        title
        review_id
        category
        review_img_url
        created_at
        votes
        designer
        comment_count`, () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then((response) => {
          const reviews = response.body.reviews;
          expect(reviews).not.toHaveLength(0);
          reviews.forEach((reviewObj) => {
            expect(reviewObj).toHaveProperty("owner");
            expect(reviewObj).toHaveProperty("title");
            expect(reviewObj).toHaveProperty("review_id");
            expect(reviewObj).toHaveProperty("category");
            expect(reviewObj).toHaveProperty("review_img_url");
            expect(reviewObj).toHaveProperty("created_at");
            expect(reviewObj).toHaveProperty("votes");
            expect(reviewObj).toHaveProperty("designer");
            expect(reviewObj).toHaveProperty("comment_count");
          });
        });
    });
  });

  describe("5-GET:/api/reviews/:review_id", () => {
    it("responds with a status code of 200", () => {
      return request(app).get("/api/reviews/1").expect(200);
    });
    it("responds with an error code of 404-Not found if the review_id does not exist", () => {
      return request(app)
        .get("/api/reviews/100000")
        .expect(404)
        .then(({ body }) => {
          expect(body.error).toEqual({ code: 404, msg: "Not found" });
        });
    });
    it("responds with an error code of 400-Bad request if the review_id is not an id", () => {
      return request(app).get("/api/reviews/NotAnId").expect(400);
    });
    it(`responds with 1 review object with these properties:
            review_id
            title
            review_body
            designer
            review_img_url
            votes
            category
            owner
            created_at
    `, () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then((response) => {
          const review = response.body.review;
          expect(typeof review).toBe("object");
          expect(Array.isArray(review)).toBe(false);
          expect(review).toHaveProperty("review_id");
          expect(review).toHaveProperty("title");
          expect(review).toHaveProperty("review_body");
          expect(review).toHaveProperty("designer");
          expect(review).toHaveProperty("review_img_url");
          expect(review).toHaveProperty("votes");
          expect(review).toHaveProperty("category");
          expect(review).toHaveProperty("owner");
          expect(review).toHaveProperty("created_at");
        });
    });
  });

  describe("6-GET:/api/reviews/:review_id/comments", () => {
    it("responds with a status code of 200", () => {
      return request(app).get("/api/reviews/1/comments").expect(200);
    });
    it("responds with an error code of 404-Not found if the review_id is a massive number", () => {
      return request(app)
        .get("/api/reviews/100000/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.error).toEqual({ code: 404, msg: "Not found" });
        });
    });
    it("responds with an error code of 400-Bad request if the review_id is not an id", () => {
      return request(app)
        .get("/api/reviews/NotAnId/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.error).toEqual({ code: 400, msg: "Bad request" });
        });
    });
    it("responds with an empty comments array when valid review has no comments", () => {
      return request(app)
        .get("/api/reviews/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
    it(`responds with array of comments with these properties:
              comment_id
              votes
              created_at
              author
              body
              review_id
      `, () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then((response) => {
          const comments = response.body.comments;
          expect(Array.isArray(comments)).toBe(true);
          comments.forEach((commentObj) => {
            expect(commentObj).toHaveProperty("comment_id");
            expect(commentObj).toHaveProperty("votes");
            expect(commentObj).toHaveProperty("created_at");
            expect(commentObj).toHaveProperty("author");
            expect(commentObj).toHaveProperty("body");
            expect(commentObj).toHaveProperty("review_id");
          });
        });
    });
    it(`serves comments in descending order with most recent comments at the top
      `, () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then((response) => {
          const comments = response.body.comments;
          expect(Array.isArray(comments)).toBe(true);
          expect(comments[0].comment_id).toBe(5);
          expect(comments[1].comment_id).toBe(1);
          expect(comments[comments.length - 1].comment_id).toBe(4);
        });
    });
  });
});

// describe("8-PATCH /api/reviews/:review_id", () => {
//   it("should accept a valid patch request and respond with 200 satus code", () => {
//     return request(app)
//       .patch("/api/reviews/1")
//       .send({
//         incVotes: 2,
//       })
//       .expect(200);
//   });
//   it("decline an invalid patch request with a incorrectly named key and respond with 400", () => {
//     return request(app)
//       .patch("/api/reviews/1")
//       .send({
//         randomKey: 400,
//       })
//       .expect(400);
//   });
//   it("decline patch request with too many keys responds 400", () => {
//     return request(app)
//       .patch("/api/reviews/1")
//       .send({
//         randomKey: 400,
//         anotherKey: 600,
//       })
//       .expect(400);
//   });
//   it("decline patch request with no keys responds 400", () => {
//     return request(app).patch("/api/reviews/1").send({}).expect(400);
//   });

//   it("should accept a valid patch request and respond with 200 satus code", () => {
//     return request(app)
//       .patch("/api/reviews/1")
//       .send({
//         incVotes: 2,
//       })
//       .expect(200)
//       .then((response) => {
//         const patchedRow = response.body.patchedRow;
//         expect(patchedRow).toHaveProperty("votes", 3);
//       });
//   });
// });
