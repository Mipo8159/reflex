export interface Post {
	identifier: string;
	title: string;
	slug: string;
	subName: string;
	username: string;
	body?: string;
	createdAt: string;
	updatedAt: string;
	sub?: Sub;

	//virtuals
	url: string;
	voteScore?: number;
	userVote?: number;
	commentCount?: number;
}

export interface Comment {
	createdAt: string;
	updatedAt: string;
	identifier: string;
	body: string;
	username: string;
	userVote: number;
	voteScore: number;
	post?: Post;
}

export interface User {
	username: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}

export interface Sub {
	createdAt: string;
	updatedAt: string;
	name: string;
	title: string;
	description: string;
	imageUrn: string;
	bannerUrn: string;
	username: string;
	posts: Post[];

	//Virtuals
	imageUrl: string;
	bannerUrl: string;
	postCount?: number;
}
