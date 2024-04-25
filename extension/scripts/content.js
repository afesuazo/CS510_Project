
// Looks for the YouTube comment section and selects the top N comments
function extractTopComments() {
    // context-text is the class of the actual comment text in YouTube
    const commentsClass = 'ytd-item-section-renderer #content-text';
    const commentList = document.querySelectorAll(commentsClass);
    return Array.from(commentList).slice(0, 5).map(comment => comment.innerText.trim());
}

// Once the comments are extracted, they are sent to the background script which will then send them to the backend
function sendCommentsToBackground(comments) {
    chrome.runtime.sendMessage({
        type: 'comments',
        data: comments
    });
}


function attemptToExtractComments() {
    console.log("Extracting comments");
    const topComments = extractTopComments();
    if (topComments.length > 0) {
      console.log("Sending comments to the backend");
      sendCommentsToBackground(topComments);
    }
    else {
        setTimeout(attemptToExtractComments, 1000);
    }
}

// Extraction is done when the page is fully loaded
window.addEventListener('load', attemptToExtractComments);