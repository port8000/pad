(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* the last_state variable is set before closing </body> and reflects the
 * processing success of the current statement */
/* global Event */
var last_state,
    caret_pos = require('./textarea-caret-position');

window.onload = function() {
  var code = document.getElementById('c'),
      l = document.getElementsByClassName('history__item'),
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
    } else if (evt.keyCode === 32 && evt.ctrlKey &&
               ! evt.metaKey && ! evt.altKey) {
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
        if (stub.length > 2) {
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

    pos = pos || caret_pos(code);
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
          alert(p[i].dataset.func);
          // todo insert func in code
          evt.preventDefault();
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

},{"./textarea-caret-position":2}],2:[function(require,module,exports){
/* jshint browser: true */

// The properties that we copy into a mirrored div.
// Note that some browsers, such as Firefox,
// do not concatenate properties, i.e. padding-top, bottom etc. -> padding,
// so we have to do every single property specifically.
var properties = [
  'direction',  // RTL support
  'boxSizing',
  'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height',
  'overflowX',
  'overflowY',  // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',  // might not make a difference, but better be safe

  'letterSpacing',
  'wordSpacing'
];

var isFirefox = !(window.mozInnerScreenX == null);

var getCaretCoordinatesFn = function (element, position, recalculate) {
  // mirrored div
  var div = document.createElement('div');
  div.id = 'input-textarea-caret-position-mirror-div';
  document.body.appendChild(div);

  var style = div.style;
  var computed = window.getComputedStyle? getComputedStyle(element) : element.currentStyle;  // currentStyle for IE < 9

  // default textarea styles
  style.whiteSpace = 'pre-wrap';
  if (element.nodeName !== 'INPUT')
    style.wordWrap = 'break-word';  // only for textarea-s

  // position off-screen
  style.position = 'absolute';  // required to return coordinates properly
  style.visibility = 'hidden';  // not 'display: none' because we want rendering

  // transfer the element's properties to the div
  properties.forEach(function (prop) {
    style[prop] = computed[prop];
  });

  if (isFirefox) {
    style.width = parseInt(computed.width) - 2 + 'px'  // Firefox adds 2 pixels to the padding - https://bugzilla.mozilla.org/show_bug.cgi?id=753662
    // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
    if (element.scrollHeight > parseInt(computed.height))
      style.overflowY = 'scroll';
  } else {
    style.overflow = 'hidden';  // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
  }  

  div.textContent = element.value.substring(0, position);
  // the second special handling for input type="text" vs textarea: spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
  if (element.nodeName === 'INPUT')
    div.textContent = div.textContent.replace(/\s/g, "\u00a0");

  var span = document.createElement('span');
  // Wrapping must be replicated *exactly*, including when a long word gets
  // onto the next line, with whitespace at the end of the line before (#7).
  // The  *only* reliable way to do that is to copy the *entire* rest of the
  // textarea's content into the <span> created at the caret position.
  // for inputs, just '.' would be enough, but why bother?
  span.textContent = element.value.substring(position) || '.';  // || because a completely empty faux span doesn't render at all
  div.appendChild(span);

  var coordinates = {
    top: span.offsetTop + parseInt(computed['borderTopWidth']),
    left: span.offsetLeft + parseInt(computed['borderLeftWidth'])
  };

  document.body.removeChild(div);

  return coordinates;
}

if (typeof Package !== 'undefined') {
  getCaretCoordinates = getCaretCoordinatesFn;  // Meteor
} else {
  module.exports = getCaretCoordinatesFn;    // Component
}

},{}]},{},[1])