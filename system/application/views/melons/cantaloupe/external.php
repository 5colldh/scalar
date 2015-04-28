<?
$path_to_icon = $app_root.'views/melons/cantaloupe/images/scalar_logo_small.png';
$css = <<<EOT
@import url(http://fonts.googleapis.com/css?family=Lato:900,400);
html, body {height:100%;}
body {overflow:hidden; background:white !important; }
body, div {margin:0;}
.external-header {height:54px; color: #ccc; background-color: #444; line-height: 54px; font-family: 'Lato', Arial, sans-serif; font-size: 13px;}
.external-header a { color: #ccc; }
.external-back-link {white-space:nowrap; float:left; margin-left:20px; }
.external-remove-link {white-space:nowrap; float:right; margin-right:20px;}
.external-remove-link-left {float:left; }
.logo-wrapper {float:right; list-style-type:none; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px;}
.book-logo {margin-left:20px; margin-top:5px; cursor:pointer; float:left;}
.book-logo img {height:43px;}
.scalar-logo {
	margin-left:10px; margin-top: 2px; cursor:pointer;
	background-image:url("{$path_to_icon}"); background-repeat:no-repeat; background-position: center;
	width:40px; height:50px; float:left;
}
.external-hilite { color: white; text-transform: uppercase; letter-spacing: 1px; }
.external-page {position:absolute; top:54px; left:0px; right:0px; bottom:0px;}
.external-page iframe {width:100%; height:100%; margin:0; padding:0; border:0; overflow:auto; background:white;}
EOT;
$this->template->add_css($css, 'embed');
?>
<script>
function checkCross() {
	var url = "<?=$link?>";
	var iframe = document.getElementById("external-iframe");
	var seen_page_before = document.getElementById('seen_page_before');
	try {
		var loc = iframe.contentDocument.location.href;
		console.log(loc);
	} catch(e) {
		if ('1'==seen_page_before.value) {
			seen_page_before.value = '0';
			if (document.referrer.length) document.location = document.referrer;
		} else {
			seen_page_before.value = '1';
			document.location = url;
		}
	}
}
</script>
<form style="display:none;"><input type="hidden" id="seen_page_before" name="seen_page_before" value="0" /></form>
<div class="external-header">
	<div class="external-back-link">
		<a href="<?=$prev?>" class="path_nav_previous_btn"></a>
		<a href="<?=$prev?>">Return to &nbsp;<span class="external-hilite"><?=$book->title?></span></a>
	</div>
	<div class="external-remove-link">
		<div class="external-remove-link-left"><a href="<?=$link?>">Remove this header</a></div>
		<ol class="logo-wrapper">
<? if (!empty($book->thumbnail)): ?>
			<li class="book-logo"><a href="<?=$base_uri?>"><img src="<?=$base_uri.$book->thumbnail?>" /></a></li>
<? else: ?>
			<li class="scalar-logo" onclick="document.location.href='<?=base_url()?>';"></li>
<? endif; ?>
		</ol>
	</div>
</div>

<div class="external-page">
	<iframe id="external-iframe" onload="checkCross()" src="<?=$link?>"></iframe>
</div>
