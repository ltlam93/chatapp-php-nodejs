<?php

$userId=$_REQUEST["userId"];

include('config.inc.php');
include('database.inc.php');

mysql_query("DELETE FROM users WHERE id = $userId ;");

mysql_query("DELETE FROM chats WHERE userId = $userId ;");

mysql_query("DELETE FROM chats WHERE randomUserId = $userId ;");

mysql_close($con);
?>
