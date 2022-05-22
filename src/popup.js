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
