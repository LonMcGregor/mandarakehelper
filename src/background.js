chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.additem) {
        chrome.storage.local.get({ "thelist": "[]" })
            .then(storage => {
                // note: array concat returns a new array
                // array.push modifies the original and returns the size
                const thearray = JSON.parse(storage.thelist);
                const thenewitem = JSON.parse(request.additem);
                thearray.push(thenewitem);
                return chrome.storage.local.set({
                    "thelist": JSON.stringify(thearray)
                })
            });
    } else if (request.removeitem) {
        chrome.storage.local.get({ "thelist": "[]" })
            .then(storage => {
                // note: array concat returns a new array
                // array.push modifies the original and returns the size
                const thearray = JSON.parse(storage.thelist);
                const titletoremove = request.removeitem;
                const newarray = thearray.filter(x => x.title !== titletoremove);
                return chrome.storage.local.set({
                    "thelist": JSON.stringify(newarray)
                })
            });
    }
});
