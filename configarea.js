function calcHeight(value) {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    // min-height + lines x line-height + padding + border
    let newHeight =Math.max(2+numberOfLineBreaks, 5);
    return newHeight;
  }
  
  let textarea = document.getElementById('config');
  textarea.addEventListener("keyup", () => {
    textarea.rows = calcHeight(textarea.value);
  });
  