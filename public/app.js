var app = new Vue({
	el: '#app',
	data: {
		message: 'Hello Vue!',
		code: '',
		url: '',
		newUrl: null,
		errorMsg: null,
	},
	methods: {
		async shortenUrl() {
			this.newUrl = null;
			this.errorMsg = null;
			const shortenedUrl = await fetch('/shorten', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					code: this.code,
					url: this.url,
				}),
			});
			if (shortenedUrl.ok) {
				const response = await shortenedUrl.json();
				this.newUrl = `http://localhost:5000/${response.code}`;
			} else {
				const response = await shortenedUrl.json();
				this.errorMsg = response.error;
				console.log(response);
			}
		},
	},
});
