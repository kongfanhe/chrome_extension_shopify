

// (async function test() {
//     let product = { "title": "hello" };
//     let image_urls = ["https://www.silverdisc.co.uk/sites/default/files/sd_importer/lion_jpg_21.jpg"];
//     const username = "25a06c0e15efa43cd9af8377d60df652";
//     const password = "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";
//     const address = "testshop1819u89ue.myshopify.com/admin/api/2021-07"
//     // const address = "ptsv2.com/t/qr6n2-1628616721/post";
//     await clear_cookies("myshopify.com");
//     let success = await save_to_shopify(product, image_urls, username, password, address);
//     console.log(success);
// })();



async function clear_cookies(domain) {
    const get_chrome_cookies = () => {
        return new Promise((resolve, reject) => {
            chrome.cookies.getAll({ domain }, cookies => resolve(cookies));
        });
    }
    let cookies = await get_chrome_cookies();
    for (var i = 0; i < cookies.length; i++) {
        let path = cookies[i].path;
        let name = cookies[i].name;
        let cookie_domain = cookies[i].domain;
        let url = "https://" + cookie_domain + path;
        chrome.cookies.remove({ url, name });
        console.log(url, name);
    }
}

async function save_to_shopify(product, image_urls, username, password, address) {
    let url = "https://" + address + "/products.json";
    let auth = 'Basic' + " " + btoa(username + ':' + password);
    let headers = new Headers();
    headers.append('Authorization', auth);
    headers.append('Content-Type', 'application/json');
    let body = JSON.stringify({ product });
    try {
        let response = await fetch(url, { method: 'POST', headers, body });
        let text = await response.text();
        console.log("fetch response:", text);
        let product_id = JSON.parse(text).product.id;
        url = "https://" + address + "/products/" + product_id + "/images.json";
        for (let i = 0; i < image_urls.length; i++) {
            let image_url = "https:" + image_urls[i];
            image_url = image_url.replace(/\.(webp)($|\?)/, '.jpg');
            console.log(image_url);
            body = JSON.stringify({ image: { src: image_url } });
            response = await fetch(url, { method: 'POST', headers, body });
            text = await response.text();
            console.log("fetch response:", text);
        }
        return response.ok;
    } catch (error) {
        console.log("fetch error:", error);
        return false;
    }
}

async function save_product(product, image_urls) {
    const username = "25a06c0e15efa43cd9af8377d60df652";
    const password = "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";
    const address = "testshop1819u89ue.myshopify.com/admin/api/2021-07"
    await clear_cookies("myshopify.com");
    let success = await save_to_shopify(product, image_urls, username, password, address);
    return success
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const { product, image_urls } = msg;
    save_product(product, image_urls)
        .then(success => sendResponse(success));
    return true
});
