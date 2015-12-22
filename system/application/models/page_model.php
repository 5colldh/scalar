<?php
/**
 * Scalar
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0
 * (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.osedu.org/licenses /ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * @projectDescription	Model for content database table
 * @author				Craig Dietrich
 * @version				2.2
 */

class Page_model extends MY_Model {

	protected $built_in_pages = array("Table of Contents"=>'toc', 'Book Content'=>'resources', 'Tag Cloud'=>'tags');

    public function __construct() {

        parent::__construct();

    }

	public function urn($pk=0) {

		return str_replace('$1', $pk, $this->page_urn_template);

	}

    public function get($content_id=0) {

     	$this->db->where('content_id',$content_id);
    	$this->db->limit(1); // There should only be one item
    	$query = $this->db->get($this->pages_table);
    	if (!$query->num_rows) return null;
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->content_id);
    	return $result[0];

    }

    public function get_all($book_id=null, $type=null, $category=null, $is_live=true) {

    	$this->db->distinct();
    	$this->db->select($this->pages_table.'.*');
    	$this->db->from($this->pages_table);
     	if (!empty($type)) $this->db->where($this->pages_table.'.type',$type);
     	if (!empty($category)) $this->db->where($this->pages_table.'.category',$category);
     	if (!empty($book_id)) $this->db->where($this->pages_table.'.book_id',$book_id);
     	if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
    	$this->db->order_by($this->pages_table.'.slug', 'asc');
    	$query = $this->db->get();
    	$result = $query->result();
    	for ($j = 0; $j < count($result); $j++) {
    		$result[$j]->urn = $this->urn($result[$j]->content_id);
    	}
    	return $result;

    }

    // TODO: do a better intersect between terms
    public function search($book_id=null, $terms=array(), $is_live=true) {

 		$content = array();
 		if (empty($terms)) return $content;
 		$count = 1;
 		foreach ($terms as $term) {
 			$escaped_term = addslashes($term);
 			$this->db->select($this->versions_table.'.*');
 			$this->db->select($this->pages_table.'.slug');
 			$this->db->select($this->pages_table.'.book_id');
 			$this->db->select($this->pages_table.'.type');
 			$this->db->from($this->versions_table);
 			$this->db->join($this->pages_table, $this->pages_table.'.content_id='.$this->versions_table.'.content_id');
 			$this->db->where($this->pages_table.'.book_id', $book_id);
 			if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
			$this->db->where("(`".$this->db->dbprefix.$this->versions_table."`.title LIKE '%".$escaped_term."%' OR `".$this->db->dbprefix.$this->versions_table."`.description LIKE '%".$escaped_term."%' OR `".$this->db->dbprefix.$this->versions_table."`.content LIKE '%".$escaped_term."%')", NULL);
 			$this->db->order_by($this->versions_table.'.version_num', 'desc');
 			$query = $this->db->get();
 			if (!$query->num_rows) continue;
 			$result = $query->result();
 			foreach ($result as $row) {
 				if ($count>1 && !isset($content[$row->content_id])) continue;  // so that terms refine rather than expand
 				if (!isset($content[$row->content_id])) {
 					$content[$row->content_id] = new stdClass;
 					$content[$row->content_id]->versions = array();
 				}
 				$content[$row->content_id]->versions[] = $row;
 			}
 			$count++;
 		}

 		$remove = array();
 		foreach ($content as $key => $row) {
 			if (!$this->is_top_version($row->versions[0]->content_id, $row->versions[0]->version_num)) {
 				$remove[] = $key;
 			} else {
 				$content[$key]->content_id = $row->versions[0]->content_id;
 				$content[$key]->slug = $row->versions[0]->slug;
 				$content[$key]->type = $row->versions[0]->type;
 			}
 		}
 		foreach ($remove as $key) {
 			unset($content[$key]);
 		}

 		return $content;

    }

    public function get_by_slug($book_id=0, $slug='', $is_live=false) {

    	$this->db->where('book_id',$book_id);
    	$this->db->where('slug',$slug);
    	if (!empty($is_live)) $this->db->where('is_live', 1);
    	$this->db->limit(1); // There should only be one item
    	$query = $this->db->get($this->pages_table);
    	if (!$query->num_rows) return null;
    	$result = $query->result();
    	$result[0]->urn = $this->urn($result[0]->content_id);
    	return $result[0];

    }

    public function get_by_version_url($book_id=0, $url='', $is_live=false) {

    	$return = array();

    	$this->db->select($this->versions_table.'.*');
    	$this->db->from($this->versions_table);
    	$this->db->where($this->versions_table.'.url', $url);
    	$this->db->orderby($this->versions_table.'.version_id', 'desc');
    	$query = $this->db->get();
    	if (!$query->num_rows) return null;
    	$result = $query->result();

    	foreach ($result as $row) {
			if (!array_key_exists($row->content_id, $return)) {
				$content = $this->get($row->content_id);
				if (empty($content)) continue;
				$return[$row->content_id] = $content;
				$return[$row->content_id]->versions = array();
			}
			$return[$row->content_id]->versions[] = $row;
    	}

    	return $return;

    }

    public function is_built_in_slug($book_id=0, $slug='') {

		if (in_array($slug, $this->built_in_pages)) return array_search($slug, $this->built_in_pages);
		if ('users/'==substr($slug, 0, 6)) {
			$user_id = (int) substr($slug, 6);
			$CI =& get_instance();
        	if ('object'!=@gettype($CI->user_books)) $CI->load->model('user_book_model','user_books');
       		$user = $CI->user_books->get($book_id, $user_id);
       		if (!$user) return false;
			return $user->fullname;
		}
		return false;

    }

    public function built_in($book_id=0, $is_live=true, $scope='Book') {

		$CI =& get_instance();
        if ('object'!=gettype($CI->users)) $CI->load->model('user_model','users');
        $users = $CI->users->get_book_users($book_id);
		$built_in_slugs = $this->built_in_pages;
		foreach ($users as $user) {
			if ($is_live && !$user->list_in_index) continue;
			$built_in_slugs[$user->fullname] = 'users/'.$user->user_id;
		}
		$real_slugs = array();

		$this->db->select($this->pages_table.'.*');
		$this->db->select($this->versions_table.'.*');
		$this->db->from($this->pages_table);
    	$this->db->join($this->versions_table, $this->versions_table.'.content_id='.$this->pages_table.'.content_id');
    	$this->db->where($this->pages_table.'.book_id',$book_id);
		$this->db->where_in($this->pages_table.'.slug', $built_in_slugs);
		if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
		$this->db->orderby($this->pages_table.'.slug', 'desc');
    	$query = $this->db->get();
    	//if (!$query->num_rows) return null;
    	$result = $query->result();

    	$return = array();
    	foreach ($result as $row) {
    		$real_slugs[] = $row->slug;
			if (!isset($return[$row->content_id])) {
				$return[$row->content_id] = new stdClass;
				$return[$row->content_id]->versions = array();
				$return[$row->content_id]->urn = $this->urn($row->content_id);
			}
			$is_content = true;
			foreach($row as $field => $value) {
				if ('version_id' == $field) $is_content = false;
				if ($is_content) {
					$return[$row->content_id]->$field = $value;
				} else {
					if (!isset($return[$row->content_id]->versions[$row->version_id])) {
						$return[$row->content_id]->versions[$row->version_id] = new stdClass;
						$return[$row->content_id]->versions[$row->version_id]->urn = $this->version_urn($row->version_id);
					}
					$return[$row->content_id]->versions[$row->version_id]->$field = $value;
				}
			}
    	}

    	$real_slugs = array_unique($real_slugs);
		$slugs_needed = array_diff($built_in_slugs, $real_slugs);
		foreach ($slugs_needed as $title => $slug) {
			if ('Book Content'==$title) $title = ucwords($scope).' Content';
			$return[$slug] = new stdClass;
			$return[$slug]->slug = $slug;
			$return[$slug]->type = 'composite';
			$return[$slug]->versions = array();
			$return[$slug]->versions[0] = new stdClass;
			$return[$slug]->versions[0]->title = $title;
			$return[$slug]->versions[0]->type = "version";
			$return[$slug]->versions[0]->version_num = 0;
		}

    	return $return;

    }

    public function is_owner($user_id=0, $content_id=0) {

    	$user_id = (int) $user_id;
    	$this->db->select('user');
    	$this->db->from($this->pages_table);
    	$this->db->where('content_id', $content_id);
    	$this->db->limit(1);
    	$query = $this->db->get();
    	$result = $query->result();
    	$single_result = $result[0];
    	if ($single_result->user != $user_id) return false;
    	return true;

    }

    public function set_live($content_id=0, $bool=true) {

    	$this->db->where('content_id',$content_id);
		$this->db->set('is_live', $bool ? '1' : '0');
		$this->db->update($this->pages_table);

    }

    public function delete($content=0) {

    	if (is_numeric($content)) $content_id = (int) $content;
    	if (isset($content->content_id)) $content_id = (int) $content->content_id;
    	if (empty($content_id)) return false;
    	unset($content);

		// Get book slug (for deleting files)
    	$this->db->select($this->books_table.".slug");
    	$this->db->select($this->books_table.".book_id");
    	$this->db->from($this->pages_table);
    	$this->db->join($this->books_table, $this->books_table.'.book_id='.$this->pages_table.'.book_id');
    	$this->db->where($this->pages_table.'.content_id',$content_id);
    	$query = $this->db->get();
    	$result = $query->result();
    	$book_id = (int) $result[0]->book_id;
    	$book_slug = $result[0]->slug;

		// Delete from content table

		$this->db->where('content_id', $content_id);
		$this->db->delete($this->pages_table);

		// Get versions and delete from relationship tables and meta

        $ci=&get_instance();
		$ci->load->model("version_model","versions");

		$this->db->where('content_id', $content_id);
		$query = $this->db->get($this->versions_table);
		$result = $query->result();
		$url_cache = array();
		foreach ($result as $row) {
			$version_id = (int) $row->version_id;
			$ci->versions->delete($version_id);
			$url_cache[] = $row->url;  // Physical file
		}

		// Delete physical file (if not used by another page)
		foreach ($url_cache as $url) {
			if (!empty($url) && !isURL($url) && !empty($book_slug)) { // is local
				// Make sure this resource isn't being used by another page in the same book
				$version = $ci->versions->get_by_url($url);
				if (!empty($version)) {
					$content = $this->get($version->content_id);
					if (!empty($content) && (int) $content->book_id == $book_id) {
						continue; // Don't delete
					}
				}
				// Go ahead and delete
				$url = confirm_slash(FCPATH).confirm_slash($book_slug).$url;
				if (file_exists($url) && !unlink($url)) echo 'Warning: could not delete file.';
			}
		}

		// Delete versions
		$this->db->where('content_id', $content_id);
		$this->db->delete($this->versions_table);

		return true;

    }

    public function save($array=array()) {

    	// Get ID
    	$content_id = (int) $array['id'];
    	if (empty($content_id)) throw new Exception('Could not resolve content ID');
    	unset($array['id']);
    	unset($array['section']);
    	unset($array['ci_session']);
    	if (isset($array['color']) && $array['color']=='#ffffff') $array['color'] = '';

    	// If the slug has changed...
    	if (isset($array['slug'])) {

	    	// Get previous slug
			$this->db->select('slug');
			$this->db->from($this->pages_table);
			$this->db->where('content_id', $content_id);
			$query = $this->db->get();
			$result = $query->result();
			if (!isset($result[0])) throw new Exception('Could not find book');
			$slug = $result[0]->slug;

	    	// Get book slug
			$this->db->select($this->books_table.'.slug');
			$this->db->select($this->books_table.'.book_id');
			$this->db->from($this->pages_table);
			$this->db->join($this->books_table, $this->books_table.'.book_id='.$this->pages_table.'.book_id');
			$this->db->where($this->pages_table.'.content_id', $content_id);
			$query = $this->db->get();
			$result = $query->result();
			if (!isset($result[0])) throw new Exception('Could not find book');
			$book_slug = $result[0]->slug;
			$book_id = (int) $result[0]->book_id;

    		// Scrub slug
    		if (!function_exists('safe_name')) {
  				$ci = get_instance();
				$ci->load->helper('url');
    		}
    		$array['slug'] = safe_name($array['slug']);
    	    $array['slug'] = $this->safe_slug($array['slug'], $book_id, $content_id);

			// Rewrite URLs in book text content
			// This is most likely not to be completely trusted but if working properly provides a userful service to authors since linking is important in Scalar
			if ($array['slug'] != $slug) {
				// TODO: test for safety on the slug rename
				$this->db->select($this->versions_table.'.version_id');
				$this->db->from($this->versions_table);
				$this->db->join($this->pages_table, $this->versions_table.'.content_id='.$this->pages_table.'.content_id');
				$this->db->join($this->books_table, $this->pages_table.'.book_id='.$this->books_table.'.book_id');
				$this->db->where($this->books_table.'.book_id', $book_id);
				$query = $this->db->get();
				if ($query->num_rows()) {
					$dbprefix = $this->db->dbprefix;  // Since we're using a custom MySQL query below
					if (empty($dbprefix)) die('Could not resolve DB prefix. Nothing has been saved. Please try again');
					$book_version_ids = array();
					$result = $query->result();
					foreach ($result as $row) $book_version_ids[] = $row->version_id;
					if (!empty($book_version_ids)) {
						// Update hard URLs in version contet
						$old = confirm_slash(base_url()).confirm_slash($book_slug).$slug;
						$new = confirm_slash(base_url()).confirm_slash($book_slug).$array['slug'];
						$query = $this->db->query("UPDATE ".$dbprefix.$this->versions_table." SET content = replace(content, '$old', '$new') WHERE version_id IN (".implode(',',$book_version_ids).")");
						// Update soft URLs in version contet - href
						$old = 'href="'.$slug.'"';
						$new = 'href="'.$array['slug'].'"';
						$query = $this->db->query("UPDATE ".$dbprefix.$this->versions_table." SET content = replace(content, '".addslashes($old)."', '".addslashes($new)."') WHERE version_id IN (".implode(',',$book_version_ids).")");
						// Update soft URLs in version contet - resource
						$old = 'resource="'.$slug.'"';
						$new = 'resource="'.$array['slug'].'"';
						$query = $this->db->query("UPDATE ".$dbprefix.$this->versions_table." SET content = replace(content, '".addslashes($old)."', '".addslashes($new)."') WHERE version_id IN (".implode(',',$book_version_ids).")");
					}
				}
			}
    	} // isset $array['slug']

		// Save row
		$this->db->where('content_id', $content_id);
		$this->db->update($this->pages_table, $array);
		return $array;

    }

    public function create($array=array()) {

    	if ('array'!=gettype($array)) $array = (array) $array;
    	if (!isset($array['book_id']) || empty($array['book_id'])) die('Could not find book ID');
    	if (!isset($array['user_id']) || empty($array['user_id'])) $array['user_id'] = 0;  // Talk to Craig and John about this
        if (!function_exists('safe_name')) {
  			$ci = get_instance();
			$ci->load->helper('url');
    	}

    	if (!isset($array['slug']) || empty($array['slug'])) {
    		if (!isset($array['title']) && !isset($array['identifier'])) die('Could not find slug, title, or identifier.');
    		if (isset($array['identifier']) && !empty($array['identifier'])) {
    			$title_for_slug = trim($array['identifier']);
    		} elseif (isset($array['title'])) {
    			$title_for_slug = trim($array['title']);
    		}
    		$slug = safe_name($title_for_slug, false);
    	} else {
    		$slug = safe_name($array['slug']);
    	}

    	$slug = $this->safe_slug($slug, $array['book_id']);

    	$data = array();
    	$data['book_id']    = (int) $array['book_id'];
		$data['slug']       = (string) $slug;
		$data['type']       = (isset($array['type'])) ? $array['type'] : 'composite';
		$data['is_live']    = (isset($array['is_live'])) ? $array['is_live'] : 1;
		$data['color']      = (isset($array['color']) && $array['color'] != '#ffffff') ? $array['color'] : '';
		$data['user']       = (int) $array['user_id'];
		$data['created']    = date('c');
		if (isset($array['category']) && !empty($array['category'])) $data['category'] = $array['category'];
		if (isset($array['thumbnail']))  		$data['thumbnail'] = (is_array($array['thumbnail'])) ? $array['thumbnail'][0] : $array['thumbnail'];
		if (isset($array['background']))  		$data['background'] = (is_array($array['background'])) ? $array['background'][0] : $array['background'];
		if (isset($array['banner']))  			$data['banner'] = (is_array($array['banner'])) ? $array['banner'][0] : $array['banner'];
		if (isset($array['custom_style']))  	$data['custom_style'] = (is_array($array['custom_style'])) ? $array['custom_style'][0] : $array['custom_style'];
		if (isset($array['custom_scripts']))  	$data['custom_scripts'] = (is_array($array['custom_scripts'])) ? $array['custom_scripts'][0] : $array['custom_scripts'];
		if (isset($array['audio']))  			$data['audio'] = (is_array($array['audio'])) ? $array['audio'][0] : $array['audio'];

    	$this->db->insert($this->pages_table, $data);

    	$id = $this->db->insert_id();
    	return $id;

    }

    public function create_if_not_exists($array=array(), $is_live=false) {

    	if (!isset($array['slug']) || empty($array['slug'])) die('Could not find slug');
    	if (!isset($array['book_id']) || empty($array['book_id'])) die('Could not find book ID');
    	if (!isset($array['title']) || empty($array['book_id'])) die('Could not find title');

		$this->db->select($this->pages_table.'.content_id');
		$this->db->from($this->pages_table);
    	$this->db->where($this->pages_table.'.book_id',$array['book_id']);
		$this->db->where($this->pages_table.'.slug', $array['slug']);
		if (!empty($is_live)) $this->db->where($this->pages_table.'.is_live', 1);
    	$query = $this->db->get();

    	if (!$query->num_rows()) {
			$CI =& get_instance();
        	if ('object'!=gettype($CI->users)) $CI->load->model('version_model','versions');
			$content_id = self::create($array);
			$version_id = $CI->versions->create($content_id, $array);
			return $content_id;
    	} else {
			$result = $query->result();
			return $result->content_id;
    	}

    }

}
?>
