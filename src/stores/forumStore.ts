import { create } from 'zustand';
import { getForumPosts, saveForumPost, updateForumPost } from '../utils/storage';
import type { ForumPost } from '../types';

interface ForumState {
  posts: ForumPost[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
  addPost: (post: ForumPost) => Promise<void>;
  updatePost: (post: ForumPost) => Promise<void>;
}

export const useForumStore = create<ForumState>((set) => ({
  posts: [],
  isHydrated: false,

  hydrate: async () => {
    const posts = await getForumPosts();
    set({
      posts: posts.sort((a, b) => b.timestamp - a.timestamp),
      isHydrated: true,
    });
  },

  reset: () => set({ posts: [], isHydrated: false }),

  addPost: async (post) => {
    await saveForumPost(post);
    set((state) => ({ posts: [post, ...state.posts] }));
  },

  updatePost: async (post) => {
    await updateForumPost(post);
    set((state) => ({
      posts: state.posts.map((p) => (p.id === post.id ? post : p)),
    }));
  },
}));
