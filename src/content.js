const btn = document.createElement("button");
btn.innerText = "Add this item to extension list";
btn.className = "extbtn";
btn.addEventListener("click", add_this_item);
document.querySelector(".operate").appendChild(btn);


function add_this_item(e) {
    let prices = [];
    if (!document.querySelector(".soldout")) {
        prices.push(
            [
                document.querySelector(".content_head .shop").innerText.trim(),
                document.querySelector(".basicinfo .__price + p").innerText.trim()
            ]
        );
    }

    // get other alt stores and prices
    prices = prices.concat(Array.from(document.querySelectorAll(".other_item .block")).map(x => [
        x.querySelector(".shop").innerText.trim(),
        x.querySelector(".price").innerText.trim()
    ]));
    // add all to storage
    data_item = {
        "url": window.location.href,
        "title": document.querySelector("h1").innerText.trim(),
        "prices": prices
    };
    chrome.runtime.sendMessage({
        "additem": JSON.stringify(data_item)
    })
        .then(response => {
            e.target.innerText = "Added!";
        });
}
