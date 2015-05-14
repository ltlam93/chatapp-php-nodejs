<?php
include('config.inc.php');
include('database.inc.php');

// Chen 1 user moi vao bang users voi inchat=N (not busy)
mysql_query("INSERT INTO users (inchat) values('N');");

// Tra ve id cua user vua them vao
echo mysql_insert_id();

mysql_close($con);
?>