/**
 * Scratchie Plugin
 *
 * @version 1.1 (31/05/2010)
 * @requires jQuery v1.3.2
 * @author Alex Weber <alexweber.com.br>
 * @copyright Copyright (c) 2010, Alex Weber
 * @license http://www.opensource.org/licenses/bsd-license.php
 * @see http://www.alexweber.com.br/jquery/scratchie
 *
 * Distributed under the terms of the new BSD License
 */
 
/**
 * Scratchie is a fully-customizable scratchcard plugin
 * Define a background image and an overlay image or color and clicking and drag
 * or just drag the mouse over the overlay to reveal the image underneath
 * when the image is fully revealed or enough is
 *
 * @example $("#myelement").scratchie();
 *
 * @example $("#myelement").litebox({
 *		target : 'mytarget'
 *		completion : 50,
 * 		fillX : 10,
 *		fillY : 10,
 *		callback : function(){
 *			// do something awesome here!
 *		}
 *	});
 *
 * @param cursor mouse cursor image
 * @param cursorHeight mouse cursor image height (px)
 * @param cursorWidth mouse cursor image width (px)
 * @param target target img element id
 * @param img target img source
 * @param title image title/alt attributes
 * @param fillColor scratchcard overlay color
 * @param fillImg scratchcard overlay image
 * @param fillX width of overlay blocks (px)
 * @param fillY height of overlay blocks (px)
 * @param completion completion percentage to trigger callback
 * @param uncoverOnComplete uncover all elements when completion percentage reached,
 * @param requireMouseClick require mouse click to start scratching
 * @param callback callback on completion
 *
 * @return jQuery Object
 * @type jQuery
 *
 * @name jQuery.fn.scratchie
 * @cat Plugins/Forms
 */
(function($){
    $.fn.scratchie = function(options) {
        // default options
        var settings = {
        	cursor: 'coin.gif', // mouse cursor image
        	cursorHeight: 20, // mouse cursor image height (px)
        	cursorWidth: 20, // mouse cursor image width (px)
        	target : 'target', // target img element id
            img : 'prize.jpg', // target img source
            title : 'Are you feeling lucky today?', // image title/alt attributes
            fillColor : '#cc0000', // scratchcard overlay color
            fillImg : 'overlay.jpg', // scratchcard overlay image
            fillX : 20, // width of overlay blocks
            fillY : 20, // height of overlay blocks
            completion: 60, // completion percentage to trigger callback
            uncoverOnComplete : true, // uncover all elements when completion percentage reached,
            requireMouseClick : true, // require mouse click to start scratching
            callback: function(){ // callback on completion
            	alert('Congratulations!');
            }
        };

        // if an options object is passed, extend defaults, if not assume its the target element
        if(options){
            if(typeof options == 'object'){
                $.extend(settings, options);
            }else{
                settings.target = options;
            }
        }

		/*
		 * Global variables & functions
		 */
		 
		// whether mousedown active
		var mousedown = false;
		// total number of overlay images and how many uncovered
		var overlaysTotal = overlaysUncovered = 0;
		
		/*
		 * Callbacks used more than once
		 */
		 
		// ensure mouseup works when dragging from original place where mousedown occured
		var mouseUpAfterDrag = function(){
			$().one('mouseup', function(){
				mousedown = false;
				$().unbind();
				$('.scratch_overlay').bind('mousedown', mouseUpAfterDrag);
			});
			return false;
		}
		
		// keep the coin cursor moving along
		var mouseMove = function(e){
			// if the image is right on top of the cursor it starts blinking
			//$('#cursor').css({'left' : e.clientX - 2, 'top' : e.clientY - 10});
			$('#cursor').css({'left' : e.clientX - 2, 'top' : e.clientY + 1});
		}
		
		// show coin cursor on enter
		var mouseEnter = function(){
			$('#cursor').show();
			return false;
		}
		
		// hide coin cursor on exit
		var mouseOut = function(){
			$('#cursor').hide();
			return false;
		}	

        /*
         * Main plugin loop
         */
         
        this.each(function (){
        	// declare variables
        	var t, target, tw, th, tp, ov, spritex, spritey;
        	
        	// cache selectors
        	t = $(this);
        	target = $('#' + settings.target);
        	
        	// remove cursor from target div & hide target not to ruin surprise
        	t.css({'cursor' : 'url(blank.cur), none', 'visibility' : 'none'});
        	
        	// display img in target element & disable dragging image
			target.attr({
				'src' : settings.img,
				'alt' : settings.title,
				'title' : settings.title,
				'zIndex' : 1
			}).bind('mousedown', function(){
				return false;
			});
        	
        	// init vars
        	th = target.height();
        	tw = target.width();
        	tp = target.position();
        	tt = tp.top;
        	tl = tp.left;
        	spritex = spritey = 0;
        	
        	// create cursor div
        	t.after('<div id="cursor" style="cursor:none;width:' + settings.cursorWidth + 'px;height:' + settings.cursorHeight + 
        	'px;position:absolute;display:none;top:0;left:0;z-index:10000;background:url(' + settings.cursor + ') top\
        	 left no-repeat;"></div>');

        	// generate overlay html
        	ov = '';
        	for(i=0; i < tw; i += settings.fillX){
        	
        		for(j = 0; j < th; j += settings.fillY){
        			++overlaysTotal;
        			ov += '<div class="scratch_overlay" style="z-index:100;height:' + settings.fillY + 'px;width:' + settings.fillX + 'px;\
        			position:absolute;border:0;overflow:hidden;top:' + (tt + j) + 'px;left:' + (tl + i) + 'px;background:';
        			
        			if(settings.fillImg){
        				ov += ' transparent url(' + settings.fillImg + ') -' + spritex + 'px -' + spritey + 'px no-repeat;';
	        			spritey += settings.fillY;
        			}else{
        				ov += settings.fillColor;
        			}
        			
        			ov += '"/>';
        		}
        		
        		if(settings.fillImg){
		    		spritey = 0;
		    		spritex += settings.fillX;
		    	}
        	}
        	
        	// apply overlay html
			t.after(ov);

        	// remove cursor from overlay
        	$('.scratch_overlay').css('cursor', 'url(blank.cur), none');
			
			// bind cursor events to target
			target.bind('mouseout', function(){
				mouseOut();
			}).bind('mouseenter', function(){
				mouseEnter();
			}).bind('mousemove', function(e){
				mouseMove(e);
			});
			
			// binc cursor events to overlay
			$('.scratch_overlay').bind('mouseout', function(){
				mouseOut();
			}).bind('mouseenter', function(){
				mouseEnter();
			}).bind('mousemove', function(e){
				mouseMove(e);
			});
			
			// capture mouse movement and determine whether dragging when clicked
			if(settings.requireMouseClick === true){
					$('.scratch_overlay').bind('mousedown', function(){
					mousedown = true;
					// fix to recognize mouseup event after moving mouse
					mouseUpAfterDrag();
					$(this).remove();
					return false;
				});
			}
			
			// do the whole uncovering thing
			$('.scratch_overlay').bind('mouseover', function(){
				if(mousedown === true || settings.requireMouseClick === false){
					// remove elements when dragging with mousedown
					++overlaysUncovered;
					$(this).remove();
					// check if complete & fire callback
					if((overlaysUncovered / overlaysTotal) * 100 >= settings.completion){
						if(settings.uncoverOnComplete === true){
							$('.scratch_overlay').remove();
						}
						settings.callback();
					}
				}
			});
			
			// when we're done with everything, reveal the target
			//target.css('visibility', 'visible');
        });
    // keep the chaining dream alive
    return this;
	};
})(jQuery);
