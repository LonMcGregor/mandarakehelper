document.querySelectorAll(".content .block").forEach(saleitem => {
    const btn = document.createElement("button");
    btn.innerText = "compare";
    btn.className = "extbtn";
    btn.addEventListener("click", e => {
        chrome.runtime.sendMessage({"additem": e.target.parentElement.querySelector("a").href}, response => {
            e.target.innerText = "Added!";
        })
    });
    saleitem.appendChild(btn);
})
