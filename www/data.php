<?php
header('Content-type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Move from database to json format.
// Target format
// [ { name: , reg_time: , count: }, ... ] - that is, a raw dump from the database.

// Php sucks.
class MyDateTime extends \DateTime implements \JsonSerializable
{
    public function jsonSerialize()
    {
        return $this->format("c");
    }
}


// phpinfo(INFO_MODULES);
require_once('./dbconnect.php');

// Parameters
// cutoff = last value we know of, only pass newer than this.
$cutoff = isset ($_GET['cutoff'])
    ? $connection->real_escape_string(trim($_GET['cutoff']))
    : "2018-01-01T12:00:00.000Z";


$sql = "SELECT name, reg_time, count FROM data where reg_time > '$cutoff' and name='FT-00124' order by name, reg_time";
$results = $connection->query($sql);

$rows = array();
while($row = mysqli_fetch_array($results)) {
    $row['reg_time'] = new MyDateTime($row['reg_time']);
    $rows[] = $row;
}

echo json_encode($rows, JSON_NUMERIC_CHECK)

?>
