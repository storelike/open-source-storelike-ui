import { defineCollection, z } from 'astro:content';

const productCollection = defineCollection({
	schema: z.object({
		draft: z.boolean(),
		title: z.string(),
		snippet: z.string(),
		image: z.object({
		  src: z.string(),
		  alt: z.string(),
		}),
		pubDate: z.string().transform(str => new Date(str)),
		author: z.string().default('Buildberries'),
		category: z.string(),
		tags: z.array(z.string()),
		price: z.number(),
		discount: z.number(),
		is_active: z.boolean(),
		is_delivery: z.boolean(),

	  }),
	});

const teamCollection = defineCollection({
	schema: z.object({
	  draft: z.boolean(),
	  name: z.string(),
	  title: z.string(),
	  avatar: z.object({
		src: z.string(),
		alt: z.string(),
	  }),
	  pubDate: z.string().transform(str => new Date(str)),
	}),
  });
  

  export const collections = {
	'product': productCollection,
	// 'team': teamCollection,
  };

