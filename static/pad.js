var last_state;

window.onload = function() {
  var code = document.getElementById('c'),
      l = document.getElementsByClassName('codelist__item'),
      content = document.getElementsByClassName('content')[0],
      stage = document.getElementsByClassName('stage')[0],
      x;

  if (last_state !== undefined) {
    l[0].className += " success_" + (last_state? "1" : "0");
  }

  for (x in l) {
    if (l.hasOwnProperty(x)) {

      l[x].addEventListener('click', (function(x) {
        return function() {
          if (code.value === '') {
            code.value = x.getElementsByTagName('pre')[0].getAttribute("title");
          } else if (code.value !== x.getElementsByTagName('pre')[0]
                                  .getAttribute("title") &&
                    confirm('overwrite code?')) {
            code.value = x.getElementsByTagName('pre')[0].getAttribute("title");
          }
          code.focus();
          return false;
        };
      })(l[x]), false);

      l[x].addEventListener('keydown', (function(x) {
        return function(evt) {
          if (evt.keyCode === 13) { // enter
            x.dispatchEvent(new Event('click'));
          } else if (evt.keyCode === 40 || evt.keyCode === 74) { // ArrDown, j
            if (x.nextElementSibling) {
              x.nextElementSibling.focus();
            }
            evt.preventDefault();
          } else if (evt.keyCode === 38 || evt.keyCode === 75) { // ArrUp, k
            if (x.previousElementSibling) {
              x.previousElementSibling.focus();
            }
            evt.preventDefault();
          } else if (evt.keyCode === 27 || evt.keyCode === 72) { // esc, h
            code.focus();
            evt.preventDefault();
          } else if (evt.keyCode === 35) { // end
            x.parentNode.lastElementChild.focus();
            evt.preventDefault();
          } else if (evt.keyCode === 36) { // home
            x.parentNode.children[0].focus();
            evt.preventDefault();
          }
        };
      })(l[x]), false);

    }
  }

  code.addEventListener('keydown', function(evt) {
    if (evt.ctrlKey && evt.keyCode === 13) {
      code.form.submit();
    } else if (evt.keyCode === 13) {
      evt.preventDefault();
      code.value += "\n";
      if (code.scrollHeight > code.offsetHeight) {
        if (content.offsetHeight <= window.innerHeight - 20) {
          code.style.height = (code.offsetHeight+20)+"px";
        }
      }
    } else if (evt.keyCode > 64 && evt.keyCode < 91 && ! evt.ctrlKey &&
               ! evt.metaKey && ! evt.altKey) {
    }
  });
};
