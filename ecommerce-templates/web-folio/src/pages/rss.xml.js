import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { cmSeo } from '../locale/cms-locale.json';

export async function GET(context) {
	const posts = await getCollection('products');
	return rss({
		title: cmSeo.siteTitle.value,
		description: `RSS | ${cmSeo.siteDescription.value}`,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/products/${post.slug}/`,
		})),
	});
}
