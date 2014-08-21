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
ini_set('display_errors', 0);
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
    printf('<span class="error__type"><em>%s:</em> %s</span>', $errtype, $errstr);
    if (in_array($errno, array(E_ERROR, E_PARSE, E_CORE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR))) {
        echo '<div class="error__backtrace">';
        debug_print_backtrace();
        echo '</div>';
    }
    echo '</div>';
}


#EOF
