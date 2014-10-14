(function($){
    $.scalarSidebar = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        base.container;
        base.queryVars;
        base.current_pane;

        base.hovered_item;
        base.infobar_timeout;
        base.sidebar_timeout;

        base.isSmallScreen = false;
        
        base.icons = {};
        base.loaded_nodes = {};

        base.fullScreenViews = ['iframe'];

        base.get_vars = '?';

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("scalarSidebar", base);
        
        base.init = function(){

        	base.isSmallScreen = $(window).width()<=580;
        	$(window).resize(function(){
        		base.isSmallScreen = $(this).width()<=580;
        		if(base.isSmallScreen){
					clearTimeout(base.infobar_timeout);
					clearTimeout(base.sidebar_timeout);
        		}
        	});

        	base.is_logged_in = $('link#logged_in').length > 0 && $('link#logged_in').attr('href')!='';

        	base.stime = new Date();
            base.options = $.extend({},$.scalarSidebar.defaultOptions, options);
            if(currentNode != null){
            	//Determine first whether we are in a full screen layout or not - if so, add a class to the body tag.
            	if(base.fullScreenViews.indexOf(currentNode.current.defaultView)>=0){
            		$('body').addClass('fullscreen_page');
            	}
            	$('body').addClass('sidebar_collapsed');
            	//Sorry, I need this to be readable for now - is this the fastest way? Seems to be: http://stackoverflow.com/questions/51185/are-javascript-strings-immutable-do-i-need-a-string-builder-in-javascript/4717855#4717855
				var html = '<div id="info_panel" class="heading_font">'+
								'<div id="info_panel_arrow"></div>'+
								'<div id="info_panel_content">'+
									'<div id="info_panel_header" class="heading_font">'+
										'<a class="overview_link active" data-page="overview">overview</a>'+
										'<a class="metadata_link" data-page="metadata">metadata</a>'+
										'<a class="comments_link" data-page="comments">comments</a>'+
										'<div id="info_panel_selector">'+
											'<ul>'+
												'<li class="">'+
											'</ul>'+
										'</div>'+
									'</div>'+
									'<h3 class="title header_font"></h3>'+
									'<div class="section" id="overview_info">'+
										'<div class="content">'+
											'<p class="description caption_font"></p>'+
											'<div class="featured_block">'+
												'<hr />'+
												'<h4 class="header_font">Featured In</h4>'+
												'<ul class="featured_list caption_font"></ul>'+
											'</div>'+
											'<div class="tagged_by_block">'+
												'<hr />'+
												'<h4>Tagged By</h4>'+
												'<ul class="tagged_by_list caption_font"></ul>'+
											'</div>'+
										'</div>'+
									'</div>'+
									'<div class="section" id="comments_info">'+
										'<div class="content">'+
											'<h4 class="header_font">Comments</h4>'+
											'<a class="discuss_link"><div class="icon"><span class="icon-add-comment"></span></div> <span class="text">Discuss</span></a><br/>'+
											'<ul class="comment_list"></ul>'+
										'</div>'+
									'</div>'+
									'<div class="section" id="metadata_info">'+
										'<div class="content">'+
											'<h4 class="header_font">Metadata</h4>'+
											'<dl class="metadata_list caption_font"></dl>'+
										'</div>'+
									'</div>'+
								'</div>'+
								'<footer>'+
									'<a class="info_hide">Back</a>'+
									'<a class="info_visit">Visit</a>'+
								'</footer>'+
							'</div>'+
							'<div id="sidebar" class="heading_font">'+
								'<div id="sidebar_inside">'+
									'<header>'+
										'<span class="header_icon"></span>'+
										'<span class="controls">'+
											'<a class="sidebar_collapse icon-arrow-left"></a>'+
											'&nbsp;&nbsp;'+
											'<a class="sidebar_maximize icon-arrow-right"></a>'+
										'</span>'+
										'<span class="title"></span>'+
										'<div id="sidebar_selector">'+
											'<ul>'+
												'<li class="path" data-pane="path"><span class="header_icon"><span class="icon-path"></span></span><span class="title">Path</span></li>'+
												'<li class="tags" data-pane="tags"><span class="header_icon"><span class="icon-tags"></span></span><span class="title">Tags</span></li>'+
												'<li class="index" data-pane="index"><span class="header_icon"><span class="icon-index"></span></span><span class="title">Index</span></li>'+
												'<li class="linear" data-pane="linear"><span class="header_icon"><span class="icon-linear"></span></span><span class="title">Linear</span></li>'+
												'<li class="recent" data-pane="recent"><span class="header_icon"><span class="icon-recent"></span></span><span class="title">Recent</span></li>'+
												'<li class="markers" data-pane="markers"><span class="header_icon"><span class="icon-markers"></span></span><span class="title">Markers</span></li>'+
											'</ul>'+
										'</div>'+
									'</header><br/>'+
									'<div id="sidebar_panes"></div>'+
									'<footer id="sidebar_close_footer">'+
										'<a class="sidebar_hide">Close</a>'+
									'</footer>'+
								'</div>'+
							'</div>';

				base.container = $(html).appendTo('body');
				base.lastScroll = $(document).scrollTop();
				if (!isMobile){
					$(window).scroll(function() {
						var currentScroll = $(document).scrollTop();
						if ((currentScroll > base.lastScroll) && (currentScroll > 50) && (state == ViewState.Reading)) {
							$('#sidebar, #info_panel').addClass('tall');
						} else if ((base.lastScroll - currentScroll) > 10) {
							$('#sidebar, #info_panel').removeClass('tall');
						}
						if(typeof base.hovered_item != 'undefined' && base.hovered_item != null){
							var hovered_item = base.hovered_item;
							var top_offset = base.hovered_item.offset().top+$('#header').height()-$(window).scrollTop()-5;
							$('#info_panel_arrow').css({
								'top':(top_offset)+'px'
							});
						}
						base.lastScroll = currentScroll;
					});
					$('#header').mouseenter(function(){
						$('#sidebar, #info_panel').removeClass('tall');
					});
				}

				$('#info_panel_header a').click(function(){
					var current_page = $(this).data('page');
					$('#info_panel').removeClass().addClass(current_page);
					$(this).addClass('active').siblings('a').removeClass('active');
				});

	           	base.queryVars = scalarapi.getQueryVars( document.location.href );


	           	if(base.queryVars.path!=null && typeof base.queryVars.path!='undefined'){
	        		base.get_vars += 'path='+base.queryVars.path;
	        	}

	        	if((base.queryVars.visualization!=null && typeof base.queryVars.visualization!='undefined') || (base.queryVars.v!=null &&  typeof base.queryVars.v!='undefined')){
	        		if(base.get_vars != '?'){
	        			base.get_vars += '&';
	        		}
	        		if(base.queryVars.v!=null && typeof base.queryVars.v!='undefined'){
		        		base.get_vars += 'v='+base.queryVars.v;	
		        	}else{
	        			base.get_vars += 'v='+base.queryVars.visualization;	
	        		}
	        	}

	            base.build_paths_pane();
				base.build_tags_pane();
	            base.build_index_pane();
	            base.build_linear_pane();


	            //Ready for this? Using jQuery promises for chained async loading of extra JS files. Booyah. (Removing yepnope call that broke on Firefox)
	            $.when(
				    $.getScript( arbors_uri+'/html/common.js' ),
				    $.getScript( widgets_uri+'/cookie/jquery.cookie.js' ),
				    $.getScript( widgets_uri+'/nav/jquery.rdfquery.rules.min-1.0.js' ),
				    $.getScript( widgets_uri+'/nav/jquery.scalarrecent.js' ),
				    $.Deferred(function( deferred ){
				        $( deferred.resolve );
				    })
				).done(function(){
						scalarrecent_log_page();
	            		base.build_recent_pane();
				});

	            base.build_markers_pane();

	            
	            base.current_pane = $('#sidebar_panes .pane').first().data('type');
	            $('#sidebar header').hide();
	          	$('#sidebar_'+base.current_pane+'_pane').fadeIn('slow',function(){$(this).addClass('active').removeAttr('style');});
	          	$('#sidebar_selector li.'+base.current_pane).addClass('active');
	          	$('#sidebar header>.title').text(base.current_pane.toUpperCase());

	          	$('#sidebar header>.header_icon').html(base.icons[base.current_pane]);
			    $('#sidebar header').fadeIn('slow');

			    $('#sidebar_inside>header').click(function(e){
			    	if((!isMobile && !base.isSmallScreen)||($('body').hasClass('sidebar_expanded')||$(this).hasClass('selector_open'))){
				    	if($(this).hasClass('selector_open')){
				    			//Clicked on the header - hide the selection dialogue.
				    			$(this).removeClass('selector_open');
			    		}else{
				    		//Clicked on the header - show the selection dialogue.
			    			$(this).addClass('selector_open');
			    		}
				    }else{
				    	base.triggerSidebar(true);
			    	}
			    });

			    $('#sidebar, #info_panel').mouseenter(function(e){
			    	if(!isMobile && !base.isSmallScreen){
						clearTimeout(base.sidebar_timeout);
						base.triggerSidebar(true);
						e.stopPropagation();
					}
				}).mouseleave(function(){
					if(!isMobile && !base.isSmallScreen){
						base.sidebar_timeout = setTimeout(function(){
							base.triggerSidebar(false);
						},500);
					}
				});

	          	$('#sidebar header .controls .sidebar_collapse').click(function(e){
	          		if($('body').hasClass('sidebar_full')){
	          			$('body').removeClass('sidebar_full');
	          		}else{
	          			base.triggerSidebar(false);
	          		}
	          		$('#sidebar_inside>header').removeClass('selector_open');
	          		base.hideInfo();
	          		e.stopPropagation();
	          	});
	          	$('#sidebar .sidebar_hide').click(function(e){
	          		$('#sidebar_inside>header').removeClass('selector_open');
	          		base.triggerSidebar(false);
	          		base.hideInfo();
	          		e.stopPropagation();
	          	});
	          	$('#sidebar header .controls .sidebar_maximize').click(function(e){
	          		if(!$('body').hasClass('sidebar_full')){
	          			$('#sidebar_inside>header').removeClass('selector_open');
	          			$('body').addClass('sidebar_full');
	          			e.stopPropagation();
	          			base.hideInfo();
	          		}
	          	});
	          	$('#sidebar_selector li').click(function(){
	          		if($(this).hasClass('enabled')){
	          			base.change_pane($(this).data('pane'));
	          		}
	          	});

	          	$('#comments_info .discuss_link').click(function(){
	          		if($('#comment_control').length > 0){
	          			$('#comment_control').click();
	          		}
	          	});
			}			
        };

        base.change_pane = function(pane){
        	base.current_pane = pane;
            $('#sidebar header').hide();
            $('#sidebar .pane').removeClass('active');
          	$('#sidebar_'+base.current_pane+'_pane').fadeIn('slow',function(){$(this).addClass('active').removeAttr('style');});
          	$('#sidebar_selector li').removeClass('active');
          	$('#sidebar_selector li.'+base.current_pane).addClass('active');
          	$('#sidebar header>.title').text(base.current_pane.toUpperCase());
		    $('#sidebar header>.header_icon').html(base.icons[base.current_pane]);
		    $('#sidebar header').fadeIn('slow');
		    if($('#sidebar_'+base.current_pane+'_pane').find('.large').length == 0){
		    	$('#sidebar_inside .controls .sidebar_maximize').hide();
		    }else{
		    	$('#sidebar_inside .controls .sidebar_maximize').show();
		    }
        }

        base.show_icon = function(slug, new_item){
			var item = base.loaded_nodes[slug];
			var item_html = '<span class="sidebar_icon ';
			var type = 'unknown';
			if(typeof item != 'undefined' && item != null){
				type = item.current.mediaSource.contentType;
			}

			item_html += base.getIconByType(type);
			
			item_html += '" style="display: none;"></span>';

			$(item_html).prependTo(new_item).fadeIn('slow');

			if($('#sidebar_panes .pane.active').length>0){
        		var scrollmid =  ($('#sidebar_panes .pane.active')[0].scrollHeight-$('#sidebar_panes .pane.active')[0].clientHeight)/2.0;
        	}else{
        		var scrollmid = 0;
        	}
			$('#sidebar_panes').animate({
				scrollTop: scrollmid
			},10);

		}
		base.load_info = function(slug){
			//Prepare yourself for some hot jQuery chaining action.
				$('#info_panel').data('slug',slug)
								.removeClass()
								.addClass('overview')
								.find('.overview_link')
								.addClass('active')
								.siblings('a')
								.removeClass('active');

				$('body').addClass('info_panel_open');
				$('#info_panel .title').text('Loading...');
				if(typeof base.loaded_nodes[slug] != 'undefined'){
					base.showInfo($('#sidebar .active.pane').data('type'),base.loaded_nodes[slug]);
				}else{
					scalarapi.loadNode(
	        			slug,
	        			true,
	        			function(json){
	        				base.loaded_nodes[slug] = scalarapi.getNode(slug);
	        				//console.log(base.loaded_nodes[slug]);
	        				base.showInfo($('#sidebar .active.pane').data('type'),base.loaded_nodes[slug]);
	        			},
	        			function(err){
	        				//console.log(err);
	        			},
	        			1, true
	        		);
	        	}
		}

        base.build_paths_pane = function(){
        	var paths = currentNode.getRelations('path', 'incoming', 'reverseindex');
        	base.icons['path'] = '<span class="icon-path"></span>';
        	var html = '<div class="pane" data-type="path" id="sidebar_path_pane">'+
        					'<div class="smallmed"><ul class="current path"></ul></div>'+
        					'<div class="large list">'+
        						'<header><a class="all_link" data-view="all">View All</a><a class="list_link" data-view="list">List View</a></header>'+
        						'<div class="view" id="path_list_view"></div>'+
        						'<div class="view" id="path_all_view"></div>'+
        					'</div>'+
        				'</div>';

			//Make a jQuery object from the new pane's html - will make appending/prepending easier.
			var new_pane = $(html);
			new_pane.find('.large>a').click(function(){
				var view = $(this).data('view');
				if(!$('#sidebar_path_pane .large').hasClass(view)){
					$('#sidebar_path_pane .large').removeClass('list all').addClass(view);
				}
			});

			if(typeof base.queryVars.path == 'undefined' || base.queryVars.path == null){
					var item_html = '<li data-url="'+currentNode.url+'" data-slug="'+currentNode.slug+'"><div class="title">'+currentNode.current.title+'</div></li>';

					var new_item = $(item_html).appendTo(new_pane.find('ul.current.path'));

					new_item.addClass('active');

					var slug = currentNode.slug;

					base.loaded_nodes[slug] = currentNode;
					
					base.show_icon(slug, new_item);
			}else{
				var before = 0;
				var after = 0;
				var dist_before = 0;
				var dist_after = 0;
				for(p in paths){
					var parent_node = currentNode.incomingRelations[p].body;
					if(parent_node.slug == base.queryVars.path){
						
						$(new_pane).find('ul.current.path').data('path',parent_node.slug);

						var before_current = true; //We'll flip this once we come to the current page;

						// Unfortunately, the outgoing relations list does not sort by index by default, so we're just going to reformat that list. 
						// We could probably write a custom sort function, but in the end, this is a faster process.
						var relations_list = {};

						var current_node_index = 0;

						for(r in parent_node.outgoingRelations){
							var path_step = parent_node.outgoingRelations[r];
							relations_list[path_step.index] = path_step;
							if(path_step.target.slug == currentNode.slug){
								current_node_index = path_step.index;
							}
						}
						
						//Alright, iterate through our properly ordered list.
						for(r in relations_list){
							var path_step = relations_list[r];
							var node_info = scalarapi.getNode(path_step.target.slug);
							//console.log(node_info);
							//Same as the active page, pretty much.
							var item_html = '<li data-url="'+path_step.target.url+'" data-slug="'+path_step.target.slug+'"><div class="title">'+path_step.target.current.title+'</div></li>';

							var new_item = $(item_html).appendTo(new_pane.find('ul.current.path'));

							if(path_step.target.slug == currentNode.slug){
								new_item.addClass('active');
							}else{
								var raw_dist = r-current_node_index;
								var distance = Math.abs(raw_dist)*4;
								if(distance > 10){
									new_item.addClass('distant');
									if(raw_dist<0){
										dist_before++;
									}else{
										dist_after++;
									}
								}else{
									new_item.addClass('distance_'+distance);
									if(raw_dist<0){
										before++;
									}else{
										after++;
									}
								}
							}

							var slug = path_step.target.slug;

							if(typeof base.loaded_nodes[slug] == 'undefined' || base.loaded_nodes[slug] == null){
								if(typeof base.loaded_nodes[slug] != 'undefined'){
									//We already have this page loaded - let's show it now.
									base.loaded_nodes[slug] = currentNode;
									base.show_icon(slug, new_item);
								}else{
									//We don't have this loaded yet - let's do a little bit of asynchronous magic here; Self-calling anonymous function to load the icon using the API.
									(function(slug, new_item){
										scalarapi.loadNode(
											slug,
											true,
											function(json){
												base.loaded_nodes[slug] = scalarapi.getNode(slug);
												base.show_icon(slug, new_item);	
											},
											function(err){},
											1, true);
									})(slug, new_item);
								}
							}else{
								base.show_icon(slug, new_item);
							}

						}	
						break; //Alright, we can exit the loop now.
					}
					
				}

				if(before!=after){
					var diff = Math.abs(before-after);
					var html = '';
					for(var i = 0; i < diff; i++){
						html += '<li class="empty">&nbsp;</li>';
					}
					if(before>after){
						//We need to add some items after the current one. They will be hidden on hover.
						$(html).appendTo(new_pane.find('ul.current.path'));
					}else if(after>before){
						//We need to add some items before the current one. They will be hidden on hover.
						$(html).prependTo(new_pane.find('ul.current.path'));
					}
				}
				if(dist_before!=dist_after){
					var diff = Math.abs(dist_before-dist_after);
					var html = '';
					for(var i = 0; i < diff; i++){
						html += '<li class="distant empty">&nbsp;</li>';
					}
					if(before>after){
						//We need to add some items after the current one. They will be hidden on hover.
						$(html).appendTo(new_pane.find('ul.current.path'));
					}else if(after>before){
						//We need to add some items before the current one. They will be hidden on hover.
						$(html).prependTo(new_pane.find('ul.current.path'));
					}
				}
			}

			
			base.init_sidebar_items(new_pane);
			$('body>.page').click(function(){
				if(isMobile && !base.isSmallScreen){
					base.hideInfo();
					base.hovered_item = null;
				}
			})
			$('#info_panel').mouseenter(function(e){
				if(!isMobile && !base.isSmallScreen){
					clearTimeout(base.infobar_timeout);
				}
			}).mouseleave(function(){
				if(!isMobile && !base.isSmallScreen){
					base.infobar_timeout = setTimeout(function(){
						base.hovered_item = null;
						base.hideInfo();
					},500);
				}
			});

			$('body>.bg_screen,body>.page,body>#info_panel>footer>.info_hide').click(function(e){
				if($('body').hasClass('info_panel_open')){
					$('body').removeClass('info_panel_open');
					$('#info_panel').removeData('slug');	
				}
			});

			$('#sidebar #sidebar_panes').append(new_pane);
			$('#sidebar_selector .path').addClass('enabled');
        }

        base.build_tags_pane = function(){
        	
        	var tags = currentNode.getRelations('tag', 'incoming', 'reverseindex');
        	//Determine if we need the tags pane...
        	base.icons.tags = '<span class="icon-tags"></span>';

        	var html = '<div class="pane" data-type="tags" id="sidebar_tags_pane"><div class="smallmed"><ul class="current tags"></ul></div></div>';
        	var new_pane = $(html);

        	if(tags.length > 0){
	        	for(t in tags){
	        		var tag = tags[t];

	        		var item_html = '<li class="active" data-url="'+tag.body.url+'" data-slug="'+tag.body.slug+'"><span class="sidebar_icon"><span class="icon-tags"></span></span><div class="title">'+tag.body.current.title+'</div></li>';

					var new_item = $(item_html).appendTo(new_pane.find('ul.current.tags'));
	        	}
	        	base.init_sidebar_items(new_pane);
	        }else{
	        	new_pane.find('ul.current.tags').append('<li class="empty active">There are no tags on this page.</li>');
	        }

        	$('#sidebar #sidebar_panes').append(new_pane);	
			$('#sidebar_selector .tags').addClass('enabled');
        }
        base.build_index_pane = function(){
        	base.icons.index = '<span class="icon-index"></span>';

        	var html = '<div class="pane" data-type="index" id="sidebar_index_pane"><div class="smallmed"><ul class="current index"></ul></div>';
        	var new_pane = $(html).appendTo($('#sidebar #sidebar_panes'));

        	
			var path_url = scalarapi.model.urlPrefix+'rdf/instancesof/path?format=json';
			var page_url = scalarapi.model.urlPrefix+'rdf/instancesof/page?format=json';
			var media_url = scalarapi.model.urlPrefix+'rdf/instancesof/media?format=json';
			var comment_url = scalarapi.model.urlPrefix+'rdf/instancesof/reply?format=json';
			
        	//Handle Paths...
        	var item_html = '<li><span class="sidebar_icon icon-path"></span><br /><div class="title"></div></li>';
        	var new_item = $(item_html).appendTo(new_pane.find('ul.current.index'));
        	(function(new_item){
				$.getJSON(path_url,function(json){
        			base.book_paths = scalarapi.model.parseNodes(json);
        			new_item.find('.title').text(base.book_paths.length);
        		});
			})(new_item);

			//Handle Pages...
        	item_html = '<li><span class="sidebar_icon icon-page"></span><br /><div class="title"></div></li>';
        	new_item = $(item_html).appendTo(new_pane.find('ul.current.index'));
        	(function(new_item){
				$.getJSON(page_url,function(json){
        			base.book_pages = scalarapi.model.parseNodes(json);
        			new_item.find('.title').text(base.book_pages.length);
        		});
			})(new_item);

			//Handle Media...

				//Images...
	        	item_html = '<li><span class="sidebar_icon icon-photo"></span><br /><div class="title"></div></li>';
	        	var images_item = $(item_html).appendTo(new_pane.find('ul.current.index'));

	        	//Video...
	        	item_html = '<li><span class="sidebar_icon icon-video"></span><br /><div class="title"></div></li>';
	        	var video_item = $(item_html).appendTo(new_pane.find('ul.current.index'));

	        	//Audio...
	        	item_html = '<li><span class="sidebar_icon icon-audio"></span><br /><div class="title"></div></li>';
	        	var audio_item = $(item_html).appendTo(new_pane.find('ul.current.index'));

        	(function(images_item,video_item,audio_item){
				$.getJSON(media_url,function(json){
					
					base.book_media = scalarapi.model.parseNodes(json);

					base.book_images = [];
					base.book_videos = [];
					base.book_audio = [];

					for(var i in base.book_media){
						switch(base.book_media[i].current.mediaSource.contentType){
							case 'image':
								base.book_images.push(base.book_media[i]);
								break;
							case 'video':
								base.book_videos.push(base.book_media[i]);
								break;
							case 'audio':
								base.book_audio.push(base.book_media[i]);
								break;
						}
					}

        			images_item.find('.title').text(base.book_images.length);
        			video_item.find('.title').text(base.book_videos.length);
        			audio_item.find('.title').text(base.book_audio.length);
        		});
			})(images_item,video_item,audio_item);

        	//Handle Comments...
        	item_html = '<li><span class="sidebar_icon icon-comment"></span><br /><div class="title"></div></li>';
        	new_item = $(item_html).appendTo(new_pane.find('ul.current.index'));
        	(function(new_item){
				$.getJSON(comment_url,function(json){
        			base.book_comments = scalarapi.model.parseNodes(json);
        			new_item.find('.title').text(base.book_comments.length);
        		});
			})(new_item);

			$('#sidebar_selector .index').addClass('enabled');
        }
        base.build_linear_pane = function(){
        	base.icons.linear = '<span class="icon-linear"></span>';

        	var html = '<div class="pane" data-type="linear" id="sidebar_linear_pane"><ul class="linear"></ul></div>';


        	$('#sidebar #sidebar_panes').append($(html));	
			$('#sidebar_selector .linear').addClass('enabled');
        }
        base.build_recent_pane = function(){
        	var html = '<div class="pane" data-type="recent" id="sidebar_recent_pane"><div class="smallmed"><ul class="current recent"></ul></div></div>';
        	var new_pane = $(html).appendTo($('#sidebar #sidebar_panes'));

        	//As noted in jquery.scalarrecent.js, stored history is deprecated - using local storage.
		    try {
				var prev_string = localStorage.getItem('scalar_user_history');
			} catch(err) {
				// Most likely user is in Safari private browsing mode
			}
			if ('undefined'==typeof(prev_string) || !prev_string || !prev_string.length) {
				//No nodes - handle empty recent pane here...
				new_pane.find('ul.current.recent').append('<li class="empty active">Your history is currently empty.</li>');
			} else {
				var nodes = JSON.parse(prev_string);
				for(var uri in nodes){
					var this_node = nodes[uri];
					var slug = uri.replace(scalarapi.model.urlPrefix,'');
					if(typeof this_node['http://purl.org/dc/elements/1.1/title']!='undefined' && this_node['http://purl.org/dc/elements/1.1/title'] != null && this_node['http://purl.org/dc/elements/1.1/title'].length > 0){
						var title = this_node['http://purl.org/dc/elements/1.1/title'][this_node['http://purl.org/dc/elements/1.1/title'].length-1].value;
					}else{
						//We don't have a title... Skip this one?
						continue;
					}
					var item_html = '<li data-url="'+uri+'" data-slug="'+slug+'"><div class="title">'+title+'</div></li>';
					var new_item = $(item_html).appendTo(new_pane.find('ul.current.recent'));

					if(slug == currentNode.slug){
						new_item.addClass('active');
					}
					if(typeof base.loaded_nodes[slug] == 'undefined' || base.loaded_nodes[slug] == null){
						if(typeof base.loaded_nodes[slug] != 'undefined'){
							//We already have this page loaded - let's show it now.
							base.loaded_nodes[slug] = currentNode;
							base.show_icon(slug, new_item);
						}else{
							//We don't have this loaded yet - let's do a little bit of asynchronous magic here; Self-calling anonymous function to load the icon using the API.
							(function(slug, new_item){
								scalarapi.loadNode(
									slug,
									true,
									function(json){
										base.loaded_nodes[slug] = scalarapi.getNode(slug);
										base.show_icon(slug, new_item);	
									},
									function(err){},
									1, true);
							})(slug, new_item);
						}
					}else{
						base.show_icon(slug, new_item);
					}
				}
			}

			base.init_sidebar_items(new_pane);

        	base.icons.recent = '<span class="icon-recent"></span>';	
			$('#sidebar_selector .recent').addClass('enabled');
        }
        base.build_markers_pane = function(){
        	base.icons.markers = '<span class="icon-markers"></span>';

        	var html = '<div class="pane" data-type="markers" id="sidebar_markers_pane"><ul class="markers"></ul></div>';


        	$('#sidebar #sidebar_panes').append($(html));	
			$('#sidebar_selector .markers').addClass('enabled');
        }
        
        base.init_sidebar_items = function(new_pane){
        	new_pane.find('li:not(.empty)').mouseenter(function(e){
				if(!isMobile && !base.isSmallScreen){
					clearTimeout(base.sidebar_timeout);
					base.triggerSidebar(true);
					e.stopPropagation();
					base.hovered_item = $(this);
					var slug = $(this).data('slug');
					$('#info_panel .title, #info_panel .description, #info_panel .featured_list,#info_panel .tagged_by_list, #info_panel .comment_list, #info_panel .metadata_list').html('');
					var top_offset = $(this).offset().top+$('#header').height()-$(window).scrollTop()-5;
					$('#info_panel_arrow').css({
						'top':top_offset+'px'
					});
					clearTimeout(base.infobar_timeout);
					base.load_info(slug);
					e.stopPropagation();
				}
			}).mouseleave(function(){ 
				if(!isMobile && !base.isSmallScreen){
					base.infobar_timeout = setTimeout(function(){
						base.hovered_item = null;
						base.hideInfo();
					},500);
				}
			}).click(function(){
				var slug = $(this).data('slug');
				if(!isMobile && !isTablet && !base.isSmallScreen){
					var node = scalarapi.getNode(slug);
					var path = $(this).parent('ul.path').data('path');

					var target_url = node.url+base.get_vars;

					window.location = target_url;
				}else{
					base.triggerSidebar(true);
					base.load_info(slug);
					base.hovered_item = $(this);
					var top_offset = base.hovered_item.offset().top+$('#header').height()-$(window).scrollTop()-5;
					$('#info_panel_arrow').css({
						'top':(top_offset)+'px'
					});
				}
			});
        }

        base.triggerSidebar = function(do_expand){
        	if($('#sidebar_panes .pane.active').length>0){
        		var scrollmid =  ($('#sidebar_panes .pane.active')[0].scrollHeight-$('#sidebar_panes .pane.active')[0].clientHeight)/2.0;
        	}else{
        		var scrollmid = 0;
        	}

        	if(typeof do_expand !== 'undefined'){
        		if(do_expand === true && !$('body').hasClass('sidebar_expanded')){
        			$('body').addClass('sidebar_expanded').removeClass('sidebar_collapsed');

        			$('#sidebar_panes').animate({
						scrollTop: scrollmid
					},10);
        			
        		}else if(do_expand === false && $('body').hasClass('sidebar_expanded')){
        			$('body').removeClass('sidebar_expanded sidebar_full').addClass('sidebar_collapsed');
        			$('#sidebar_inside>header').removeClass('selector_open');
					$('#sidebar_panes').animate({
						scrollTop: scrollmid
					},10);
        		}
        	}else if($('body').hasClass('sidebar_expanded')){
				base.triggerSidebar(false);
        	}else{
        		base.triggerSidebar(true);
        	}
        };

        base.showInfo = function(view,page){
        	switch(view){
        		case 'recent':
        		case 'path':
		        	$('#info_panel .title').text(page.current.title);
		        	$('#info_panel .description').text(page.current.description);
		        	
		        	var target_url = page.url+base.get_vars;

		        	$('body>#info_panel .info_visit').attr('href',target_url);
		        	var references = page.getRelations('referee', 'incoming', 'reverseindex');
		        	var tags = page.getRelations('tag', 'incoming', 'reverseindex');
		        	
		        	//console.log(references);

		        	$('#info_panel .featured_block').hide();
		        	if(references.length > 0){
		        		for(var i = 0; i< references.length; i++){
		        			var this_reference = references[i].body;

		        			target_url = this_reference.url;

				        	if(base.queryVars.visualization!=null && typeof base.queryVars.visualization!='undefined'){
				        		target_url += '?v='+base.queryVars.visualization;	
				        	}else if(base.queryVars.v!=null && typeof base.queryVars.v!='undefined'){
				        		target_url += '?v='+base.queryVars.v;	
				        	}

		        			$('#info_panel .featured_block ul.featured_list').append('<li><a href="'+target_url+'"><span class="'+base.getIconByType(this_reference.current.mediaSource.contentType)+'"></span> '+this_reference.current.title+'</a></li>');
		        		}
		        		$('#info_panel .featured_block').fadeIn('fast');
		        	}

		        	$('#info_panel .tagged_by_block').hide();
		        	if(tags.length > 0){
		        		for(var i = 0; i< tags.length; i++){
		        			var this_tag = tags[i].body;

		        			target_url = this_tag.url;

				        	if(base.queryVars.visualization!=null && typeof base.queryVars.visualization!='undefined'){
				        		target_url += '?v='+base.queryVars.visualization;	
				        	}else if(base.queryVars.v!=null && typeof base.queryVars.v!='undefined'){
				        		target_url += '?v='+base.queryVars.v;	
				        	}
				        	
		        			
		        			$('#info_panel .tagged_by_block ul.tagged_by_list').append('<li><a href="'+target_url+'"><span class="'+base.getIconByType(this_tag.current.mediaSource.contentType)+'"></span> '+this_tag.current.title+'</a></li>');
		        		}
		        		$('#info_panel .tagged_by_block').fadeIn('fast');
		        	}

		        	//Handle the comments:
		        	var comments = page.getRelations('comment', 'incoming', 'reverseindex');
		        	$('#info_panel #comments_info .comment_list').html('');
		        	if(comments.length > 0){
		        		for(var c in comments){
		        			comment = comments[c];				
		        			//console.log(comment);
							var date = new Date(comment.properties.datetime);

		        			target_url = comment.body.url;

				        	if(base.queryVars.visualization!=null && typeof base.queryVars.visualization!='undefined'){
				        		target_url += '?v='+base.queryVars.visualization;	
				        	}else if(base.queryVars.v!=null && typeof base.queryVars.v!='undefined'){
				        		target_url += '?v='+base.queryVars.v;	
				        	}
				        	
							$('#info_panel #comments_info .comment_list').append('<li><a href="'+target_url+'"><div class="icon"><span class="icon-add-comment"></span></div> <span class="text"><strong>'+comment.body.getDisplayTitle()+'</strong> <span class="caption_font">'+comment.body.current.content+'</span></span></a></li>');
			        	}
		        	}else{
		        		$('#info_panel #comments_info .comment_list').append('<li>There are currently no comments for this page.</li>');
		        	}

		        	//Hide discuss link if not current page...
		        	if(page.slug!=currentNode.slug){
		        		$('#comments_info .discuss_link').hide();
		        	}else{
		        		$('#comments_info .discuss_link').show();
		        	}

		        	//Handle Metadata
		        	var properties = page.current.properties;
	        		var items = {
	        			dcterms : {},
	        			scalarterms : {},
	        			art : {},
	        			rdf : {},
	        			other : {}
	        		};
	        		for(prop in properties){
	        			if(typeof properties[prop] != 'undefined' && properties[prop] != null && properties[prop].length > 0 && properties[prop][properties[prop].length-1].value!=''){
		        			var filtered_prop = properties[prop][properties[prop].length-1].value.replace('http://scalar.usc.edu/2012/01/scalar-ns#','').replace(scalarapi.model.urlPrefix,'');

			        		if(prop.indexOf('dc/terms')>=0){
			        			items.dcterms[prop.replace('http://purl.org/dc/terms/','dc.')] = filtered_prop;
			        		}else if(prop.indexOf('scalar.usc.edu')>=0){
			        			items.scalarterms[prop.replace('http://scalar.usc.edu/2012/01/scalar-ns#','scalar.')] = filtered_prop;
			        		}else if(prop.indexOf('artstor')>=0){
			        			items.art[prop.replace('http://simile.mit.edu/2003/10/ontologies/artstor#','art.')] = filtered_prop;
			        		}else if(prop.indexOf('rdf-syntax-ns')>=0){
			        			items.rdf[prop.replace('http://www.w3.org/1999/02/22-rdf-syntax-ns#','rdf.')] = filtered_prop;
			        		}else if(
			        			prop == 'http://rdfs.org/sioc/ns#content' || 
			        			prop == 'http://xmlns.com/foaf/0.1/homepage' || 
			        			prop == 'http://open.vocab.org/terms/versionnumber'
			        		){
			        			//Skip these ones - either they are more content than metadata, or they are back-end info.
			        		}else{
			        			items.other[prop] = filtered_prop;
			        		}
			        	}
	        		}
	        		for(type in items){
	        			for(term in items[type]){
	        				$('#info_panel #metadata_info .metadata_list').append('<dt class="caption_font">'+term+'</dt> <dd class="caption_font">'+(items[type][term])+'</dd><br />');
	        			}
	        			if(items[type].length > 0){
	        				$('#info_panel #metadata_info .metadata_list').append('<br />');	
	        			}
	        		}
		    }
        	
        }
        base.hideInfo = function(){
        	$('body').removeClass('info_panel_open');
			$('#info_panel').removeData('slug');
        }

        base.getIconByType = function(type){
        	//console.log(type);
        	var icons = {
        		'image' : 'icon-photo',
        		'default' : 'icon-page'
        	};
        	if(typeof icons[type] !== 'undefined'){
        		return icons[type];
        	}else{
        		return icons.default;
        	}
        }
        
        // Run initializer
        base.init();
    };
    
    $.scalarSidebar.defaultOptions = {
    };
    
    $.fn.scalarSidebar = function(options){
        return this.each(function(){
            (new $.scalarSidebar(this, options));
        });
    };
    
})(jQuery);