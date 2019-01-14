const expect = require('chai').expect
const chai = require("chai");
// const chaiHttp = require("chai-http");

const chaiHttp = require('chai-http')
const { app, runServer, closeServer } = require('../server')

chai.use(chaiHttp)

describe("Blog Posts", function() {
  before(function() {
    return runServer()
  });
  after(function() {
    return closeServer()
  });
  it("should list blog posts on GET", function() {
    return chai
      .request(app)
      .get("/blog-posts")
      .then(function(res) {
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.be.a("array")

        // because we create a blog post on app load
        expect(res.body.length).to.be.at.least(1)
        const expectedKeys = ["id", "title", "content", "author", "publishDate"]
        res.body.forEach(function(item) {
          expect(item).to.be.a("object")
          expect(item).to.include.keys(expectedKeys)
        })
      })
  })
  it("should add a blog post on POST", function() {
    const newBlogPost = { title: "The World's Deserts", content: "There are many of them", author: "D.R.", publishDate: "01-13-2019" }
    return chai
      .request(app)
      .post("/blog-posts")
      .send(newBlogPost)
      .then(function(res) {
        expect(res).to.have.status(201)
        expect(res).to.be.json
        expect(res.body).to.be.a("object")
        expect(res.body).to.include.keys("id", "title", "content", "author", "publishDate")
        expect(res.body.id).to.not.equal(null)
        expect(res.body).to.deep.equal(
          Object.assign(newBlogPost, { id: res.body.id })
        )
      })
  })
  it("should update blog post on PUT", function() {
    const updateData = {
      title: "The World's Ancient Wonders",
      content: "There are seven of them.",
      author: "D.R.",
      publishDate: "01-13-19"
    }
    return (
      chai
        .request(app)
        .get("/blog-posts")
        .then(function(res) {
          updateData.id = res.body[0].id
          return chai
            .request(app)
            .put(`/blog-posts/${updateData.id}`)
            .send(updateData)
        })
        .then(function(res) {
          expect(res).to.have.status(204)
          //expect(res).to.be.json
          expect(res.body).to.be.a("object")
          //expect(res.body).to.deep.equal(updateData)
        })
    )
  })
  it("should delete blog post on DELETE", function() {
    return (
      chai
        .request(app)
        .get("/blog-posts")
        .then(function(res) {
          return chai.request(app).delete(`/blog-posts/${res.body[0].id}`)
        })
        .then(function(res) {
          expect(res).to.have.status(204)
        })
    )
  })
})