import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import seoData from '@const/seo/seo-data-site.json';

export async function GET(context) {
	const posts = await getCollection('products');
	return rss({
		title: seoData.SITE_TITLE,
		description: `RSS | ${seoData.SITE_DESCRIPTION}`,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/products/${post.slug}/`,
		})),
	});
}
