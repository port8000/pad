import { getCaretPosition } from './static/textarea-caret-position.js';

window.onload = function() {
  var code = document.getElementById('c'),
      l = document.getElementsByClassName('history__item'),
      content = document.getElementsByClassName('content')[0],
      x;

  /* highlight the current statement in the history with actual state
   *
   * The last_state variable is set before closing </body> and reflects the
   * processing success of the current statement */
  if (window.last_state !== undefined) {
    l[0].className += " success_" + (window.last_state? "1" : "0");
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
          current.parentNode.className += ' history--active';
        }, true);

        current.addEventListener('blur', function() {
          current.parentNode.className = current.parentNode.className
                                           .replace(' history--active', '');
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
          } else if (evt.keyCode === 46) { // del
            current.getElementsByClassName('history__delete')[0].click();
            evt.preventDefault();
          }
        }, false);

      })(l[x]);
    }
  }

  /* react to special key events in code editor */
  code.addEventListener('keydown', function(evt) {
    if (evt.ctrlKey && evt.keyCode === 13) { // ctrl+enter
      code.form.submit();
    } else if (evt.keyCode === 13) { // enter
      //evt.preventDefault();
      //code.value += "\n";
      window.setTimeout(function() {
        if (code.scrollHeight > code.offsetHeight) {
          if (content.offsetHeight <= window.innerHeight - 20) {
            code.style.height = (code.offsetHeight+20)+"px";
          }
        }
      });
    } else if (evt.keyCode === 32 && evt.ctrlKey &&
               ! evt.metaKey && ! evt.altKey) { // ctrl+space
        var val = code.value,
            sStart = code.selectionStart,
            sEnd = code.selectionEnd,
            stub = '';
        if (sStart !== sEnd) {
          stub = val.substring(sStart, sEnd);
        } else {
          stub = val.substring(0, sStart);
        }
        stub = stub.split('').reverse().join('');
        stub = stub.replace(/^([a-zA-Z0-9_]*)(.|\s)*$/, '$1');
        stub = stub.split('').reverse().join('');
        if (stub.length > 1) {
          evt.preventDefault();
          var xht = new XMLHttpRequest();
          xht.onreadystatechange = function() {
            if (xht.readyState === 4 && xht.status === 200) {
              var data = JSON.parse(xht.responseText);
              show_functions(stub, data);
            }
          };
          xht.open('GET', '?___f='+encodeURIComponent(stub), true);
          xht.send();
        }
    }
  });

  /**
   *
   */
  function show_functions(stub, data, pos) {
    var overlay = document.createElement('div'), p, plen,
        old = document.querySelector('.overlay');
    if (old) {
      document.body.removeChild(old);
    }
    overlay.className = 'overlay';

    for (var n in data) {
      if (data.hasOwnProperty(n)) {
        overlay.insertAdjacentHTML('beforeend',
            '<p class="overlay__item" tabindex="0" data-func="'+n+'">' +
              data[n] +
              ' ' +
              '<a class="overlay__link" target="_blank" href="http://php.net/' +
                encodeURIComponent(n) + '">' +
                '?</a>' +
            '</p>');
      }
    }

    p = overlay.getElementsByTagName('p');
    plen = p.length;
    if (! plen) {
      /* there is no function to be displayed */
      return;
    }

    pos = pos || getCaretPosition(code);
    overlay.style.top = pos.top + 20 + "px";
    overlay.style.left = pos.left + "px";

    function kill() {
      if (overlay && overlay.parentNode) {
        document.body.removeChild(overlay);
        overlay = undefined;
      }
    }

    document.addEventListener('focus', function _del_overlay(evt) {
      var contained, el = evt.target;
      while (el && el.parentNode) {
        if (el === overlay) {
          contained = true;
          break;
        }
        el = el.parentNode;
      }
      if (! contained) {
        kill();
        document.removeEventListener('focus', _del_overlay);
      }
    }, true);

    overlay.addEventListener('click', function(evt) {
      var i = 0;
      if (evt.target.nodeName.toUpperCase() === 'A') {
        return;
      }

      for (; i < plen; i++) {
        if (p[i] === document.activeElement) {
          var func = p[i].dataset.func;
          if (func) {
            var val = code.value,
                sStart = code.selectionStart,
                sEnd = code.selectionEnd,
                sVal = val.substring(0, sStart).replace(new RegExp(stub+'$'), '') + func;
            evt.preventDefault();
            code.value = sVal + val.substring(sEnd);
            code.selectionStart = code.selectionEnd = sVal.length;
            code.focus();
          }
          break;
        }
      }

      kill();
    });

    overlay.addEventListener('keydown', function(evt) {
      var i = 0, handled = false;

      if (evt.target.nodeName.toUpperCase() === 'A' && evt.keyCode === 13) {
        return;
      }

      if (evt.keyCode === 13 || evt.keyCode === 73) { // enter, i
        overlay.click();
      } else if (evt.keyCode === 71) { // g
        for (; i < plen; i++) {
          if (p[i] === document.activeElement ||
              p[i].querySelector('a') === document.activeElement) {
            p[i].querySelector('a').click();
            break;
          }
        }
      } else if (evt.keyCode === 40 || evt.keyCode === 74) { // ArrDown, j
        for (; i < plen; i++) {
          if (p[i] === document.activeElement ||
              p[i].querySelector('a') === document.activeElement) {
            if (plen > i + 1) {
              p[i+1].focus();
              handled = true;
            }
            break;
          }
        }
        if (! handled) {
          p[0].focus();
        }
        evt.preventDefault();
      } else if (evt.keyCode === 38 || evt.keyCode === 75) { // ArrUp, k
        for (; i < plen; i++) {
          if (p[i] === document.activeElement ||
              p[i].querySelector('a') === document.activeElement) {
            if (i > 0) {
              p[i-1].focus();
              handled = true;
            }
            break;
          }
        }
        if (! handled) {
          p[plen-1].focus();
        }
        evt.preventDefault();
      } else if (evt.keyCode === 35) { // end
        p[p.length - 1].focus();
        evt.preventDefault();
      } else if (evt.keyCode === 36) { // home
        p[0].focus();
        evt.preventDefault();
      } else if (evt.keyCode === 27 || evt.keyCode === 72 ||
                 evt.keyCode === 46) { // esc, h, del
        code.focus();
        kill();
        evt.preventDefault();
      }
    });

    document.body.appendChild(overlay);
    p[0].focus();
  }
};
