<?php

// Arbor (wrapper) to use, e.g., 'html5_RDFa'
$config['arbor'] = 'html5_RDFa';

// Array of views; leave value empty and it won't be displayed as a default view option in the editor
$config['views'] = array(
			'plain' => array('name'=>'Basic','description'=>'In the <b>Basic</b> layout, the page\'s text and media are interspersed. You can set the size and placement of linked media as they are added to the page.','image'=>'view_basic.gif'),
			'image_header' => array('name'=>'Image Header','description'=>'In the <b>Image Header</b> layout, the page\'s background image (either its own, or one inherited from its parent) is shown as a header, with the title and description of the page overlaid. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'view_image_header.gif'),
			'splash' => array('name'=>'Splash','description'=>'In the <b>Splash</b> layout, the page\'s background image (either its own, or one inherited from its parent) is shown full screen, with the page\'s title and a continue button overlaid at the bottom.','image'=>'view_splash.gif'),
			'book_splash' => array('name'=>'Book Splash','description'=>'In the <b>Book Splash</b> layout, the page\'s background image (either its own, or one inherited from its parent) is shown full screen, with the book\'s title, author(s), and a continue button overlaid at the bottom.','image'=>'view_book_splash.gif'),
			'gallery' => array('name'=>'Media Gallery','description'=>'In the <b>Media Gallery</b> layout, media contained or tagged by the page are embedded at full width into a vertically scrolling gallery.','image'=>'view_gallery.gif'),
			'structured_gallery' => array('name'=>'Structured Media Gallery','description'=>'In the <b>Structured Media Gallery</b> layout, media contained or tagged up to two levels deep are grouped into titled galleries of thumbnails which reveal the media in a larger view when clicked.','image'=>'view_structured_gallery.gif'),
			'google_maps' => array('name'=>'Google Map','description'=>'The <b>Google Map</b> layout plots the current page plus any content it contains or tags on a Google Map embedded at the top of the page. Every piece of content to be plotted must include <i>dcterms:spatial</i> metadata (added using the \'Metadata\' section below) in the format <i>decimal latitude,decimal longitude</i>. Each pin shown on the map will reveal the title, description, and link for its content when clicked. The rest of the page follows the Basic layout, with text and media interspersed.','image'=>'view_google_map.gif'),
			'iframe' => array('name'=>'IFrame','description'=>'Many third party tools allow their content to be embedded using iframe code which can be pasted into your Scalar page. The <b>iframe</b> layout makes this content more immersive by removing the page\'s title and margins so that setting the iframe\'s width to 100% will cause it to fill all of the available horizontal space on the page.','image'=>'view_iframe.gif'),
			'edit' => '',
			'annotation_editor' => ''
		);

// Default view
$config['default_view'] = 'plain';

// Media reference options (will translate to, e.g., data-property="value")
$config['reference_options'] = array(
			'size' => array('small', 'medium', 'large', 'full'),
			'align' => array('right', 'left'),
			'caption' => array('description', 'title', 'title-and-description', 'none'),
			/*'autoplay' => array('false', 'true'),
			'display-content-preview-box' => array('true', 'false')*/
		);

//Available Visualization Methods
$config['available_visualizations'] = array(
	'pinwheel',
	'sidebar'
);

//Cantaloupe Visualization Method - Default: 'pinwheel'
$config['visualization'] = 'pinwheel'; //Can also be "sidebar" for new vis