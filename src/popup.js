const CONVERSION_RATE = 0.0062;
const POSTAGE = 3600;

function deleteItem(event) {
    const row = event.target.parentElement.parentElement;
    const title = row.querySelector("a").title;
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
        const store_running_totals = ["Totals"];

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
            itemlink.innerText = item.title.substring(item.title.length-15);
            itemlink.title = item.title;
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
                    store_running_totals.push(0);

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
                // add a basic conversion stored in the title
                stores[storeindex].title = "£" + Number.parseFloat(Number(price.split("yen")[0])*CONVERSION_RATE).toFixed(2);
                stores[storeindex].innerHTML = stores[storeindex].innerHTML + price + "<br>";
                // turn the "X yen" string into a number as best as possible
                store_running_totals[storeindex] = store_running_totals[storeindex] + Number(price.split("yen")[0]);
            }
        })

        const row = document.createElement("tr");
        for (let i = 0; i < store_running_totals.length; i++) {
            const cell = document.createElement("td")
            cell.innerText = store_running_totals[i] + "円";
            cell.title = "£" + Number.parseFloat(store_running_totals[i]*CONVERSION_RATE).toFixed(2);
            row.appendChild(cell);
        }
        document.querySelector("tbody").appendChild(row);

        const rowpp = document.createElement("tr");
        for (let i = 0; i < store_running_totals.length; i++) {
            const cell = document.createElement("td")
            cell.innerText = "£" + Number.parseFloat((store_running_totals[i]+POSTAGE)*CONVERSION_RATE).toFixed(2);
            rowpp.appendChild(cell);
        }
        document.querySelector("tbody").appendChild(rowpp);
    })

function openInTab(event){
    // Only allow opening one tab at a time from the popup
    if(!window.location.search){
        chrome.tabs.create({url: window.location.href+"?tab=1"})
    }
}

document.querySelector("#itemhead").addEventListener("click", openInTab);
