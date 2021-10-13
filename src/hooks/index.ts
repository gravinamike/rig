import type { Handle } from '@sveltejs/kit'
import { connectToDatabase } from "$lib/shared/db"
import pkg from 'objection'
const { Model } = pkg


export const handle: Handle = async ({ request, resolve }) => {
	
	if (request.method === 'GET' && request.path.startsWith("/api/")) {
		await connectToDatabase()
    }

	const response = await resolve(request);
	
	return response;
};
