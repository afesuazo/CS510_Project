
// Looks for the YouTube comment section and selects the top N comments
function extractTopComments() {
    // context-text is the class of the actual comment text in YouTube
    const commentsClass = 'ytd-item-section-renderer #content-text';
    const commentList = document.querySelectorAll(commentsClass);
    return Array.from(commentList).slice(0, 5).map(comment => comment.innerText.trim());
}

// Once the comments are extracted, they are sent to the background script which will then send them to the backend
function sendCommentsToBackground(type, comments) {
    chrome.runtime.sendMessage({
        type,
        data: comments
    });
}


function attemptToExtractComments() {
    console.log("Extracting Top comments: ");
    const topComments = extractTopComments();
    if (topComments.length > 0) {
      sendCommentsToBackground('topComments', topComments);
    }
    else {
        setTimeout(attemptToExtractComments, 1000);
    }
}

// Extraction is done when the page is fully loaded
window.addEventListener('load', attemptToExtractComments);

// Debounce function to delay the execution of a function until after a certain time has elapsed
function debounce(callback, delay) {
    let timeoutId;
    return function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback();
        }, delay);
    };
}

// Function to check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Looks for the YouTube comments that are in viewport
function extractInViewportComments() {
    // context-text is the class of the actual comment text in YouTube
    const commentsClass = 'ytd-item-section-renderer #content-text';
    const commentList = document.querySelectorAll(commentsClass);
    return Array.from(commentList).filter(isInViewport).map(comment => comment.innerText.trim());
}

function attemptToExtractInViewportComments() {
    console.log("Extracting comments in viewport: ");
    const inViewportComments = extractInViewportComments();
    if (inViewportComments.length > 0) {
      sendCommentsToBackground('inViewportComments', inViewportComments);
    }
}

window.addEventListener('scroll', debounce(attemptToExtractInViewportComments, 300));

// Looks for the YouTube comments that are liked by the user
function extractLikedComments() {
    const commentList = [];
    // Find all ytd-comment-view-model elements
    const commentViewModels = document.querySelectorAll('ytd-comment-view-model');
    // Iterate through each ytd-comment-view-model element
    commentViewModels.forEach(commentViewModel => {
        // Check if it has a child button with aria-pressed=true
        const buttonWithAriaPressed = commentViewModel.querySelector('button[aria-pressed="true"]');
        if (buttonWithAriaPressed) {
            // Found a comment that is liked by user
            const commentEle = commentViewModel.querySelector('#content-text');
            commentList.push(commentEle.innerText.trim());
        }
    });
    return commentList;
}

function attemptToExtractLikedComments() {
    console.log("Extracting comments liked by the user: ");
    const likedComments = extractLikedComments();
    if (likedComments.length > 0) {
      sendCommentsToBackground('likedComments', likedComments);
    }
}

window.addEventListener('click', (event) => {
    // if the user doesn't click like button
    if (event.target.className != "yt-spec-touch-feedback-shape__fill") {
        return;
    }
    attemptToExtractLikedComments();
})