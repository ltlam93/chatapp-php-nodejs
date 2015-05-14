<?php
include('config.inc.php');

include('database.inc.php');

$result=mysql_query("SELECT * FROM users");

$count =0;

while ($row=mysql_fetch_array($result)){
    $count++;
}

mysql_close($con);

echo $count;
?>
