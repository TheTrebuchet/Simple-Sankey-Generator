import {Interactive} from "https://vectorjs.org/index.js";

// Construct an interactive within the HTML element with the id "my-interactive"
let exInteractive = new Interactive("my-interactive");
exInteractive.border = true;
let line = exInteractive.line(20,20,40,40)
// Construct a control point at the the location (100, 100)
let control = exInteractive.control(100, 100);