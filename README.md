# Chrome Extension Shopify Test Demo

## Introduction

A test demo of the Chrome extension app to save the product info to the shopify web store.


## How to use
1. Download this repo as a ZIP file from GitHub.
2. Unzip the file and find a diretory named **shopify**.
3. In Chrome go to the extensions page (chrome://extensions).
4. Enable Developer Mode.
5. Load the **shopify** directory.

## Features
1. Recursive combination for arbitrary set of variants (sizes, colors and more). The code can work on more than two variants , you only have to change the list definition (Line 121 of **grab.js**).
2. Send http request in the background to avoid CORS issues.
3. In case the variant has duplicate string, add auto-indexed suffix to the string (Line 107 of **grab.js**)

