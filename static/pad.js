/* the last_state variable is set before closing </body> and reflects the
 * processing success of the current statement */
/* global Event */
var last_state;

window.onload = function() {
  var code = document.getElementById('c'),
      l = document.getElementsByClassName('codelist__item'),
      content = document.getElementsByClassName('content')[0],
      x;

  /* highlight the current statement in the history with actual state */
  if (last_state !== undefined) {
    l[0].className += " success_" + (last_state? "1" : "0");
  }

  /* navigate the history */
  for (x in l) {
    if (l.hasOwnProperty(x)) {
      (function(current) {

        current.addEventListener('click', function(evt) {
          if (evt.target.nodeName.toUpperCase() === 'A') {
            return;
          }
          if (code.value === '') {
            code.value = current.getElementsByTagName('pre')[0]
                                .getAttribute("title");
          } else if (code.value !== current.getElementsByTagName('pre')[0]
                                  .getAttribute("title") &&
                    window.confirm('overwrite code?')) {
            code.value = current.getElementsByTagName('pre')[0]
                                .getAttribute("title");
          }
          code.focus();
          evt.preventDefault();
          evt.stopPropagation();
        }, false);

        /* focus and blur must be catched in the capture phase, see
         * http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
         */
        current.addEventListener('focus', function() {
          current.parentNode.className += ' codelist--active';
        }, true);

        current.addEventListener('blur', function() {
          current.parentNode.className = current.parentNode.className
                                           .replace(' codelist--active', '');
        }, true);

        current.addEventListener('keydown', function(evt) {
          if (evt.target.nodeName.toUpperCase() === 'A') {
            return;
          }
          if (evt.keyCode === 13) { // enter
            current.dispatchEvent(new Event('click'));
          } else if (evt.keyCode === 40 || evt.keyCode === 74) { // ArrDown, j
            if (current.nextElementSibling) {
              current.nextElementSibling.focus();
            }
            evt.preventDefault();
          } else if (evt.keyCode === 38 || evt.keyCode === 75) { // ArrUp, k
            if (current.previousElementSibling) {
              current.previousElementSibling.focus();
            }
            evt.preventDefault();
          } else if (evt.keyCode === 27 || evt.keyCode === 72) { // esc, h
            code.focus();
            evt.preventDefault();
          } else if (evt.keyCode === 35) { // end
            current.parentNode.lastElementChild.focus();
            evt.preventDefault();
          } else if (evt.keyCode === 36) { // home
            current.parentNode.children[0].focus();
            evt.preventDefault();
          }
        }, false);

      })(l[x]);
    }
  }

  /* react to special key events in code editor */
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
      // TODO get cursor position and prev text, then try to match against funcs
    }
  });
};
