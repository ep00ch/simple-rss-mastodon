// Simple RSS reader for mastodon feeds
var simpleRSSPlugin = (function() {
	// get all the feed containers
	var feedsNodes = document.querySelectorAll('[data-rss-feed]');

	for (var container of feedsNodes) {
		// get feed URL
		var url = encodeURIComponent(container.getAttribute('data-rss-feed'));

		// Get data - append as script with callback to avoid CORS
		var script = document.createElement('script');
		script.src = document.location.protocol + '//api.rss2json.com/v1/api.json?callback=simpleRSSPlugin.handleJSON&rss_url=' + url;
		document.querySelector('head').appendChild(script);
		// Remove script
		script.parentNode.removeChild(script);
	}

	// Callback function
	function handleJSON(data) {
		if (data.feed && data.items ) {
			// find the div with the response data-rss-feed url
			const container = document.querySelector('[data-rss-feed="' + data.feed.url + '"]');
			// get whether to link titles
			var addLink = container.getAttribute('data-rss-link-titles') || 'true';
			// get title wrapper element
			var titleWrapper = container.getAttribute('data-rss-title-wrapper') || 'h2';
			// max number of feed items to show
			var max = container.getAttribute('data-rss-max') || 10;

			// New feed content container
			var docFrag = document.createDocumentFragment().appendChild(document.createElement('ul'))

			for (var i = 0; (i < data.items.length && i < max); i++) {
				var e = data.items[i];

				var tempNode = document.createElement('li');
				// shorten pubDate and use locale format
				var pubDate = new Date(e.pubDate.split(' ')[0]).toLocaleDateString()
				// parse out the mastodon author from the link
				var author = e.link.split('/')
				author = author[3] + '@' + author[2]

				var template = '<' + titleWrapper + '><a href="' + e.link + '">' + pubDate + ' - ' + e.title + author + '</a></' + titleWrapper + ' > ' + ' <div class="feed-content"> ' + e.content + '</div > ';
				if (addLink === 'false') {
					template = '<' + titleWrapper + '>' + e.title + '</' + titleWrapper + '>' + e.content;
				}
				if (e.enclosure.link && e.enclosure.type.startsWith('image') && e.enclosure.rating.value == 'nonadult') {
					template += '<br><img class="feed-img" src="' + e.enclosure.link + '" alt="unavailable - open link for complete post, including alt tags">'
				}
				tempNode.innerHTML = template;
				docFrag.appendChild(tempNode);
			}

			container.appendChild(docFrag);
		}
	}
	// Return function for use in global scope
	return {
		handleJSON: handleJSON
	}
}) ();