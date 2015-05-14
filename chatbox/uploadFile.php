<?php
$fileName = $_FILES["file"]["name"];
$temp= explode('.', $fileName);
$fileName= md5($fileName).rand(1,15). '.' . array_pop($temp);

if (file_exists("upload/" . $fileName)) {
    $fileName= rand(1,15). $fileName;
}
move_uploaded_file($_FILES["file"]["tmp_name"], "upload/" . $fileName);
echo $fileName;
?>