<?php
/**
 * Scratchpad to quickly try PHP code
 *
 * See https://github.com/port8000/pad
 * Copyright 2012 Port 8000 UG (haftungsbeschraenkt)
 * This code is licensed under both the MIT and GPL license.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 */
ini_set('track_errors', 1);
ini_set('display_errors', 1);
error_reporting(-1);
set_error_handler('___e');


function ___e($errno, $errstr, $errfile, $errline) {
    global $___s;
    $___s = False;
    if (!defined ('E_RECOVERABLE_ERROR')) { define ('E_RECOVERABLE_ERROR', 4096); }
    $errortype = array (
        E_ERROR           => "Error",
        E_WARNING         => "Warning",
        E_PARSE           => "Parsing Error",
        E_NOTICE          => "Notice",
        E_CORE_ERROR      => "Core Error",
        E_CORE_WARNING    => "Core Warning",
        E_COMPILE_ERROR   => "Compile Error",
        E_COMPILE_WARNING => "Compile Warning",
        E_USER_ERROR      => "User Error",
        E_USER_WARNING    => "User Warning",
        E_USER_NOTICE     => "User Notice",
        E_STRICT          => "Runtime Notice",
        E_RECOVERABLE_ERROR => "Recoverable Error"
        );
    if (array_key_exists($errno, $errortype)) {
        $errtype = $errortype[$errno];
    } else {
        $errtype = "Unknown Error";
    }
    echo '<div class="error">';
    printf('<em>%s:</em> %s<br/>', $errtype, $errstr);
    if (in_array($errno, array(E_ERROR, E_PARSE, E_CORE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR))) {
        debug_print_backtrace();
    }
    echo '</div>';
}


$___c = '';
if (isset($_POST['c'])) {
    $___c = $_POST['c'];
}
$___i = Null;
$___s = true;
$___db = new PDO('sqlite:'.dirname(__FILE__).'/pad.sqlite');
$___db->query('CREATE TABLE IF NOT EXISTS pad (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  success INTEGER DEFAULT 0
)');
$___o = $___db->query('SELECT * FROM pad
        ORDER BY created DESC LIMIT 19')->fetchAll(PDO::FETCH_ASSOC);


if ($___c) {
    foreach ($___o as $___d) {
        if ($___d['code'] === $___c) {
            $___i = False;
        }
    }
    unset($___d);
    if ($___i !== False) {
        $q = $___db->prepare('INSERT INTO pad (code) VALUES (?)');
        $q->execute(array($___c));
        $___i = $___db->lastInsertId();
        unset($q);
    } else {
        $___i = NULL;
    }
}


?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Codepad</title>
<style>
body {
  font: 1em/1.25 Arial,sans-serif;
  margin: 10px;
}
.codelist {
  float:right;
  width: 360px;
  margin: -10px -10px 10px 10px;
  background: white;
  box-shadow: -2px 2px 4px #ddd;
}
.code {
  padding: 2px 4px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
  box-shadow: inset 0 -3px 5px 0 #eee;
  border-left: 4px solid #777;
}
.code:hover {
  box-shadow: none;
}
.code.success_0 {
  border-left: 4px solid #f00;
}
.code.success_1 {
  border-left: 4px solid #0f0;
}
.content {
  margin-right: 370px;
}
.stage,
textarea,
pre {
  font: 1em/1.25 Inconsolata,"DejaVu Sans Mono",Monaco,Consolas,"Courier New",Courier,monospace;
}
pre {
  margin: 0;
}
textarea {
  border: 1px inset #777;
  border-radius: 3px;
  padding: 9px;
  width: 100%;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
textarea:focus,
textarea:active {
  box-shadow: 0 0 3px 3px #cfc;
  border-style: solid;
  border-color: #797;
}

.stage {
  margin: 10px 0;
  border: 1px solid #777;
  border-radius: 3px;
  padding: 9px;
  white-space: pre;
  overflow: auto;
  resize: both;
}

.error {
  border: 1px solid red;
  border-radius: 2px;
  padding: 9px;
}
</style>
<script>
window.onload = function() {
  var c = document.getElementById('c');
  var l = document.querySelectorAll('.codelist div');
  for (var x in l) {
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
};
</script>
</head>
<body>
<div class="codelist">
<?php if ($___i):
    printf('<div class="code"><pre title="%s">%s%s</pre></div>',
        htmlspecialchars($___c, ENT_QUOTES, 'UTF-8'),
        htmlspecialchars(substr($___c, 0, 40), ENT_QUOTES, 'UTF-8'),
        strlen($___c) > 40? '...' : '');
endif ?>
<?php foreach ($___o as $___d) {
    printf('<div class="code success_%s"><pre title="%s">%s%s</pre></div>',
        $___d['success'],
        htmlspecialchars($___d['code'], ENT_QUOTES, 'UTF-8'),
        htmlspecialchars(substr($___d['code'], 0, 40), ENT_QUOTES, 'UTF-8'),
        strlen($___d['code']) > 40? '...' : '');
}
unset($___d);?>
</div>
<div class="content">
<form method="post" action="">
<textarea rows="20" cols="78" name="c" id="c" style="height:100<?php
    echo ($___c)? 'px' : '%'?>"><?php
    echo htmlspecialchars($___c, ENT_QUOTES, 'UTF-8')?></textarea>
<br>
<input type="submit">
</form>
<div class="stage"><?php

if ($___c) {
    try {
        $___r = eval($___c);
        if ($___r === False) {
            $___s = False;
        } elseif ($___r !== Null) {
            echo '<hr/>RESULT:<br/>' . htmlspecialchars($___r, ENT_QUOTES, 'UTF-8');
        }
    } catch (Exception $e) {
        echo 'EXCEPTION THROWN<br/>';
        var_dump($e);
        $___s = false;
    }
    if ($___i !== NULL && $___s === True) {
        $q = $___db->prepare('UPDATE pad SET success = ? WHERE id = ?');
        $q->execute(array($___s, $___i));
    }
} else {
    echo 'Please enter PHP code above.';
}

?></div>
</div>
</body>
</html>
