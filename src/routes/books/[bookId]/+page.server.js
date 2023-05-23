import { db } from '$lib/server/database';
import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params }) {
	const fetchBook = async (id) => {
		const bookId = await params.bookId;
		const workres = await fetch(`https://openlibrary.org/works/${id}.json`);
		const work = await workres.json();

		const bookres = await fetch(`https://openlibrary.org/search.json?title=${work.title}&limit=18`);

		const bookData = await bookres.json();

		const matchingBooks = bookData.docs.filter((book) => book.key === work.key); // filter callback checks if the key property of each book matches the work.key value
		const isbnData = await fetch(`https://openlibrary.org/isbn/${matchingBooks[0].isbn[0]}.json`);
		const isbn = await isbnData.json();
		const username = locals.user.name;
		const fav = await db.fav.findFirst({
			where: {
				bookId,
				users: {
					some: {
						username
					}
				}
			}
		});

		const isBookIdFound = fav !== null;
		return {
			work,
			matchingBooks,
			isbn,
			isBookIdFound
		};
	};

	const result = await fetchBook(params.bookId);

	return {
		work: result.work,
		bookData: result.matchingBooks[0],
		isbn: result.isbn,
		favTag: result.isBookIdFound
	};
}
/** @type {import('./$types').Actions} */
export const actions = {
	addFav: async ({ locals, request, params }) => {
		const bookId = await params.bookId;
		if (!(locals && locals.user && locals.user.name)) {
			throw redirect(302, '/login');
		}
		const username = locals.user.name;
		const user = await db.user.findUnique({
			where: { username }
		});

		await db.fav.create({
			data: {
				bookId: bookId,
				users: {
					connect: { id: user.id }
				}
			}
		});
	}
};
