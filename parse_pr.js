const fs = require('fs');

async function checkComments() {
    try {
        const response = await fetch("https://api.github.com/repos/farinhahelder-hue/heldonica/pulls/570/comments");
        const comments = await response.json();
        console.log("Review comments:");
        if (comments.length === 0) {
            console.log("No review comments found.");
        }
        for (const comment of comments) {
            console.log(`- ${comment.user.login}: ${comment.body}`);
        }
    } catch (e) {
        console.error(e);
    }
}
checkComments();
