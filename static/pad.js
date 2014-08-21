var last_state;

window.onload = function() {
  var c = document.getElementById('c'),
      l = document.getElementsByClassName('codelist__item'),
      x;

  if (last_state !== undefined) {
    l[0].className += " success_" + (last_state? "1" : "0");
  }

  for (x in l) {
    if (l.hasOwnProperty(x)) {
      l[x].addEventListener('click', (function(x) { return function() {
        if (c.value === '') {
          c.value = x.getElementsByTagName('pre')[0].getAttribute("title");
        } else if (c.value !== x.getElementsByTagName('pre')[0]
                                .getAttribute("title") &&
            confirm('overwrite code?')) {
          c.value = x.getElementsByTagName('pre')[0].getAttribute("title");
        }
        c.focus();
        return false;
      };
      })(l[x]), false);
      l[x].addEventListener('keyup', (function(x) { return function(evt) {
        if (evt.keyCode === 13) {
          x.dispatchEvent(new Event('click'));
        } else if (evt.keyCode === 40 || evt.keyCode === 74) {
          x.nextSibling.focus();
          evt.preventDefault();
        } else if (evt.keyCode === 38 || evt.keyCode === 75) {
          x.previousSibling.focus();
          evt.preventDefault();
        }
      };
      })(l[x]), false);
    }
  }

  c.addEventListener('keyup', function(evt) {
    if (evt.ctrlKey && evt.keyCode === 13) {
      c.form.submit();
    }
  });
};
