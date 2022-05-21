chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.additem) {
        chrome.storage.local.get({"thelist": "[]"})
        .then(storage => {
            // note: array concat returns a new array
            // array.push modifies the original and returns the size
            const thearray = JSON.parse(storage.thelist);
            thearray.push(request.additem);
            return chrome.storage.local.set({
                "thelist": JSON.stringify(thearray)
            })
        });
    }
});
