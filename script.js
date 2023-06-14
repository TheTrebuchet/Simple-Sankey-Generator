import {Interactive} from "https://vectorjs.org/index.js";

// Construct an interactive within the HTML element with the id "my-interactive"
let exInteractive = new Interactive("my-interactive");
exInteractive.border = true;
for (let i = 1; i<10; i++) {
    let line = exInteractive.line(10*i,20,40,40)
}

