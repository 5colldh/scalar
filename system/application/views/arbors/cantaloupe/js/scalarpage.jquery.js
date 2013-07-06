(function($) {

	$.scalarpage = function(e, options) {
	
		/**
		
		TODO:
		
		- You tend to read the lateral (right) button before the down (enter path) button, even though the latter should probably come first
		- What happens when media extends beyond height of content (http://scalar.usc.edu/works/guide/creating-an-account?template=cantaloupe)
		- When images have white borders, can be hard to tell if caption is for the image above or below it (http://scalar.usc.edu/works/guide/reading-in-scalar?template=cantaloupe)
		- Should subway map buttons include things like (enter path at) and such?
		- Animated page transitions to emphasize spatial relationship?
		- Make buttons know your history so they suggest the right thing to do, otherwise you can get stuck in loops
		- Continue implies the content is continued, but this isn't always the case. Sometimes it's a full stop.
		- Is inline media showing up?
		- HTML tags in subway map aren't getting parsed (http://scalar.usc.edu/works/text-identity-subjectivity/the-kierkegaardian-aesthetic-and-blakean-innocence?template=cantaloupe)
		- Strange indenting (http://scalar.usc.edu/works/text-identity-subjectivity/the-kierkegaardian-aesthetic-and-blakean-innocence?template=cantaloupe, http://scalar.usc.edu/works/text-identity-subjectivity/blakes-aesthetic-theology?template=cantaloupe, http://scalar.usc.edu/works/growing-apart-a-political-history-of-american-inequality/index?template=cantaloupe, http://scalar.usc.edu/works/growing-apart-a-political-history-of-american-inequality/wage-ratios-sidebar?template=cantaloupe)
		- Maintaining the path you're on in subway map
		
		
		*/
	
		var element = e;
		
		var page = {
		
			options: $.extend({}, options),
			
			/**
			  * Increments the data with the given name attached to the selection.
			  *
			  * @param {Object} selection		The selection whose data is to be incremented.
			  * @param {String} data			The name of the data property to be incremented.
			  */
			incrementData: function(selection, data) {
				var value = selection.data(data);
				if (value != undefined) {
					value++;
				} else {
					value = 1;
				}
				selection.data(data, value);
				return value;
			},
			
			/**
			 * Called when a mediaelement instance has gathered metadata about the media.
			 *
			 * @param {Object} event			The event object.
			 * @param {Object} link				The link which spawned the mediaelement, and which contains its data.
			 */
			handleMediaElementMetadata: function(event, link) {
				$.scalarmedia(link);
			},
			
			handleSetState: function(event, data) {
			
				switch (data.state) {
				
					case ViewState.Reading:
					if (data.instantaneous) {
						$('.page').stop().show();
					} else {
						$('.page').stop().fadeIn();
					}
					break;
					
					case ViewState.Navigating:
					if (data.instantaneous) {
						$('.page').stop().hide();
					} else {
						$('.page').stop().fadeOut();
					}
					break;
				
				}
			
			},
			
			/**
			 * Finds all contiguous elements that aren't paragraphs or divs and wraps them
			 * in divs.
			 *
			 * @param {Object} selection		The jQuery selection to modify.
			 */
			wrapOrphanParagraphs: function(selection) {
				selection.each(function() {
				  	var buffer = null;
				  	$(this).contents().each(function() {
				  		if ($(this).is('p,div')) {
				  			if (buffer != null) {
				  				$(buffer).wrapAll('<div></div>');
				  				buffer = null;
				  			}
				  		} else {
				  			if (buffer == null) {
				  				buffer = $(this);
				  			} else {
				  				buffer = buffer.add(this);
				  			}
				  		}
				  	});
					if (buffer != null) {
						$(buffer).wrapAll('<div></div>');
						buffer = null;
					}
				});
			},
			
			addMediaElementForLink: function(link, parent) {
			
				var size = link.attr('data-size');
				if (size == undefined) size = 'medium';
				
				var align = link.attr('data-align');
				if (align == undefined) align = 'right';
				
				// create a temporary element and remove it so we can get it's width; this allows us to specify
				// the various media element widths via CSS
				var temp = $('<div class="'+size+'_dim"></div>').appendTo('.page');
				var width = parseInt(temp.width());
				temp.remove();
				
				slot = link.slotmanager_create_slot(width, {url_attributes: ['href', 'src']});
				if (slot) {
					slotDOMElement = slot.data('slot');
					slotMediaElement = slot.data('mediaelement');
					if ($(slot).hasClass('inline')) {
						link.after(slotDOMElement);
						link.hide();
					} else if (size != 'full') {
						parent.before(slotDOMElement);
						count = page.incrementData(parent, align+'_count');
						if (count == 1) slotDOMElement.addClass('top');
						slotDOMElement.addClass(align);
					} else {
						parent.after(slotDOMElement);
						slotDOMElement.addClass('full');
					}				
				}
			
			}
			
		};
		
		element.addClass('page');
		
		$('body').bind('setState', page.handleSetState);
		
		page.wrapOrphanParagraphs($('[property="sioc:content"]'));
	  	
	  	$('[property="sioc:content"]').children('p,div').addClass('body_copy').wrap('<div class="paragraph_wrapper"></div>');
	  	
	  	$('body').bind('mediaElementMetadataHandled', page.handleMediaElementMetadata);
	  	
	  	// add mediaelements
		$('a').each(function() {
		
			// resource property signifies a media link
			if ($(this).attr('resource') || ($(this).find('[property="art:url"]').length > 0)) {
			
				var slot;
				var slotDOMElement;
				var slotMediaElement;
				var count;
				var parent;
				
				if ($(this).attr('resource') == undefined) {
					$(this).attr('href', currentNode.current.sourceFile);
					$(this).attr('resource', currentNode.slug);
					$(this).attr('data-size', 'full');
					parent = $(this);
				} else {
					parent = $(this).parent('p,div');
				}
								
				$(this).addClass('media_link');
				
				page.addMediaElementForLink($(this), parent);
				
			}
		});
		
		$('[property="art:url"]').each(function() {
		
			if ($(this).text().length > 0) {
			
				$(this).wrapInner('<a href="'+currentNode.current.sourceFile+'" resource="'+currentNode.slug+'" data-size="full"></a>');
				page.addMediaElementForLink($(this).find('a'), $(this));
				$(this).css('display', 'none');
			
			}
		
		});
				

		
		$('section').hide(); // TODO: Make this more targeted	
				
		var pathOptionCount = 0;
		$('.path_of').each(function() {
			if ($(this).parent().is('section')) {
				var pathSection = $(this).parent();
				pathSection.addClass('relationships');
				pathSection.find('h3').text('Path contents');
				pathSection.show();
		
				var path_nodes = currentNode.getRelatedNodes('path', 'outgoing');
				if (path_nodes.length > 0) {
					pathSection.append('<p><a class="nav_btn" href="'+path_nodes[0].url+'">Begin this path at “'+path_nodes[0].getDisplayTitle()+'”</a></p>');
					pathOptionCount++;
				}
				
				var i;
				var index;
			}
		});
		
		var containing_paths = currentNode.getRelatedNodes('path', 'incoming');
		//console.log(containing_paths);
		if (containing_paths.length > 0) {
			for (i in containing_paths) {
				var sibling_nodes = containing_paths[i].getRelatedNodes('path', 'outgoing');
				//console.log(sibling_nodes);
				index = sibling_nodes.indexOf(currentNode);
				if (index < (sibling_nodes.length - 1)) {
					if (pathOptionCount > 0) {
						$('article').append('<p><a class="nav_btn" href="'+sibling_nodes[index+1].url+'">Or, continue on to “'+sibling_nodes[index+1].getDisplayTitle()+'”</a></p>');
					} else {
						$('article').append('<br/><p><a class="nav_btn" href="'+sibling_nodes[index+1].url+'">Continue to “'+sibling_nodes[index+1].getDisplayTitle()+'”</a></p>');
					}
					pathOptionCount++;
				}
			}
		}
		
		
		$('.tag_of').each(function() {
			if ($(this).parent().is('section')) {
				var tagSection = $(this).parent();
				tagSection.addClass('relationships');
				tagSection.find('h3').text('Tag contents');
				tagSection.find('ol').contents().unwrap().wrapAll('<ul></ul>');
				tagSection.show();
				
				var tag_nodes = currentNode.getRelatedNodes('tag', 'outgoing');
				if (tag_nodes.length > 1) {
					tagSection.append('<p><a class="nav_btn" href="'+tag_nodes[Math.floor(Math.random() * tag_nodes.length)].url+'">Visit a random tagged page</a></p>');
				}
			}
		});

		
		addTemplateLinks($('article'), 'cantaloupe');
		
		var comments = currentNode.getRelatedNodes('comment', 'incoming');
		$('article').append('<div id="footer"><div id="comment" class="reply_link">'+((comments.length > 0) ? comments.length : '&nbsp;')+'</div><div id="footer-right"></div></div>');
	  	
	  	$('body').addClass('primary_text');
	  	$('h1, h2, h3, h4, #header, .mediaElementFooter, #comment, .media_metadata').addClass('secondary_text');
	
	}

})(jQuery);