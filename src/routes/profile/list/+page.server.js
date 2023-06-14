import { db } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';
let username, bookId, isbn, work;
let fav,
	existingBook = null;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {};
}
/** @type {import('./$types').Actions} */
export const actions = {
	//Add to List Function
	userStatus: async ({ request, params, locals }) => {
		//redirect if mot logged in
		if (!(locals && locals.user && locals.user.name)) {
			throw redirect(302, '/login');
		}
		//getting form data
		username = locals.user.name;
		const bookId = await params.bookId;
		const data = await request.formData();
		const title = data.get('title');
		const rating = data.get('rating');
		const status = data.get('status');
		const categoryId = parseInt(status, 10); //to convert the status to Int, shit doesn't work otherwise for somereason
		const chapters = data.get('chapters');
		const pages = data.get('pages');
		const rereads = data.get('rereads');
		const startedAt = data.get('startDate');
		const notes = data.get('notes');
		let startedDateTime = undefined;
		if (startedAt) {
			startedDateTime = new Date(startedAt).toISOString();
		}

		const completedAt = data.get('finishDate');
		const completedDateTime = undefined;
		if (completedAt) {
			completedDateTime = new Date(completedAt).toISOString();
		}
		const user = await db.user.findUnique({
			where: { username }
		});
		existingBook = await db.book.findFirst({
			where: {
				title,
				User: {
					some: { username }
				}
			},
			include: {
				bookCategory: true
			}
		});
		console.log(existingBook);

		// Creating/updating the userStatus
		if (existingBook) {
			await db.Book.update({
				where: { id: existingBook.id }, // Provide the unique identifier of the existing record
				data: {
					pages: pages,
					chapters: chapters,
					rating: rating,
					rereads: rereads,
					completedAt: completedDateTime,
					createdAt: startedDateTime,
					notes: notes,
					bookCategory: {
						// Disconnecting the category at index 1 from the existing book's categories
						disconnect: [{ id: existingBook.bookCategory[1].id }],

						// Connecting the new category and the "All" category to the book
						connect: [{ id: categoryId }, { id: 1 }]
					},
					User: {
						connect: { id: user.id }
					}
				}
			});
		}
		await db.activity.create({
			data: {
				bookId: bookId,
				title: existingBook.title,
				pages: pages,
				rating: rating,
				userId: user.id,
				...(existingBook.covers && { covers: existingBook.covers[0] }),
				categoryId: categoryId
			}
		});
	}
};
