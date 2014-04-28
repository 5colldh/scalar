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
 * http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
$.fn.bootstrapModal = function(options) {

  var settings = $.extend({
    title: '',
    keyboard: true,
    backdrop: true,
    show: false
  }, options);

  var html = '\
  <div class="modal fade">\
    <div class="modal-dialog">\
      <div class="modal-content">\
        <div class="modal-header">\
          <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&nbsp;</span><span class="sr-only">Close</span></button>\
          <h2 class="modal-title heading_font">'+settings.title+'</h2>\
        </div>\
        <div class="modal-body">\
          '+this.html()+'\
        </div>\
      </div><!-- /.modal-content -->\
    </div>\
  </div>';
  var $modal = $(html);
  $modal.modal({
    show: settings.show,
    keyboard: settings.keyboard,
    backdrop: settings.backdrop
  });
  $modal.accessibleBootstrapModal();
  this.replaceWith($modal);

  return $modal;

};