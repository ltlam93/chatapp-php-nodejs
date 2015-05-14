<?php
// Bat userId gui tu trinh duyet web
$userId=$_REQUEST["userId"];

$msg   ="";
$randomUserId;

include ('config.inc.php');
include ('database.inc.php');

// Lay toan bo thong tin ve user do (gom id cua user va id cua ban chat) trong bang chats
$result=mysql_query("SELECT * FROM chats WHERE userId = $userId ");

// neu user co trong bang chats
if (mysql_num_rows($result) > 0){
    // lay tin nhan moi nhat tu ban chat
    $result=mysql_query("SELECT * FROM msgs WHERE randomUserId = $userId ORDER BY sentdate limit 1");

    $id    =0;

    while ($row=mysql_fetch_array($result)){
        $id          = $row["id"];
        $msg         =$row["msg"];
        $randomUserId=$row["userId"];
    }

    // neu co tin nhan moi
    if ($id != 0){
        // xoa no trong bang msgs
        mysql_query ("DELETE FROM msgs WHERE id = $id ");
        // va chen vao bang oldMsgs
        mysql_query ("INSERT INTO oldMsgs(userId,randomUserId,msg) VALUES( $randomUserId,$userId,'$msg'); ");
    }
}else{
    echo "||--noResult--||";
}

mysql_close ($con);

// Tra ve tin nhan moi
echo urldecode($msg);
?>
