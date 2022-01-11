const Model = require('../../index.js');

const User = new Model("User", {
    name: Model.types.STRING(),
    handle: Model.types.STRING(),
    bio: Model.types.STRING("No bio provided."),
})

const Post = new Model("Post", {
    title: Model.types.STRING(),
    content: Model.types.STRING("No content provided."),
    author: Model.types.REF(0, User), // Use 0 as the default author id.
})

// Seed the database with example data.
function seed() {
    User.clear()
    Post.clear()

    const [john, jane] = User.seed([{ name: "John Doe", handle: "jdoe" }, { name: "Jane Doe", handle: "jane", bio: "Hi, I'm Jane Doe!" }])
    Post.seed([
        { title: "Hello, World!", content: "This is my first post!", author: john.id },
        { title: "Hello, API!", content: "This is my first post, but the second post!", author: jane.id },
        { title: "The Third Post", content: "This is the third post!", author: john.id },
    ])
}

module.exports = { User, Post, seed };