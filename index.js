import express from 'express';
import { nanoid } from 'nanoid';
import monk from 'monk';
import path from 'path';
import yup from 'yup';

const app = express();
const port = process.env.PORT || 5000;

// import dotenv from 'dotenv';
// dotenv.config();

const db = monk(process.env.MONGODB_URL);
const urlList = db.get('all_urls');

app.use(express.static('public'));
app.use(express.json());

// Redirect to URL
app.get('/:id', async (req, res) => {
	const { id: code } = req.params;
	const exists = await urlList.findOne({ code });
	if (exists) {
		res.redirect(301, exists.url);
	} else {
		res.sendFile(path.join(path.resolve(), 'public/error.html'));
	}
});

const schema = yup.object().shape({
	code: yup
		.string()
		.trim()
		.matches(/^[\w\-]+$/i),
	url: yup.string().trim().url().required(),
});

// Create new shortened URL
app.post('/shorten', async (req, res) => {
	let { code, url } = req.body;
	try {
		await schema.validate({
			code,
			url,
		});
		if (!code) {
			code = nanoid(5);
		}
		code = code.toLowerCase();
		// Check database to see if code is already there
		const exists = await urlList.findOne({ code });
		if (exists) {
			res.status(400).json({
				error: `Error: code already redirects to ${exists.url}`,
			});
		} else {
			const newUrl = {
				url,
				code,
			};
			const created = await urlList.insert(newUrl);
			res.json(created);
		}
	} catch (error) {
		res.status(400).json({
			error: 'Error: link invalid (It must begin with http:// or https://)',
		});
	}
});

app.listen(port, () => console.log(`Listening on port ${port}`));
