/**
 * animateNumber[https://github.com/bplok20010/animateNumber]
 *
 * author: nobo.zhou
 * 
 * Created on: 2018/03/12
 */
(function () {
    'use strict';
	
	var defaults = {
		className: "",
		container: null,
		itemHeight: 18,
		itemWidth: 14,
		symbolWidth: 8,
		maxNumber: 9999999,
		//初始默认位置
		defaultPos: '0',
		speed: 1000,
		defaultNumber: 0,
		symbol: ',',
		initAnimate: true
	};
	
	function pad(iarr, length){
		for( var i = 0;i<length; i++ ) {
			iarr.unshift('');	
		}
		
		return iarr;
	}
	
	var $div = document.createElement('div');
	var supportTransition = 'transition' in $div.style;
	
	 function formatNumber(num) {  
		var num = (num || 0).toString(), result = '';  
		while (num.length > 3) {  
			result = ',' + num.slice(-3) + result;  
			num = num.slice(0, num.length - 3);  
		}  
		if (num) { result = num + result; }  
		return result;  
	 } 
	 
	function sum( array ){
		var result = 0;
		for (var i = 0; i < array.length; i++){
			result += parseInt(array[i]);
		} 
		return result;
	} 
	
	function AnimateNumber(opts){
		
		if( !(this instanceof AnimateNumber) ) return new AnimateNumber(opts);
		
		var self = this;
		var opt = this.options = $.extend( defaults, opts || {} );
		
		if( !opt.container ) {
			throw new TypeError('miss container');	
		}
		
		if( isNaN(parseInt(opt.maxNumber)) ) {
			throw new TypeError('maxNumber error');	
		}
		
		if( opt.defaultPos === '' ) opt.defaultPos = '0';
		
		this._dataSlot = formatNumber(opt.maxNumber).split('');
		
		this._width = sum($.map( this._dataSlot, function( v ){ return v == ',' ? opt.symbolWidth : opt.itemWidth; } ));
		
		var numSlot = formatNumber(opt.defaultNumber).split('');
		
		var extLen = this._dataSlot.length - numSlot.length;
		if( extLen < 0 ) {
			throw new TypeError('maxNumber < defaultNumber');		
		}
		
		this._lastDataSlot = pad( numSlot, extLen );
		
		this._init();
		
		
		if( opt.initAnimate ) {
			setTimeout(function(){
				self.setNumber( opt.defaultNumber );	
			}, 0);
		} else {
			var _lastSpeed = opt.speed;
			opt.speed = 0;
			self.setNumber( opt.defaultNumber );	
			opt.speed = _lastSpeed;	
		}
		
		if( opt.onCreate ) {
			opt.onCreate.call(this);	
		}
	}
	
	AnimateNumber.prototype = {
		constructor: AnimateNumber,
		
		_init: function(){
			var self = this;
			var opt = this.options;
			var html = [];
			
			var len = this._dataSlot.length;
			var solts = this._dataSlot;
			
			html.push('<div class="z-animate-number '+ opt.className +'">');
			
			for( var i = 0; i< len; i++ ) {
				if( solts[i] === ',' ) {
					html.push( '<div data-idx="'+i+'" class="number-symbol">'+opt.symbol+'</div>' );		
				} else {
					html.push( '<div data-idx="'+i+'" class="number-item">'+this._getNumberList()+'</div>' );	
				}
			}
			
			html.push('</div>');
			
			var container = $(html.join(''));
			
			this.$container = container;
			
			container.css({
				width: this._width,
				lineHeight: opt.itemHeight + 'px',
				height: opt.itemHeight,
				overflow: 'hidden',
				display: 'inline-block',
				position: 'relative',	
			});
			
			var offset = 0;
			
			container.find('> div').each(function(){
				var $this = $(this);
				
				var isSymbol = $this.hasClass('number-symbol');
				
				$this.css({
					width: isSymbol ? opt.symbolWidth : opt.itemWidth,
					position: 'absolute',
					top: isSymbol ? 0 : self._getItemPos( opt.defaultPos ),
					left: offset	
				});
				
				offset += isSymbol ? opt.symbolWidth : opt.itemWidth;
				
				$('> span', $this).css({
					display: 'block',
					textAlign: 'center',
					height: opt.itemHeight,
					width: '100%'
				});
					
			});
			
			$(opt.container).append( container );
			
		},
		
		_getItemPos: function(value){
			var opt = this.options
			if( value === '' ) return 0;
			value = parseInt(value);
			
			value = isNaN(value) ? -1 : value;
			
			return (value + 1) * opt.itemHeight * -1;
		},
		
		_getNumberList: function(){
			var len = 10;
			var list = ['<span class="number-item-cell"></span>'];
			for(var i=0;i<len;i++) {
				list.push( '<span class="number-item-cell">'+i+'</span>' );	
			}	
			
			return list.join('');
		},
		
		setNumber: function(num){
			var self = this;
			var opt = this.options;
			var numSlot = formatNumber(num || 0).split('');	
			var currentSlots = pad( numSlot, this._dataSlot.length - numSlot.length );
			var dataSlot = this._dataSlot;
			var $solts = $('> div', this.$container);
			
			$.each( currentSlots, function(i, v){
				var $solt = $($solts[i]);
				var isSymbol = $solt.hasClass('number-symbol');
				
				if( isSymbol ) {
					if( v === '' ) {
						$solt.css('visibility', 'hidden');	
					} else {
						$solt.css('visibility', 'visible');	
					}
					
					return;
				}
				
				var top = self._getItemPos(v);
				
				if( supportTransition ) {
					$solt.css({
						top: top,
						transition: opt.speed / 1000 + 's'
					});
				} else {
					$solt.animate({
						top: top	
					}, opt.speed)	
				}
			} );
			
		}
	}
	
	$.fn.animateNumber = function(opts, num){
		return this.each(function(){
			
			if( opts === 'destroy' ) {
				if( !this.$$a_m ) return;
				this.$$a_m.$container.remove();
				if( this.$$a_m.options.onDestroy ) {
					this.$$a_m.options.onDestroy.call(this.$$a_m);	
				}
				this.$$a_m = undefined;	
				return;
			}
			
			if( opts === 'set' ) {
				if( !this.$$a_m || num === undefined) return;
				this.$$a_m.setNumber( num );	
				return;	
			}
			
			if( this.$$a_m ) return;
			
			this.$$a_m = new AnimateNumber($.extend({}, opts, {
				container: this	
			}));
		})	
	}
   
})();