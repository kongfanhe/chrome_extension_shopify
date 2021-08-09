

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const { product, username, password, address } = msg;
    console.log(product)
    let headers = new Headers();
    headers.append('Authorization', 'Basic' + " " + btoa(username + ':' + password));
    headers.append('Content-Type', 'application/json');

    let url = "https://" + address;
    // let url = "https://ptsv2.com/t/5iwmv-1628480073/post";

    chrome.storage.sync.set({ "status": 0 });
    fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ product }),
    }).then(response => {
        console.log("response", response);
        response.text().then(function (text) {
          console.log("text", text);
        });
        chrome.storage.sync.set({ "status": response.status });
    }).catch((error) => {
        console.log("error", error);
        chrome.storage.sync.set({ "status": -1 });
    });
    sendResponse("done");
});