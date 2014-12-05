(function( $ ) {
	
	var defaults = {
			data: null,
			select: null,
			modal: true,
			urlroot: '',
			selected: null,
			title: 'Choose a Scalar interface',
			msg: '<small>This can be changed at any time. However, there are differences between interfaces that might cause alignment problems when transitioning previously authored content.</small>',
			width: 600,
			height: 500
	};  	
	
    $.fn.melondialog = function(options) {
    	
    	// Options
    	var $this = $(this);
    	opts = $.extend( {}, defaults, options );
    	
    	// Ok/cancel
    	opts['buttons'] = [ 
    	  	{ text: "Continue", class: "generic_button default", click: function() { 
    	  		var selected = $(this).find(':checked').val();
    	  		$(opts.select).val(selected).trigger('change');
    	  		$this.dialog('destroy');
    	  		$this.remove();
    	  	} },
    	  	{ text: "Cancel", class: "generic_button", click: function() { $this.dialog( "destroy" ); $this.remove(); } }
    	];
    	
    	// Structure
    	$this.addClass('melondialog');
    	$('<p>'+opts.msg+'</p>').appendTo($this);
    	var $table = $('<table><tbody><tr></tr></tbody></table>').appendTo($this);
    	
    	// List of melons
    	for (var j = 0; j < opts.data.length; j++) {
    		if (!opts.data[j]['meta']['is_selectable']) continue;
    		var $cell = $('<td></td>').appendTo($table.find('tr'));
    		$('<p>'+opts.data[j]['meta']['name']+'</p>').appendTo($cell);
    		var $img = $('<img src="'+opts.urlroot+opts.data[j]['meta']['thumb_app_path']+'" />').appendTo($cell);
    		$('<p><small>'+opts.data[j]['meta']['description']+'</small></p>').appendTo($cell);
    		var $radio = $('<p><small><input id="cb_'+j+'" type="radio" name="template" value="'+opts.data[j]['meta']['slug']+'" /><label for="cb_'+j+'"> Selected interface</label></small></p>').appendTo($cell);
    		if (opts.selected==opts.data[j]['meta']['slug']) $radio.find('input').prop('checked', true);
    		$img.click(function() {
    			$(this).parent().find('input[type="radio"]').prop('checked', true);
    		});
    	}
    	
    	// Hand over to jQuery UI
    	$this.dialog(opts);
    	
    };
    
}( jQuery ));