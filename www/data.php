<?php
header('Content-type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


# Move from database to json format.
# Target format
# [ { name: , reg_time: , count: }, ... ]

// phpinfo(INFO_MODULES);

require_once('./dbconnect.php');

$sql = "SELECT name, reg_time, count FROM data where reg_time > '2018-02-03 12:00:00' order by name, reg_time";
$results = $connection->query($sql);

$rows = array();
while($row = mysqli_fetch_array($results)) {
    $rows[] = $row;
}

echo json_encode($rows)

?>
