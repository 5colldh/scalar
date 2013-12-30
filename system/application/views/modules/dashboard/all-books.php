<? if ('deleted'==@$_REQUEST['action']): ?>
<div class="saved">
<a style="float:right;" href="?zone=all-books#tabs-all-books">clear</a>
Book has been deleted
</div><br />
<? endif ?>	
<? if ('added'==@$_REQUEST['action']): ?>
<div class="saved">
<a style="float:right;" href="?zone=all-books#tabs-all-books">clear</a>
Book has been added
</div><br />
<? endif ?>		
		
		<script>
		$(document).ready(function() {
   			
			// 'Edit users' button
			
			$('.value_select_trigger').click(function() {
				var $this = $(this);
				var multiple = $this.hasClass('multiple');
				var resource = $this.attr('resource');
				var rel = $this.attr('rel');
				var id = $this.parents('tr').find("td[property='id']").html();
				var ids = new Array;
				var elements = $this.parent().find("span");
				for (var j = 0; j < elements.length; j++) {
					ids.push( $(elements[j]).attr('id') );
				}
				var post = {'id':id};
				var box = $('#value_selector');
				var form = box.find('form:first');
				form.find("input[name='section']").val(rel);
				form.find("input[name='id']").val(id);
				var selector = box.find('select');
				if (multiple) {selector.attr('multiple','multiple');selector.find('#multiple_info').show();} else {selector.removeAttr('multiple');selector.find('#multiple_info').hide();}		
				selector.html('<option value="0">Loading...</option>');
				$.post('api/'+resource, post, function(data) {
					selector.html('');
					var option = $('<option value="0">(Select none)</option>');
					selector.append(option);
					for (var j = 0; j < data.length; j++) {
						var rel_id = data[j].user_id;
						if ('undefined'==typeof(rel_id)) rel_id = data[j].book_id;
						var title = data[j].fullname;
						if ('undefined'==typeof(title)) title = data[j].title;
						var selected = (ids.indexOf(rel_id) != -1) ? true : false;
						var option = $('<option value="'+rel_id+'"'+((selected)?' selected':'')+'>'+title+'</option>');
						selector.append(option);
					}
					box.css( 'top', ((parseInt($(window).height())/2)-(parseInt(box.height())/2))+parseInt($(window).scrollTop()) );
					box.css( 'left', ((parseInt($(window).width())/2)-(parseInt(box.width())/2)) );					
					box.show();
				});		
						
			});	   					
   			
   			$(window).resize(function() { resizeList(); });
   			resizeList();
   			
		});	
		
		function resizeList() {
    		$('.table_wrapper').height(Math.max(200, $(window).height() - ($('.table_wrapper').offset().top + 60))+'px'); // magic number to get list height right
		}
		
		function submit_value_selector($this) {
			
			var section = $this.find("input[name='section']").val();
			var id = $this.find("input[name='id']").val();
			var selected_ids = new Array;
			var selected = $this.find('select :selected');
			for (var j = 0; j < selected.length; j++) {
				selected_ids.push($(selected[j]).val());
			}
			var post = {'id':id, 'selected_ids':selected_ids, 'multi':1};
			$.post('api/'+section, post, function(data) {
				var element = $('#'+section+'_'+id);
				element.find('span, br').remove();
				for (var j = 0; j < data.length; j++) {
					var rel_id = data[j].id;
					var title = data[j].title;
					var relationship = data[j].relationship;
					var span = $('<span id="'+rel_id+'">'+title+'</span>');
					element.prepend(span);
					if ('undefined'!=typeof(relationship)) {
						span.append(' ('+relationship+')');
						span.append(' <span style="color:red;font-weight:bold">*</span>');
						span.after('<br />');
					}
				}	
				$this.parent().hide();	
			});			
			
		}			
		</script>			
		
		<form action="<?=confirm_slash(base_url())?>system/dashboard#tabs-all-books" method="post">
		<input type="hidden" name="zone" value="all-books" />
		<input type="hidden" name="action" value="do_add_book" />
		Add new book: <input type="text" name="title" value="title" style="width:200px;" onfocus="if (this.value=='title') this.value='';" />&nbsp; 
		<select name="user_id">
			<option value="0">(Initial author)</option>
		<? foreach ($users as $user): ?>
			<option value="<?=$user->user_id?>"><?=$user->fullname?></option>
		<? endforeach ?>
		</select>&nbsp; 
		<input type="submit" value="Go" class="generic_button" />
		</form>			
		
		<br clear="both" />
		
		<div class="table_wrapper">
		<table cellspacing="0" cellpadding="0" class="tablesorter">
			<thead>
				<tr class="head">
					<th></th>
					<th style="display:none;">ID</th>
					<th style="display:none;">Book Id</th>
					<th style="white-space:nowrap;">Title</th>
					<th style="white-space:nowrap;">Subtitle</th>
					<!--<th style="white-space:nowrap;">Description</th>-->
					<th style="white-space:nowrap;">URI</th>
					<th style="white-space:nowrap;">Public</th>
					<th style="white-space:nowrap;">In index</th>
					<th style="white-space:nowrap;">Featured</th>
					<th style="white-space:nowrap;">Contributors</th>
					<th style="white-space:nowrap;">Created</th>
				</tr>
			</thead>
			<tbody>
<?
		$count = 1;
		if (!empty($books)) {
			foreach ($books as $row) {
				$desc_excerpt = create_excerpt($row->description);
				if (strlen($row->description) == strlen($desc_excerpt)) $desc_excerpt = null;				
				echo '<tr class="bottom_border" typeof="books">';
				echo '<td style="white-space:nowrap;"><a href="javascript:;" onclick="edit_row($(this).parents(\'tr\'));" class="generic_button">Edit</a> <a style="color:#888888;" href="'.confirm_slash(base_url()).'system/dashboard?action=do_delete&delete='.$row->book_id.'&type=books&zone=all-books#tabs-all-books" onclick="if (!confirm(\'Are you sure you wish to DELETE this book and all associated content?\')) return false;" class="generic_button">Remove</a></td>'."\n";
				echo '<td property="id" style="display:none;">'.$row->book_id."</td>\n";
				echo '<td property="book_id" style="display:none;">'.$row->book_id."</td>\n";
				echo '<td class="editable" property="title" style="width:100px;">'.$row->title."</td>\n";
				echo '<td class="editable" property="subtitle">'.$row->subtitle."</td>\n";
				/*if ($desc_excerpt) {
					echo '<td class="editable textarea excerpt" property="description"><span class="full">'.$row->description.'</span><span class="clip">'.$desc_excerpt.'</span></td>'."\n";
				} else {
					echo '<td class="editable textarea" property="description">'.$row->description.'</td>';
				}	*/			
				echo '<td class="editable has_link" property="slug"><a href="'.confirm_slash(base_url()).$row->slug.'">'.$row->slug."</a></td>\n";
				echo '<td class="editable boolean" property="url_is_public">'.$row->url_is_public."</td>\n";
				echo '<td class="editable boolean" property="display_in_index">'.$row->display_in_index."</td>\n";
				echo '<td class="editable boolean" property="is_featured">'.$row->is_featured."</td>\n";
				echo '<td style="width=150px;" id="save_book_users_'.$row->book_id.'">';
				foreach ($row->users as $user) {
					echo '<span id="'.$user->user_id.'">'.$user->fullname.'</span>';
					if ($user->list_in_index) echo ' <span style="color:red;font-weight:bold">*</span>';
					echo '<br />';
				}
				echo '<p><a href="javascript:;" class="value_select_trigger multiple generic_button" resource="get_system_users" rel="save_book_users" style="white-space:nowrap;">Edit users</a></p>';
				echo "</td>\n";
				echo '<td style="white-space:nowrap;">'.date( 'M j, Y g:i A', strtotime($row->created) )."</td>\n";
				echo "</tr>\n";
				$count++;
			}
		}
?>
			</tbody>
		</table>
		</div>	