const Model = require('./model');

const assert = (bool, message = "Assertion failed") => { if (!bool) throw new Error("Assersion Error: " + message) }

const User = new Model("User", {
    id: Model.types.ID(),
    username: Model.types.STRING(),
    bio: Model.types.STRING("No bio provided."),
    password: Model.types.STRING()
});

const Post = new Model("Post", {
    id: Model.types.ID(),
    title: Model.types.STRING(),
    content: Model.types.STRING("Empty content."),
    author: Model.types.REF(0, User),
});

const john = User.create({
    username: 'John',
    password: '12345',
});

const jane = User.create({
    username: 'Jane',
    password: '67890',
    bio: "Hi, I'm Jane. I'm a programmer and blogger.",
});

// Loop 20 times to create 20 posts.
for (let i = 0; i < 20; i++) {
    if (i % 2 === 0) {
        Post.create({
            title: `Post ${i}`,
            content: `This is post ${i}.`,
            author: john.id
        });
    } else {
        Post.create({
            title: `Post ${i}`,
            content: `This is post ${i}.`,
            author: jane.id
        });
    }
}

const janesPosts = Post.where(post => post.author().id === jane.id).all();

const userData = User.toJSON()
const postData = Post.toJSON()

const User2 = Model.fromJSON(userData);
const Post2 = Model.fromJSON(postData, { User: User2 });

// All checks out!