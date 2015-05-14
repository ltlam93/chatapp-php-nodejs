<?php
// Bat userId gui tu trinh duyet web
$userId=$_REQUEST["userId"];

include('config.inc.php');
include('database.inc.php');
$randomUserId=0;

// Lay toan bo thong tin ve user do (gom id cua user va id cua ban chat) trong bang chats
$result      =mysql_query("SELECT * FROM chats WHERE userId = $userId ");

// Lay id cua ban chat
while ($row=mysql_fetch_array($result)){
    $randomUserId= $row["randomUserId"];
}

// Neu chua co ban chat
if ($randomUserId == 0){
    // lay random 1 user trong bang users k ban
    $result=mysql_query("SELECT * FROM users WHERE id <> $userId AND inchat like 'N' ORDER BY RAND() LIMIT 1");

    while ($row=mysql_fetch_array($result)){
        $randomUserId=$row["id"];
    }

    // neu tim dc ban chat
    if ($randomUserId != 0){
        // chen id cua user va ban chat vao bang chats
        mysql_query("INSERT INTO chats (userId,randomUserId) values($userId, $randomUserId) ");
        mysql_query("INSERT INTO chats (userId,randomUserId) values($randomUserId, $userId) ");

        // update trang thai cua user thanh Y - dang ban chat
        mysql_query("UPDATE users SET inchat='Y' WHERE id = $userId ");
        mysql_query("UPDATE users SET inchat='Y' WHERE id = $randomUserId ");
    }
}

// Tra ve id cua ban chat
echo $randomUserId;
mysql_close($con);
?>
