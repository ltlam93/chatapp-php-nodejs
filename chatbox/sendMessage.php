<?php
$userId      =$_REQUEST["userId"];

$randomUserId=$_REQUEST["strangerId"];
$msg         =urlencode($_REQUEST["message"]);

include('config.inc.php');
include('database.inc.php');

mysql_query("INSERT INTO msgs(userId,randomUserId,msg) VALUES($userId, $randomUserId, '$msg'); ");

mysql_close($con);
echo urldecode($msg);
?>
