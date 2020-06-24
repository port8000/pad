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
require_once 'error_handler.php';


define('HISTSIZE', 99);


$___c = '';
if (isset($_POST['c'])) {
    $___c = $_POST['c'];
    error_log("PHP Pad here. I'm about to eval() some code in file ".__FILE__);
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

if (isset($_GET['___k']) && is_numeric($_GET['___k'])) {
    /* a history item is selected to be deleted */
    $___db->prepare('DELETE FROM pad WHERE "id" = ?')
          ->execute(array($_GET['___k']));
    header('Location: '.$_SERVER['PHP_SELF']);
    die();
}

if (isset($_GET['___f']) && strlen($_GET['___f']) > 1 &&
    ! preg_match('/[^a-zA-Z0-9_]/', $_GET['___f'])) {
    /* a function definition is requested */
    header('Content-type: application/json; charset=utf-8');
    require_once 'functions.php';
    $result = array();
    foreach ($functions as $name => $synopsis) {
        if (strpos($name, $_GET['___f']) === 0) {
            $result[$name] = $synopsis;
        }
    }
    die(json_encode($result));
}

$___o = $___db->query('SELECT * FROM pad
        ORDER BY created DESC LIMIT '.HISTSIZE)->fetchAll(PDO::FETCH_ASSOC);


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
    <style><?php include "static/pad.css" ?></style>
    <script><?php include "static/pad.js" ?></script>
  </head>
  <body>
    <div class="history" tabindex="-1">
      <?php if ($___i):
      printf('<div class="history__item" tabindex="0">
              <a class="history__delete" href="?___k='.$___i.'" title="delete this entry">×</a>
              <pre title="%s">%s%s</pre></div>',
            htmlspecialchars($___c, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(substr($___c, 0, 40), ENT_QUOTES, 'UTF-8'),
            strlen($___c) > 40? '...' : '');
      endif ?>
      <?php foreach ($___o as $___d) {
          printf('<div class="history__item success_%s" tabindex="0">
              <a class="history__delete" href="?___k='.$___d['id'].'" title="delete this entry">×</a>
              <pre title="%s">%s%s</pre></div>',
            $___d['success'],
            htmlspecialchars($___d['code'], ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(substr(trim(preg_replace('/\r?\n([ \t]*\r?\n)+/', "\n", $___d['code'])), 0, 40), ENT_QUOTES, 'UTF-8'),
            strlen($___d['code']) > 40? '...' : '');
      }
      unset($___o);
      unset($___d);?>
    </div>
    <div class="content">
      <form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF'], ENT_QUOTES, 'UTF-8') ?>">
        <textarea placeholder="Enter PHP code here (without leading &lt;?php)"
                  rows="20" cols="78" name="c" id="c" autofocus tabindex="1"
                  class="code code--<?php
                      echo ($___c)? 'filled' : 'empty'?>"><?php
          echo htmlspecialchars(($___c? $___c : (isset($_GET['c'])? $_GET['c'] : '')), ENT_QUOTES, 'UTF-8');
        ?></textarea>
        <br>
        <button type="submit" id="run" tabindex="2">run code</button>
        <small>(or press <kbd>Ctrl+Enter</kbd>)</small>
      </form>
      <div class="stage"><?php

        if ($___c) {
            try {
                if (function_exists('untaint')) {
                    untaint($___c);
                }
                $___r = eval($___c);
                if ($___r === False) {
                    $___s = False;
                    $e = error_get_last();
                    ___e($e['type'], $e['message'], $e['file'], $e['line']);
                } elseif ($___r !== Null) {
                    if (! is_string($___r)) {
                        $___r = print_r($___r, true);
                    }
                    echo '<hr/>RETURNED VALUE:<br>' . htmlspecialchars($___r, ENT_QUOTES, 'UTF-8');
                }
            } catch (Exception $e) {
                echo '<div class="error"><span class="error__type">EXCEPTION THROWN</span><div class="error__backtrace">';
                var_dump($e);
                echo '</div></div>';
                $___s = false;
            }
            if ($___i !== NULL && $___s === True) {
                $q = $___db->prepare('UPDATE pad SET success = ? WHERE id = ?');
                $q->execute(array($___s, $___i));
            }
        } else {
            ?>Please enter PHP code above. No starting <code>&lt;?php</code> is needed.<?php
        } ?>
</div>
    <p><small title="If you can see this, there was no uncaught fatal error above."><code>EOF</code></small></p>
    </div>
    <?php if ($___i !== NULL): ?>
      <script>last_state = <?php echo $___s? '1' : '0' ?>;</script>
    <?php endif ?>
  </body>
</html>
