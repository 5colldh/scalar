CKEDITOR._scalar = {
	selectcontent : function(options) {
		$('<div></div>').content_selector(options);
	},
	contentoptions : function(options) {
		$('<div></div>').content_options(options);
	},
	external_link : function(editor, options) {
		CKEDITOR.dialog.add( 'external_link', function(editor) {
			return {
				title : 'Insert External Link',
				width : 500,
				minHeight : 100,
				contents : [{
					id : 'general',
					label : 'External Link',
					elements : [{
						type : 'html',
						html : 'Add a hyperlink to an external site. Scalar will maintain a header bar that allows easy navigation back to your book (unless disallowed by the external site).'
					},{
						type : 'text',
						id : 'href',
						label : 'URL',
						'default' : 'http://',
						validate : CKEDITOR.dialog.validate.notEmpty( 'URL is a required field' ),
						required : true,
						setup : function(element) {
							if (null!==element.getAttribute('href')) this.setValue(element.getAttribute('href'));
						},
						commit : function(data) {
							data.href = this.getValue();
						}
					},{
						type : 'checkbox',
						id : 'target_blank',
						label : 'Open in a new browser window',
						'default' : false,
						setup : function(element) {
							if ('_blank'==element.getAttribute('target')) this.setValue('checked');
						},
						commit : function(data) {
							data.target = (this.getValue()) ? '_blank' : false;
						}
					}]
				}],
				onShow : function() {
					var sel = editor.getSelection(), element = sel.getStartElement();
					if (sel.getRanges()[0].collapsed) {
						alert('Please select text to transform into a link');
					    ckCancel = this._.buttons['cancel'],
					    ckCancel.click();
						return;
					}
					this.element = editor.document.createElement('a');
					this.element.setHtml(sel.getSelectedText());
					if (element) element = element.getAscendant('a', true);
					// Browsers won't allow href attribute to be re-written, so doing this round-about by always creating a new <a> but propogating it with the existing element's values if it exists
					if (!element || element.getName() != 'a' || element.data('cke-realelement' )) {
						this.setupContent(this.element);
					} else {
						this.setupContent(element);
					}
				},
				onOk : function() {
					var dialog = this, data = {};
					this.commitContent(data);
					if (data.href.length) this.element.setAttribute('href', data.href);
					if (data.target) this.element.setAttribute('target', data.target);
					editor.insertElement(this.element);
				}
			};
		});
		var _command = new CKEDITOR.dialogCommand('external_link');
		editor.addCommand('_external_link_dialog', _command);
		editor.execCommand("_external_link_dialog");
	}
};

CKEDITOR.plugins.add( 'scalar', {
    icons: 'scalar1,scalar2,scalar3,scalar4,scalar5,scalar6,scalar7',
    requires: 'dialog',
    init: function( editor ) {
	    var pluginDirectory = this.path;
	    editor.addContentsCss( pluginDirectory + 'styles/scalar.css' );
        editor.addCommand( 'insertScalar1', {
            exec: function( editor ) {
			    		var sel = editor.getSelection();
							var isEdit = false;
							var element = sel.getStartElement();

							//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
							if ( element.getAscendant( 'a', true ) ) {
								element = element.getAscendant( 'a', true );
								if(!element.hasClass('inline') && element.getAttribute('href').indexOf('#')<0){
									//Not inline, no annotation
									isEdit = true;
								}
							}
							if(!isEdit){
				    		if (sel.getRanges()[0].collapsed) {
									alert('Please select text to transform into a media link');
				    			return;
								}else{
									element = null;
								}
							}
		        		CKEDITOR._scalar.selectcontent({type:'media',changeable:false,multiple:false,msg:'Insert Scalar Media Link',element:element,callback:function(node){
		        			CKEDITOR._scalar.contentoptions({data:reference_options['insertMediaLink'],element:element,callback:function(options) {
												if(!isEdit){
													var sel = editor.getSelection();
													element = editor.document.createElement('a');
													element.setHtml(sel.getSelectedText());
												}else{
													element = element.getAscendant( 'a', true );
												}
												var href = node.version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
			            			element.setAttribute('href', href);

												//Also have to set cke-saved-href if this is an edit, so that we can actually change the href value!
												if(isEdit){
													element.data('cke-saved-href',href);
												}

			            			element.setAttribute('resource', node.slug);
			            			for (var key in options) {
			            				element.setAttribute('data-'+key, options[key]);
			            			}
												if(!isEdit){
			            				editor.insertElement(element);
												}else{
													editor.updateElement(element);
												}
		        			}});
		        		}});
            }
        });
        editor.addCommand( 'insertScalar2', {
            exec: function( editor ) {
        		var sel = editor.getSelection();
						var element = sel.getStartElement();
						var isEdit = false;
						//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
						if ( element.getAscendant( 'a', true ) ) {
							element = element.getAscendant( 'a', true );
							if(element.hasClass('inline') && element.getAttribute('href').indexOf('#')<0){
								//Is inline, no annotation
								isEdit = true;
							}
						}
						if(!isEdit){
							element = null;
						}
        		CKEDITOR._scalar.selectcontent({type:'media',changeable:false,multiple:false,msg:'Insert Inline Scalar Media Link',element:element,callback:function(node){
        			CKEDITOR._scalar.contentoptions({data:reference_options['insertMediaelement'],element:element,callback:function(options) {
									if(!isEdit){
				        		element = editor.document.createElement('a');
									}else{
										element = element.getAscendant( 'a', true );
									}
	            		element.setAttribute('name','scalar-inline-media');  // Required to let empty <a> through
	            		element.setAttribute('class', 'inline');
									var href = node.version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
		        			element.setAttribute('href', href);
									//Also have to set cke-saved-href if this is an edit, so that we can actually change the href value!
									if(isEdit){
										element.data('cke-saved-href',href);
									}
		        			element.setAttribute('resource', node.slug);
            			for (var key in options) {
            				element.setAttribute('data-'+key, options[key]);
            			}
									if(!isEdit){
		        				editor.insertElement(element);
									}
        			}});
        		}});
            }
        });
        editor.addCommand( 'insertScalar3', {
            exec: function( editor ) {
			    		var sel = editor.getSelection();
							var isEdit = false;
							var element = sel.getStartElement();

							//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
							if ( element.getAscendant( 'a', true ) ) {
								element = element.getAscendant( 'a', true );
								if(!element.hasClass('inline') && element.getAttribute('href').indexOf('#')>=0){
									//Not inline, with annotation
									isEdit = true;
								}
							}
							if(!isEdit){
								if (sel.getRanges()[0].collapsed) {
									alert('Please select text to transform into a media link');
									return;
								}else{
									element = null;
								}
							}
	        		CKEDITOR._scalar.selectcontent({type:'annotation',changeable:false,multiple:false,rec:1,msg:'Insert Scalar Annotation',element:element,callback:function(node){
	        			CKEDITOR._scalar.contentoptions({data:reference_options['insertAnnotation'],element:element,callback:function(options) {
									if(!isEdit){
										var sel = editor.getSelection();
												element = editor.document.createElement('a');
												element.setHtml(sel.getSelectedText());
									}else{
										element = element.getAscendant( 'a', true );
									}
	            		var url = node.targets[0].version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
	            		url += '#'+node.slug;
	            		var resource = node.targets[0].slug;
		        			element.setAttribute('href', url);
									if(isEdit){
										element.data('cke-saved-href',url);
									}
		        			element.setAttribute('resource', resource);
            			for (var key in options) {
            				element.setAttribute('data-'+key, options[key]);
            			}
									if(!isEdit){
		        				editor.insertElement(element);
									}
	        			}});
	        		}});
            }
        });
        editor.addCommand( 'insertScalar4', {
            exec: function( editor ) {
							var sel = editor.getSelection();
							var element = sel.getStartElement();
							var isEdit = false;
							//Check to see if we currently have an anchor tag - if so, make sure it's a non-inline media link
							if ( element.getAscendant( 'a', true ) ) {
								element = element.getAscendant( 'a', true );
								if(element.hasClass('inline') && element.getAttribute('href').indexOf('#')>=0){
									//Is inline, with annotation
									isEdit = true;
								}
							}
							if(!isEdit){
								element = null;
							}
	        		CKEDITOR._scalar.selectcontent({type:'annotation',changeable:false,multiple:false,rec:1,msg:'Insert Inline Scalar Annotation',element:element,callback:function(node){
	        			CKEDITOR._scalar.contentoptions({data:reference_options['insertInlineAnnotation'],element:element,callback:function(options) {
										if(!isEdit){
											element = editor.document.createElement('a');
										}else{
											element = element.getAscendant( 'a', true );
										}
		            		var url = node.targets[0].version['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
		            		url += '#'+node.slug;
		            		var resource = node.targets[0].slug;
		            		element.setAttribute('name','scalar-inline-annotation');  // Required to let empty <a> through
		            		element.setAttribute('class', 'inline');
			        			element.setAttribute('href', url);
										if(isEdit){
											element.data('cke-saved-href',url);
										}
			        			element.setAttribute('resource', resource);
	            			for (var key in options) {
	            				element.setAttribute('data-'+key, options[key]);
	            			}
										if(!isEdit){
			        				editor.insertElement(element);
										}
	        			}});
	        		}});
            }
        });
        editor.addCommand( 'insertScalar5', {
            exec: function( editor ) {
	    		var sel = editor.getSelection();
	    		if (sel.getRanges()[0].collapsed) {
	    			alert('Please select text to transform into a note link');
	    			return;
	    		}
        		CKEDITOR._scalar.selectcontent({changeable:true,multiple:false,onthefly:true,msg:'Insert Scalar Note',callback:function(node){
        			CKEDITOR._scalar.contentoptions({data:reference_options['insertNote'],callback:function(options) {
	        			var sel = editor.getSelection();
	            		element = editor.document.createElement('span');
	            		element.setHtml(sel.getSelectedText());
	            		element.setAttribute('class', 'note');
	        			element.setAttribute('rev', 'scalar:has_note');
	        			element.setAttribute('resource', node.slug);
            			for (var key in options) {
            				element.setAttribute('data-'+key, options[key]);
            			}
	        			editor.insertElement(element);
        			}});
        		}});
            }
        });
        editor.addCommand( 'insertScalar6', {
            exec: function( editor ) {
	    		var sel = editor.getSelection();
	    		if (sel.getRanges()[0].collapsed) {
	    			alert('Please select text to transform into a link');
	    			return;
	    		}
        		CKEDITOR._scalar.selectcontent({changeable:true,multiple:false,onthefly:true,msg:'Insert link to Scalar content',callback:function(node){
        			CKEDITOR._scalar.contentoptions({data:reference_options['createInternalLink'],callback:function(options) {
	        			var sel = editor.getSelection();
	            		element = editor.document.createElement('a');
	            		element.setHtml(sel.getSelectedText());
	        			element.setAttribute('href', node.slug);
            			for (var key in options) {
            				element.setAttribute('data-'+key, options[key]);
            			}
	        			editor.insertElement(element);
        			}});
        		}});
            }
        });
        editor.addCommand( 'insertScalar7', {  // External link
            exec: function( editor ) {
        		CKEDITOR._scalar.external_link(editor, {});
            }
        });
        editor.ui.addButton( 'Scalar1', {
            label: 'Insert Scalar Media Link',
            command: 'insertScalar1',
            toolbar: 'links'
        });
        editor.ui.addButton( 'Scalar2', {
            label: 'Insert Inline Scalar Media Link',
            command: 'insertScalar2',
            toolbar: 'links'
        });
        editor.ui.addButton( 'Scalar3', {
            label: 'Insert Scalar Annotation',
            command: 'insertScalar3',
            toolbar: 'links'
        });
        editor.ui.addButton( 'Scalar4', {
            label: 'Insert Inline Scalar Annotation',
            command: 'insertScalar4',
            toolbar: 'links'
        });
        editor.ui.addButton( 'Scalar5', {
            label: 'Insert Scalar Note',
            command: 'insertScalar5',
            toolbar: 'links'
        });
        editor.ui.addButton( 'Scalar6', {
            label: 'Insert Link to another Scalar Page',
            command: 'insertScalar6',
            toolbar: 'links'
        });
        editor.ui.addButton( 'Scalar7', {
            label: 'Insert External Link',
            command: 'insertScalar7',
            toolbar: 'links'
        });
    }
});
