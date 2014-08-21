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
require_once "error_handler.php";


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
        ORDER BY created DESC LIMIT 39')->fetchAll(PDO::FETCH_ASSOC);


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
    <div class="codelist">
      <?php if ($___i):
        printf('<div class="codelist__item"><pre title="%s">%s%s</pre></div>',
            htmlspecialchars($___c, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(substr($___c, 0, 40), ENT_QUOTES, 'UTF-8'),
            strlen($___c) > 40? '...' : '');
      endif ?>
      <?php foreach ($___o as $___d) {
        printf('<div class="codelist__item success_%s"><pre title="%s">%s%s</pre></div>',
            $___d['success'],
            htmlspecialchars($___d['code'], ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(substr($___d['code'], 0, 40), ENT_QUOTES, 'UTF-8'),
            strlen($___d['code']) > 40? '...' : '');
      }
      unset($___o);
      unset($___d);?>
    </div>
    <div class="content">
      <form method="post" action="">
        <textarea rows="20" cols="78" name="c" id="c" autofocus class="code code--<?php
            echo ($___c)? 'filled' : 'empty'?>"><?php
            echo htmlspecialchars(($___c? $___c : (isset($_GET['c'])? $_GET['c'] : '')), ENT_QUOTES, 'UTF-8')?></textarea>
        <br>
        <button type="submit" id="run">run code</button>
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
                } elseif ($___r !== Null) {
                    echo '<hr/>RESULT:<br>' . htmlspecialchars($___r, ENT_QUOTES, 'UTF-8');
                }
            } catch (Exception $e) {
                echo '<div class="error"><span class="error__type">EXCEPTION THROWN</span><div class="error__backtrace">';
                var_dump($e);
                echo '</div>';
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
    </div>
  </body>
</html>
