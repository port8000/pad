window.onload = function() {
  var c = document.getElementById('c'),
      l = document.getElementsByClassName('codelist__item'),
      x;

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
        return false;
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
