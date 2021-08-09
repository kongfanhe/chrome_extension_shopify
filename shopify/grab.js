


document.body.onload = function () {
  let div = $("<div>", { "class": "grab" });
  let button = $("<button>", { "text": "Grab" });
  button.click(grab);
  div.append(button);
  div.append($("<div>", { id: "content_container" }));
  $(document.body).append(div);
}


function grab() {
  let { title, price, image_urls, sizes, colors } = extract_data();
  let div = $("<div>");
  div.append(`<br><div>TITLE: ${title}</div>`);
  div.append(`<br><div>PRICE: ${price}</div><br>`);
  let imgs_div = $("<div>");
  image_urls.forEach(url => {
    imgs_div.append(`<img src='${url}'></img>`);
  });
  div.append(imgs_div)
  div.append(`<br><div>SIZES: ${sizes.join("  ")}</div>`);
  div.append(`<br><div>COLORS: ${colors.join("  ")}</div><br>`);
  let button = $("<button>", { "text": "Save" });
  button.click(function () {
    save(title, price, image_urls, sizes, colors);
  });
  div.append(button)
  $('#content_container').empty().append(div);
}


function save(title, price, image_urls, sizes, colors) {
  sizes = auto_index_arr(sizes);
  colors = auto_index_arr(colors);
  const { options, variants } = create_options_variants(sizes, colors, price);

  const product = { title, options, variants };

  console.log(product);

  const username = "25a06c0e15efa43cd9af8377d60df652";
  const password = "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";
  const address = "testshop1819u89ue.myshopify.com/admin/api/2021-07/products.json";

  // save_shopify_ajax(product, username, password, address);
  // save_shopify_fetch(product, username, password, address);
  save_shopify_bg(product, username, password, address);

}

function save_shopify_bg(product, username, password, address) {
  chrome.runtime.sendMessage({ product, username, password, address });
  let intervalID = setInterval(function () {
    chrome.storage.sync.get("status", ({ status }) => {
      if (status != 0) {
        window.clearInterval(intervalID);
        if ((status == 201) || (status == 200)){
          alert("Success!");
        } else {
          alert("Failed Saving Data!");
        }
      }
    });
  }, 500);
}


function save_shopify_ajax(product, username, password, address) {
  const url = "https://" + username + ":" + password + "@" + address;
  // let url = "https://ptsv2.com/t/cerqj-1628472941/post";
  $.ajax({
    url: url,
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify({ product }),
    processData: false,
    success: function (data, textStatus, jQxhr) {
      console.log("success");
    },
    error: function (jqXhr, textStatus, errorThrown) {
      console.log(jqXhr, textStatus, errorThrown);
    }
  });
}


function save_shopify_fetch(product, username, password, address) {
  let headers = new Headers();
  headers.append('Authorization', 'Basic' + " " + btoa(username + ':' + password));
  headers.append('Content-Type', 'application/json');
  let url = "https://" + address;
  // let url = "https://ptsv2.com/t/cerqj-1628472941/post";
  fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({product}),
  }).then(response => {
    console.log(response);
  })
}


function auto_index_arr(arr) {
  let unique_arr = [];
  for (let n = 0; n < arr.length; n++) {
    let v = arr[n];
    if (unique_arr.includes(v)) {
      v = v + "" + n;
    }
    unique_arr.push(v);
  }
  return unique_arr
}


function create_options_variants(sizes, colors, price) {
  let features = [sizes, colors];
  let names = ["Size", "Color"];
  let options = [];
  let valid_features = [];
  for (let n = 0; n < features.length; n++) {
    let values = features[n];
    let name = names[n];
    if (values.length > 0) {
      options.push({ name, values });
      valid_features.push(values);
    }
  }
  let variants = create_variants(valid_features, price);
  return { options, variants };
}

function mlen(array) {
  let lengths = [];
  array.forEach(a => {
    lengths.push(a.length);
  });
  return lengths.reduce((a, b) => a * b, 1)
}

function create_variants(features, price, variants, n_features) {
  if (variants == undefined) {
    variants = [];
    for (let n = 0; n < mlen(features); n++) {
      variants.push({});
    }
    n_features = 0;
    return create_variants(features, price, variants, n_features)
  } else if (n_features >= features.length) {
    return variants;
  } else {
    let p = mlen(features.slice(0, n_features));
    let q = features[n_features].length;
    let key = `option${n_features + 1}`;
    for (let n = 0; n < variants.length; n++) {
      let m = parseInt(n / p) % q;
      variants[n][key] = features[n_features][m];
      variants[n]["price"] = price;
    }
    n_features++;
    return create_variants(features, price, variants, n_features)
  }
}


function extract_data() {
  let title = "";
  let price = "";
  let image_urls = [];
  let sizes = [];
  let colors = [];

  title = $(".product-intro__head-name").text();
  price = $(".product-intro__head-price").find("span").text();
  $(".product-intro__thumbs-inner").find("img").each(function () {
    image_urls.push($(this).attr("data-src"));
  });
  $(".product-intro__size-choose").find("span.inner").each(function () {
    let s = $(this).text();
    s = s.trim();
    sizes.push(s);
  });
  $(".product-intro__color-choose").find("div").each(function () {
    let c = $(this).attr("aria-label");
    if (typeof c !== 'undefined' && c !== false) {
      colors.push(c);
    };
  });

  return { title, price, image_urls, sizes, colors };
}
