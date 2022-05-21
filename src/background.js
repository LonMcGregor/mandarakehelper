chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.additem) {

        chrome.storage.local.get({"thelist": []})

        fetch(request.additem)
        .then(response => response.text())
        .then(bodytext => {
            const parser = new DOMParser();
            return parser.parseFromString(text, "text/html");
        })
        .then(body => {
            // get main item title, store and price
            let prices = [];
            prices.push(
                [
                    body.querySelector(".content_head .shop").innerText,
                    body.querySelector(".basicinfo .__price + p").innerText
                ]
            );
            // get other alt stores and prices
            prices = prices.concat(Array.from(body.querySelectorAll(".other_item .block")).map(x => [
                x.querySelector(".shop").innerText,
                x.querySelector(".price").innerText
            ]));
            // add all to storage
            return {
                "url": body.querySelector("link[hreflang=en]").href,
                "title": body.querySelector("h1").innerText,
                "prices": prices
            };
        })
        .then(itemdata => {
            return [Promise.resolve(chrome.storage.local.get({"thelist": "[]"})), itemdata];
        })
        .then(function ([storage, itemdata]){
            return chrome.storage.local.set({
                "thelist": JSON.stringify(JSON.parse(storage.thelist).push(itemdata))
            })
        })
    }
});
