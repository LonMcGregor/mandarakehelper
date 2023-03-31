const btn = document.createElement("button");
btn.innerText = "Add this item to extension list";
btn.className = "extbtn";
btn.addEventListener("click", add_this_item);
document.querySelector(".operate").appendChild(btn);


function add_this_item(e) {
    let prices = [];
    if (!document.querySelector(".detail_panel .soldout")) {
        prices.push(
            [
                document.querySelector(".content_head .shop").innerText,
                document.querySelector(".basicinfo .__price + p").innerText
            ]
        );
    }

    // get other alt stores and prices. Filter on .addcart as sold out items do not have this class in the store link
    prices = prices.concat(Array.from(document.querySelectorAll(".other_item .block")).filter(x => x.querySelector(".addcart")).map(x => [
        x.querySelector(".shop").innerText,
        x.querySelector(".price").innerText
    ]));
    // add all to storage
    data_item = {
        "url": window.location.href,
        "title": document.querySelector("h1").innerText,
        "prices": prices
    };
    chrome.runtime.sendMessage({
        "additem": JSON.stringify(data_item)
    })
        .then(response => {
            e.target.innerText = "Added!";
        });
}
