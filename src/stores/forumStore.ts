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
  deletePost: (id: string) => Promise<void>;
  deleteReply: (postId: string, replyId: string) => Promise<void>;
  upvotePost: (postId: string, uid: string) => Promise<void>;
  upvoteReply: (postId: string, replyId: string, uid: string) => Promise<void>;
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

  deletePost: async (id) => {
    const { deleteForumPostRecord } = await import('../utils/storage');
    await deleteForumPostRecord(id);
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== id),
    }));
  },

  deleteReply: async (postId, replyId) => {
    const { deleteForumReplyRecord } = await import('../utils/storage');
    await deleteForumReplyRecord(postId, replyId);
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id !== postId
          ? p
          : (() => {
              const childrenByParent = new Map<string, string[]>();
              for (const reply of p.replies) {
                const parent = reply.parentReplyId ?? '__root__';
                const list = childrenByParent.get(parent) ?? [];
                list.push(reply.id);
                childrenByParent.set(parent, list);
              }

              const idsToDelete = new Set<string>();
              const stack = [replyId];
              while (stack.length > 0) {
                const current = stack.pop()!;
                idsToDelete.add(current);
                const children = childrenByParent.get(current) ?? [];
                for (const childId of children) stack.push(childId);
              }

              return { ...p, replies: p.replies.filter((r) => !idsToDelete.has(r.id)) };
            })()
      ),
    }));
  },

  upvotePost: async (postId, uid) => {
    set((state) => {
      const updated = state.posts.map((p) => {
        if (p.id !== postId) return p;
        const upvotes = p.upvotes ?? [];
        const hasVoted = upvotes.includes(uid);
        const next = hasVoted ? upvotes.filter((u) => u !== uid) : [...upvotes, uid];
        return { ...p, upvotes: next };
      });
      const post = updated.find((p) => p.id === postId);
      if (post) void import('../utils/storage').then(({ updateForumPost }) => updateForumPost(post));
      return { posts: updated };
    });
  },

  upvoteReply: async (postId, replyId, uid) => {
    set((state) => {
      const updated = state.posts.map((p) => {
        if (p.id !== postId) return p;
        const replies = p.replies.map((r) => {
          if (r.id !== replyId) return r;
          const upvotes = r.upvotes ?? [];
          const hasVoted = upvotes.includes(uid);
          const next = hasVoted ? upvotes.filter((u) => u !== uid) : [...upvotes, uid];
          return { ...r, upvotes: next };
        });
        return { ...p, replies };
      });
      const post = updated.find((p) => p.id === postId);
      if (post) void import('../utils/storage').then(({ updateForumPost }) => updateForumPost(post));
      return { posts: updated };
    });
  },
}));
