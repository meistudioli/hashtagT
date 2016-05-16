<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Content-type: application/json; charset=utf-8");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("x-frame-options:sameorigin");
/*header("max-age: 1000");*/
import_request_variables("gp");
ini_set('display_errors', 0);
require_once './libs/cls_commom.php';
foreach ($_REQUEST as $k => $v) $$k = $v;

$libs = new CommonClass();

switch ($action) {
	case 'htagSuggest':
		$NNP = array('q');
		foreach ($NNP as $k => $v) if (!isset($$v) || empty($$v)) $libs->callBack('not null parameter miss.');

		$qa = (!isset($qa)) ? 5 : (int) $qa;

		$resopnse = array(
			'q' => $q,
			'suggest' => ''
		);

		$suggest = array();
		$amt = rand(1, $qa);
		for ($i=-1,$l=$amt;++$i<$l;) $suggest[] = $q.'XXXX'.$i;
		$resopnse['suggest'] = $suggest;

		$libs->callBack('success', $resopnse);
		break;
	default:
		$libs->callBack('queryError', array(array('errCode'=>'', 'errMsg'=>'Unexcept error occurs. Try it later, please.')));
}//end switch
/*中文*/
?>