// A simple CRUD API.
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Models
const { User, Post, seed } = require('./models');
seed()

// API
app.get("/", (req, res) => {
    res.json({
        users: User.count,
        posts: Post.count
    })
})

app.get("/user", (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    res.json(User.query().limit(limit).all());
})

app.get("/user/:id", (req, res) => {
    console.log(parseInt(req.params.id))
    const user = User.get(parseInt(req.params.id)).data;
    if (!user) return res.status(404).json({ error: "User not found." });
    const posts = Post.where(row => row.author().id == user.id).all();
    res.json({ ...user, posts });
})

app.get("/post", (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    res.json(Post.query().limit(limit).all());
})

app.get("/post/:id", (req, res) => {
    const post = Post.get(parseInt(req.params.id))
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json({ id: post.id, title: post.title, content: post.content, author: post.author.value });
})

app.get("/user/:id/posts", (req, res) => {
    const user = User.get(parseInt(req.params.id))
    if (!user) return res.status(404).json({ error: "User not found." });
    const posts = Post.where(row => row.author().id === user.id).all();
    res.json(posts);
})

app.listen(5000, () => console.log("Server running on port 5000"))