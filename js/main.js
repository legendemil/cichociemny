//@prepros-prepend initPhotoSwipe.js

const App = (function (app) {
	let 
		DOM = {
			$pageHeader: null,
			$infoBox: null,
			$timelineBox: null,
			$galleryImgArr: null,
			$navCloseBtn: null,
			$loadingScreen: null,
			$orders: null
		},
		wHeight = window.innerHeight,
		infoBoxTop = 0,
		timelineTop = $('.timeline').offset().top,
		interviewTop = $('.interview').offset().top,
		bioTop = $('#bio').offset().top,
		galleryTop = $('.gallery').offset().top,
		ordersTop = $('.orders').offset().top,
		aboutTop = $('.about').offset().top;

	function hideIntro() {
	    window.scrollTo(0,0);
	    $('.page-intro').addClass('page-intro--hide');
	    setTimeout(() => $('.page-intro').remove(), 1000);
	}
	
	function smoothScroll() {
		$('a[href*="#"]:not([href="#"])').click(function() {
		    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
		     	var target = $(this.hash);
		    	target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
		     	if (target.length) {
		       		$('html, body').animate({
		        		scrollTop: target.offset().top
		       		}, 1000);
		       		return false;
		      }
			}
	  });
	}

	function showMore(ev) {	
		const fileName = ev.target.getAttribute('data-fileName'),
            headerText = ev.target.getAttribute('data-headerText');
		DOM.$loadingScreen.addClass('is-showed');
		Router.changeHash(`#${headerText}`);
		$.get(fileName, page => {
			NewPage.render(headerText, page);
			DOM.$loadingScreen.removeClass('is-showed');
		});
	}

	function slideElements() {
		let wScroll = $(this).scrollTop(),	
			{ $pageHeader, $infoBox, $timelineBox, $bioInfoArr, $orders ,$galleryImgArr } = DOM,
			isSmall = window.innerWidth < 560 ? true : false;

		if(!infoBoxTop) {
			infoBoxTop = $infoBox.offset().top;
		}
		
		if(wScroll > infoBoxTop - wHeight / 1.5 && wScroll < timelineTop) {
			$infoBox.addClass('slide-out');
		}

		if(wScroll < timelineTop) {
			let 
				heroOffset = 0,
				logoOffset = 0,
				infoOffset = 0;
				
			if(!isSmall) {
				heroOffset = wScroll / 15,
				logoOffset = wScroll / 1.1,
				infoOffset = wScroll / 2.5;
				heroOffset = Math.max(10, heroOffset);
			}
			
			$pageHeader.find('.page-header__hero').css({'transform': `translate(-50%, ${heroOffset}%)`});
			$pageHeader.find('.logo').css({'transform': `translateY(${logoOffset}%)`})
			$pageHeader.find('.page-header__info-box').css({'transform': `translateY(${infoOffset}%)`});
		}
		if(wScroll > (timelineTop - wHeight) && wScroll < galleryTop) {
			let scaleHeader = 1,
				scaleBox = 1;
			if(!isSmall) {
				scaleHeader = (wScroll + wHeight / 2) / timelineTop / 1.5;
				scaleHeader = Math.min(scaleHeader, 1);
			}
			$.each($timelineBox, (i, item) => {
				if(!isSmall) {
					scaleBox = (wScroll + (wHeight/ 2.4)) / $(item).offset().top;
					scaleBox = Math.min(scaleBox, 1);
				}
				$(item).css({'transform': `scale(${scaleBox})`});
			});
		}

		if(!isSmall && wScroll > ordersTop - wHeight / 1.2 && wScroll < galleryTop) {
			$.each($orders, (i, item) => {
				setTimeout(() => $(item).addClass('is-showed'), i * 250);
			});
			DOM.$orders = null;
		}


		if(!isSmall && wScroll > galleryTop - wHeight / 1.2 && wScroll < aboutTop) {
			$.each($galleryImgArr, (i, item) => {
				setTimeout(() => $(item).addClass('is-showed'), i * 250);
			});
			DOM.$galleryImgArr = null;
		}

		if(!isSmall && wScroll > interviewTop && wScroll < galleryTop) {
			$.each($('.interview-box'), (i, item) => {
				if(wScroll + wHeight / 1.5 > $(item).offset().top) {
					$(item).addClass('is-showed');
				}
			});

		}
	}

	function toggleNav() {
		$('.page-nav-list').toggleClass('is-active');
	}

	function cacheDOM() {
		DOM = {
			$pageHeader: $('.page-header'),
			$infoBox: $('.info-box'),
			$timelineBox: $('.timeline-box'),
			$galleryImgArr: $('.my-gallery__figure img'),
			$navCloseBtn: $('.page-nav__close-btn'),
			$loadingScreen: $('.loading-screen'),
			$orders: $('.order-item')
		};
	}

	function bindEvents() {
		$('.new-page-btn').on('click', showMore);
		$(window).on('scroll', slideElements);
		smoothScroll();
		DOM.$navCloseBtn.on('click', toggleNav);
	}

	function init() {
		cacheDOM();
		bindEvents();
		hideIntro();
	}

	app.init = init;

	return app;
})(App || {});


// visits counter module
const VisitsCounter = (function(counter) {
	let $element = $('#page-visits');
	counter.update = function () {
		$.get('php/counter.php', count => {
			$element.text(count);
		});
	}

	return counter;
})(VisitsCounter || {});

// post module
const Post = (function (post) {
	function renderPost(name, text, date) {
		return `<li class="post">
					<p class="post__author"><b>${name}</b> pisze: <span class="post__date">${date}</span></p>
					<p class="post__text">${text}</p>
				</li>`;
	}

	post.renderPost = renderPost;
	return post;
})(Post || {});

// quest book  module
const QuestBook = (function(module, Post) {
	let DOM = { };

	// sending post
	function sendPost(ev) {
		ev.preventDefault();
		addPostToList();	
		clearInputs();
	}

	function sendPostDb(name, text, date) {
		$.post('php/questBook.php?type=sendPost', {
			name,
			text,
			date
		}, (data, status) => {
			console.log(data, status)
		});
	}
	
	function addPostToList() {
		const name = DOM.$name.val(),
			  email = DOM.$email.val(),
			  text = DOM.$text.val(),
			  now = new Date(),
			  date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

		sendPostDb(name, text, email);
		DOM.$list.prepend(Post.renderPost(name, text, date));
	}

	function clearInputs() {
		DOM.$name.val('');
		DOM.$email.val('');
		DOM.$text.val('');
	}

	// getting posts

	function getPosts() {
		$.get('php/questBook.php?type=getPosts', function (posts) {
			posts.forEach((post) => {
				post = JSON.parse(post);
				DOM.$list.prepend(Post.renderPost(post.name, post.text, post.date));
			});
		}, 'json')
	}
	
	function cacheDOM() {
		DOM.$form = $('.quest-book__form');
		DOM.$name = $(DOM.$form).find('.quest-book__form-name');
		DOM.$email = $(DOM.$form).find('.quest-book__form-email');
		DOM.$text = $(DOM.$form).find('.quest-book__form-text');
		DOM.$list = $('.posts');
	}

	function bindEvents() {
		$(DOM.$form).on('submit', sendPost);
	}
	
	function init() {
		cacheDOM();
		bindEvents();
		getPosts();
	}
	
	module.init = init;
	return module;
})(QuestBook || {}, Post);


const NewPage = (function (page) {
	let DOM = {
		viewDetailsTmpl: null,
		heading: null,
		content: null,
		box: null,
		closeBtn: null
	}
	
	function render(headerText, content) {
		window.localStorage.setItem('is-page-loaded', true)
		DOM.heading.innerText = headerText;
		DOM.content.innerHTML = content;
		document.body.appendChild(DOM.box);
	}

	function closePage() {
		const $viewMoreBox = $('.view-more');
		$viewMoreBox.addClass('view-more__hide');
		setTimeout(() => $viewMoreBox.removeClass('view-more__hide').remove(), 500);
	}

	function cacheDOM() {
		let details = DOM.viewDetailsTmpl = document.querySelector('#view-details').content;
		DOM.heading = details.querySelector('.view-more__heading span');
		DOM.content = details.querySelector('.view-more__content');
		DOM.box = details.querySelector('.view-more');
		DOM.closeBtn = details.querySelector('.view-more__close-btn');
	}

	function bindEvents() {
		DOM.closeBtn.addEventListener('click', closePage);
	}

	function init() {
		cacheDOM();
		bindEvents();
	}

	page.init = init;
	page.render = render;
	page.closePage = closePage;

	return page;
})(NewPage || {});


let Router = (function(router, closePage) {
	let currHash = '';

	function changeHash(newHash) {
		newHash = newHash.
			toLowerCase().
			split(' ').
			join('-');
		window.location.hash = newHash;
		currHash = newHash;
	}

	function onhashchange() {
		closePage();
		if(window.localStorage.getItem('is-page-loaded') === true) {
			changeHash('/');
		}
	}

	function bindEvents() {
		window.addEventListener('hashchange', onhashchange);
	}

	function init() {
		bindEvents();
	}

	init();

	router.changeHash = changeHash;

	return router;
})(Router || {}, NewPage.closePage);


$(function(){
	QuestBook.init();
	VisitsCounter.update();
	App.init();
	NewPage.init();
	initPhotoSwipeFromDOM('.my-gallery');
    
});