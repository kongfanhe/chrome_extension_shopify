


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
  button.click(async function () {
    await save(title, price, image_urls, sizes, colors);
  });
  div.append(button)
  $('#content_container').empty().append(div);
}


async function save(title, price, image_urls, sizes, colors) {
  sizes = auto_index_arr(sizes);
  colors = auto_index_arr(colors);
  const { options, variants } = create_options_variants(sizes, colors, price);
  const product = { title, options, variants };
  console.log(product);
  await save_shopify_bg(product, image_urls);
}

async function save_shopify_bg(product, image_urls) {
  chrome.runtime.sendMessage({ product, image_urls }, function (success) {
    if (success) {
      alert("Success!");
    } else {
      alert("Failed Saving Data!");
    }
  });
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
