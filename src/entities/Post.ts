import { Exclude, Expose } from 'class-transformer';
import {
	Entity as TOEntity,
	Column,
	Index,
	ManyToOne,
	JoinColumn,
	BeforeInsert,
	OneToMany,
} from 'typeorm';
import { makeid, slugify } from '../utils/helper';
import Comment from './Comment';

import Entity from './Entity';
import Sub from './Sub';
import User from './User';
import Vote from './Vote';

@TOEntity('posts')
export default class Post extends Entity {
	constructor(post: Partial<Post>) {
		super();
		Object.assign(this, post);
	}

	@Column()
	title: string;

	@Column({ nullable: true, type: 'text' })
	body: string;

	@Index()
	@Column()
	identifier: string;

	@Index()
	@Column()
	slug: string;

	@ManyToOne(() => User, (user) => user.posts)
	@JoinColumn({ name: 'username', referencedColumnName: 'username' })
	user: User;
	@Column()
	username: string;

	@ManyToOne(() => Sub, (sub) => sub.posts)
	@JoinColumn({ name: 'subName', referencedColumnName: 'name' })
	sub: Sub;
	@Column()
	subName: string;

	@Exclude()
	@OneToMany(() => Comment, (comment) => comment.post)
	comments: Comment[];

	@Exclude()
	@OneToMany(() => Vote, (vote) => vote.post)
	votes: Vote[];

	@BeforeInsert()
	makeIdAndSlug() {
		this.identifier = makeid(7);
		this.slug = slugify(this.title);
	}

	@Expose() get url(): string {
		return `/r/${this.subName}/${this.identifier}/${this.slug}`;
	}

	@Expose() get commentCount(): number {
		return this.comments?.length;
	}

	@Expose() get voteScore(): number {
		return this.votes?.reduce((prev, curr) => prev + (curr.value || 0), 0);
	}

	protected userVote: number;
	setUserVote(user: User) {
		const index = this.votes?.findIndex((v) => v.username === user.username);
		this.userVote = index > -1 ? this.votes[index].value : 0;
	}
}
