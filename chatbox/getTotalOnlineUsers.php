<?php
include('config.inc.php');

include('database.inc.php');

$result=mysql_query("SELECT * FROM users where inchat like 'Y'");

$count = mysql_num_rows($result);

echo $count;
?>
