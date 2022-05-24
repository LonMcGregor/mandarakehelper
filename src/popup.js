function deleteItem(event) {
    const row = event.target.parentElement.parentElement;
    const title = row.querySelector("a").innerText;
    chrome.runtime.sendMessage({ "removeitem": title })
        .then(response => {
            row.parentElement.removeChild(row);
        });
}

chrome.storage.local.get({ "thelist": "[]" })
    .then(data => JSON.parse(data.thelist))
    .then(data => {
        // placeholder in first entry, so the stores line up with the table rows
        // the first item of any row is the title, not a store
        const order_of_stores = ["placeholder"];

        // get a refrence to the header row and table
        const table = document.querySelector("table tbody");
        const head = document.querySelector("table > tbody > tr");

        // process each stored item
        data.forEach(item => {
            //make a row for it
            const row = document.createElement("tr");

            // and add the first element with the item title and a link
            const itemcell = document.createElement("td");
            const itemlink = document.createElement("a");
            itemlink.href = item.url;
            itemlink.innerText = item.title;
            itemcell.appendChild(itemlink);
            row.appendChild(itemcell);
            table.appendChild(row);

            // add a delete button
            const delbtn = document.createElement("button");
            delbtn.innerText = "x";
            itemcell.insertAdjacentElement("afterbegin", delbtn);
            delbtn.addEventListener("click", deleteItem);

            // keep track of all of the stores, again account for the fact
            // that the 0th item is the item title
            const stores = ["placeholder"];

            // add empty cells for each of the shops we know about already
            for (let i = 1; i < order_of_stores.length; i++) {
                const storecell = document.createElement("td");
                stores.push(storecell);
                row.appendChild(stores[i]);
            }

            // add the entries for each store
            for (let i = 0; i < item.prices.length; i++) {
                const store = item.prices[i][0];
                const price = item.prices[i][1];
                // get the index of this store
                let storeindex = order_of_stores.indexOf(store);
                // if it doesn't exist we need to add a new cell
                if (storeindex == -1) {
                    order_of_stores.push(store);

                    // to the header of the table
                    const storeheader = document.createElement("th");
                    storeheader.innerText = store;
                    head.appendChild(storeheader);

                    // and this row of the table for this item
                    const storecell = document.createElement("td");
                    stores.push(storecell);
                    row.appendChild(storecell);
                }
                // set the price of the item into this store's cell
                storeindex = order_of_stores.indexOf(store);
                stores[storeindex].innerHTML = stores[storeindex].innerHTML + price + "<br>";
            }
        })
    })

async function checkPriceFor(url) {
    // https://stackoverflow.com/questions/28250680/how-do-i-access-previous-promise-results-in-a-then-chain
    // accessing intermdiate values in a promise chain
    // split the chain up (you can do that‽)
    var mainprices = fetch(url)
        .then(response => response.text())
        .then(text => {
            const shopid = /shop:\s+'(\d+)'/.exec(text)[1];
            const itemid = /id:\s+'(\d+)'/.exec(text)[1];
            const parser = new DOMParser();
            const body = parser.parseFromString(text, "text/html");
            let prices = [
                body.querySelector(".content_head .shop").innerText.trim(),
                body.querySelector("meta[itemprop=price]").getAttribute("content").trim()
            ];
            return {
                itemid: itemid,
                store: shopid,
                prices: prices,
                title: body.querySelector("h1").innerText
            };
        });
    var altprices = mainprices
        .then(data => {
            const formData = new FormData();
            formData.append('itemCode', data.itemid);
            formData.append('lang', 'en');
            formData.append('deviceId', '');
            formData.append('shop', data.store);
            const referer = 'https://order.mandarake.co.jp/order/detailPage/item?itemCode=' + data.itemid + '&ref=list&sort=title&sortOrder=0&lang=en';

            return fetch("https://tools.mandarake.co.jp/tools/otherItems/", {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData
            });
        })
        .then(response => response.text())
        .then(text => {
            const parser = new DOMParser();
            const body = parser.parseFromString(text, "text/html");
            return Array.from(body.querySelectorAll(".block")).map(x => [
                x.querySelector(".shop").innerText,
                x.querySelector(".price").innerText
            ]);
        });
    // complete network requests and update storage
    return Promise.all([mainprices, altprices])
        .then(function ([mainprices, altprices]) {
            data_item = {
                "url": url, // TODO change to use the unique item ID instead of titles and urls
                "title": mainprices.title,
                "prices": mainprices.prices.concat(altprices)
            };
            return chrome.runtime.sendMessage({
                "updateitem": JSON.stringify(data_item)
            })
        })
        .then(response => {
            incrementRecheckButton();
        })
        .then(resolve => setTimeout(resolve, 2000)) // add a delay to avoid hammering mandarake servers
        .catch(() => {
            document.querySelector("#recheck").innerText = "Encountered error checking entry " + pricesChecked;
        });
}

// foreach with promises
// https://riptutorial.com/javascript/example/7609/foreach-with-promises
async function recheckPrices() {
    var i = 0;
    const URLsToCheck = Array.from(document.querySelectorAll("table a")).map(x => x.href);

    var nextPromise = function () {
        if (i >= URLsToCheck.length) {
            // Processing finished.
            return;
        }

        var newPromise = checkPriceFor(URLsToCheck[i]);
        i++;
        // Chain to finish processing.
        return newPromise.then(nextPromise);
    };

    // Kick off the chain.
    return Promise.resolve().then(nextPromise);
};

function incrementRecheckButton() {
    pricesChecked++;
    document.querySelector("#recheck").innerText = "Checking " + pricesChecked + "/" + (Array.from(document.querySelectorAll("tr")).length - 1) + "...";
}

function recheckPricesPress(event) {
    event.target.removeEventListener("click", recheckPricesPress);
    pricesChecked = -1;
    incrementRecheckButton();
    recheckPrices();
}

let pricesChecked = 0;
const recheckbtn = document.createElement("button");
recheckbtn.id = "recheck";
recheckbtn.innerText = "Recheck Prices";
recheckbtn.addEventListener("click", recheckPricesPress);
document.body.appendChild(recheckbtn);
